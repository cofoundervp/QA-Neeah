var timer = 0, isPopup = false,
    discussion = {}, cacheDiscussionId = "";
$(function () {
    action.setCurrentLang();
    // timer = window.setInterval(background.checkInternet, 1000000);
    User.getAuthication(function(resp){
        if(resp){
            action.login();
        }else{
            Utils.iconOff();
        }
    })
});
// chrome.idle.setDetectionInterval(15);
// chrome.idle.onStateChanged.addListener(
//     function (state) {
//         if(state === "active" || state === "idle"){
//             background.checkInternet();
//         }
//     }
// );
//click from icon event
chrome.browserAction.onClicked.addListener(function(tab) {
    Cookie.getFromDomain(config.url(), "name_value", function (value) {
        if (!value) {
            Utils.createTab(config.url() + "/app/signin", true);
        }else{
            Utils.createTab(config.url() + "/app/web-journal", true);
        }
    });
});
//check if extension is update
chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == "update"){
        chrome.storage.local.get("switch_value", function (obj) {
            var swi = obj.switch_value ? obj.switch_value : "";
            if (swi == "off" || swi == "") {
                User.updateAutoWebJournal(0, 0);
            }else{
                User.updateAutoWebJournal(1, 0);
            }
        });
    }
});

chrome.runtime.onMessageExternal.addListener(
  function(request, sender, sendResponse) {
      var req = request.action,
          tab = sender.tab
          switch(req){
            case "OPEN_LAST_VISIT":
                background.openLastVisit();
                break;
            case "SAVE_AUTO_WEBJOURNAL":
                var autoJournal =  request.autoJournal,
                    autoCache = request.autoCache;
                background.saveAutoWebJournal(autoJournal, autoCache);
                break;
            case "SHARE_PAGE_FROM_WEBJOURNAL":
                var title = request.title,
                    url = request.url;
                background.shareUrlFromWebJournal(title, url);
                break;
            case "LOGIN_NEEAH_ACCOUNT":
                action.login();
                break;
            case  "LOGOUT_NEEAH_ACCOUNT":
                action.logout();
                break;
          }
  });
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        var req = request.action,
            tab = sender.tab;
        switch(req){
            case "GET_CURRENT_API":
                var cssClass = "";
                sendResponse({
                    api: config.url()
                });
                break;
            case "GET_CURRENT_JWT":
                var defer = $.Deferred();
                User.getAuthication(function(jwt){
                    sendResponse(jwt);
                });
                return true;
                break;
            case "ADD_CACHE":
                background.addCache(tab.id, request, sendResponse);
                //~ var cacheFunc = function(){
                    //~ background.addCache(tab.id, tab.url, function(resp){
                        //~ sendResponse(resp);
                    //~ });
                //~ };
                //~ chrome.tabs.sendMessage(tab.id, {action: "GET_CURRENT_CACHED"}, function (cache) {
                      //~ if(!cache.cacheId){
                          //~ Document.add([tab.url], 0).then(function (obj) {
                              //~ if(obj) cacheFunc();
                          //~ });
                      //~ }
                  //~ });
                // Document.isUrlExist(tab.url).then(function (resp) {
                //     if(resp.urlExists){
                //         cacheFunc();
                //     }else{
                //         Document.add([tab.url], 0).then(function (obj) {
                //             if(obj) cacheFunc();
                //         });
                //     }
                // });
                return true;
                break;
            case "CHECK_BLACKLIST_OR_ROBOT":
                background.checkRobotOrBlacklist(request.url, function(obj){
                    sendResponse(obj)
                });
                return true;
                break;
            case "ADD_DOCUMENT":
                var response = sendResponse;
                background.addDocument(tab.id, tab.url, true, function(resp){
                    response(true);
                });
                return true;
                break;
            case "UPDATE_TOUR_STEP":
                if(request.annotation){
                    background.updateTourStep(null, request.annotation, null, null, null);
                }
                if(request.exclusion){
                    background.updateTourStep(null, null, null, request.exclusion, null);
                }
                break;
            case "GET_CURRENT_TOUR_STEP":
                    User.getUserInfo("ftue").then(function(resp){
                        if(resp.web == "-1"){
                            sendResponse(resp.extension);
                        } else sendResponse(resp);
                    });
                    return true;
                break;
            case "CHECK_IGNORE_URL":
                sendResponse(Utils.ignoreUrl(request.url));
                break;
            case "GOT_SEARCH_ALERT":
                if(request.isChecked){
                    background.updateTourStep(null, null, "-1", null, null);
                }
                getQueryStr(tab.url, tab.id, true);
                break;
            case "SHARE_PAGE_FROM_HUB":
                if(typeof request.email){
                    background.shareUrlFromHub(tab.title, request.url, tab.id, request.email);
                    if(request.isNotShow){
                        background.updateTourStep(null, "-1", null, null, null);
                    }
                }else{
                    background.shareUrlFromHub(tab.title, request.url, tab.id);
                }
                break;
            case "ADD_EXCLUSION_PAGE":
                background.addPageExclusion(request.type, tab.id, request.url, function(resp){
                    sendResponse(resp);
                });
                return true;
                break;
            //for hub menu
            case "GET_LAST_COMMENT_DISCUSSION":
                hubBackground.getListLastCommentDiscussion(request.url, request.offset, function(resp){
                    sendResponse(resp)
                });
                return true;
                break;
            case "SESSION_USER_ID":
                sendResponse(Cookie.get("ID_User"));
            case "GET_COMMENT_DISCUSSION":
                hubBackground.getDiscussion(request.groupId, request.pageNumber, function(res){
                    sendResponse(res)
                });
                return true;
                break;
            case "DELETE_COMMENT":
                hubBackground.delComment(request.commentId, request.groupId, function(res){
                    sendResponse(res);
                });
                return true;
            case "ADD_COMMENT":
                hubBackground.addComment(request.groupId, request.message, function(res){
                    sendResponse(res);
                });
                return true;
                break;
            case "ADD_REPLY":
                hubBackground.addReply(request.groupId, request.commentId, request.message, function(res){
                    sendResponse(res);
                });
                return true;
                break;
            case "GET_MEMBER_DISCUSSION":
                hubBackground.getGroupMember(request.groupId, function(res){
                    sendResponse(res);
                });
                return true;
                break;
            case "GET_REPLIES_COMMENT":
                var pageNumber = request.pageNumber ? request.pageNumber : null,
                    offset = request.offset;
                hubBackground.getReplies(request.cmtId, request.groupId, request.limit, pageNumber, offset, function(res){
                    sendResponse(res);
                });
                return true;
                break;
            case "GET_LAST_SHARED":
                hubBackground.getLastShared(function(res){
                    sendResponse(res);
                });
                return true;
                break;
            case "SAVE_LAST_SHARED":
                hubBackground.saveLastShared(request.data);
                break;
            case "COPPY_TO_CLIPBOARD_URL":
                hubBackground.shareCopyClipboard(tab.id, request.url, request.cacheId, function(res){
                    sendResponse(res);
                });
                return true;
                break;
            case "CHECK_DISCUSSION":
                background.checkDiscussion(tab.id, request.url, function(res){
                    sendResponse(res);
                });
                return true;
                break;
            case "AUTO_JOURNALLING":
                var state = request.state;
                hubBackground.autoJournalling(state);
            case "GET_AUTO_JOURNALLING":
                hubBackground.getAutoJournalling(function(res){
                    sendResponse(res);
                });
                return true;
                break;
            case "SAVE_SEARCH_ALEART":
                hubBackground.saveSearchAlert(request.type);
                break;
            case "GET_SEARCH_ALERT":
                sendResponse(hubBackground.getTypeSearchAlert());
                break;
            case "GET_INFO_PLAN":
                User.getPlan().then(function(res){
                    var limit = parseInt(res.plan.storage),
                        usedStorage = parseInt(res.usedStorage);
                    if(usedStorage >= limit){
                        console.log("1");
                        Cookie.setFromDomain(config.url(), "haveExceed", "1", "30");
                        sendResponse({"haveExceed": 1});
                    }else{
                        console.log("2");
                        Cookie.setFromDomain(config.url(), "haveExceed", "0", "30");
                        sendResponse({"haveExceed": 0});
                    }
                });
                return true
                break;
        }
    }
);
chrome.extension.onMessage.addListener(
    function (request, sender, sendResponse) {
        var req = request.action;
        var tab = sender.tab;
        switch (req) {
            case "SHARE_ON_SOCIAL":
                // Utils.getCurrentTab(function(info){
                //     var url = request.url;
                //     var title = info.title;
                //     var tabId = info.id;
                //     var type = request.type;
                //     var isTour = request.isTour ? request.isTour : 0;
                //     action.shareSocial(tabId, url, title, type, isTour);
                // });
                action.shareSocial(tab.id, tab.url, tab.title, request.type, request.isTour ? request.isTour : 0);
                break;
            case "IMPORT_DOCUMENT":
                action.importDocument();
                break;
            case  "CLOSE_DIALOG":
                action.removeUI(tab.id, request.frameName);
                break;
            case "OPEN_DIALOG_INVITE_USER":
                var groupId = request.groupId;
                showpopup.inviteUser(groupId);
                break;
            case  "SHARE_CURRENT_PAGE":
                var listEmail = request.listEmailShare;
                var message = request.messageShare,
                    includeMarkup = request.includeMarkup;
                action.shareEmail(request.url, listEmail, message, includeMarkup);
                break;
            case  "OPEN_CHAT_WINDOW":
                isOpen =  false;
                var resp = JSON.parse(request.data);
                Utils.getCurrentTab(function (info) {
                    discussion.groupId = resp.idGroup;
                    discussion.ownerID = resp.ownerID;
                    discussion.url = resp.url;
                    discussion.tabId = info.id;
                    discussion.isOwner = resp.isOwner;
                });
                break;
            case "INVITE_USER":
                action.inviteUser(tab.id, request.listEmailShare, request.listGroupId, request.message);
                break;
            case  "ADD_PAGE_NOTE":
                action.addPageNote(request.url, request.note);
                break;
            case "SAVE_COLOR_HIGHLIGHT":
                var className = request.className;
                // chrome.storage.local.set({'lastColorHighLight': className});
                Cookie.setFromDomain(config.url(), "lastColorHighLight", className, "1");
                break;
            case "OPEN_SHARED_ANNOTATED":
                Utils.getCurrentTab(function (info) {
                    var cacheDiscussionId = request.discussionId;
                    if(cacheDiscussionId){
                        Utils.executeScript(info.id, UIhidden.create("discussionId", cacheDiscussionId));
                    }
                });
                break;
            case "GET_TITLE":
                sendResponse({title: tab.title})
                break;
            case "UPDATE_CACHE_PAGE":
                var cacheId = request.cacheId;
                var content = request.content;
                background.updateCached(cacheId, content, sendResponse);
                return true;
                break;
        }
});
// chrome.webNavigation.onCommitted.addListener(function(e) {
//     console.log(e);
// });
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    var title = tab.title;
    var url = tab.url;
    if (changeInfo.status == 'complete') {
        background.initScript(title, url, tabId);
        chrome.storage.local.get(["switch_value", 'autoCache'], function (obj) {
            var _switch = obj.switch_value;
            _switch = typeof _switch == "undefined" ? "on" : _switch;
            var autoCache = obj.autoCache == 'on';
            chrome.tabs.sendMessage(tabId, {
                action: "PAGE_LOADED",
                autoJournal: _switch == 'on' || _switch == '',
                autoCache: autoCache
            });
        });
        var isSearchIntercept = Utils.isSearchIntercept(url);
        if(isSearchIntercept){
            User.getAuthication(function(jwt){
                if(jwt) {
                    setTimeout(function(){
                        getQueryStr(url, tabId);
                    }, 700);
                }
            });
        }
    }

});
function showPopupCache(url, tabId, title){
    Document.checkCache(url).then(function(resp){
        var redirectCache = config.url() + "/app/cache?url=" + url + "&title=" + title
        if(resp.cached){
            chrome.tabs.sendMessage(tabId, {action: "SAVE_SESSION_CACHED", haveCached: 1});
            if(resp.annotated){
                var strHtml = "You've added markups to this page, <a target='_blank' style='color:#e9573f' href='"+redirectCache+"'>click here</a> to view them";
                Utils.executeScript(tabId, UIpopupAnnotate.create("", strHtml));
                chrome.tabs.sendMessage(tabId, {action: "SET_TIME_OUT_CLOSE_POPUP"});
            }else{
                if(!resp.last_visit) return;
                Cookie.getFromDomain(config.url(), "lang-neeah", function (value) {
                    var lang = value ? value : "en";
                    i18n.init({lng: lang, debug: false, resGetPath: config.getlocalesPath()}, function (t) {
                        window.STR_LABEL_TODAY = t("STR_LABEL_TODAY");
                        window.STR_LABEL_YESTERDAY = t("STR_LABEL_YESTERDAY");
                        var localDate = Utils.convertUTCDate(resp.last_visit.toString()),
                            shortDateString = Utils.convertToLocalDateString(localDate, {
                                year: "numeric", month: "long",
                                day: "numeric",  hour: "2-digit", minute: "2-digit"
                            }, "en"),
                            strHtml = "You last visited this page on "+shortDateString+", <a target='_blank' style='color:#e9573f' href='"+redirectCache+"'>click here</a> to view the cache version";
                        Utils.executeScript(tabId, UIpopupAnnotate.create("", strHtml));
                        chrome.tabs.sendMessage(tabId, {action: "SET_TIME_OUT_CLOSE_POPUP"});
                    });

                });
            }
        }else{
            chrome.tabs.sendMessage(tabId, {action: "SAVE_SESSION_CACHED", haveCached: 0});
        }
    }, function(){
        chrome.tabs.sendMessage(tabId, {action: "SAVE_SESSION_CACHED", haveCached: 0});
    });
}
function getQueryStr(url, tabId, haveSearch) {
    var typeSearch = Cookie.get("search-alert");
    Cookie.getFromDomain(config.url(), "lang-neeah", function (value) {
        if (value != "" && value != null){
            i18n.init({lng: value, debug: false, resGetPath: config.getlocalesPath()}, function (t) {
                window.STR_MSG_INTERCEPT_RESULT = t("STR_MSG_INTERCEPT_RESULT");
                window.STR_MSG_INTERCEPT_RESULT_MINI_TYPE = t("STR_MSG_INTERCEPT_RESULT_MINI_TYPE");
            });
        }
        var strKey = Utils.getQuerrySearch(url);
        if(strKey){
            User.getUserInfo("ftue").then(function(resp){
                var obj = resp.extension;
                if(resp.web == "-1" && obj.searchAlert != "-1" && !haveSearch){
                    chrome.tabs.sendMessage(tabId, {action: "CHECK_TOUR_SEARCH_ALERT"});
                }else{
                    if (typeSearch == "mini") {
                        background.miniSearch(url, tabId);
                    }else {
                        background.expandSearch(url, tabId);
                    }
                }
            });
        }
    });
}

var action = {
  addPageNote : function(url, note){
      //need wait scrapper to add document
      setTimeout(function () {
          Document.addNote(url, note);
      },3000);
  },
  importDocument : function(){
      chrome.history.search({text: '', maxResults: 100000000}, function (resp) {
          var Urls = [];
          resp.forEach(function(history){
              Urls.push(history.url);
          });
          User.getAuthication(function(){
              Document.add(Urls);
          });
      });
  },

  removeUI : function(tabID, divName){
      var script = ' document.getElementById("'+divName+'").remove()';
      Utils.executeScript(tabID, script);
  },

  login : function(){
       Cookie.getFromDomain(config.url(), "JWT", function(value){
           chrome.storage.local.set({'JWT': value}, function() {
               api.updateAuth(value);
                if(value){
                    User.getUserInfo().then(function(resp){
                        if(resp.success){
                            var obj = resp.data;
                            Cookie.set("ID_User", obj.userID, 30, "1");
                            //save exceed limit markup
                            User.getPlan().then(function(res){
                                console.log(res);
                                var limit = parseInt(res.plan.storage),
                                    usedStorage = parseInt(res.usedStorage);
                                Cookie.setFromDomain(config.url(), "planName",  res.plan.name.toLocaleLowerCase(), "30");
                                if(usedStorage >= limit){
                                    Cookie.setFromDomain(config.url(), "haveExceed", "1", "30");
                                }else{
                                    Cookie.setFromDomain(config.url(), "haveExceed", "0", "30");
                                }
                            });
                            if(obj.autoJournal){
                                Utils.iconOn();
                                chrome.storage.local.set({'switch_value': "on"});
                                if(obj.autoCache) chrome.storage.local.set({'autoCache': "on"});
                                else chrome.storage.local.set({'autoCache': "off"});
                            }else{
                                Utils.iconPaused();
                                chrome.storage.local.set({'switch_value': "off"});
                                chrome.storage.local.set({'autoCache': "off"});
                            }
                        }
                    });
                    Cookie.getFromDomain(config.url(), "lang-neeah", function(lang){
                        Cookie.set("lang-neeah", lang, 30, "1");
                        Cookie.getFromDomain(config.url(), "name_value", function(name){
                            Cookie.set("name_value", name, 30, "1");
                        });
                    });
                } else {
                    Utils.iconOff();
                }
           });
       });
  },

  logout : function (isFromWeb) {
      User.logout().then(function (resp) {
          if(resp.success == "1"){
              api.updateAuth(null);
              Utils.iconOff({path: 'images/neeah-icon-gray.png'});
              Cookie.removeEntire();
              Utils.removeStoreAge();
              chrome.browserAction.setBadgeText({ text: "" });
          }else{
              Utils.iconOn({path: 'images/neeah-icon-normal.png'});
              chrome.browserAction.setBadgeText({ text: "" });
          }
      });
  },

  shareSocial : function(tabId, url, title, type, isTour){
      //update api share facebook with current markups
      var shareFB = function(cacheId, thumbImg, description){
            var listUrl = [];
              var obj = {
                    url: url
                };
            if(cacheId){
                obj.cacheId = cacheId;
            }
            listUrl.push(obj);
            comment.addDiscussion(listUrl, null, null, type, 0).then(function(data){
                if(data.success == "1"){
                    var obj = data.discussions;
                    if(type == "facebook") showpopup.facebook(tabId, obj[0].sharedLink, url, thumbImg, description, title, obj[0].id, obj[0].ownerID, isTour);
                    else  showpopup.twitter(tabId, obj[0].sharedLink, url, title, obj[0].id, obj[0].ownerID);
                }
            });
      };
        chrome.tabs.sendMessage(tabId, {action: "GET_CURRENT_CACHED"}, function (cache) {
            if(cache.cacheId){
                //update cache
                chrome.tabs.sendMessage(tabId, {action:"GET_NEW_CACHE"}, function(data){
                    if(data){
                        Cache.update(data.cacheId, data.html);
                    }
                });
                //share page
                chrome.tabs.sendMessage(tabId, {action: "GET_PAGE_DETAIL"}, function (info) {
                    shareFB(cache.cacheId, info.thumbImg, info.description);
                });
            }
            else{
                chrome.tabs.sendMessage(tabId, {action: "GET_HTML_PAGE"}, function (data) {
                    chrome.tabs.sendMessage(tabId, {action: "GET_PAGE_DETAIL"}, function (info) {
                        Cache.add(url, data.html, info.description, title, info.thumbImg, null).then(function(resp){
                            chrome.tabs.sendMessage(tabId, {action: "SAVE_CURRENT_CACHED", cacheId: resp.id});
                            shareFB(resp.id, info.thumbImg, info.description);
                        });
                    });
                });
            }
        });
    },

    shareEmail : function (url, listEmail, message, includeMarkup) {
        Utils.getCurrentTab(function (info) {
            chrome.tabs.sendMessage(info.id, {action: "GET_PAGE_DETAIL"}, function(respHtml){
                var document = {
                    url : url
                };
                if(respHtml.thumbImg) document.thumbImg = respHtml.thumbImg;
                if(respHtml.description) document.description = respHtml.description;
                if(respHtml.title)  document.title = respHtml.title;
                var sendEmail = function(cacheId){
                    var listUrl = [];
                    if(cacheId) document.cacheId = cacheId;
                    listUrl.push(document);
                    comment.addDiscussion(listUrl, listEmail, message, "email", includeMarkup).then(function(data){
                        if(data.success == "1"){
                            var obj = data.discussions,
                                script = 'document.getElementById("divBlanket").remove();document.getElementById("divShare").remove()';
                            Utils.executeScript(info.id, script);
                        }
                    });
                }
                chrome.tabs.sendMessage(info.id, {action: "GET_CURRENT_CACHED"}, function (res) {
                    if(res.cacheId) {
                        sendEmail(res.cacheId);
                    }
                    else{
                        chrome.tabs.sendMessage(info.id, {action: "GET_HTML_PAGE"}, function (data) {
                            Cache.add(url, data.html, respHtml.description, respHtml.title, respHtml.thumbImg, null).then(function(respCache){
                                chrome.tabs.sendMessage(info.id, {action: "SAVE_CURRENT_CACHED", cacheId: respCache.id});
                                sendEmail(respCache.id);
                            });
                        });
                    }
                });
            });
        });
    },

    setCurrentLang : function () {
        Cookie.getFromDomain(config.url(), "lang-neeah", function (value) {
            if (value != "" && value != null) {
                Cookie.set("lang-neeah", value, 1, "1");
                i18n.init({lng: value, resGetPath: config.getlocalesPath(), fallbackLng: false}, function (t) {
                    window.STR_MSG_INTERCEPT_RESULT = t("STR_MSG_INTERCEPT_RESULT");
                    window.STR_MSG_INTERCEPT_RESULT_MINI_TYPE = t("STR_MSG_INTERCEPT_RESULT_MINI_TYPE");
                    window.STR_LABEL_TODAY = t("STR_LABEL_TODAY");
                    window.STR_LABEL_YESTERDAY = t("STR_LABEL_YESTERDAY");
                });
            }
        });
    },

    inviteUser : function(tabId, listEmail, listGroupId, message){
        User.getAuthication(function(){
            comment.inviteUser(listGroupId, listEmail, message).then(function (resp) {
                if(resp.success == "1"){
                    action.removeUI(tabId, "divBlanket");
                    action.removeUI(tabId, "divShare");
                }
            });
        });
    }
};

var showpopup = {
    NotificationPlan : function(tabId, cb){
        //show notification
        Cookie.getFromDomain(config.url(), "haveExceed",function(exceed){
            if(exceed == "1"){
                chrome.tabs.sendMessage(tabId, {action: "SHOW_NOTIFICATION", text: "Your current content storage usage exceeds the storage capacity of your plan. Please upgrade immediately to avoid losing data."});
                if(typeof cb == "function") cb(true);
            }else{
                Cookie.getFromDomain(config.url(), "planName",function(planName){
                    if(planName.toLocaleLowerCase() != "collaborator"){
                        chrome.tabs.sendMessage(tabId, {action: "SHOW_NOTIFICATION", text: "Upgrade your plan to allow receivers to add notes and annotate."});
                        if(typeof cb == "function") cb(true);
                    }else{
                        if(typeof cb == "function") cb(false);
                    }
                });
            }
        });
    },
    facebook : function(tabID, redirectUrl, url, img, description, title, groupID, ownerID, isTour){
        var obj = {
            "name": title,
            "urlshare": redirectUrl,
            "tiSHOW_NOTIFICATIONtle": title
        };
        if (description) {
            obj.description = description;
        }
        if (url) {
            obj.caption = url;
        }
        if (groupID) {
            obj.idGroup = groupID;
        }
        if (img && !isTour) {
            obj.image = img;
        }

        obj = Utils.base64Encode(JSON.stringify(obj));
        Cookie.setFromDomain(config.url(), "dataFB", obj, "1");
        var _urlOauth = "https://www.facebook.com/dialog/oauth?client_id=" + getIDApp.facebook() + "&redirect_uri=" + config.url() + "/app/shareComplete?data=" + obj;
        var windowFB = window.open(_urlOauth, '_blank', 'toolbar=yes, scrollbars=yes, resizable=yes, top=250, left=350, width=700, height=400');
        showpopup.NotificationPlan(tabID);
    },

    twitter : function(tabID, redirectUrl, url, title, groupID,ownerID){
        var url = config.url() + '/app/share-twitter?oauth=1&title='+title+'&url='+redirectUrl+'&groupID='+groupID+'';
        var windowTwitter = window.open(url, '_blank', 'toolbar=yes, scrollbars=yes, resizable=yes, top=250, left=350, width=600, height=450');
        showpopup.NotificationPlan(tabID);
    },

    inviteUser : function (groupId) {
        Utils.getCurrentTab(function (info) {
            var url = "chrome-extension://hbchcjeppddbockfcdiejdpnimjbdcpm/inviteUser.html?groupID=" + groupId + "";
            Utils.executeScript(info.id, UIblanket.get);
            Utils.executeScript(info.id, UIshare.dialogshare(url));
        });
    },
};
var background = {
    initScript : function(title, url, tabId){
        User.getAuthication(function(jwt){
            if(typeof jwt.error != "undefined") return;
            if(jwt && !(Utils.isUrlImg(url))){
                Cookie.getFromDomain(config.url(), "lastColorHighLight",function(value){
                    var color = "annotator-hl-yellow";
                    if(value){
                        color = value;
                    }
                    Utils.executeScript(tabId, UIhidden.create("hdLastColor", color));
                });
                if(cacheDiscussionId){
                    Utils.executeScript(tabId, UIhidden.create("discussionId", cacheDiscussionId));
                }
            }
        });
        //inject id to page
        Utils.executeScript(tabId, UIhidden.create("hbchcjeppddbockfcdiejdpnimjbdcpm", 1));
        //check if url have cache pagevie
        setTimeout(function(){
            showPopupCache(url, tabId, title);
            if(!Utils.ignoreUrl(url)){
               background.showTourPopupCache(tabId, url);
            }
        }, 1000);
    },
    haveIgnoreCofiddle : function(url){
         var arrayStr = ["cofiddle", "neeah"];
         var a = $('<a>', { href:url } )[0],
             bool = false;
         a = a.hostname;
         for(var i = 0; i < arrayStr.length; i++){
             if(a.indexOf(arrayStr[i])  != "-1"){
                 bool = true;
                 break;
             }
         }
         return bool;
    },
    shareUrlFromWebJournal : function(title, url){
        Utils.createTab(url, true);
    },
    shareUrlFromHub : function(title, url, tabId, cacheId, email){
        if(Utils.isUrlImg(url)) {
            return null;
        }

        var blanket = UIblanket.get;
        var params = { url: url };
        if(typeof email !=undefined){
            params.email = email;
        }
        var urlShare = "chrome-extension://hbchcjeppddbockfcdiejdpnimjbdcpm/sharePage.html?" + $.param(params);
        var dialogShare = UIshare.dialogshare(urlShare);

        Utils.executeScript(tabId, blanket);
        Utils.executeScript(tabId, dialogShare);
        //show notification
        showpopup.NotificationPlan(tabId);
    },
    saveAutoWebJournal : function(autoJournal, autoCache){
        if(autoJournal){
            chrome.storage.local.set({'switch_value': "on"}, function() {
                Utils.iconOn();
                if(autoCache){
                    chrome.storage.local.set({'autoCache': "on"});
                }else{
                    chrome.storage.local.set({'autoCache': "off"});
                }
            });
        }else{
            chrome.storage.local.set({'switch_value': "off"}, function() {
                Utils.iconPaused();
                chrome.storage.local.set({'autoCache': "off"});
            });
        }
    },

    openLastVisit : function(){
        chrome.history.search({text: '', maxResults: 30}, function(data) {
            if(data.length > 0){
                for(var i = 0; i < data.length; i++) {
                    if(Utils.ignoreUrl(data[i].url)){
                         continue
                    }else{
                        Utils.createTab(data[i].url, true);
                        return true;
                    }
                }
                Utils.createTab("chrome://newtab", true);
                return true;
            }else{
                Utils.createTab("chrome://newtab", true);
                return true;
            }
        });
    },
    redirectCache : function(tabId, url, title){
        var pageRedirect = config.url() + "/app/cache?url=" + url + "&title=" + title;
        Utils.updateTab(tabId, pageRedirect);
    },
    checkInternet : function(){
        var isInternet = Utils.isAvailableInternet();
        chrome.storage.local.get("switch_value", function (obj) {
            var _switch = obj.switch_value;
            Cookie.getFromDomain(config.url(), "JWT", function (value) {
                if (value) {
                    if (isInternet) {
                        if (_switch == "off") {
                            chrome.browserAction.setIcon({path: 'images/neeah-icon-paused.png'});
                        } else {
                            chrome.browserAction.setIcon({path: 'images/neeah-icon-normal.png'});
                        }
                    } else {
                        if (_switch == "off") {
                            chrome.browserAction.setIcon({path: 'images/neeah_pause.png'});
                        } else {
                            chrome.browserAction.setIcon({path: 'images/neeah-icon-gray.png'});
                        }
                    }
                }
            });
        });
    },

    miniSearch : function(url, tabId){
        var lag = User.getCurrentLang();
        var width = "320px";
        if (lag == "vi-VN" || lag == "vi") {
            width = "320px";
        }
        var strKey = Utils.getQuerrySearch(url);
        if(strKey == ""){
            return;
        }
        Search.getNumFound(strKey).then(function (getNumFound) {
            var result = "";
            if (getNumFound == 0) {
                action.removeUI(tabId, "intercept-search");
                return;
            }

            var url = "chrome-extension://hbchcjeppddbockfcdiejdpnimjbdcpm/interceptSearch.html?type=mini&numberResult="+ getNumFound +"&keyword=" + encodeURI(strKey);
            var code = UISearch.expand(url);
            Utils.executeScript(tabId,  code);
            isPopup = true;

            return null;
        });

    },

    expandSearch : function (url, tabId) {
        var strKey = Utils.getQuerrySearch(url);
        if(strKey == ""){
            return;
        }
        Search.getNumFound(strKey).then(function (numFoundResult) {
            if (isPopup) {
                action.removeUI(tabId, "intercept-search");
            }
            if (numFoundResult > 0) {
                Cookie.getFromDomain(config.url(), "JWT", function (jwt) {
                    if(jwt != "" && jwt != null) {
                        var url = "chrome-extension://hbchcjeppddbockfcdiejdpnimjbdcpm/interceptSearch.html?key=" + encodeURI(strKey);
                        var code = UISearch.expand(url);
                        Utils.executeScript(tabId,  code);
                        isPopup = true;
                        return null;
                    }
                });
                isPopup = true;
                return;
            }
            return null;
        });

    },
    showTourPopupCache : function(tabId, url){
        User.getUserInfo("ftue").then(function(resp){
            var obj = resp.extension;
            if(obj.annotation == "-1" && obj.exclusion == "1"){
                Utils.check_robot(url, function(isRobot){
                    if(isRobot) {
                        chrome.tabs.sendMessage(tabId, {action: "CHECK_TOUR_CACHE"});
                        return;
                    }else{
                        BlackList.check(url).then(function(isBlackList){
                            if(isBlackList){
                                chrome.tabs.sendMessage(tabId, {action: "CHECK_TOUR_CACHE"});
                                return;
                            }
                        });
                    }
                });

                // Document.checkCache(url).then(function(resp){
                //     if(!resp.cached) chrome.tabs.sendMessage(tabId, {action: "CHECK_TOUR_CACHE"});
                // }, function(){
                //     //failed
                //     chrome.tabs.sendMessage(tabId, {action: "CHECK_TOUR_CACHE"});
                // });
            }
        });
    },
    addDocument : function (tabId, url, forceAdd, cb) {
        var addDocFunc = function(){
            Utils.check_robot(url, function(isRobot){
                if(isRobot && !forceAdd) {
                    return;
                }
                Document.add([url], 0).then(function (obj) {
                    if(obj.firstHistory == "0"){
                        Cookie.remove(config.url(), "firstHistory");
                    }
                    if(obj.success){
                        chrome.storage.local.get("autoCache", function (obj) {
                            if(typeof obj == "object"){
                                var autoCache = obj.autoCache;
                                if(autoCache == "on"){
                                    background.addCache(tabId, url);
                                }
                                // Cookie.getFromDomain(config.url(), "haveExceed",function(exceed){
                                //     if(exceed == "1"){
                                //         chrome.tabs.sendMessage(tabId, {action: "SHOW_NOTIFICATION", text: "Your current content storage usage exceeds the storage usage capacity of current plan."});
                                //     }
                                // });
                            }
                        });
                    }
                    if(cb && typeof cb == "function") cb();
                });
            });
        }
        addDocFunc();
    },
    addCache : function(tabId, data, cb){
        //~ var tempCache = function(){
            //~ chrome.tabs.sendMessage(tabId, {action: "GET_NEW_CACHE"}, function (data) {
               //~ if(!data){
                   //~ setTimeout(function(){
                       //~ tempCache();
                   //~ }, 1000);addCache
               //~ }else{
                   //~ chrome.tabs.saddCacheendMessage(tabId, {action: "GET_PAGE_DETAIL"}, function (respHtml) {
                       //~ Cache.add(url, data.html, respHtml.description, respHtml.title, respHtml.thumbImg, null).then(function(resp){
                           //~ if(resp){
                                //~ // Utils.executeScript(tabId, UIhidden.create("cacheId", resp.id));
                                //~ chrome.tabs.sendMessage(tabId, {action: "SAVE_CURRENT_CACHED", cacheId: resp.id});
                                //~ if(typeof cb == "function") cb(resp);
                            //~ }
                       //~ });
                   //~ });
               //~ }
           //~ });
        //~ };
        //~ tempCache();
        Cache.add(data.url, data.content, data.description, data.title, data.thumbImg).then(function(resp){
            //~ if(resp){
                //~ // Utils.executeScript(tabId, UIhidden.create("cacheId", resp.id));
                //~ chrome.tabs.sendMessage(tabId, {action: "SAVE_CURRENT_CACHED", cacheId: resp.id});
                //~ if(typeof cb == "function") cb(resp);
            //~ }
            Cookie.getFromDomain(config.url(), "haveExceed",function(exceed){
                console.log(exceed);
                if(exceed == "1"){
                    chrome.tabs.sendMessage(tabId, {action: "SHOW_NOTIFICATION", text: "Your current content storage usage exceeds the storage capacity of your plan. Please upgrade immediately to avoid losing data."});
                }
            });
            if(typeof cb == "function") cb(resp);
        });
    },
    checkDiscussion : function(tabId, url, cb){
        User.getAuthication(function(){
            comment.doesDiscussionExist(url, 0).then(function (resp) {
                if(resp.success == "1"){
                    cb(true);
                }else{
                    cb(false);
                }
            });
        });
    },
    updateTourStep : function(web, annotation, searchAlert, exclusion, recipient){
        User.updateTourStep(web, annotation, searchAlert, exclusion, recipient);
    },
    checkRobotOrBlacklist : function(url, cb){
        BlackList.check(url).then(function(isBlackList){
            var obj = null;
            obj = {
                isBlackList: isBlackList ? 1 :0
            };
            Utils.check_robot(url, function(isRobot){
                obj.isRobot = isRobot ? 1 : 0;
                if(cb && typeof cb == "function") cb(obj);
            }, function(){
                obj.isRobot = 0;
                if(cb && typeof cb == "function") cb(obj);
            });
        })
    },
    addPageExclusion : function(type, tabId, url, cb){
        if(type == "excludeSite"){
            var a = $('<a>', { href:url } )[0],
                domain = a.hostname,
                path = a.pathname;
            path = path.substr(1);
            BlackList.add(domain, path, 1).then(function(respBlacklist){
                if(respBlacklist){
                    // Document.remove([url]);
                    // BlackList.removeUrlBlacklist(domain, path);
                    cb(true);
                }
            }, function(){
                cb(false);
            });
        }
        if(type == "unExcludeForceSaving"){
            BlackList.remove(url).then(function(respBlacklist){
                if(respBlacklist) cb(true);
            });
        }
    },
    updateCached: function(cacheId, content, cb){
        Cache.update(cacheId, content).then(function() {
            cb(true);
        }, function(err) {
            cb(false);
        });
    }
};
var hubBackground = {
    getListLastCommentDiscussion: function(url, offset, cb){
        comment.getListDiscussion(url, offset).then(function(resp){
            if(cb && typeof cb == "function") cb(resp);
        });
    },

    getListActStream : function(url, cb){
        Document.getActivityStream(url, 100, 1).done(function(res){
            var listActStream = [];
            if(res.success){
                res = res.data;
                var getGroupMember = function(disc) {
                    var tmp = $.Deferred();
                    comment.getGroupMember(disc.ref_id).done(function(data){
                        var obj = {
                            users: data.users,
                            emails: data.emails
                        };
                        disc.member = obj;
                        tmp.resolve(disc);
                    });
                    return tmp.promise();
                };
                for(var i = 0; i < res.length; i ++){
                    var temp = res[i];
                    var localDate = Utils.convertUTCDate(res[i].created_at.toString()),
                        shortDateString = Utils.convertToLocalDateString(localDate, {
                            year: "numeric", month: "long",
                            day: "numeric",  hour: "2-digit", minute: "2-digit"
                        }, "en");
                    temp.created_at = shortDateString;
                    if(res[i].type == "discussion"){
                        temp = getGroupMember(temp);
                    }
                    listActStream.push(temp);
                }
                $.when.apply($, listActStream).done(function() {
                    if(cb && typeof cb == "function"){
                        cb(Array.from(arguments));
                        // cb(res);
                    }
                });
            }
        })
    },
    addComment : function(groupId, message, cb){
        comment.addComment(groupId, message).then(function(res){
            if(cb && typeof cb == "function"){
                cb(res);
            }
        })
    },
    addReply : function(groupId, commentId, message, cb){
        comment.addReply(groupId, commentId, message).then(function(res){
            if(cb && typeof cb == "function"){
                cb(res);
            }
        })
    },
    delComment : function(commentId, groupId, cb){
        comment.delete(commentId, groupId).then(function(res){
            if(cb && typeof cb == "function"){
                cb(res);
            }
        });
    },
    getDiscussion : function(groupID, pageNumber, cb){
        comment.get(pageNumber, groupID, 1).then(function(res){
            if(cb && typeof cb == "function"){
                cb(res);
            }
        })
    },
    getGroupMember : function(groupId, cb){
        comment.getGroupMember(groupId).then(function(res){
            if(cb && typeof cb == "function"){
                cb(res);
            }
        })
    },
    getReplies : function(idCmt, groupId, limit, pageNumber, offset,  cb){
        comment.getReplies(idCmt, 1, groupId, limit, pageNumber, offset).then(function(res){
            if(cb && typeof cb == "function"){
                cb(res);
            }
        });
    },
    getLastShared : function(cb){
        Cookie.getFromDomain(config.url(), "lastShared",function(obj){
            if(obj){
                obj = jQuery.parseJSON(obj);
                cb(obj);
            }else{
                cb(null);
            }
        });
    },
    saveLastShared : function(obj){
        Cookie.setFromDomain(config.url(), "lastShared", JSON.stringify(obj), "1");
        // chrome.storage.local.set({"lastShared": obj});

    },
    shareCopyClipboard : function(tabId, url, cacheId, cb){
        var listUrl = [{
            url: url,
            cacheId: cacheId
        }];
        //show notification
        showpopup.NotificationPlan(tabId, function(res){
            comment.addDiscussion(listUrl, null, null, null, 0).then(function(data){
                if(data.success == "1"){
                    var obj = data.discussions,
                        link = obj[0].sharedLink;
                    var shareCopy = {
                        exceed: res,
                        link: link
                    };
                    clipboard.copy(link);
                    // if(cb && typeof cb == "function") cb(link);
                    if(cb && typeof cb == "function") cb(shareCopy);
                }
            });
        });

    },
    autoJournalling : function(state){
        if (state == "off") {
            chrome.storage.local.set({'switch_value': "off"}, function() {
                chrome.browserAction.setIcon({ path: 'images/neeah-icon-paused.png' });
                chrome.storage.local.set({'autoCache': "off"});
                User.updateAutoWebJournal(0);
            });
        } else {
            chrome.storage.local.set({'switch_value': "on"}, function() {
                chrome.browserAction.setIcon({ path: 'images/neeah-icon-normal.png' });
                User.getUserInfo().then(function(resp){
                    if(resp.success){
                        var obj = resp.data;
                        if(obj.autoCache) chrome.storage.local.set({'autoCache': "on"});
                        else chrome.storage.local.set({'autoCache': "off"});
                    }
                });
                User.updateAutoWebJournal(1);
            });
        }
    },
    getAutoJournalling : function(cb){
        chrome.storage.local.get("switch_value", function (obj) {
            var swi = obj.switch_value ? obj.switch_value : "";
            if (swi == "off" || swi == "") {
                cb({state: "off"});
            } else {
                cb({state: "on"})
            }
        });
    },
    saveSearchAlert : function(type){
            Cookie.set("search-alert", type);
    },
    getTypeSearchAlert : function(){
        return Cookie.get("search-alert");
    }
};
