var DesktopNotifications = {
  enable: function(force) { // enables the line DesktopNotifications functionality (this is the defualt behavior)
    if (window.Notification) {
      if (force || Notification.permission == "default") {
        Notification.requestPermission(function(permission){
          if(permission == 'granted'){
            DesktopNotifications.status = true;
          } else {
            DesktopNotifications.status = false;
          }
        });
      } else if (Notification.permission == "granted") {
        DesktopNotifications.status = true;
      }
    };
  },
  disable: function() { // disable the line DesktopNotifications functionality
    DesktopNotifications.status = false;
  },
  getParam: function(sname)
  {
    var params = location.search.substr(location.search.indexOf("?")+1);
    var sval = "";
    params = params.split("&");
    // split param and value into individual pieces
    for (var i=0; i<params.length; i++)
    {
      temp = params[i].split("=");
      if ( [temp[0]] == sname ) { sval = temp[1]; }
    }
    return sval;
  },
  newMsg: function(authorName, author, text, sticky, timestamp, timestr){ // Creates a new desktop notification
    if(DesktopNotifications.status == true){
      if (!DesktopNotifications.firstNotificationShown) {
        DesktopNotifications.firstNotificationShown = true;
        DesktopNotifications.newMsgInner(
          'Notifications enabled', '',
          'You can disable notifications in the settings menu'
        );
      }
      DesktopNotifications.newMsgInner(authorName, author, text, sticky, timestamp, timestr);
    }
  },
  /* internal helper */
  newMsgInner: function(authorName, author, text, sticky, timestamp, timestr) {
    if (window.webkitNotifications) {
      window.webkitNotifications.createNotification("", authorName, text).show();
    } else if (window.Notification) {
      // I shouldn't show them from me..
      if(author === clientVars.userId) return; // dont show my own!
      new Notification(authorName, { icon: null, body: text });
    }
  }
}


var postAceInit = function(hook, context){
  /* initialize properties */
  DesktopNotifications.status = false;
  DesktopNotifications.firstNotificationShown = false;
  /* init */
  if($('#options-desktopNotifications').is(':checked')) {
    DesktopNotifications.enable(false);
  } else {
    DesktopNotifications.disable();
  }
  var urlContainsDesktopNotificationsTrue = (DesktopNotifications.getParam("DesktopNotifications") == "true"); // if the url param is set
  if(urlContainsDesktopNotificationsTrue){
    $('#options-desktopNotifications').attr('checked','checked');
    DesktopNotifications.enable(false);
  }else if (DesktopNotifications.getParam("DesktopNotifications") == "false"){
    $('#options-desktopNotifications').attr('checked',false);
    DesktopNotifications.disable();
  }
  /* on click */
  $('#options-desktopNotifications').on('click', function() {
    if($('#options-desktopNotifications').is(':checked')) {
      DesktopNotifications.enable(true); // enables Desktop Notifications
    } else {
      DesktopNotifications.disable(); // disables Desktop Notifications
    }
  });
};
exports.postAceInit = postAceInit;

exports.chatNewMessage = function(e, obj, cb){
  obj.authorName = obj.authorName || "SYSTEM MESSAGE:";
  DesktopNotifications.newMsg(obj.authorName, obj.author, obj.text, obj.sticky, obj.timestamp, obj.timeStr);
  cb([null]);
}
