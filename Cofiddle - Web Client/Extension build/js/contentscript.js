var globalHtml = "";
window.addEventListener("message", function (event) {
    var action = "";

    if (event.source != window) return;

    if(event.data.type){
        action = event.data.type;
    }

    switch (action) {
        case "IMPORT_BROWSER":
            chrome.extension.sendMessage({action: "IMPORT_DOCUMENT"});
            break;
        case "TOUR_VIEW":
            chrome.extension.sendMessage({action: "SET_TOUR"});
            break;
        case "LOGOUT_NEEAH_ACCOUNT":
            chrome.extension.sendMessage({action: "LOGOUT_NEEAH_ACCOUNT", isFromWeb: true});
            break;
        case "OPEN_CHAT_NEEAH_WINDOW":
            chrome.extension.sendMessage({action: "OPEN_CHAT_WINDOW", data: event.data.text});
            break;
        case "LOGIN_NEEAH_ACCOUNT":
            chrome.extension.sendMessage({action: "LOGIN_NEEAH_ACCOUNT"});
            break;
        case "LOGIN_OAUTH_GOOGLE_FROM_WEBSITE":
            chrome.extension.sendMessage({ action: "LOGIN_NEEAH_ACCOUNT" });
            break;
        case "OPEN_SHARED_ANNOTATED":
            chrome.extension.sendMessage({ action: "OPEN_SHARED_ANNOTATED", discussionId: event.data.text });
            break;
        case "OPEN_LAST_VISIT":
            chrome.extension.sendMessage({ action: "OPEN_LAST_VISIT"});
            break;
    }
}, false);
chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {
    if (msg.action == 'GET_PAGE_DETAIL') {
        var description = document.querySelector('meta[property="og:description"]') ?
                          document.querySelector('meta[property="og:description"]').content : "" ;

        if(!description) {
            description = document.querySelector('meta[name="description"]') ?
                          document.querySelector('meta[name="description"]').content : "";
        }

        var title = document.title;

        if(!title) {
            title = document.querySelector('meta[name="title"]') ?
                    document.querySelector('meta[name="title"]').content : "";
        }

        var thumbImg = document.querySelector('meta[property="og:image"]') ?
                       document.querySelector('meta[property="og:image"]').content : "";

        if(!thumbImg){
            thumbImg = document.querySelector('meta[name="image"]') ?
                       document.querySelector('meta[name="image"]').content : "";
        }

        var robot = document.querySelector('meta[name="robots"]') ?
                    document.querySelector('meta[name="robots"]').content : "";

        var noIndex = robot.indexOf("NOINDEX") != -1 || robot.indexOf("noindex") != -1;
        sendResponse({
            noindex: noIndex,
            description: description,
            title: title,
            thumbImg: thumbImg,
            url: window.registeredUrl
        });

        //~ if(robot.indexOf("NOINDEX") != -1 || robot.indexOf("noindex") != -1) {
            //~ sendResponse({noindex : "1"});
        //~ } else {
           //~ sendResponse({noindex: "0", description: description, title: title, thumbImg: thumbImg});
        //~ }
    }
    if (msg.action == 'CHECK_INJECT_SCRIPT') {
            sendResponse({message: "true"});
    }
    if(msg.action == "GET_HTML_PAGE"){
        var html = null;
        if (window.CACHE_DATA) html = window.CACHE_DATA.content;
        sendResponse({html: html, encoding: document.charset.toLowerCase()});
    }
    if(msg.action == "CHECK_HASH"){
        var hash = $("#hashCache").val() ? $("#hashCache").val() : "";
        sendResponse({hash: hash});
    }
    if(msg.action == "SET_TIME_OUT_CLOSE_POPUP"){
        setTimeout(function(){
            $("#annotate-show-popup").remove();
        }, 10000);
    }
    if(msg.action == "SAVE_SESSION_CACHED"){
        if(msg.haveCached) sessionStorage.setItem("cached", 1);
        else  sessionStorage.setItem("cached", 0);
    }
    if(msg.action == "GET_SESSION_CACHED"){
        sendResponse({cached: sessionStorage.getItem("cached")});
    }
    if(msg.action == "GET_CURRENT_CACHED"){
        sendResponse({cacheId: window.CACHE_ID});
        // if(window.CACHE_ID){
        //     sendResponse({cacheId: window.CACHE_ID})
        // }else{
        //     if($("#cacheId").length > 0) sendResponse({cacheId: $("#cacheId").val()});
        //     else sendResponse({cacheId: null});
        // }
    }
    if(msg.action == "SAVE_CURRENT_CACHED"){
        // if($("#cacheId").length > 0) $("#cacheId").val(msg.cacheId);
        // else{
        //     var cacheInput = document.createElement('input');
        //     cacheInput.id = 'cacheId';
        //     cacheInput.setAttribute("type", "hidden");
        //     cacheInput.setAttribute("value", msg.cacheId);
        //     document.body.appendChild(cacheInput);
        // }
        //~ if(!window.CACHE_ID) window.CACHE_ID = msg.cacheId;
        window.CACHE_ID = msg.cacheId;

    }
    if(msg.action == "SHOW_NOTIFICATION"){
        $("#cofiddle-note").html(msg.text);
        $("#cofiddle-note").slideDown(500);
        setTimeout(function(){
             $("#cofiddle-note").slideUp("slow");
        }, 7000);
    }
});
$(function(){
    setTimeout(function(){
        chrome.runtime.sendMessage({action: "GET_INFO_PLAN"}, function(res){
            window.EXCEED_LIMIT = res.haveExceed;
        });
    })
});
