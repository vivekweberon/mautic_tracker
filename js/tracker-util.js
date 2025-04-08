console.log("tracker-util.js loaded");
const GTM_CONFIG = { 
  "www.eastbayinfo.com" : "GTM-MNS9VNQ",
  "weberealty.thrivebrokers.com" : "GTM-MNS9VNQ",
  "blue.eastbayinfo.com" : "GTM-WQKQHT2",
  "blue-weberealty.thrivebrokers.com" : "GTM-WQKQHT2"
}
  
const USERID_PREFIX_CONFIG = {
  "my.eastbayinfo.com" : "EC",
  "my.thrivebrokers.com" : "TC",
  "leads-blue.eastbayinfo.com" : "EC",
  "leads-blue-weberealty.thrivebrokers.com" : "TC",
  "alpha.eastbayinfo.org" : "EC",
  "alpha.weberon.org" : "TC",
  "my.reachpersona.com" : "TC",
  "my.serenest.services" : "TC"
}

const MAUTIC_SRC_CONFIG = {
  "www.eastbayinfo.com" : "https://my.eastbayinfo.com",
  "weberealty.thrivebrokers.com" : "https://my.thrivebrokers.com",
  "blue.eastbayinfo.com" : "https://leads-blue.eastbayinfo.com",
  "blue-weberealty.thrivebrokers.com" : "https://leads-blue-weberealty.thrivebrokers.com",
  "developer5.eastbayinfo.com" : "https://leads-blue.eastbayinfo.com",
  "developer5-weberealty.thrivebrokers.com" : "https://leads-blue-weberealty.thrivebrokers.com",
  "developer4.eastbayinfo.com" : "https://leads-blue.eastbayinfo.com",
  "developer4-weberealty.thrivebrokers.com" : "https://leads-blue-weberealty.thrivebrokers.com",
  "developer9.eastbayinfo.com" : "https://leads-blue.eastbayinfo.com",
  "developer9-weberealty.thrivebrokers.com" : "https://leads-blue-weberealty.thrivebrokers.com",
  "developer12.eastbayinfo.com" : "https://leads-blue.eastbayinfo.com",
  "developer12-weberealty.thrivebrokers.com" : "https://leads-blue-weberealty.thrivebrokers.com",
  "alpha-ud.eastbayinfo.org" : "https://alpha.eastbayinfo.org",
  "alpha-bd.weberon.org" : "https://alpha.weberon.org",
  "realtor.reachpersona.com" : "https://my.reachpersona.com",
  "serenest.services" : "https://my.serenest.services",
  "www.serenest.services" : "https://my.serenest.services",
  "ns-blue-weberealty.thrivebrokers.com" : "https://leads-blue-weberealty.thrivebrokers.com"
}

const LP_CTA_LINK_DOMAIN_CONFIG = {
  "www.eastbayinfo.com" : "weberealty.thrivebrokers.com",
  "weberealty.thrivebrokers.com" : "weberealty.thrivebrokers.com",
  "blue.eastbayinfo.com" : "blue-weberealty.thrivebrokers.com",
  "blue-weberealty.thrivebrokers.com" : "blue-weberealty.thrivebrokers.com",
  "developer5.eastbayinfo.com" : "blue-weberealty.thrivebrokers.com",
  "developer5-weberealty.thrivebrokers.com" : "blue-weberealty.thrivebrokers.com",
  "developer4.eastbayinfo.com" : "blue-weberealty.thrivebrokers.com",
  "developer4-weberealty.thrivebrokers.com" : "blue-weberealty.thrivebrokers.com",
  "developer9.eastbayinfo.com" : "blue-weberealty.thrivebrokers.com",
  "developer9-weberealty.thrivebrokers.com" : "blue-weberealty.thrivebrokers.com",
  "developer12.eastbayinfo.com" : "blue-weberealty.thrivebrokers.com",
  "developer12-weberealty.thrivebrokers.com" : "blue-weberealty.thrivebrokers.com",
  "alpha-ud.eastbayinfo.org" : "alpha-bd.eastbayinfo.org",
  "ns-blue-weberealty.thrivebrokers.com" : "https://leads-blue-weberealty.thrivebrokers.com"
}

let mauticSrc = "";
let lp_CTA_Link_Domain = "";
let g_client_id = '819755038455-07s13rbrbq92u2hoa07mutpfk8hrtrb9.apps.googleusercontent.com';

setMauticSrc();
setLpCTALinkDomain();

function setMauticSrc(){
  if(MAUTIC_SRC_CONFIG){
    let hostname = window.location.hostname;
    mauticSrc = MAUTIC_SRC_CONFIG[hostname];
    if(!mauticSrc){
      logError("mauticSrc is not defined for this Domain");
    }
  }else{
    logError("MAUTIC_SRC_CONFIG is not defined");
  }
}

function setLpCTALinkDomain(){
  if(LP_CTA_LINK_DOMAIN_CONFIG){
    let hostname = window.location.hostname;
    lp_CTA_Link_Domain = LP_CTA_LINK_DOMAIN_CONFIG[hostname];
    if(!lp_CTA_Link_Domain){
      logError("lp_CTA_Link_Domain is not defined for this Domain");
    }
  }else{
    logError("LP_CTA_LINK_DOMAIN_CONFIG is not defined");
  }
}

function getSearchParams(url_string){
  var params2 = {}
  try {
    var url = new URL(url_string);
    var search = url.search;
    search.substr(1).split('&').forEach(function(pair) {
      var keyValues = pair.split('=')
      params2[keyValues[0]] = keyValues[1]
    })
  } catch (e) {
    console.log(e)
  }
  return params2;
}

function getQueryParameter(name){
  var value;
  try {
    value = getSearchParams(window.location.href)[name];
  } catch (err) {}
  return value;
}
