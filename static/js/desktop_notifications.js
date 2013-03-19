var DesktopNotifications;
var postAceInit = function(hook, context){
  DesktopNotifications = {
    enable: function() { // enables the line DesktopNotifications functionality (this is the defualt behavior)
      $("#chaticon").click(function(){
        if (window.webkitNotifications.checkPermission() == 0) { // 0 is PERMISSION_ALLOWED
          // function defined in step 2
          DesktopNotifications.status = true;
          window.webkitNotifications.createNotification('', 'Notifications Enabled', 'Desktop notifications enabled, you can change your settings in the settings menu');
        }else{
          window.webkitNotifications.requestPermission();
        }
      });
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
    newMsg: function(msg){ // Creates a new desktop notification
      if(DesktopNotifications.status == true){
        window.webkitNotifications.createNotification("", msg.authorName, msg.text).show();
      }
    }	
  }
  /* init */
  if($('#options-desktopNotifications').is(':checked')) {
    DesktopNotifications.enable();
  } else {
    DesktopNotifications.disable();
  }
  var urlContainsDesktopNotificationsTrue = (DesktopNotifications.getParam("DesktopNotifications") == "true"); // if the url param is set
  if(urlContainsDesktopNotificationsTrue){
    $('#options-desktopNotifications').attr('checked','checked');
    DesktopNotifications.enable();
  }else if (DesktopNotifications.getParam("DesktopNotifications") == "false"){
    $('#options-desktopNotifications').attr('checked',false);
    DesktopNotifications.disable();
  } 
  /* on click */
  $('#options-desktopNotifications').on('click', function() {
    if($('#options-desktopNotifications').is(':checked')) {
      DesktopNotifications.enable(); // enables Desktop Notifications
    } else {
      DesktopNotifications.disable(); // disables Desktop Notifications
    }
  });
};
exports.postAceInit = postAceInit;

exports.chatNewMessage = function(name, msg){
  DesktopNotifications.newMsg(msg);  
}
