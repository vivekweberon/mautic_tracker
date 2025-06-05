console.log("rb-config.js loaded");
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
  accessToken: 'a369216935fe434cb70adca043caf58dae1824f3f9c85ebab328f55fba0d366c13fb124a5c15f323a0f1f390bcb24c5b',
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

if (typeof Rollbar !== 'undefined') {
  console.log("Rollbar is defined, initializing...");
  window.Rollbar = Rollbar.init(_rollbarConfig);
} else {
  console.error("Rollbar is NOT defined when trying to init");
}

updateRollbarPerson();

function updateRollbarEnvironment(){
  if(_rollbarConfig){
    let hostname = window.location.hostname;
    _rollbarConfig.payload.environment = ROLLBAR_CONFIG[hostname] ? ROLLBAR_CONFIG[hostname] : "NOT DEFINED";
  }
}

// function updateRollbarPerson(){
//   console.log("updateRollbarPerson called");
//   let userID;
//   let interval_Rollbar_UserID = setInterval(function(){
//     if(window.getUserIDFromCookie){
//       console.log("getUserIDFromCookie is available");
//       userID = getUserIDFromCookie();
//       if(userID){
//         console.log("UserID found: " + userID);
//         if(window.Rollbar){
//           console.log("Configuring Rollbar with UserID: " + userID);
//           Rollbar.configure({payload: {person: {id: userID}}});
//         }else{
//           console.log("Rollbar is not available to configure Person");
//         }
//         clearInterval(interval_Rollbar_UserID);
//         console.log("Rollbar UserID configuration complete");
//       }
//     }
//     console.log("Waiting for getUserIDFromCookie to be available...");
//   }, 1000);
// }

function updateRollbarPerson(){
  let userID;
  let interval_Rollbar_UserID = setInterval(function(){
    if(window.getUserIDFromCookie){
      userID = getUserIDFromCookie();
      if(userID){
        // Wait for Rollbar to be available
        if(window.Rollbar){
          Rollbar.configure({payload: {person: {id: userID}}});
          clearInterval(interval_Rollbar_UserID);
        }else{
          console.log("Rollbar is not available yet, waiting...");
        }
      }
    }
  }, 1000);
}