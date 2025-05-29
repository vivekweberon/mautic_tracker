const MT_ERROR = "Error invoking mt method";
if(_rollbarConfig){
  _rollbarConfig.payload.user = getClientInfo();
}

// Rollbar Snippet
// End Rollbar Snippet

function logResourceLoadError(ref) {
  let err = "Error loading: '"+ (ref.src || ref.href) +"'";
  if(window.Rollbar){
    Rollbar.error(err);
  }else{
    console.log(err);
  }
  return false;
}

function logError(err){
  if(window.Rollbar){
    Rollbar.error(err);
  }else{
    console.log(err);
  }
}

function getClientInfo(){
  let client = {};
  client.userAgent = navigator.userAgent;
  client.browser = getBrowserName();
  client.cookieEnabled = navigator.cookieEnabled;
  client.language = navigator.language;
  client.vendor = navigator.vendor;
  client.webdriver = navigator.webdriver;
  client.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  client.PageURL = window.location.href
  client.referrer = (document.referrer == "") ? "Direct" : document.referrer;
  return client;
}

function getBrowserName(){
  let sBrowser, sUsrAg = navigator.userAgent;
  if (sUsrAg.indexOf("Firefox") > -1) {
    sBrowser = "Mozilla Firefox";
  } else if (sUsrAg.indexOf("SamsungBrowser") > -1) {
    sBrowser = "Samsung Internet";
  } else if (sUsrAg.indexOf("Opera") > -1 || sUsrAg.indexOf("OPR") > -1) {
    sBrowser = "Opera";
  } else if (sUsrAg.indexOf("Trident") > -1) {
    sBrowser = "Microsoft Internet Explorer";
  } else if (sUsrAg.indexOf("Edge") > -1) {
    sBrowser = "Microsoft Edge (Legacy)";
  } else if (sUsrAg.indexOf("Edg") > -1) {
    sBrowser = "Microsoft Edge (Chromium)";
  } else if (sUsrAg.indexOf("Chrome") > -1) {
    sBrowser = "Google Chrome or Chromium";
  } else if (sUsrAg.indexOf("Safari") > -1) {
    sBrowser = "Apple Safari";
  } else {
    sBrowser = "unknown";
  }
  return sBrowser;
}