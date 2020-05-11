var eejs = require('ep_etherpad-lite/node/eejs/');
var settings = require('ep_etherpad-lite/node/utils/Settings');
var checked_state = '';

exports.eejsBlock_mySettings = function (hook_name, args, cb) {
  if (!settings.ep_desktop_notifications_default) checked_state = 'checked';
  args.content = args.content + eejs.require('ep_desktop_notifications/templates/desktop_notifications_entry.ejs', {checked : checked_state});
  return cb();
}

exports.eejsBlock_styles = function (hook_name, args, cb) {
  args.content = args.content + `
    <style>
      @keyframes notification-permission-button {
        0% { color: inherit; }
        100% { color: #FFBF00; }
      }
      #notification-permission-button {
        color: #FFBF00;
        animation: notification-permission-button 2s ease-out 0s infinite alternate;
      }
    </style>`;
  return cb();
}
