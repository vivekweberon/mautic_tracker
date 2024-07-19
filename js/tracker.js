let gtmContainerID;

if (GTM_CONFIG) {
  let hostname = window.location.hostname;
  gtmContainerID = GTM_CONFIG[hostname];
  if (gtmContainerID) {
    let gtmScript = document.createElement("script");
    let gtmCode = "(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','" + gtmContainerID + "');"
    gtmScript.innerHTML = gtmCode;
    let head = document.getElementsByTagName('head')[0];
    head.prepend(gtmScript);
  }
}

if (typeof MauticFormCallback == 'undefined') {
  var MauticFormCallback = {};
}

let utmTagsFormName;
let utmTagsFormID;
let progressiveFormName;
let progressiveFormID;
let formName;
let formID;
let areaCodeRegex = '';
let mFormSlotID;

// Query Parameters
let utmSource;
let utmMedium;
let utmCampaign;
let utmContent;
let utmTerm;
let cs;
let pageTitle;
let pCode;
let currentPageName = getCurrentPageName();
let FORMSETS;
let formLoaded = false;
let oauthLoginRequired = true;
let enableGoogleOneTap = true;
let enableGoogleSignIn = true;
let embeddedFormForKnownContacts = false;
let embeddedFormSlotID;
let unsubscribeEnabled = false;
let unsubscribeInstruction = 'We hope you found this Useful. To unsubscribe,'
let unsubscribeLinkText = 'Click here';
let unsubscribeCollateral = '';
let unsubscribeAnonymousUserMessage = 'Please introduce yourself by submitting the form given below inorder to Unsubscribe';
let resubscribeInstruction = 'You have unsubscribed to this mailing. To re-subscribe,';
let resubscribeLinkText = 'Click here';
let resubscribeSuccessMessage = 'You have been Resubscribed to this mailing';
let feedbackFormName;
let feedbackFormID;
let feedbackFormSlotID = 'feedbackContent';
const FEEDBACK_FORMSET_NAME = 'feedback';

extractQueryParameters();
setAreaCodeRegEx();

function addMauticFormHooksOnSubmitAndOnResponse(fName) {
  MauticFormCallback[fName] = {
    onValidateEnd: function (formValid) {
      if(formValid){
        onFormSubmitEvent();
      }
    },
    onResponseEnd: function (response) {
      setTimeout(function () {
        location.reload();
      }, 2000);
    }
  };
}

function addMauticFormHookForFeedbackForm(fName) {
  MauticFormCallback[fName] = {
    onValidateEnd: function (formValid) {
      if(formValid){
        onFeedbackFormSubmitEvent();
      }
    },
    onResponseEnd: function (response) {
      setTimeout(function () {
        location.reload();
      }, 2000);
    }
  };
}

function getFormsetName_UTM(currentPageName, utmCampaign, FORMSETS){
  let formsetName;
  if ((currentPageName) && (utmCampaign) && (FORMSETS)) {
    formsetName = FORMSETS['cf:'+currentPageName+':'+utmCampaign];
  }
  return formsetName;
}

function getFormsetName_PageName(currentPageName, FORMSETS){
  let formsetName;
  if ((currentPageName) && (FORMSETS)) {
    formsetName = FORMSETS[currentPageName];
  }
  return formsetName;
}

function getFormsetName(currentPageName, utmCampaign, FORMSETS){
  let formsetName = getFormsetName_UTM(currentPageName, utmCampaign, FORMSETS);
  formsetName = formsetName ? formsetName : getFormsetName_PageName(currentPageName, FORMSETS);
  return formsetName;
}

function setMauticForms(FORMSET_NAME) {
  
  if (FORMSET_NAME == undefined) {
    setFormsets();
    FORMSET_NAME = getFormsetName(currentPageName, utmCampaign, FORMSETS);
  }

  if (MAUTIC_FORMSET[FORMSET_NAME]) {
    [progressiveFormName, progressiveFormID] = MAUTIC_FORMSET[FORMSET_NAME];
    setForm(progressiveFormName, progressiveFormID);
    addMauticFormHooksOnSubmitAndOnResponse(progressiveFormName);
  }
}

function setFeedbackForm(){
  if (MAUTIC_FORMSET[FEEDBACK_FORMSET_NAME]) {
    [feedbackFormName, feedbackFormID] = MAUTIC_FORMSET[FEEDBACK_FORMSET_NAME];
    addMauticFormHookForFeedbackForm(feedbackFormName);
  }
}

function setFormsets(){
  if(!FORMSETS){
    FORMSETS = getFormsets();
  }
}

function isCampaignValid(){
  setFormsets();
  let formsetName = getFormsetName_UTM(currentPageName, utmCampaign, FORMSETS);
  return (formsetName ? true : false);
}

function loadMenu(){
  return !isCampaignValid();
}

function updateBanner(){
  if(isCampaignValid()){
    addBorderOnTopOfTheBanner();
    loadCampaignBanner(currentPageName, utmCampaign);
  }else{
    loadPageBanner(currentPageName);
  }
}

function addBorderOnTopOfTheBanner(){
  let bannerHeader = document.getElementById('banner_header');
  if(bannerHeader){
    bannerHeader.style.borderTop = 'thick solid gray'; 
  }
}

function loadPageBanner(currentPageName){
  replaceBanner("p-"+currentPageName+"-banner");
}

function loadCampaignBanner(currentPageName, utmCampaign){
  let bannerName = "c-"+currentPageName+"-"+utmCampaign+"-banner";
  let pBanner = document.getElementById("pBanner");
  
  if(pBanner){
    let sources = '<source media="(min-width: 0px) and (max-width: 576px)" srcset="images/sw/banners/new/'+bannerName+'-576x270.jpg">'+
    '<source media="(min-width: 577px) and (max-width: 768px)" srcset="images/sw/banners/new/'+bannerName+'-768x270.jpg">';
    $(pBanner).prepend(sources);
  }
  replaceBanner(bannerName);
}

function replaceBanner(imageName){
  let banner = document.getElementById("banner");
  if(banner){
    let imgURL = banner.getAttribute("src");
    if(imgURL){
      banner.setAttribute("src", imgURL.replace("default_banner", imageName));
    }
  }
}

function extractQueryParameters() {
  let params = getSearchParams(window.location.href);
  setUTMParameters(params);
  setCampaignSource();
  setPageTitle();
  setPcode(params);
}

function setUTMParameters(params) {
  let utmParams = ['utm_medium', 'utm_source', 'utm_campaign', 'utm_content', 'utm_term'];
  let utmValues = utmParams.map(function(utm){
    return (params[utm] == undefined ? "" : decodeURIComponent((params[utm]).trim()));
  })
  utmMedium = utmValues[0];
  utmSource = utmValues[1];
  utmCampaign = utmValues[2];
  utmContent = utmValues[3];
  utmTerm = utmValues[4];
}

function setCampaignSource() {
  cs = getCampaignSource();
}

function setPcode(params) {
  pCode = extractPcode(params["pcode"]);
}

function setPageTitle(){
  pageTitle = '';
  let title = document.querySelector("title");
  if((title)&&(title.textContent)){
    pageTitle = title.textContent
    if(cs){
      pageTitle += ': '+cs;
    }
  }
}

function trackParametersOnPageLoad() {
  trackPhoneCTA();
  if (pCode != undefined) {
    mt('send', 'pageview', { page_title: pageTitle, pcode: pCode, tags: cs }, { onerror: function () { logError(MT_ERROR) } });
  }
  else {
    mt('send', 'pageview', { page_title: pageTitle, tags: cs }, { onerror: function () { logError(MT_ERROR) } });
  }
}

function trackPhoneCTA() {
  $("a[href^='tel']").on('click', function(e){
    let href = this.getAttribute("href");
    let arr = href.split(",");
    let pageTitle= 'Tried Calling: ' + arr[0];
    pageTitle += (arr.length > 1 ? (" ext:" + arr[arr.length -1]) : "");
    if(window.mt){
      mt('send', 'pageview', { page_title: pageTitle }, { onerror: function () { logError(MT_ERROR) } });
    }else{
      let err = 'mt method not found';
      logError(err);
      console.log(err);
    } 
  });
}

function reWriteURLS() {
  let href;
  let newHref;
  let params;
  $("a").each(function (index) {
    href = $(this).attr("href");
    if ((href != undefined) && (href != '') && (!href.includes('tel:')) && (!href.includes('mailto:')) && (!href.includes('#')) && (!href.includes('javascript:'))) {
      params = getQueryParameters(href);
      newHref = href.includes('?') ? href + "&" : href + "?";
      newHref = (utmSource && !('utm_source' in params)) ? newHref + "utm_source=" + utmSource + "&" : newHref;
      newHref = (utmMedium && !('utm_medium' in params)) ? newHref + "utm_medium=" + utmMedium + "&" : newHref;
      newHref = (utmCampaign && !('utm_campaign' in params)) ? newHref + "utm_campaign=" + utmCampaign + "&" : newHref;
      newHref = (utmContent && !('utm_content' in params)) ? newHref + "utm_content=" + utmContent + "&" : newHref;
      newHref = (utmTerm && !('utm_term' in params)) ? newHref + "utm_term=" + utmTerm + "&" : newHref;
      newHref = (newHref.endsWith("&") || newHref.endsWith("?")) ? newHref.slice(0, -1) : newHref;
      $(this).attr("href", newHref);
    }
  });
}

function getQueryParameters(url) {
  let newURL = (!url.startsWith('https')) ? (url.startsWith('/') ? 'https://getqueryparameters.com' + url : 'https://getqueryparameters.com/' + url) : url;
  return getSearchParams(newURL);
}

function getCampaignSource() {
  let campaignSource = "";
  if ((utmCampaign) && (utmSource) && (utmMedium)) {
    campaignSource = utmCampaign + "-" + utmSource + "-" + utmMedium;
  }
  return campaignSource;
}

function isEndOfForm() {
  let ret = false;
  if (formName == progressiveFormName) {
    ret = isEndOfProgressiveForm();
  }
  return ret;
}

function isEndOfProgressiveForm() {
  let ret = false;
  if(formName != 'pfhomewardboundlp'){
    let email = document.getElementById("mauticform_input_" + formName + "_f_email");
    let phone = document.getElementById("mauticform_input_" + formName + "_f_phone");
    let fullname = document.getElementById("mauticform_input_" + formName + "_fullname");
    ret = ((email == null) && (phone == null) && (fullname == null));
  }
  return ret;
}

function displayPopupForm() {
  if (popupForm) {
    let endOfForm = isEndOfForm();
    let pageID = getPageID();
    let submitFlag = (localStorage.getItem(pageID + '-sf') == undefined) ? 0 : Number(localStorage.getItem(pageID + '-sf'));
    let count = (localStorage.getItem(pageID + '-count') == undefined) ? 0 : Number(localStorage.getItem(pageID + '-count'));
    let lpModal = document.getElementById("lpModal");
    let lpClose = document.getElementById("lpClose");
    let body = document.getElementsByTagName("body")[0];

    lpClose.onclick = function () {
      if ((localStorage.getItem(pageID + '-count') == undefined) || (Number(localStorage.getItem(pageID + '-count')) < nTimes)) {
        lpModal.style.display = "none";
        body.style.overflow = "auto";
        displayForm(lpModal);
        count++;
        localStorage.setItem(pageID + '-count', count.toString());
        if (controlVideos) {
          playVideosIfPaused();
        }
      }
    }

    if (!endOfForm) {
      if (submitFlag == 1) {
        submitFlag = 0;
        localStorage.setItem(pageID + '-sf', submitFlag.toString());
        count = 0;
        localStorage.setItem(pageID + '-count', count.toString());
        displayForm(lpModal, zDuration);
      }
      else if (count == nTimes) {
        lpModal.style.display = "block";
        body.style.overflow = "hidden";
      }
      else {
        displayForm(lpModal);
      }
    }
    else {
      lpModal.style.display = "none";
      body.style.overflow = "auto";
    }
  }
}

function hideLastForm() {
  let form = document.getElementById("mauticform_" + formName);
  form.parentNode.removeChild(form);
  if (formName == progressiveFormName) {
    resetMauticSDK();
  }
}

function onFormSubmitEvent() {
  let lpTag = currentPageName;
  let pageID = getPageID();
  // store the update in session storage, which will be sent after form submission
  let mtSendUpdate;
  let formData = {};
  let pageTitle = 'Form submitted on: ' + lpTag;
  if (pCode != undefined) {
    mtSendUpdate = { page_title: pageTitle, pcode: pCode, tags: lpTag };
  }
  else {
    mtSendUpdate = { page_title: pageTitle, tags: lpTag };
  }
  sessionStorage.mtSendUpdate = JSON.stringify(mtSendUpdate);

  // to update alias field
  let alias = document.getElementById("mauticform_input_" + formName + "_alias");
  let fullname = document.getElementById("mauticform_input_" + formName + "_fullname");
  if ((fullname != undefined) && (alias != undefined)) {
    alias.value = fullname.value;
    formData.fullname = fullname.value;
  }

  // set popup form submission flag for the page
  if (popupForm) {
    localStorage.setItem(pageID + '-sf', "1");
  }

  // to update email and phone submitted fields
  let femail = document.getElementById("mauticform_input_" + formName + "_f_email");
  let fphone = document.getElementById("mauticform_input_" + formName + "_f_phone");
  let email_submitted = document.getElementById("mauticform_input_" + formName + "_email_submitted");
  let phone_submitted = document.getElementById("mauticform_input_" + formName + "_phone_submitted");
  if ((femail) && (email_submitted)) {
    email_submitted.value = 'yes';
    formData.email = femail.value;
  }
  if ((fphone) && (phone_submitted)) {
    phone_submitted.value = 'yes';
    formData.phone = fphone.value;
  }

  //send form data to Rollbar
  if (window.Rollbar) {
    Rollbar.info("Form-Submission", formData);
  }

  // to update report name
  updateReportField(lpTag);
}

function updateReportField(lpTag){
  let report = document.getElementById("mauticform_input_" + formName + "_report");
  if ((reports) && (report)) {
    let reportName = reports[lpTag];
    if (reportName) {
      report.value = reportName;
    }else {
      report.value = "NA";
    }
  }
}

function setMauticFormFields(formName) {
  let cUTMSourceField = document.getElementById("mauticform_input_" + formName + "_c_utm_source");
  let cUTMMediumField = document.getElementById("mauticform_input_" + formName + "_c_utm_medium");
  let cUTMCampaignField = document.getElementById("mauticform_input_" + formName + "_c_utm_campaign");
  let cUTMTermField = document.getElementById("mauticform_input_" + formName + "_c_utm_term");
  let cUTMContentField = document.getElementById("mauticform_input_" + formName + "_c_utm_content");

  if((cUTMSourceField)&&(cUTMMediumField)&&(cUTMCampaignField)&&(cUTMTermField)&&(cUTMContentField)){
    cUTMSourceField.value = utmSource;
    cUTMMediumField.value = utmMedium;
    cUTMCampaignField.value = utmCampaign;
    cUTMTermField.value = utmTerm;
    cUTMContentField.value = utmContent;
  }
  setCurrentPage(formName);
}

function addValidationToFields() {
  let emailFields = ['email', 'f_email', 'friend_email'];
  let phoneFields = ['phone', 'f_phone', 'friend_phone'];

  emailFields.forEach(function(fieldName){
    let email = document.getElementById("mauticform_input_" + formName + "_" + fieldName);
    if(email){
      validateField(email);
    }
  })

  phoneFields.forEach(function(fieldName){
    let phone = document.getElementById("mauticform_input_" + formName + "_" + fieldName);
    if(phone){
      addPhoneValidation(phone);
      validateField(phone);
    }
  })
}

function replaceForm(rFormName, rFormID) {
  removeForm(mFormSlotID);
  formName = rFormName;
  formID = rFormID;
  loadForm(mFormSlotID);
}

function setCurrentPage(formName){
  let currentPage = document.getElementById("mauticform_input_" + formName + "_currentpage");
  if(currentPage){
    let pageID = getPageID();
    if(pageID){
      currentPage.value = (currentPageName == pageID)? currentPageName : currentPageName+"/?id="+pageID;
    }else{
      currentPage.value = currentPageName; 
    }
  }
}

function removeForm(mFormSlotID) {
  let formSlot = document.getElementById(mFormSlotID);
  if (mFormSlotID == 'aside') {
    while (formSlot.children.length > 0) {
      formSlot.removeChild(formSlot.children[0]);
    }
  }
  else {
    while (formSlot.children.length > 1) {
      formSlot.removeChild(formSlot.children[1]);
    }
  }
  resetMauticSDK();
}

function resetMauticSDK() {
  let head = document.getElementsByTagName('head')[0];
  let sts = head.getElementsByTagName('script');
  if (sts.length > 0) {
    let src;
    for (let i = 0; i < sts.length; ++i) {
      src = (sts[i]).getAttribute("src");
      if (((src) && (src.includes("mautic-form.js"))) || ((src == undefined) && (((sts[i]).innerHTML).includes("This section is only needed once per page")))) {
        head.removeChild(sts[i]);
        --i;
      }
    }
    MauticSDKLoaded = undefined;
    MauticSDK = undefined;
  }
}

function setCurrentUrl(formName) {
  let rtn = document.getElementById("mauticform_" + formName + "_return");
  if (rtn) {
    let contactAnchor = mFormSlotID ? ("#" + mFormSlotID) : "";
    let href = window.location.href;
    if (contactAnchor) {
      href = href.includes(contactAnchor) ? href : href + contactAnchor;
    }
    rtn.value = href;
  }
}

function updateFormActionAttribute(formName) {
  let mForm = document.getElementById("mauticform_" + formName);
  if (mForm) {
    let arr = (window.location.href).split('?');
    if ((arr.length == 2) && (arr[1] != undefined) && (arr[1] != '')) {
      let action = mForm.getAttribute("action");
      action = action + "&" + arr[1];
      mForm.setAttribute('action', action);
    }
  }
}

function createFormHeader() {
  let alias = document.getElementById("mauticform_input_" + formName + "_alias");
  let emailVerified = document.getElementById("mauticform_input_" + formName + "_ev");
  let formHeader = '';

  if (formName == progressiveFormName) {
    let email = document.getElementById("mauticform_input_" + formName + "_f_email");
    let phone = document.getElementById("mauticform_input_" + formName + "_f_phone");
    formHeader = (email != undefined) ? emailFormHeader : (phone != undefined) ? phoneFormHeader : (window.customFormHeader != undefined) ? window.customFormHeader : "";
  }

  let div = document.createElement("div");
  div.id = "msg";
  div.setAttribute("class", "formHeader");
  div.innerHTML = formHeader;
  addElementBeforeOrAfter(div);

  if (alias) {
    alias = alias.value;
    if ((alias) && (emailVerified.value == 'true')) {
      formHeader = 'Welcome ' + alias;
      let div = document.createElement("div");
      div.setAttribute("class", "welcomeMessage");
      div.innerHTML = formHeader;
      addElementBeforeOrAfter(div);
    }
  }
}

function validateAreaCode(phoneNumber) {
  let ret = false;
  if ((phoneNumber) && (phoneNumber != '') && (phoneNumber.includes('-')) && (areaCodeRegex != '')) {
    let val = phoneNumber.split('-')[0];
    if (areaCodeRegex.test('1' + val)) {
      ret = true;
    }
  }
  return ret;
}

function addPhoneValidation(phone) {
  phone.addEventListener('input', function (e) {
    var x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
    e.target.value = !x[2] ? x[1] : x[1] + '-' + x[2] + (x[3] ? '-' + x[3] : '');
    let result = validateAreaCode(phone.value);
    if (!result) {
      phone.setCustomValidity('Please enter valid US phone number.');
    }
    else {
      phone.setCustomValidity('');
    }
  });
}

function extractPcode(pcodeStr) {
  let pcode = pcodeStr;
  if ((pcode != undefined) && (pcode != '')) {
    pcode = pcode.trim();
    pcode = decodeURIComponent(pcode);
    pcode = pcode.split('?')[0];
    pcode = pcode.endsWith("/") ? pcode.substring(0, pcode.length - 1) : pcode;
    let pcodeArr = pcode.split('/');
    pcode = pcodeArr[pcodeArr.length - 1];
    pcode = pcode.includes('-') ? (pcode.split('-')[1]) : pcode;
    pcode = (pcode == '') ? undefined : pcode;
  }
  else {
    pcode = undefined;
  }
  return pcode;
}

function loadForm(formSlotId, readMore) {
  mFormSlotID = formSlotId;
  let mtSendUpdate = sessionStorage.mtSendUpdate;
  if ((mtSendUpdate != undefined) && (mtSendUpdate != '')) {
    mtSendUpdate = JSON.parse(mtSendUpdate);
    mt('send', 'pageview', mtSendUpdate, { onload: function () { sessionStorage.mtSendUpdate = ''; loadForm(formSlotId, readMore); }, onerror: function () { logError(MT_ERROR) } });
  }
  else {
    if (readMore) {
      let readMoreFlag = localStorage.getItem(currentPageName + "-readMore");
      if(readMoreFlag != 'yes'){
        return; 
      }
    }

    if (pCode) {
      identifyUserAndLoadMauticForm();
    }
    else {
      loadMauticForm();
    }
  }
}

function loadMauticForm() {
  if ((page == 'm_lp') || (page == 'm_asset')) {
    formOnload();
  } else {
    let aside = document.getElementById(mFormSlotID);
    let src = mauticSrc + "/form/generate.js?id=" + formID;
    let script = document.createElement('script');
    script.setAttribute('src', src);
    script.addEventListener('load', function () {
      formLoaded = true;
      formOnload();
    });
    script.onerror = function () {
      logResourceLoadError(this);
    };
    aside.appendChild(script);
  }
}

function isFormLoaded(){
  return formLoaded;
}

function identifyUserAndLoadMauticForm() {
  if (pCode != undefined) {
    let pageTitle = 'Known user visit: ' + pCode;
    mt('send', 'pageview', { page_title: pageTitle, pcode: pCode }, { onload: function () { loadMauticForm(); }, onerror: function () { logError(MT_ERROR) } });
  }
  else {
    loadMauticForm();
  }
}

function sendEmailOrPhoneVerifiedEvents(id) {
  if (((id == "ev") || (id == "sv")) && (sessionStorage.getItem('gtm_' + id) != 'yes')) {
    let ev = document.getElementById("mauticform_input_" + progressiveFormName + "_" + id);
    if ((ev) && (ev.value == "true")) {
      let eventName = (id == "ev") ? "emailVerified" : "phoneVerified";
      window.dataLayer.push({
        event: eventName
      });
      sessionStorage.setItem('gtm_' + id, 'yes');
    }
  }
}

function sendGTMEvents() {
  sendEmailOrPhoneVerifiedEvents("ev");
  sendEmailOrPhoneVerifiedEvents("sv");
}

function onFeedbackFormSubmitEvent(){
  let pageTitle = 'Unsubscribed from '+ unsubscribeCollateral;
  sessionStorage.setItem('unsubscribed-'+currentPageName, 'yes');
  mt('send', 'pageview', { page_title: pageTitle, tags: 'unsubscribe-'+unsubscribeCollateral.toLowerCase() }, { onerror: function () { logError(MT_ERROR) } });
  addResubscribeLink();
}

function loadFeedbackForm() {
  let formSlot = document.getElementById(feedbackFormSlotID);
  if(formSlot){
    let src = mauticSrc + "/form/generate.js?id="+feedbackFormID;
    let script = document.createElement('script');
    script.setAttribute('src', src);
    script.addEventListener('load', function () {
      setMauticFormFields(feedbackFormName);
      addFeedbackFormHeader();
      displayFeedbackForm();
      setCurrentUrl(feedbackFormName);
      updateFormActionAttribute(feedbackFormName);
    });
    script.onerror = function () {
      logResourceLoadError(this);
    };
    formSlot.appendChild(script);
  }else{
    logError('feedbackFormSlot is not defined');
    console.log('feedbackFormSlot is not defined');
  }
}

function addFeedbackFormHeader(){
  let div = document.createElement("div");
  div.id = "feedbackFormHeader";
  div.setAttribute("class", "formHeader");
  div.innerHTML = feedbackFormHeader;
  let close = document.getElementById('feedbackClose');
  $(close).after(div);
}

function displayFeedbackForm() {
  let feedbackModal = document.getElementById("feedbackModal");
  let feedbackClose = document.getElementById("feedbackClose");
  let body = document.getElementsByTagName("body")[0];

  feedbackClose.onclick = function () {
    feedbackModal.style.display = "none";
    body.style.overflow = "auto";
  }

  feedbackModal.style.display = "block";
  body.style.overflow = "hidden";
}

function userHasUnsubscribed(){
  let ret = false;
  let unsubscribed = sessionStorage.getItem('unsubscribed-'+currentPageName);
  if(unsubscribed == 'yes'){
    ret = true;
  }
  return ret;
}

function addUnsubscribeOrResubscribeLink(){
  if(userHasUnsubscribed()){
    addResubscribeLink();
  }else{
    addUnsubscribeLink();
  }  
}

function addUnsubscribeLink(){
  if(unsubscribeEnabled && unsubscribeInstruction && unsubscribeLinkText && unsubscribeCollateral && mFormSlotID){
    let resubscribeElement = document.getElementById('resubscribe');
    if(resubscribeElement){
      resubscribeElement.remove();
    }
    let unsubscribeElement = '<div id="unsubscribe" class="unsubscribe">' + unsubscribeInstruction + ' <a href="" onclick="unsubscribe(event)">' + unsubscribeLinkText + '</a> </div>';
    let formSlot = document.getElementById(mFormSlotID);
    $(formSlot).append(unsubscribeElement);
  }
}

function feedbackFormLoaded(){
  let ret = false;
  let feedbackForm = document.getElementById('mauticform_'+feedbackFormName);
  if(feedbackForm){
    ret = true;
  }
  return ret;
}

function unsubscribe(e){
  e.preventDefault();
  if(isAnonymousUser()){
    alert(unsubscribeAnonymousUserMessage);
    return;
  }
  if(!feedbackFormLoaded()){
    loadFeedbackForm();
  }else{
    displayFeedbackForm();
  }
}

function isAnonymousUser(){
  let ret = false;
  let alias = document.getElementById("mauticform_input_" + formName + "_alias");
  if(alias && !alias.value){
    ret = true;
  }
  return ret;
}

function addResubscribeLink(){
  let unsubscribeElement = document.getElementById('unsubscribe');
  if(unsubscribeElement){
    unsubscribeElement.remove();
  }
  let resubscribeElement = '<div id="resubscribe" class="resubscribe">' + resubscribeInstruction + ' <a href="" onclick="resubscribe(event)">' + resubscribeLinkText + '</a> </div>';
  let formSlot = document.getElementById(mFormSlotID);
  $(formSlot).append(resubscribeElement);
}

function resubscribe(e){
  e.preventDefault();
  let pageTitle = 'Re-Subscribed to '+ unsubscribeCollateral;
  sessionStorage.removeItem('unsubscribed-'+currentPageName);
  mt('send', 'pageview', { page_title: pageTitle, tags: '-unsubscribe-'+unsubscribeCollateral.toLowerCase() }, { onerror: function () { logError(MT_ERROR) } });
  alert(resubscribeSuccessMessage);
  addUnsubscribeLink();
}

function formOnload() {
  let form = document.getElementById("mauticform_" + formName);
  let submit = document.getElementById("mauticform_input_" + formName + "_submit");

  if ((form != null) && (submit != null)) {
    addUnsubscribeOrResubscribeLink()
    useEmbeddedFormForKnownContacts();
    if (gtmContainerID) {
      sendGTMEvents();
    }   
    if ((page == 'lp') || (page == 'asset') || (page == 'listing') || (page == 'm_lp') || (page == 'm_asset')) {
      if ((page == 'asset') || (page == 'm_asset')) {
        showReportPageContent();
      }
      displayPopupForm();
      if (window.google) {
        isOauthLoginRequired();
        initGoogleIdentityService();
        initOneTapSignIn();
        initGoogleSignIn();
      }
      addValidationToFields();
      createFormHeader();
      if (!isEndOfForm()) {
        //addFormOnSubmitEvent(); Replaced by form processing hooks
        setMauticFormFields(formName);
        setCurrentUrl(formName);
        updateFormActionAttribute(formName);
        displayORDividerAfterPhoneCTA();
      } else if (submit.innerHTML == "Get Report") {
        displayORDividerAfterPhoneCTA();
      } else if (submit.innerHTML == "Submit") {
        hideLastForm();
      }
    }
  }
}

function useEmbeddedFormForKnownContacts(){
  if(embeddedFormForKnownContacts){
    let email = document.getElementById("mauticform_input_" + formName + "_f_email");
    let phone = document.getElementById("mauticform_input_" + formName + "_f_phone");
    let fullname = document.getElementById("mauticform_input_" + formName + "_fullname");
    let knownContact = ((email == null) && (phone == null) && (fullname == null));
    if(knownContact){
      const element = document.getElementById("lpClose");
      element.remove();
      let lpContent = document.getElementById("lpContent");
      let aside = document.getElementById(embeddedFormSlotID);
      while (lpContent.firstChild){
        aside.appendChild(lpContent.firstChild)
      }
      mFormSlotID = embeddedFormSlotID;
      popupForm = false;
    }
  }
}

function displayORDividerAfterPhoneCTA() {
  if(!popupForm){
    let cta_spans = document.getElementsByClassName("cta_span");
    if(cta_spans[0]){
      cta_spans[0].style.display = 'inline-block';
    }
    
    let cta_or = document.getElementsByClassName("cta_or");
    if(cta_or){
      for(let i=0; i < cta_or.length; ++i){
        cta_or[i].style.display = 'inline-block';
      } 
    } 
  }
}

function initGoogleIdentityService() {
  if ((enableGoogleOneTap || enableGoogleSignIn) && oauthLoginRequired) {
    google.accounts.id.initialize({
      client_id: g_client_id,
      callback: handleCredentialResponse,
      cancel_on_tap_outside: false,
      itp_support: false,
      context: "signin",
      ux_mode: "popup"
    });
  }
}

function initOneTapSignIn() {
  if (enableGoogleOneTap && oauthLoginRequired) {
    google.accounts.id.prompt();
  }
}

function submitOauthNameAndEmail(oEmail, oName, oSource) {
  if (oEmail) {
    let email = document.getElementById("mauticform_input_" + formName + "_f_email");
    let fullname = document.getElementById("mauticform_input_" + formName + "_fullname");
    let alias = document.getElementById("mauticform_input_" + formName + "_alias");
    let submit = document.getElementById("mauticform_input_" + formName + "_submit");
    let oauthName = document.getElementById("mauticform_input_" + formName + "_oauth_name");
    let oauthEmail = document.getElementById("mauticform_input_" + formName + "_oauth_email");
    let oauthSource = document.getElementById("mauticform_input_" + formName + "_oauth_source");
    let ev = document.getElementById("mauticform_input_" + formName + "_ev");

    if (email) {
      email.value = oEmail;
      if (fullname) {
        fullname.value = oName;
      }
      alias.value = oName;
      oauthName.value = oName;
      oauthEmail.value = oEmail;
      oauthSource.value = oSource;
      ev.value = true;
      sessionStorage.setItem('g-signin', 'yes');
      submit.click();
    }
    else {
      let lpTag = currentPageName;
      let pageTitle = 'Google-SignIn or Google-OneTap';
      mt('send', 'pageview', { page_title: pageTitle, tags: lpTag, email: oEmail, firstname: oName, alias: oName, oauth_email: oEmail, oauth_name: oName, oauth_source: oSource, ev: true, email_submitted: 'yes' }, { onload: function () { location.reload(); }, onerror: function () { logError(MT_ERROR) } });
    }
  }
}

function handleCredentialResponse(response) {
  const cred = jwt_decode(response.credential);
  const selectBy = response.select_by;
  let source = "";

  if ((selectBy) && (selectBy.includes('user'))) {
    source = 'Google-OneTap';
  } else if ((selectBy) && (selectBy.includes('btn'))) {
    source = 'Google-SignIn';
  }

  if (cred.email) {
    submitOauthNameAndEmail(cred.email, cred.name, source);
  }
}

function loadVideo(params, parentTag) {
  let osWidth;
  if ((parentTag != undefined) && (parentTag != '')) {
    let parentElement = document.getElementById(parentTag);
    if (parentElement != null) {
      let width = parentElement.offsetWidth;
      document.getElementById('video').style.width = "" + (width - 30) + "px";
      osWidth = width;
    }
  }
  if (params != undefined) {
    setVideoWidthAndParams(params, osWidth);
  }
}

function setVideoWidthAndParams(params, osWidth) {
  let vtimer0 = setInterval(function () {
    let iframe = document.getElementById('me_youtube_0_container');
    if ((iframe != null) && (iframe.getAttribute("src") != null)) {
      if (osWidth != undefined) {
        iframe.style.width = "" + (osWidth - 30) + "px";
        document.getElementById('mep_0').style.width = "" + (osWidth - 30) + "px";
      }
      let isource = iframe.getAttribute("src");
      let arr = isource.split('controls=0');
      let nsource = arr[0] + params + arr[1];
      iframe.setAttribute("src", nsource);
      clearInterval(vtimer0);
    }
  }, 200);
}

function setForm(reqFormName, reqFormID) {
  formName = reqFormName;
  formID = reqFormID;
}

function validateField(field) {
  field.addEventListener("blur", function (e) {
    field.reportValidity();
  });
}

function isOauthLoginRequired() {
  let ret = false;
  if (sessionStorage.getItem('g-signin') != 'yes') {
    let emailVerified = document.getElementById("mauticform_input_" + formName + "_ev");
    if((emailVerified)&&(emailVerified.value != "true")){
      ret = true;
    }
  }
  oauthLoginRequired = ret;
}

function addElementBeforeOrAfter(element) {
  if (mFormSlotID == 'aside') {
    let formSlot = document.getElementById(mFormSlotID);
    let cta = document.getElementById('cta');
    if((cta)&&(formSlot.contains(cta))){
      $(cta).after(element);
    }else{
      $(formSlot).prepend(element);
    } 
  }
  else if (mFormSlotID == 'lpContent') {
    let close = document.getElementById('lpClose');
    $(close).after(element);
  }
}

function addDivider(formSlot) {
  let divider = '<div style="margin:auto; width:100%; max-width:320px; text-align:center; margin-bottom:10px">_ _ _ _ _ _ _ _ _ _ _ _ OR _ _ _ _ _ _ _ _ _ _ _ _</div>';
  addElementBeforeOrAfter(divider);
}

function addSecondaryFormHeader(formSlot) {
  let header = '<div class="secondaryFormHeader"> Submit the form below: </div>';
  addElementBeforeOrAfter(header);
}

function initGoogleSignIn() {
  let email = document.getElementById("mauticform_input_" + formName + "_f_email");
  if ((formName == progressiveFormName) && email && enableGoogleSignIn && oauthLoginRequired) {
    if (!isEndOfForm()) {
      addSecondaryFormHeader();
      addDivider();
    }
    let divTag = document.createElement("div");
    divTag.setAttribute("id", "my-signin2");
    addElementBeforeOrAfter(divTag);

    google.accounts.id.renderButton(
      document.getElementById("my-signin2"),
      { theme: "filled_blue", size: "large", type: "standard", shape: "rectangular", text: "signin_with", logo_alignment: "left", width: "240px" }
    );
  }
}

function getFormsets() {
  let url = "./js/formsets.json";
  let ret;
  $.ajaxSetup({ async: false });
  $.getJSON(url)
    .done(function (data) {
      if (data) {
        ret = data;
      }
    })
    .fail(function (jqxhr, textStatus, error) {
      var err = textStatus + ", " + error;
      console.log("Request Failed: " + err);
      logError("Error loading: " + "'./js/formsets.json'");
    })
  $.ajaxSetup({ async: true });
  return ret;
}

function addLinkerParamToURLAndRedirect() {
  let rpLink = document.getElementById("rpLink");
  if ((rpLink) && (PROXY_REPORT_LINK_DOMAIN_CONFIG)) {
    let href = rpLink.getAttribute("href");
    let domain = PROXY_REPORT_LINK_DOMAIN_CONFIG[window.location.hostname];
    if ((href) && (domain)) {
      //Set domain
      let newHref = "https://" + domain + "/" + href;
      newHref = newHref.includes('?') ? newHref + "&" : newHref + "?";
      //Set linker param
      let linkerParam, cID, sID;
      let interval = setInterval(function () {
        if ((window.ga) && (ga.getAll) && (window.dataLayer) && (window.ga4MeasurementID)) {
          linkerParam = ga.getAll()[0].get('linkerParam');
          newHref = linkerParam ? newHref + linkerParam : newHref;
          
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          
          gtag('get', ga4MeasurementID, 'client_id', (client_id) => {
            cID = client_id;
          });
      
          gtag('get', ga4MeasurementID, 'session_id', (session_id) => {
            sID = session_id;
          });
      
          let cID_sID_interval = setInterval(function () {
            if ((cID) && (sID)) {
              newHref = newHref + "&cID=" + cID + "&sID=" + sID;
              rpLink.setAttribute('href', newHref);
              rpLink.click();
              clearInterval(cID_sID_interval);
            } else {
              console.log("cId and sID are undefined"); 
            }    
          }, 100)
      
          clearInterval(interval);  
        } else {
          console.log("ga undefined");
        }
      }, 500)
    }
  }
}

function getUserIDFromDWC(dwc) {
  let m_uid;
  let span = document.querySelector("#dwc_ucid span");
  if (span) {
    m_uid = span.innerHTML;
  }
  else {
    m_uid = dwc.innerHTML;
  }
  return m_uid;
}

function getUserIDFromCookie() {
  let name = "mtc_id=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  let c;
  let m_uid;

  for (let i = 0; i < ca.length; i++) {
    c = (ca[i]).trim();
    if (c.indexOf(name) == 0) {
      m_uid = c.substring(name.length, c.length);
      break;
    }
  }

  if ((m_uid) && (mauticSrc) && (USERID_PREFIX_CONFIG)) {
    let url = new URL(mauticSrc);
    let hostname = url.hostname;
    let prefix = USERID_PREFIX_CONFIG[hostname];
    m_uid = (prefix ? (prefix + "-" + m_uid) : m_uid);
  }
  return m_uid;
}

function getUserID() {
  try {
    let m_uid;
    let dwc = document.getElementById("dwc_ucid");

    if (dwc) {
      m_uid = getUserIDFromDWC(dwc);
      if ((m_uid) && (!(/^EC-\d+$/.test(m_uid)))) {
        m_uid = getUserIDFromCookie();
      }
    } else {
      m_uid = getUserIDFromCookie();
    }

    return m_uid;
  } catch (e) {
    console.log(e)
  }
}

function disableGoogleOneTap(){
  enableGoogleOneTap = false;
}

function disableGoogleSignIn(){
  enableGoogleSignIn = false;  
}

function enableEmbeddedFormForKnownContacts(formSlotID){
  embeddedFormForKnownContacts = true;
  embeddedFormSlotID = formSlotID;
}

function enableUnsubscribe(usCollateral){
  if(usCollateral){
    unsubscribeEnabled = true;
    unsubscribeCollateral = usCollateral;
    setFeedbackForm();
  }
}

function setUnsubscribeInstructionAndLinkText(usInstruction, usLinkText){
  unsubscribeInstruction = usInstruction ? usInstruction : unsubscribeInstruction;
  unsubscribeLinkText = usLinkText ? usLinkText : unsubscribeLinkText;
}

function setFeedbackFormSlotID(fbFormSlotID){
  if(fbFormSlotID){
    feedbackFormSlotID = fbFormSlotID;
  }
}

function setResubscribeInstructionAndLinkText(rsInstruction, rsLinkText){
  resubscribeInstruction = rsInstruction ? rsInstruction : resubscribeInstruction;
  resubscribeLinkText = rsLinkText ? rsLinkText : resubscribeLinkText;
}

function setResubscribeSuccessMessage(rsSuccessMessage){
  if(rsSuccessMessage){
    resubscribeSuccessMessage = rsSuccessMessage;
  }
}

function setUnsubscribeAnonymousUserMessage(usAnonymousUserMessage){
  if(usAnonymousUserMessage){
    unsubscribeAnonymousUserMessage = usAnonymousUserMessage;
  }
}