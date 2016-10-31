'use strict';
var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
$(document).ready(function () {
    if(typeof Utils == "undefined") return;
    Utils.loadSegment(function () {
        analytics.load(getIDApp.segment());
    });
});
var Utils = {

    getCurrentDate : function(){
        var year = new Date().getFullYear();
        var month = new Date().getMonth();
        var date = new Date().getDate();
        var hour = new Date().getHours();
        var minute = new Date().getMinutes();
        var second = new Date().getSeconds();
        return year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second;
    },

    getParameterByName : function(name, url){
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&#]" + name + "=([^&#]*)"),
            results = regex.exec(url);
        return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    },

    trunkString : function (str, n) {
        if (str.length > n) {
            if (str.indexOf(" ") != -1) {
                return this.cutString(str, n) + "...";
            }
            else {
                return str.substring(0, n) + "...";
            }
        }
        return str;
    },

    cutString : function (s, n) {
        var cut = s.indexOf(' ', n);
        if (cut == -1) {
            s = s.substring(0, n);
        }
        else {
            s = s.substring(0, cut)
        }
        return s;
    },

    validateEmail : function (email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    },

    isNumber : function (val) {
        var matches = val.match(/\d+/g);
        if(matches != null) return true;
        return false;
    },

    isUppercase : function (str) {
        for (var i = 0; i < str.length; i++) {
            var isUpcase = (/[A-Z]/.test(str));
            if (isUpcase) {
                return isUpcase;
            }
        }
    },
    convertUTCDate : function(str){
        if (!str) {
            return null;
        }
        var strYear = str.substring(0, 4);
        var strMonth = str.substring(5, 7);
        strMonth = parseInt(strMonth) - 1;
        var strDay = str.substring(8, 10);
        var strHour = str.substring(11, 13);
        var strMinutes = str.substring(14, 16);
        var strSecond = str.substring(17, 19);

        var date = new Date(strYear, strMonth, strDay, strHour, strMinutes, strSecond);
        date.setUTCFullYear(strYear);
        date.setUTCMonth(strMonth);
        date.setUTCDate(strDay);
        date.setUTCHours(strHour);
        date.setUTCMinutes(strMinutes);
        date.setUTCSeconds(strSecond);

        return date;
    },

    convertToLocalDateString : function(date, options, language) {
        if (!date) return '';
        language = language || 'en';
        //check time is today
        var today = (new Date).toDateString();
        var dateComment = date.toDateString();
        var dateConvert = "";
        var yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday = yesterday.toDateString();

        var timeOpts = {
            hour: options.hour || "2-digit",
            minute: options.minute || "2-digit",
            hour12: options.hour12 || false
        }
        if (today == dateComment) {
            dateConvert = date.toLocaleTimeString(language, timeOpts);
            dateConvert = window.STR_LABEL_TODAY ? window.STR_LABEL_TODAY : "Today" + ", " + dateConvert;
        }
        else if (yesterday == dateComment) {
            dateConvert = date.toLocaleTimeString(language, timeOpts);
            dateConvert = window.STR_LABEL_YESTERDAY ? window.STR_LABEL_YESTERDAY : "Yesterday" + ", " + dateConvert;
        }
        else {
            dateConvert = date.toLocaleDateString(language, options);
        }
        return dateConvert;
    },

    updateTokenLogin : function (token,callback) {
        storeToken();
        if (token != "") {
            var expires = (new Date().getTime() / 1000) + (364 * 24 * 60 * 60 * 1000);
            chrome.cookies.set({ "url": urlBase, "name": "loginToken", value: token, path: "/", expirationDate: expires }, function (cookie) {
                if (callback) {
                    callback(cookie ? cookie.value : null);
                }
            });
        }
    },

    extractEmails : function (text) {
        return text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
    },

    convertDate : function (str, options) {
        var strYear     = str.substring(0, 4),
            strMonth    = str.substring(5, 7),
            strDay      = str.substring(8, 10),
            strHour     = str.substring(11, 13),
            strMinutes  = str.substring(14, 16),
            strSecond   = str.substring(17, 19),
            lang         = Cookie.get("lang-neeah"),
            date        = new Date(strYear, strMonth, strDay, strHour, strMinutes, strSecond);
        strMonth = parseInt(strMonth) - 1;

        date.setUTCFullYear(strYear);
        date.setUTCMonth(strMonth);
        date.setUTCDate(strDay);
        date.setUTCHours(strHour);
        date.setUTCMinutes(strMinutes);
        date.setUTCSeconds(strSecond);
        //check time is today
        var today = (new Date).toDateString();
        var dateComment = date.toDateString();

        var yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday = yesterday.toDateString();

        var localTime = {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        };
        if(!lang){
            lang = User.getCurrentLang();
        }
        var dateConvert = date.toLocaleTimeString(this.convertLocale(lang), localTime);

        if (today == dateComment) {
            dateConvert = window.STR_LABEL_TODAY + ", " + dateConvert;
        } else if (yesterday == dateComment) {
            dateConvert = window.STR_LABEL_YESTERDAY + ", " + dateConvert;
        } else {
            dateConvert = date.toLocaleDateString(this.convertLocale(lang), options);
        }
        return dateConvert;
    },

    insertAtTextareaCursor : function (txtarea, text) {

        //var txtarea = $(control).next('textarea')[0];
        txtarea = txtarea[0];
        var scrollPos = txtarea.scrollTop;
        var strPos = 0;
        var br = ((txtarea.selectionStart || txtarea.selectionStart == '0') ?
            "ff" : (document.selection ? "ie" : false));
        if (br == "ie") {
            txtarea.focus();
            var range = document.selection.createRange();
            range.moveStart('character', -txtarea.value.length);
            strPos = range.text.length;
        }
        else if (br == "ff") strPos = txtarea.selectionStart;

        var front = (txtarea.value).substring(0, strPos);
        var back = (txtarea.value).substring(strPos, txtarea.value.length);
        txtarea.value = front + text + back;
        strPos = strPos + text.length;
        if (br == "ie") {
            txtarea.focus();
            var range = document.selection.createRange();
            range.moveStart('character', -txtarea.value.length);
            range.moveStart('character', strPos);
            range.moveEnd('character', 0);
            range.select();
        } else if (br == "ff") {
            txtarea.selectionStart = strPos;
            txtarea.selectionEnd = strPos;
            txtarea.focus();
        }
    },

    isSearchIntercept : function (url) {
        var isIntercept = false,
            arrayUrl    = listSearch.url;
        var a = $('<a>', { href:url } )[0];
        url = a.hostname;
        for(var i = 0; i < arrayUrl.length; i++) {
            if (url.indexOf(arrayUrl[i]) != -1) {
                isIntercept = true;
                break;
            }
        }
        return isIntercept;
    },

    ignoreUrl : function(currentUrl){
        var a = $('<a>', { href:currentUrl } )[0];
        currentUrl = a.hostname;
        if (a.protocol == "chrome:") {
            return true;
        }
        for (var i = 0; i < ignore.url.length; i++) {
            if (currentUrl.indexOf(ignore.url[i]) != -1) {
                return true;
            }
        }
        return false;
    },

    isUrlImg : function (url) {
        var a = $('<a>', { href:url } )[0],
            pathname = a.pathname;
        return(pathname.match(/\.(jpeg|jpg|gif|png|bmp|svg)$/) != null);
    },

    isAvailableInternet : function(){
        if(navigator.onLine) {
            return true;
        }else {
            return false;
        }
    },

    getQuerrySearch : function(url){
        var a = $('<a>', { href:url } )[0];
        var domain  = a.hostname;
        var str = "";
        for(var i = 0; i < listSearch.url.length; i++){
            if (domain.indexOf(listSearch.url[i]) != -1) {
                if(domain.indexOf("google.com") != "-1"){
                    str =  this.getParameterByName("q", url, 2) == "" ? this.getParameterByName("q", url, 1) : this.getParameterByName("q", url, 2);
                    break;
                }else{
                    str = this.getParameterByName("text", url) || this.getParameterByName("q", url) || this.getParameterByName("p", url) || this.getParameterByName("wd", url);
                    break;
                }
            }
        }
        return str;

    },
    base64Encode : function(input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
        input = this._utf8_encode(input);
        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output = output + _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +_keyStr.charAt(enc3) + _keyStr.charAt(enc4);
        }
        return output;
    },

    base64Decode : function(input){
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {

            enc1 = _keyStr.indexOf(input.charAt(i++));
            enc2 = _keyStr.indexOf(input.charAt(i++));
            enc3 = _keyStr.indexOf(input.charAt(i++));
            enc4 = _keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }

        }

        output = this._utf8_decode(output);

        return output;
    },

    _utf8_decode : function(str_data){
        var tmp_arr = [],
          i = 0,
          ac = 0,
          c1 = 0,
          c2 = 0,
          c3 = 0;

        str_data += '';

        while (i < str_data.length) {
            c1 = str_data.charCodeAt(i);
            if (c1 < 128) {
                tmp_arr[ac++] = String.fromCharCode(c1);
                i++;
            } else if (c1 > 191 && c1 < 224) {
                c2 = str_data.charCodeAt(i + 1);
                tmp_arr[ac++] = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
                i += 2;
            } else {
                c2 = str_data.charCodeAt(i + 1);
                c3 = str_data.charCodeAt(i + 2);
                tmp_arr[ac++] = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }

        return tmp_arr.join('');
    },

    _utf8_encode : function(argString){
        if (argString === null || typeof argString === 'undefined') {
            return '';
        }

        var string  = (argString + '');
        var utftext = '',
            start   = 0,
            end     = 0,
            stringl = string.length;

        for (var n = 0; n < stringl; n++) {
            var c1 = string.charCodeAt(n);
            var enc = null;

            if (c1 < 128) {
                end++;
            } else if (c1 > 127 && c1 < 2048) {
                enc = String.fromCharCode(
                  (c1 >> 6) | 192, (c1 & 63) | 128
                );
            } else if ((c1 & 0xF800) != 0xD800) {
                enc = String.fromCharCode(
                  (c1 >> 12) | 224, ((c1 >> 6) & 63) | 128, (c1 & 63) | 128
                );
            } else {
                if ((c1 & 0xFC00) != 0xD800) {
                    throw new RangeError('Unmatched trail surrogate at ' + n);
                }
                var c2 = string.charCodeAt(++n);
                if ((c2 & 0xFC00) != 0xDC00) {
                    throw new RangeError('Unmatched lead surrogate at ' + (n - 1));
                }
                c1 = ((c1 & 0x3FF) << 10) + (c2 & 0x3FF) + 0x10000;
                enc = String.fromCharCode(
                  (c1 >> 18) | 240, ((c1 >> 12) & 63) | 128, ((c1 >> 6) & 63) | 128, (c1 & 63) | 128
                );
            }
            if (enc !== null) {
                if (end > start) {
                    utftext += string.slice(start, end);
                }
                utftext += enc;
                start = end = n + 1;
            }
        }

        if (end > start) {
            utftext += string.slice(start, stringl);
        }

        return utftext;
    },

    inArray : function(obj, key, value){
        var isExist = false;
        obj.forEach(function(list) {
            if(list[key] == value){
                isExist = true;
            }
        });

        return isExist;
    },

    executeScript : function(tabId, script, callback){

        chrome.tabs.executeScript(tabId, {code: script}, function(){
            if(typeof  callback == "function"){
                callback(callback);
            }
        })

    },

    getCurrentTab : function (callback){
        chrome.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {
            var url = arrayOfTabs[0].url;
            var title = arrayOfTabs[0].title;
            var tabID = arrayOfTabs[0].id;
            var info = {
                url: url,
                title: title,
                id: tabID
            };
            if(typeof callback == "function"){
                 callback(info);
            }
        });
    },

    sendMessage : function(data, callback){
        chrome.extension.sendMessage(data, function (resp) {
            if(typeof  callback == "function"){
                callback(resp);
            }
        });
    },

    createTab : function (url, selected, callback) {
        chrome.tabs.create({"url": url,"selected": selected}, function(info){
            if(typeof callback == "function"){
                callback(info);
            }
        })
    },

    updateTab : function (tabId, url, callback) {
        chrome.tabs.update(tabId, {url: url }, function () {
            if(typeof  callback == "function"){
                callback(callback);
            }
        });
    },

    iconOff : function(){
        chrome.browserAction.setIcon({path: 'images/neeah-icon-gray.png'});
    },

    iconOn : function(){
        chrome.browserAction.setIcon({path: 'images/neeah-icon-normal.png'});
    },
    iconPaused : function(){
        chrome.browserAction.setIcon({path: 'images/neeah-icon-paused.png'});
    },
    highlightText : function(opts){
        var tag = opts.tag || 'strong',
            words = opts.words || [],
            regex = RegExp('(' + words.join('|') + ')', 'gi');
        var text=opts.text;
        if(text) {
            var list = text.split(regex);
            var concat_text = '';
            for (var i = 0; i < list.length; i++) {
                if (i % 2 == 1) {
                    concat_text += '<' + tag + '>' + this.escapeHtml(list[i]) + '</' + tag + '>';
                } else concat_text += this.escapeHtml(list[i]);
            }
            text = concat_text;
        }
        return text;
    },

    escapeHtml : function (str) {
        var entityMap = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': '&quot;',
            "'": '&#39;',
            "/": '&#x2F;'
        };

        return String(str).replace(/[&<>"'\/]/g, function (s) {
            return entityMap[s];
        });
    },
    //inject script to page.
    executeScripts: function (tabId, injectDetailsArray){
        function createCallback(tabId, injectDetails, innerCallback) {
            return function () {
                chrome.tabs.executeScript(tabId, injectDetails, innerCallback);
            };
        }

        var callback = null;

        for (var i = injectDetailsArray.length - 1; i >= 0; --i)
            callback = createCallback(tabId, injectDetailsArray[i], callback);

        if (callback !== null)
            callback();   // execute outermost function
    },
    injectCss: function (tabId, injectCssArray){
        function createCallback(tabId, injectDetails, innerCallback) {
            return function () {
                chrome.tabs.insertCSS(tabId, injectDetails, innerCallback);
            };
        }

        var callback = null;

        for (var i = injectCssArray.length - 1; i >= 0; --i)
            callback = createCallback(tabId, injectCssArray[i], callback);

        if (callback !== null)
            callback();   // execute outermost function
    },
    getCurrentTime : function () {
        var now = new Date();
        var year = now.getFullYear();
        var month = now.getMonth() + 1;
        var day = now.getDate();
        var hour = now.getHours();
        var minute = now.getMinutes();
        var second = now.getSeconds();
        if (month.toString().length == 1) {
            var month = '0' + month;
        }
        if (day.toString().length == 1) {
            var day = '0' + day;
        }
        if (hour.toString().length == 1) {
            var hour = '0' + hour;
        }
        if (minute.toString().length == 1) {
            var minute = '0' + minute;
        }
        if (second.toString().length == 1) {
            var second = '0' + second;
        }
        var dateTime = hour + ':' + minute + ':' + second;
        return dateTime;
    },

    loadSegment : function (callback) {
        var analytics = window.analytics = window.analytics || []; if (!analytics.initialize) if (analytics.invoked) window.console && console.error && console.error("Segment snippet included twice."); else {
            analytics.invoked = !0; analytics.methods = ["trackSubmit", "trackClick", "trackLink", "trackForm", "pageview", "identify", "group", "track", "ready", "alias", "page", "once", "off", "on"]; analytics.factory = function (t) { return function () { var e = Array.prototype.slice.call(arguments); e.unshift(t); analytics.push(e); return analytics } }; for (var t = 0; t < analytics.methods.length; t++) { var e = analytics.methods[t]; analytics[e] = analytics.factory(e) } analytics.load = function (t) { var e = document.createElement("script"); e.type = "text/javascript"; e.async = !0; e.src = ("https:" === document.location.protocol ? "https://" : "https://") + "cdn.segment.com/analytics.js/v1/" + t + "/analytics.min.js"; var n = document.getElementsByTagName("script")[0]; n.parentNode.insertBefore(e, n) }; analytics.SNIPPET_VERSION = "3.0.1";
            if(typeof callback == "function"){
                callback(callback);
            }
        }
    },

    convertLocale : function(lang){
      if(lang == "zh_t")
        return "zh-TW";
      if(lang == "zh_s")
        return "zh-CN";
      return lang;
    },

    check_robot(url, callback){
       var parsedUrl = $('<a>', { href:url } )[0];;
       var path = parsedUrl.pathname    ;
       if (path == null) path = '/';

       var robotUrl = parsedUrl.protocol + '//' + (parsedUrl.auth == null ? '' : parsedUrl.auth + '@') + parsedUrl.host + '/robots.txt';
       $.get(robotUrl).done(function(data){
           if(data){
               var robotRegEx = /^Disallow:\s+(\/[^\s]*)\s*(?:#.*)?$/gim,
                   agentRegex = /(?:^|\n)User-agent:[^\S\n]+\*[^\S\n]*(?:#.*)?(?:\nUser-agent:.*)*([\s\S]*?)(?=\nUser-agent:|\n[^\S\n]*\n|$)/gi,
                   hasRobot = false,
                   matchedAgent,
                   blockedPath;
                do {
                    matchedAgent = agentRegex.exec(data);
                    if (matchedAgent) {
                        do {
                            blockedPath = robotRegEx.exec(matchedAgent[1]);
                            if (blockedPath && path.substring(0, blockedPath[1].length) === blockedPath[1]) {
                                hasRobot = true;
                                break;
                            }
                        } while (blockedPath);
                    }
                    if (hasRobot) break;
                } while (matchedAgent);
                callback(hasRobot);
           }
       }).fail(function() {
            callback(false);
      });;
   },
   removeStoreAge: function(){
       chrome.storage.local.get(null, function(items) {
            var allKeys = Object.keys(items);
            for(var i = 0; i < allKeys.length; i++){
                if(allKeys[i] == "switch_value"){
                    continue;
                }else{
                    chrome.storage.local.remove(allKeys[i]);
                }
            }
        });
   }
};

var tracking = {
    event : function (event) {
        analytics.track(event);
    }
};
