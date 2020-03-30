import React from 'react';
import PropTypes from 'prop-types';

import MenuItem from '@material-ui/core/MenuItem';
import AppBar from '@material-ui/core/AppBar';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Paper from '@material-ui/core/Paper';
import Switch from '@material-ui/core/Switch';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';

import connectComponent from '../../../helpers/connect-component';
import getLocale from '../../../helpers/get-locale';

import EnhancedMenu from '../../shared/enhanced-menu';

import { toggleSetting } from '../../../state/root/preferences/actions';
import { open as openDialogAbout } from '../../../state/root/dialog-about/actions';
import { open as openDialogShortcut } from '../../../state/pages/preferences/shortcut-dialog/actions';

import displayLanguages from '../../../constants/display-languages';

import DialogShortcut from './dialog-shortcut';

import {
  requestOpenInBrowser,
  requestSetPreference,
  requestShowRequireRestartDialog,
} from '../../../senders';

import webcatalogLogo from '../../../assets/webcatalog-logo.svg';
import translatiumLogo from '../../../assets/translatium-logo.svg';
import singleboxLogo from '../../../assets/singlebox-logo.svg';

const styles = (theme) => ({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  innerContainer: {
    flex: 1,
    padding: 16,
    boxSizing: 'border-box',
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
  },
  paperTitle: {
    width: '100%',
    maxWidth: 480,
    margin: '0 auto',
    fontWeight: 500,
    color: theme.palette.text.primary,
    marginBottom: 2,
    paddingLeft: 16,
    fontSize: '0.9rem',
    '&:not(:first-child)': {
      marginTop: 36,
    },
  },
  paper: {
    maxWidth: 480,
    margin: '0 auto',
    border: theme.palette.type === 'dark' ? 'none' : '1px solid rgba(0, 0, 0, 0.12)',
  },
  shortcutKey: {
    lineHeight: '48px',
    padding: '0 16px',
    fontSize: 15,
    color: theme.palette.text.secondary,
  },
  appBarColorDefault: {
    background: theme.palette.type === 'dark' ? theme.palette.grey[900] : theme.palette.primary.main,
    color: theme.palette.type === 'dark' ? theme.palette.getContrastText(theme.palette.grey[900]) : theme.palette.primary.contrastText,
    WebkitAppRegion: 'drag',
    WebkitUserSelect: 'none',
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  toolbar: {
    minHeight: 40,
  },
  logo: {
    height: 28,
  },
});

const renderCombinator = (combinator) => combinator
  .replace(/\+/g, ' + ')
  .replace('alt', window.process.platform !== 'darwin' ? 'alt' : '⌥')
  .replace('shift', window.process.platform !== 'darwin' ? 'shift' : '⇧')
  .replace('mod', window.process.platform !== 'darwin' ? 'ctrl' : '⌘')
  .replace('meta', '⌘')
  .toUpperCase();

const Preferences = (props) => {
  const {
    alwaysOnTop,
    attachToMenubar,
    classes,
    langId,
    onOpenDialogAbout,
    onOpenDialogShortcut,
    onToggleSetting,
    openOnMenubarShortcut,
    realtime,
    themeSource,
    translateClipboardOnShortcut,
    translateWhenPressingEnter,
  } = props;

  const displayLanguageKeys = Object.keys(displayLanguages);
  displayLanguageKeys.sort((xKey, yKey) => {
    const x = displayLanguages[xKey].displayName;
    const y = displayLanguages[yKey].displayName;
    return x.localeCompare(y);
  });

  return (
    <div className={classes.container}>
      <DialogShortcut />
      <AppBar position="static" color="default" elevation={1} classes={{ colorDefault: classes.appBarColorDefault }}>
        <Toolbar variant="dense" className={classes.toolbar}>
          <Typography variant="subtitle1" color="inherit" className={classes.title}>{getLocale('preferences')}</Typography>
        </Toolbar>
      </AppBar>
      <div className={classes.innerContainer}>
        <Typography variant="body2" className={classes.paperTitle}>
          {getLocale('general')}
        </Typography>
        <Paper elevation={0} className={classes.paper}>
          <List dense disablePadding>
            <EnhancedMenu
              id="changeDisplayLanguage"
              buttonElement={(
                <ListItem button>
                  <ListItemText
                    primary={getLocale('displayLanguage')}
                    secondary={displayLanguages[langId].displayName}
                  />
                  <ChevronRightIcon color="action" />
                </ListItem>
              )}
            >
              {displayLanguageKeys.map((lId) => (
                <MenuItem
                  dense
                  key={`lang_${lId}`}
                  value={lId}
                  onClick={() => {
                    if (lId !== langId) {
                      requestSetPreference('langId', lId);
                      requestShowRequireRestartDialog();
                    }
                  }}
                >
                  {displayLanguages[lId].displayName}
                </MenuItem>
              ))}
            </EnhancedMenu>
            <Divider />
            <EnhancedMenu
              id="theme"
              buttonElement={(
                <ListItem button>
                  <ListItemText primary="Theme" secondary={getLocale(themeSource)} />
                  <ChevronRightIcon color="action" />
                </ListItem>
              )}
            >
              {window.process.platform === 'darwin' && (
                <MenuItem dense onClick={() => requestSetPreference('themeSource', 'system')}>{getLocale('system')}</MenuItem>
              )}
              <MenuItem dense onClick={() => requestSetPreference('themeSource', 'light')}>{getLocale('light')}</MenuItem>
              <MenuItem dense onClick={() => requestSetPreference('themeSource', 'dark')}>{getLocale('dark')}</MenuItem>
            </EnhancedMenu>
            <Divider />
            <ListItem>
              <ListItemText primary={window.process.platform === 'win32' ? getLocale('attachToTaskbar') : getLocale('attachToMenubar')} />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={attachToMenubar}
                  onChange={(e) => {
                    requestSetPreference('attachToMenubar', e.target.checked);
                    requestShowRequireRestartDialog();
                  }}
                  color="primary"
                />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </Paper>


        <Typography variant="body2" className={classes.paperTitle}>
          {getLocale('advanced')}
        </Typography>
        <Paper elevation={0} className={classes.paper}>
          <List dense disablePadding>
            <ListItem>
              <ListItemText
                primary={getLocale('realtime')}
                secondary={getLocale('realtimeDesc')}
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={realtime}
                  onChange={() => onToggleSetting('realtime')}
                  color="primary"
                />
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText primary={getLocale('translateWhenPressingEnter')} />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={translateWhenPressingEnter}
                  onChange={() => onToggleSetting('translateWhenPressingEnter')}
                  color="primary"
                />
              </ListItemSecondaryAction>
            </ListItem>
            {window.process.platform === 'darwin' && (
              <>
                <Divider />
                <ListItem
                  button
                  onClick={() => window.require('electron').remote.shell.openExternal('https://translatiumapp.com/popclip')}
                >
                  <ListItemText primary={getLocale('popclipExtension')} />
                </ListItem>
              </>
            )}
            {window.mode === 'menubar' && (
              <>
                <Divider />
                <ListItem
                  button
                  key="openOnMenubar"
                  onClick={() => onOpenDialogShortcut('openOnMenubar', openOnMenubarShortcut)}
                  disabled={!attachToMenubar}
                >
                  <ListItemText
                    primary={getLocale('openKeyboardShortcut')}
                    secondary={openOnMenubarShortcut
                      ? renderCombinator(openOnMenubarShortcut) : null}
                  />
                  <ChevronRightIcon color="action" />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary={getLocale('translateClipboardOnShortcut')}
                    secondary={getLocale('translateClipboardOnShortcutDesc')}
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={attachToMenubar ? translateClipboardOnShortcut : false}
                      onChange={() => onToggleSetting('translateClipboardOnShortcut')}
                      color="primary"
                      disabled={!attachToMenubar}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary={getLocale('alwaysOnTop')}
                    secondary={getLocale('alwaysOnTopDesc')}
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={attachToMenubar ? alwaysOnTop : false}
                      onChange={(e) => {
                        requestSetPreference('alwaysOnTop', e.target.checked);
                        requestShowRequireRestartDialog();
                      }}
                      color="primary"
                      disabled={!attachToMenubar}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </>
            )}
          </List>
        </Paper>

        <Typography variant="subtitle2" color="textPrimary" className={classes.paperTitle}>
          Atomery Apps
        </Typography>
        <Paper elevation={0} className={classes.paper}>
          <List disablePadding dense>
            <ListItem button onClick={() => requestOpenInBrowser('https://webcatalogapp.com?utm_source=translatium_app')}>
              <ListItemText
                primary={(<img src={webcatalogLogo} alt="WebCatalog" className={classes.logo} />)}
                secondary="Run Web Apps like Real Apps"
              />
              <ChevronRightIcon color="action" />
            </ListItem>
            <Divider />
            <ListItem button onClick={() => requestOpenInBrowser('https://singleboxapp.com?utm_source=translatium_app')}>
              <ListItemText
                primary={(<img src={singleboxLogo} alt="Singlebox" className={classes.logo} />)}
                secondary="All Your Apps in One Single Window"
              />
              <ChevronRightIcon color="action" />
            </ListItem>
            <Divider />
            <ListItem button onClick={() => requestOpenInBrowser('https://translatiumapp.com?utm_source=translatium_app')}>
              <ListItemText
                primary={(<img src={translatiumLogo} alt="Translatium" className={classes.logo} />)}
                secondary="Translate Any Languages like a Pro"
              />
              <ChevronRightIcon color="action" />
            </ListItem>
          </List>
        </Paper>


        <Typography variant="body2" className={classes.paperTitle} />
        <Paper elevation={0} className={classes.paper}>
          <List dense disablePadding>
            <ListItem button>
              <ListItemText primary={getLocale('about')} onClick={onOpenDialogAbout} />
            </ListItem>
            <Divider />
            <ListItem button>
              <ListItemText primary={getLocale('website')} onClick={() => requestOpenInBrowser('https://translatiumapp.com?utm_source=translatium_app')} />
            </ListItem>
            <Divider />
            <ListItem button>
              <ListItemText primary={getLocale('support')} onClick={() => requestOpenInBrowser('https://atomery.com/support?app=translatium&utm_source=translatium_app')} />
            </ListItem>
            {window.process.platform === 'darwin' && (
              <>
                <Divider />
                <ListItem button>
                  <ListItemText primary={getLocale('rateMacAppStore')} onClick={() => requestOpenInBrowser('macappstore://apps.apple.com/app/id1176624652?action=write-review')} />
                </ListItem>
              </>
            )}
            {window.process.platform === 'win32' && (
              <>
                <Divider />
                <ListItem button>
                  <ListItemText primary={getLocale('rateMicrosoftStore')} onClick={() => requestOpenInBrowser('ms-windows-store://review/?ProductId=9wzdncrcsg9k')} />
                </ListItem>
              </>
            )}
            <Divider />
            <ListItem button>
              <ListItemText primary={getLocale('quit')} onClick={() => window.require('electron').remote.app.quit()} />
            </ListItem>
          </List>
        </Paper>
      </div>
    </div>
  );
};

Preferences.propTypes = {
  alwaysOnTop: PropTypes.bool.isRequired,
  attachToMenubar: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired,
  langId: PropTypes.string.isRequired,
  onOpenDialogAbout: PropTypes.func.isRequired,
  onOpenDialogShortcut: PropTypes.func.isRequired,
  onToggleSetting: PropTypes.func.isRequired,
  openOnMenubarShortcut: PropTypes.string,
  realtime: PropTypes.bool.isRequired,
  themeSource: PropTypes.string.isRequired,
  translateClipboardOnShortcut: PropTypes.bool.isRequired,
  translateWhenPressingEnter: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  alwaysOnTop: state.preferences.alwaysOnTop,
  attachToMenubar: state.preferences.attachToMenubar,
  langId: state.preferences.langId,
  openOnMenubarShortcut: state.preferences.openOnMenubarShortcut,
  realtime: state.preferences.realtime,
  themeSource: state.preferences.themeSource,
  translateClipboardOnShortcut: state.preferences.translateClipboardOnShortcut,
  translateWhenPressingEnter: state.preferences.translateWhenPressingEnter,
});

const actionCreators = {
  openDialogAbout,
  openDialogShortcut,
  toggleSetting,
};

export default connectComponent(
  Preferences,
  mapStateToProps,
  actionCreators,
  styles,
);
