const ROLLBAR_CONFIG = {
  "www.eastbayinfo.com" : "Production",
  "weberealty.thrivebrokers.com" : "Production",
  "blue.eastbayinfo.com" : "Blue",
  "blue-weberealty.thrivebrokers.com" : "Blue",
  "developer5.eastbayinfo.com" : "Developer5",
  "developer5-weberealty.thrivebrokers.com" : "Developer5",
  "developer4.eastbayinfo.com" : "Developer4",
  "developer4-weberealty.thrivebrokers.com" : "Developer4",
  "developer9.eastbayinfo.com" : "Developer9",
  "developer9-weberealty.thrivebrokers.com" : "Developer9",
  "developer12.eastbayinfo.com" : "Developer12",
  "developer12-weberealty.thrivebrokers.com" : "Developer12",
  "realtor.reachpersona.com" : "Production-reachpersona"
}

var _rollbarConfig = {
  accessToken: '3a9451ec1ecb4f85876a84204843e1fe',
  captureUncaught: true,
  captureUnhandledRejections: true,
  retryInterval: 5000,
  autoInstrument: {
    network: true,
    log: true,
    dom: true,
    navigation: true,
    connectivity: true,
    contentSecurityPolicy: true,
    errorOnContentSecurityPolicy: true
  }, 
  payload: {
      environment: ''
  }
};

updateRollbarEnvironment();
updateRollbarPerson();

function updateRollbarEnvironment(){
  if(_rollbarConfig){
    let hostname = window.location.hostname;
    _rollbarConfig.payload.environment = ROLLBAR_CONFIG[hostname] ? ROLLBAR_CONFIG[hostname] : "NOT DEFINED";
  }
}

function updateRollbarPerson(){
  let userID;
  let interval_Rollbar_UserID = setInterval(function(){
    if(window.getUserIDFromCookie){
      userID = getUserIDFromCookie();
      if(userID){
        if(window.Rollbar){
          Rollbar.configure({payload: {person: {id: userID}}});
        }else{
          console.log("Rollbar is not available to configure Person");
        }
        clearInterval(interval_Rollbar_UserID);
      }
    }
  }, 1000);
}
