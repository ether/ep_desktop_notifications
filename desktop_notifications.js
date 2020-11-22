const eejs = require('ep_etherpad-lite/node/eejs/');
const settings = require('ep_etherpad-lite/node/utils/Settings');
let checked_state = '';

exports.eejsBlock_mySettings = function (hook_name, args, cb) {
  if (!settings.ep_desktop_notifications_default) checked_state = 'checked';
  args.content += eejs.require('ep_desktop_notifications/templates/desktop_notifications_entry.ejs', {checked: checked_state});
  return cb();
};

exports.eejsBlock_styles = function (hook_name, args, cb) {
  args.content += "<link href='../static/plugins/ep_desktop_notifications/static/css/desktop_notifications.css' rel='stylesheet'>";
  return cb();
};
