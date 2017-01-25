/* global Windows */
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import injectTapEventPlugin from 'react-tap-event-plugin';
import Raven from 'raven-js';

import store from './store';
import { updateSetting } from './actions/settings';
import renderRoutes from './renderRoutes';

import fetchLocal from './libs/fetchLocal';

const runApp = () => {
  /* global document */

  /* bug tracker */
  Raven
    .config('https://41abf1c6e02448b1b4fd3943f9104bfb:c79081de91f44981b1c9a052d7c7b008@sentry.io/132200', {
      allowSecretKey: true, // https://docs.sentry.io/clients/javascript/config/
    })
    .install();

  const launchCount = store.getState().settings.launchCount;
  store.dispatch(updateSetting('launchCount', launchCount + 1));

  if (process.env.PLATFORM === 'mac') {
    // Mock user agent
    Object.defineProperty(
      window.navigator,
      'userAgent',
      {
        get: () => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36',
      },
    );
  }

  fetchLocal('./strings/en-us.json')
    .then(res => res.json())
    .then((strings) => {
      /* global window */
      window.strings = strings;

      // onTouchTap for material-ui
      injectTapEventPlugin();

      render(
        <Provider store={store}>
          {renderRoutes()}
        </Provider>,
        document.getElementById('app'),
      );
    });
};

switch (process.env.PLATFORM) {
  case 'windows': {
    Windows.UI.WebUI.WebUIApplication.onactivated = () => {
      runApp();
    };
    break;
  }
  case 'mac': {
    runApp();
    break;
  }
  default: {
    /* eslint-disable no-console */
    console.log('Undetected Platfom');
    /* eslint-enable no-console */
  }
}
