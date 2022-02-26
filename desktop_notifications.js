'use strict';

const eejs = require('ep_etherpad-lite/node/eejs/');
const settings = require('ep_etherpad-lite/node/utils/Settings');
let checkedState = '';

exports.eejsBlock_mySettings = (hookName, args, cb) => {
  if (!settings.ep_desktop_notifications_default) checkedState = 'checked';
  args.content +=
    eejs.require('ep_desktop_notifications/templates/desktop_notifications_entry.ejs',
        {
          checked: checkedState,
        },
    );
  return cb();
};

exports.eejsBlock_styles = (hookName, args, cb) => {
  const url = '../static/plugins/ep_desktop_notifications/static/css/desktop_notifications.css';
  args.content += `<link href="${url}" rel='stylesheet'>`;
  return cb();
};
