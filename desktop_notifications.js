'use strict';

const {padToggle} = require('ep_plugin_helpers/pad-toggle-server');

// Parallel User Settings + Pad Wide Settings checkboxes for "Desktop
// Notifications". Helper owns markup, storage, broadcast, enforce, and i18n.
const desktopToggle = padToggle({
  pluginName: 'ep_desktop_notifications',
  settingId: 'desktopNotifications',
  l10nId: 'ep_desktop_notifications.desktopNotifications',
  defaultLabel: 'Desktop Notifications',
  defaultEnabled: true,
});

// The previous version honored a top-level `ep_desktop_notifications_default`
// key with inverted semantics (truthy = default off). Translate to the
// helper's nested `defaultEnabled` so existing installs keep their behavior.
exports.loadSettings = async (hookName, args) => {
  const root = args && args.settings;
  if (root) {
    const ps = (root.ep_desktop_notifications = root.ep_desktop_notifications || {});
    if (typeof ps.defaultEnabled !== 'boolean' &&
        typeof root.ep_desktop_notifications_default === 'boolean') {
      ps.defaultEnabled = !root.ep_desktop_notifications_default;
    }
  }
  return desktopToggle.loadSettings(hookName, args);
};

exports.clientVars = desktopToggle.clientVars;
exports.eejsBlock_mySettings = desktopToggle.eejsBlock_mySettings;
exports.eejsBlock_padSettings = desktopToggle.eejsBlock_padSettings;

exports.eejsBlock_styles = (hookName, args, cb) => {
  const url = '../static/plugins/ep_desktop_notifications/static/css/desktop_notifications.css';
  args.content += `<link href="${url}" rel='stylesheet'>`;
  return cb();
};
