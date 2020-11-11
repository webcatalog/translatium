import { combineReducers } from 'redux';

import {
  UPDATE_SHOULD_USE_DARK_COLORS,
  UPDATE_IS_FULL_SCREEN,
  UPDATE_IS_MAXIMIZED,
} from '../../../constants/actions';

import {
  getShouldUseDarkColors,
} from '../../../senders';

const { remote } = window.require('electron');
const win = remote.getCurrentWindow();

const isMaximized = (state = win.isMaximized(), action) => {
  switch (action.type) {
    case UPDATE_IS_MAXIMIZED: return action.isMaximized;
    default: return state;
  }
};

const isFullScreen = (state = win.isFullScreen(), action) => {
  switch (action.type) {
    case UPDATE_IS_FULL_SCREEN: return action.isFullScreen;
    default: return state;
  }
};

const shouldUseDarkColors = (state = getShouldUseDarkColors(), action) => {
  switch (action.type) {
    case UPDATE_SHOULD_USE_DARK_COLORS: return action.shouldUseDarkColors;
    default: return state;
  }
};

export default combineReducers({
  isFullScreen,
  isMaximized,
  shouldUseDarkColors,
});
