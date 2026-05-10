'use strict';
/* global webkitNotifications */

// Sub-path import keeps the client bundle clean — the top-level
// `ep_plugin_helpers` index pulls in server-only modules.
const {padToggle} = require('ep_plugin_helpers/pad-toggle');
const padcookie = require('ep_etherpad-lite/static/js/pad_cookie').padcookie;

// Same config as the server-side instance — must agree on pluginName,
// settingId, l10nId, and defaultLabel so checkbox ids and clientVars line up.
const desktopToggle = padToggle({
  pluginName: 'ep_desktop_notifications',
  settingId: 'desktopNotifications',
  l10nId: 'ep_desktop_notifications.desktopNotifications',
  defaultLabel: 'Desktop Notifications',
  defaultEnabled: true,
});

// Re-export so the helper sees pad-wide broadcasts and refreshes our state
// when another user toggles the pad-wide checkbox.
exports.handleClientMessage_CLIENT_MESSAGE = desktopToggle.handleClientMessage_CLIENT_MESSAGE;

const DesktopNotifications = {
  /* compatilibility layer */
  notificationSupported: () => !!window.Notification || !!window.webkitNotifications,
  notificationPermission: () => {
    if (window.Notification) {
      return Notification.permission;
    } else if (window.webkitNotifications) {
      return webkitNotifications.checkPermission() === 0 ? 'granted' : 'default';
    } else {
      return 'denied';
    }
  },
  requestNotificationPermission: (cb) => {
    if (window.Notification) {
      return Notification.requestPermission().then(cb);
    } else if (window.webkitNotifications) {
      return webkitNotifications.requestPermission(() => {
        cb(DesktopNotifications.notificationPermission());
      });
    } // else just chill
  },
  createNotification: (authorName, text, lang) => {
    if (window.Notification) {
      new Notification(authorName, {body: text, lang});
    } else if (window.webkitNotifications) {
      window.webkitNotifications.createNotification('', authorName, text).show();
    } else {
      console.warn(`${authorName} said: ${text}`);
    }
  },

  allowNotificationsToolbarEntryEnabled: (status) => {
    status = !!status;
    const previousEntry = $('#allowNotificationsToolbarEntry');
    const previousStatus = previousEntry.length > 0;
    if (status === previousStatus) {
      return;
    }
    let allowNotificationsToolbarEntry;
    if (status) {
      allowNotificationsToolbarEntry = $('<li>').attr({
        'id': 'allowNotificationsToolbarEntry',
        'data-type': 'button',
        'lang': 'en',
      }).click(() => {
        DesktopNotifications.enable();
      }).append($('<a>').attr({
        'title': 'Allow or forbid notifications',
        'aria-label': 'Allow or forbid notifications',
      }).append($('<button>').attr({
        'id': 'notification-permission-button',
        'class': 'buttonicon buttonicon-chat',
        'title': 'Allow or forbid notifications',
        'aria-label': 'Allow or forbid notifications',
      })));
      const toolbar = $('#editbar > .menu_left');
      toolbar.append(allowNotificationsToolbarEntry);
    } else {
      previousEntry.remove();
    }
  },
  handleNotificationPermission: (state) => {
    DesktopNotifications.status = state === 'granted';
    DesktopNotifications.allowNotificationsToolbarEntryEnabled(state === 'default');
  },
  enable: () => { // enables notifications
    DesktopNotifications.requestNotificationPermission((result) => {
      if (!DesktopNotifications.helpShown && result === 'granted') {
        DesktopNotifications.helpShown = true;
        DesktopNotifications.createNotification(
            'Notifications enabled',
            'You can disable notifications in the settings menu',
            'en'
        );
      }
      DesktopNotifications.handleNotificationPermission(result);
    });
  },
  disable: () => { // disables notifications
    DesktopNotifications.handleNotificationPermission('denied');
  },
  getParam: (sname) => {
    let params = location.search.substr(location.search.indexOf('?') + 1);
    let sval = '';
    params = params.split('&');
    // split param and value into individual pieces
    for (let i = 0; i < params.length; i++) {
      const temp = params[i].split('=');
      if ([temp[0]] === sname) { sval = temp[1]; }
    }
    return sval;
  },
  newMsg: (authorName, author, text, sticky, timestamp, timeStr) => {
    // Creates a new desktop notification
    if (DesktopNotifications.status) {
      if (author === clientVars.userId) return; // dont show my own!
      DesktopNotifications.createNotification(authorName, text);
    }
  },
};


const postAceInit = (hook, context) => {
  /* initialize properties */
  DesktopNotifications.status = false;
  DesktopNotifications.helpShown = false;

  // The README documents `?DesktopNotifications=true|false` as a way to
  // override the toggle. Now that the helper persists per-user state in
  // padcookie, write the URL value into the cookie before init reads it
  // — that way the override survives reload, matching the original intent.
  const urlOverride = DesktopNotifications.getParam('DesktopNotifications');
  if (urlOverride === 'true') padcookie.setPref('desktopNotifications', true);
  else if (urlOverride === 'false') padcookie.setPref('desktopNotifications', false);

  desktopToggle.init({
    onChange: (enabled) => {
      if (enabled) {
        DesktopNotifications.handleNotificationPermission(
            DesktopNotifications.notificationPermission()
        );
      } else {
        DesktopNotifications.disable();
      }
    },
  });
};

exports.postAceInit = postAceInit;

exports.chatNewMessage = (e, obj, cb) => {
  obj.authorName = obj.authorName || 'SYSTEM MESSAGE:';
  DesktopNotifications.newMsg(
      obj.authorName, obj.author, obj.text, obj.sticky, obj.timestamp, obj.timeStr);
  cb([null]);
};
