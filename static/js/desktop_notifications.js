var DesktopNotifications = {
  /* compatilibility layer */
  notificationSupported: function() {
    return !!window.Notification || !!window.webkitNotifications;
  },
  notificationPermission: function() {
    if (window.Notification) {
      return Notification.permission;
    } else if (window.webkitNotifications) {
      return webkitNotifications.checkPermission() === 0 ? "granted" : "default";
    } else {
      return "denied";
    }
  },
  requestNotificationPermission: function(cb) {
    if (window.Notification) {
      return Notification.requestPermission().then(cb);
    } else if (window.webkitNotifications) {
      return webkitNotifications.requestPermission(function() {
        cb(DesktopNotifications.notificationPermission());
      });
    } // else just chill
  },
  createNotification: function(authorName, text, lang) {
    if (window.Notification) {
      new Notification(authorName, { body: text, lang: lang });
    } else if (window.webkitNotifications) {
      window.webkitNotifications.createNotification("", authorName, text).show();
    } else {
      console.warn(authorName + " said: " + text);
    }
  },

  allowNotificationsToolbarEntryEnabled: function(status) {
    status = !!status;
    var previousEntry = $("#allowNotificationsToolbarEntry");
    var previousStatus = previousEntry.length > 0;
    if (status === previousStatus) {
      return;
    }
    if (status) {
      allowNotificationsToolbarEntry = $("<li>").attr({
        "id": "allowNotificationsToolbarEntry",
        "data-type": "button",
        "lang": "en",
      }).click(function() {
        DesktopNotifications.enable();
      }).append($("<a>").attr({
        "title": "Allow or forbid notifications",
        "aria-label": "Allow or forbid notifications",
      }).append($("<button>").attr({
        "id": "notification-permission-button",
        "class": "buttonicon buttonicon-chat",
        "title": "Allow or forbid notifications",
        "aria-label": "Allow or forbid notifications",
      })));
      var toolbar = $("#editbar > .menu_left");
      toolbar.append(allowNotificationsToolbarEntry);
    } else {
      previousEntry.remove();
    }
  },
  handleNotificationPermission: function(state) {
    DesktopNotifications.status = state === "granted";
    DesktopNotifications.allowNotificationsToolbarEntryEnabled(state === "default");
  },
  enable: function() { // enables notifications
    DesktopNotifications.requestNotificationPermission(function(result) {
      if (!DesktopNotifications.helpShown && result === "granted") {
        DesktopNotifications.helpShown = true;
        DesktopNotifications.createNotification(
          "Notifications enabled",
          "You can disable notifications in the settings menu",
          "en"
        );
      }
      DesktopNotifications.handleNotificationPermission(result);
    });
  },
  disable: function() { // disables notifications
    DesktopNotifications.handleNotificationPermission("denied");
  },
  getParam: function(sname) {
    var params = location.search.substr(location.search.indexOf("?")+1);
    var sval = "";
    params = params.split("&");
    // split param and value into individual pieces
    for (var i=0; i<params.length; i++) {
      temp = params[i].split("=");
      if ( [temp[0]] == sname ) { sval = temp[1]; }
    }
    return sval;
  },
  newMsg: function(authorName, author, text, sticky, timestamp, timeStr) { // Creates a new desktop notification
    if (DesktopNotifications.status) {
      if (author === clientVars.userId) return; // dont show my own!
      DesktopNotifications.createNotification(authorName, text);
    }
  }
}


var postAceInit = function(hook, context){
  /* initialize properties */
  DesktopNotifications.status = false;
  DesktopNotifications.helpShown = false;

  /* init */
  var $optionsDesktopNotifications = $("#options-desktopNotifications");
  var urlDesktopNotifications = DesktopNotifications.getParam("DesktopNotifications");
  if (urlDesktopNotifications === "true") {
    $optionsDesktopNotifications.attr("checked", "checked");
  } else if (urlDesktopNotifications === "false") {
    $optionsDesktopNotifications.attr("checked", false);
  }
  if($optionsDesktopNotifications.is(":checked")) {
    DesktopNotifications.handleNotificationPermission(
      DesktopNotifications.notificationPermission()
    );
  } else {
    DesktopNotifications.disable();
  }

  /* on click */
  $optionsDesktopNotifications.click(function() {
    if ($optionsDesktopNotifications.is(":checked")) {
      DesktopNotifications.enable();
    } else {
      DesktopNotifications.disable();
    }
  });
};

exports.postAceInit = postAceInit;

exports.chatNewMessage = function(e, obj, cb){
  obj.authorName = obj.authorName || "SYSTEM MESSAGE:";
  DesktopNotifications.newMsg(obj.authorName, obj.author, obj.text, obj.sticky, obj.timestamp, obj.timeStr);
  cb([null]);
}
