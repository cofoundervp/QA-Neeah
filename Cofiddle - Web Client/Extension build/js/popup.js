$(document).ready(function () {
    var doesInternet = Utils.isAvailableInternet();
    if(doesInternet) {
        setTimeout(function () {
            popup.loadUserName();
            popup.setCurrentLang(function () {
                //load setting play or pause
                chrome.storage.local.get("switch_value", function (obj) {
                    var swi = obj.switch_value ? obj.switch_value : "";
                    if (swi == "off" || swi == "") {
                        $("#myonoffswitch").prop("checked", true);
                        chrome.browserAction.setIcon({ path: 'images/neeah-icon-paused.png' });
                        $("#lbnStatus")
                          .text(window.STR_LABEL_PAUSED)
                          .css("color", "#AFAEAE");
                    } else {
                        $("#myonoffswitch").prop("checked", false);
                        chrome.browserAction.setIcon({ path: 'images/neeah-icon-normal.png' });
                        $("#lbnStatus")
                          .text(window.STR_LABEL_ACTIVE)
                          .css("color", "#7FAC31");
                    }
                });
                loadMenu();
            });
        }, 10);

        //check select
        var searchAlert = Cookie.get("search-alert");
        if (searchAlert == "mini" || searchAlert == "expand") {
            $("#" + searchAlert).prop("checked", true);
        } else {
            $("#expand").prop("checked", true);
        }
        setTimeout(function(){
            ready.load();
        }, 700);
        setTimeout(function () {
            $(".popup-process").hide();
            $("#menu_function").show();
        }, 500);
    } else{
        document.write("Internet is not available. Please check your internet and try again");
    }
});

function search(e) {
    if (e.which == 13) {
        var str = $("#txtSearchKey").val();
        if (str != "") {
            window.open(config.url() + "/app/search?q=" + str + "&page=1");
        }
    }
}
function loadMenu() {
    api.request('GET', config.url() + '/api/menu/menu.txt', null, function(resp){
        if(resp){
            var obj = resp;
            var htmlMenu = "";
            for (var i = 0; i < obj.length; i++) {
                htmlMenu += '<div class="user_icon">';
                htmlMenu += '<i class="' + obj[i].icon + '" style="vertical-align:middle"></i>';
                htmlMenu += '<a class="user_left" style="color:#000;text-decoration: none;" href="' + obj[i].link + '" >' + obj[i].name + '</a>';
                htmlMenu += '</div>';
            }
            Cookie.set("menu_ext", encodeURIComponent(htmlMenu), 1, "");
            $("#menu").append(htmlMenu);
        }
    });
}

var ready = {
    load: function () {
        popup.openMessage();
        popup.showtag();
        popup.getPageNote();
        popup.getListTag();

        var $txtSearchKey = $("#txtSearchKey"),
            $txtNote      = $("#txtNote"),
            $pageTags     = $('#pageTags'),
            $btnSearch    = $('#button-holder');
        $txtNote.on('keypress', function (e) {
            if (e.which == 13) {
                popup.addNoteToPage($txtNote.val());
            }
        });
        $(document)
          .on('keyup', $txtNote, function () {
                popup.countCharacter();
          })
          .on("keypress",$txtSearchKey, function (e) {
                search(e);
          })
          .on("click", $btnSearch, function(){
                var str = $("#txtSearchKey").val();
                if (str != "") {
                    window.open(config.url() + "/app/search?q=" + str + "&page=1");
                }
          })
          .on("click", "#btnCloseMess", function () { //close message
                id = $("#idMessage").val();
                popup.readMessage(id);
            })
          .on("click", '.tag-action', function (event) { //select tag
                var tagSelect = $(this).closest("label").find(".hdTagName").val().trim();
                window.open(config.url() + '/app/search?q=tag:"' + tagSelect + '"&page=1');
            })
          .on("click", "#btnProfile, iconProfile", function () { //open profile
                popup.openWebJournal();
            });

        $(".user_SharePage").click(function () {
            popup.shareOnEmail();
        });

        //Page tags
        $pageTags
          .on('itemRemoved', function (event) {
                popup.removePagTag(event.item);
            })
          .on('beforeItemAdd', function (event) {
                if(popup.invalidTag(event.item)){
                    $(".notice-add-tag").show();
                    return null;
                }
                Utils.getCurrentTab(function (info) {
                    var url = info.url;
                    if (url.indexOf(config.url()) != -1) {
                        $pageTags.tagsinput('remove', event.item);
                        $(".notice-add-tag").show();
                        return null;
                    } else {
                        popup.saveTag(event.item.trim());
                    }
                });
            });

        $txtSearchKey
          .autocomplete({
            source: function (request, response) {
                $.ajax({
                    url: connect.search + '?action=getAutoCompleteStrings&searchKey=' + $("#txtSearchKey").val(),
                    type: 'GET',
                    contentType: "'application/json'",
                    success: function (data) {
                        var obj = jQuery.parseJSON(data);
                        response(obj);
                    }
                });
            },
            open: function (event, ui) {
                $(this).autocomplete("widget").css({
                    "width": "210",
                    "background": "#fff",
                    "border-radius": "5px"
                });
            },
            messages: {
                noResults: '',
                results: function () {
                }
            }
          })
          .on('autocompleteselect', function (e, ui) {
              var str = ui.item.value;
              window.open(config.url() + "/app/search?q=" + str + "&page=1");
          });

        //check focus
        $txtNote.focus(function () {
            popup.checkUrlIsBlackList(function (resp) {
                if (resp.isBlackList) {
                    if (resp.respurlExists == "1") {
                        $("#lblUrlExitst").html("");
                    } else {
                        $("#lblUrlExitst").html(window.STR_MSG_SAVE_URL_AND_ADD_NOTE_EXTENSION);
                    }
                }
                else {
                    if (resp.urlExists == "0") {
                        $("#lblUrlExitst").html(window.STR_MSG_AUTO_ADD_TO_HISTORY_EXTENSION);
                    }
                }
            });
        });

        //2015-22-01: new function, add current tag and default pin tag
        $("#txtAddTags")
          .focus(function(){
                popup.checkUrlIsBlackList(function (resp) {
                    if (resp.isBlackList) {
                        if (resp.respurlExists == "1") {
                            $("#focus-tag").html("");
                        } else {
                            $("#focus-tag").html(window.STR_MSG_CONFIRM_SAVE_TAG_FOR_EXCLUDED_PAGE);
                        }
                    }
                    else {
                        if (resp.urlExists == "0") {
                            $("#"+label).html(window.STR_MSG_AUTO_ADD_TO_HISTORY_EXTENSION_FOR_ADDING_TAG);
                        }
                    }
                });
          })
          .on("keypress", function (e) {
                if (e.keyCode == 13) {
                    var tagName = $(this).val();
                    if(popup.invalidTag(tagName)){
                        $(".notice-add-tag").show();
                        return;
                    }
                    popup.saveTag(tagName);
                    $("html").css("height", "auto");
                    $("#txtAddTags").val("");
                    $(".notice-add-tag").hide();
                    $(".ui-autocomplete").hide();
                }else{
                    popup.initAutocomplete();
                }
            })
          .on('autocompleteselect', function (e, ui) {
                var tagName = ui.item.value;
                if(popup.invalidTag(tagName)){
                    return;
                }
                popup.saveTag(tagName);
                $("html").css("height", "auto");
                $("#txtAddTags").val("");
                e.preventDefault();
            });

        //radio checkbox
        $('input:radio[name="search-alert"]').change(
            function () {
                if ($(this).is(':checked')) {
                    Cookie.set("search-alert", $(this).val());
                }
        });



        //share on facebook
        $(document)
          .on('click', '.tag-delete', function () {
                var tagID = $(this).closest('label').find('.hdTagID').val();
                popup.removePageTag(tagID, this);
            })
          .on('click', '.tag-pin', function () {
                var pin = $(this).closest('label').find('.hdPin').val();
                if (pin == "1") {
                    var tagName = $(this).closest('label').find('.hdTagName').val();
                    popup.pinTag(tagName, this);
                } else {
                    var tagID = $(this).closest('label').find('.hdTagID').val();
                    popup.unpinTag(tagID, this);
                }
          })
          .on('click', '#iconShareFacebook, #iconShareTwitter', function (){
              $("#body_info").css("opacity", "0.4");
              $("#iconShareFacebook").prop("disabled", true);
              var action = $(this).data("action");
              popup.shareOnSocial(action, function(){
                  $("#body_info").css("opacity", "1");
                  $("#iconShareFacebook").prop("disabled", false);
              });
		  })
          .on('click', '#myonoffswitch', function () {
            if ($("#myonoffswitch").is(':checked')) {
                chrome.storage.local.set({'switch_value': "off"}, function() {
                    chrome.browserAction.setIcon({ path: 'images/neeah-icon-paused.png' });
                    $("#lbnStatus")
                      .text(window.STR_LABEL_PAUSED)
                      .css("color", "#AFAEAE");
                    User.updateAutoWebJournal(0);
                });
            } else {
                chrome.storage.local.set({'switch_value': "on"}, function() {
                    chrome.browserAction.setIcon({ path: 'images/neeah-icon-normal.png' });
                    $("#lbnStatus")
                      .text(window.STR_LABEL_ACTIVE)
                      .css("color", "#7FAC31");
                    Utils.sendMessage({ action: "POST_DOCUMENT"});
                    User.updateAutoWebJournal(1);
                });
            }
		  });
    }
};

var popup = {
    initAutocomplete : function () {
        //set autocomplete for tag
        var top = "-5px";
        $("#txtAddTags").autocomplete({
            source: function(request, response){
                var data = $("#divPageTags").data("ListTag"),
                    filterTag = function(listTag){
                        $(".tag-action").each(function () {
                            var currentTag = $(this).text();
                            var index = listTag.indexOf(currentTag);
                            if(index != "-1"){
                                listTag.splice(index, 1);
                             }
                        });
                        var obj = [], str = $("#txtAddTags").val();
                        for(var i = 0; i < listTag.length; i++){
                            if(listTag[i].indexOf(str) != "-1"){
                                obj.push(listTag[i]);
                            }
                        }
                        return obj;
                    };
                if(data){
                    data = filterTag(data);
                    response(data);
                }else{
                    popup.getListTag(function (resp) {
                        resp = filterTag(resp);
                        response(resp);
                        $("#divPageTags").data("ListTag", resp);
                    });
                }
            },
            response: function (event, ui) {
                var len = ui.content.length;
                if(len > 3){
                    top = "-140px";
                }
            },
            open: function () {
                $("html").css("height", "500px")
                $(this).autocomplete("widget").css({
                    "width": "218",
                    "height": "100",
                    "top": top,
                    "overflow-y": "scroll",
                    "overflow-x": "hidden",
                    "position": "relative",
                    "background": "#fff",
                    "border-radius": "5px"
                });
            },
            messages: {
                noResults: '',
                results: function () {
                }
            }
        });
    },

    openMessage: function () {
        User.getAuthication(function(){
            User.getLastUnread().then(function (resp) {
                if (resp) {
                    if (!jQuery.isEmptyObject(resp.data)) {
                        var obj = resp.data;
                        $("#title").html(obj.title);
                        $("#message").html(obj.message);
                        $("#idMessage").val(obj.ID);
                        $("#div_message").show();
                        $("#div_user").hide();
                    }
                } else {
                    $("#div_message").hide();
                    $("#div_user").show();
                }
            });
        });
    },

    readMessage: function (id) {
        User.readMessage(id).then(function (resp) {
            if (resp.success == "1") {
                $("#div_message").hide();
                $("#div_user").show();
            } else {
                $("#div_message").hide();
                $("#div_user").show();
            }
        });
    },

    logoutAccount: function () {
        Utils.sendMessage({action: "LOGOUT_NEEAH_ACCOUNT"});
    },

    openWebJournal: function () {
        window.open(config.url() + "/app/web-journal");
    },

    loadUserName: function () {
        Cookie.getFromDomain(config.url(), "name_value", function (value) {
            if (value) {
                $("#username").text(value);
            } else {
                Utils.iconOff();
                Utils.createTab(config.url() + "/app/signin", true);
            }
        });
    },

    showtag : function(){
        Utils.getCurrentTab(function(info){
            var $pageTags = $("#divPageTags .process");
            $pageTags.show();
            var pageTag = Document.getPageTag(info.url),
                listTag = Tag.get(),
                url = info.url;
            $.when(listTag, pageTag).done(function(respListTag, respPageTag){
                 var sessionTag = respListTag;
                 var json = [];
                 if (sessionTag.data && Utils.ignoreUrl(url)) {
                     var obj = sessionTag.data;
                     for (var i = 0; i < obj.length; i++) {
                         json.push({
                             ID: obj[i].ID,
                             tagName: obj[i].name,
                             isPageTag: 0
                         });
                    }
                 } else if (respPageTag.data) {
                      var obj = respPageTag.data;
                      for (var j = 0; j < obj.length; j++) {
                          //check if page tag is a session tag, show as session tag, else show as page tag
                          if (Utils.inArray(sessionTag.data, "name", obj[j].name)) {
                              json.push({
                                  ID: obj[j].ID,
                                  tagName: obj[j].name,
                                  isPageTag: 0
                              });
                          } else {
                            json.push({
                                ID: obj[j].ID,
                                tagName: obj[j].name,
                                isPageTag: 1
                            });
                          }
                      }
                  }
                  if(json.length > 0) {
                      var tooltip = {
                          select: window.STR_TIP_SELECT_TAG,
                          remove: window.STR_TIP_REMOVE_TAG,
                          pin: window.STR_TIP_PIN_TAG,
                          Unpin: window.STR_TIP_UNPIN_TAG
                      };
                      UITag.tag("currentTag", json, tooltip);
                      popup.setNumberTag();
                      $(".list-current-tag").show();
                  }
                  $pageTags.hide();

            });
        });
    },

    removePageTag: function (tagID, control) {
        Utils.getCurrentTab(function (info) {
            var url = info.url;
            Tag.removePageTag(tagID, url).then(function () {
                  popup.unpinTag(tagID, "");
                  UITag.remove(control);
                //popup.removeTag(tagID, control);
            });
        });
    },

    pinTag: function (tagName, control) {
        Tag.add(tagName).then(function (resp) {
            if (resp.sessionTagAdded == "1") {
                UITag.pin(control);
                popup.setNumberTag();
            }
        });
    },

    unpinTag: function (tagID, control) {
        Tag.removeSessionTag(tagID).then(function (resp) {
            if (resp.success) {
                UITag.unpin(control);
                popup.setNumberTag();
            }
        });
    },

    checkTagExist : function(tagName){
        var tagExist = false,
            $tags = $(".tag-action"),
            tagLength = $tags.length;

        for (var i = 0; i < tagLength; i++) {
            var currentTag = $tags[i];
            currentTag = $(currentTag).text();
            if (tagName == currentTag) {
                $('#txtAddTags').val("");
                tagExist = true;
                break;
            }
        }
        return tagExist;
    },
    /**
     * if current url is neeah or tab is empty, tag will be add as session tag
     * else add as page tag
     */
    saveTag: function (tagName) {
        var tagExist = this.checkTagExist(tagName);
        if (!tagExist) {
            Utils.getCurrentTab(function (info) {
                var currentUrl = info.url,
                    obj  = [], tagAdd, tagAddUrl;
                if(currentUrl.indexOf(config.url()) != -1 || currentUrl == "chrome://newtab/"){
                    tagAdd = tag.add(tagName);
                }else {
                    Document.isUrlExist(currentUrl).then(function (isExist) {
                        if (isExist.success == "1" && isExist.urlExists == "0") {
                            var document = [currentUrl];
                            Document.add(document, 0);
                        }
                    });
                    tagAddUrl = Tag.addUrl(tagName, currentUrl);
                }

                $.when(tagAdd, tagAddUrl).done(function (respTagAdd, respTagAddUrl) {
                    if(respTagAdd && respTagAdd.success == "1"){
                        obj.push({
                            tagName: tagName,
                            ID: respTagAdd.tagID,
                            isPageTag: 0
                        });
                    }else if(respTagAddUrl && respTagAddUrl.success == "1"){
                        obj.push({
                            tagName: tagName,
                            ID: respTagAddUrl.tagID,
                            isPageTag: 1
                        });
                    }
                    if(obj) {
                        var tooltip = {
                            select: window.STR_TIP_SELECT_TAG,
                            remove: window.STR_TIP_REMOVE_TAG,
                            pin: window.STR_TIP_PIN_TAG,
                            Unpin: obj.isPageTag == "1" ? window.STR_TIP_UNPIN_TAG : window.STR_TIP_PIN_TAG
                        };
                        UITag.tag("currentTag", obj, tooltip);
                        $(".list-current-tag").show();
                        popup.setNumberTag();
                    }
                });
            });
        }
    },

    setNumberTag: function () {
        var tag = $(".hdPin");
        var number = 0;
        if (tag.length > 0) {
            for (var i = 0; i < tag.length; i++) {
                var value = $(tag)[i];
                if ($(value).val() == "0") number = number + 1;
            }
            chrome.browserAction.setBadgeText({ text: number.toString() });
        } else {
            chrome.browserAction.setBadgeText({ text: "" });
        }
    },

    addNoteToPage: function (note) {
        Utils.getCurrentTab(function (info) {
            Document.isUrlExist(info.url).then(function (isExist) {
                if (isExist.success == "1" && isExist.urlExists == "0") {
                    var document = [info.url];
                    Document.add(document, 1).then(function (saved) {
                        if(saved.success == "1"){
                            Utils.sendMessage({
                                action: "ADD_PAGE_NOTE",
                                url: info.url,
                                note: note
                            });
                        }
                    });

                }else {
                    Document.addNote(info.url, note);
                }
                $("#lblUrlExitst").hide();
                $("#lblNote").show();
            });
        });
    },

    getPageNote: function () {
        Utils.getCurrentTab(function (info) {
            Document.getPageNote(info.url).then(function(resp){
                if (resp.success == "1" && resp.comment != "") {
                    var $pageNote = $("#txtNote");
                    $pageNote.html(resp.comment);
                    var note = $pageNote.val();
                    if (note != "") {
                        var count = 140 - parseInt(note.length);
                        $("#lblCount").html(count);
                        $("#pageNoteProcess").hide();
                        $(".page-note .note").css("height","85px");
                    }
                }
            });
        });
    },

    shareOnSocial: function (type, cb) {
        Utils.getCurrentTab(function (info) {
            var url = info.url;
            var title = info.title;
            var tabID = info.id;
            if(Utils.isUrlImg(url)){
                return null;
            }
            else {
                chrome.extension.sendMessage({
                    action: "SHARE_ON_SOCIAL",
                    url: url,
                    title: title,
                    tabId: tabID,
                    type: type
                });
            }

        });
        if(typeof cb === "function"){
            cb(cb);
        }
    },

    shareOnEmail: function () {
        Utils.getCurrentTab(function (info) {
            var url = info.url;
            var title = info.title;
            var tabId = info.id;

            if(Utils.isUrlImg(url)) {
                return null;
            }

            if(Utils.ignoreUrl(url)){
                return null;
            }

            var blanket = UIblanket.get;
            var urlShare = "chrome-extension://hbchcjeppddbockfcdiejdpnimjbdcpm/sharePage.html?url=" +
            encodeURIComponent(url) ;
            urlShare = urlShare.replace(/'/g, "s");
            var dialogShare = UIshare.dialogshare(urlShare);

            Utils.executeScript(tabId, blanket);
            Utils.executeScript(tabId, dialogShare);
        });
    },

    setCurrentLang: function (callback) {
        var language = "en-US";
        Cookie.getFromDomain(config.url(), "lang-neeah", function (value) {
            if (value != null) {
                Cookie.set("lang-neeah", value, 1, "");
                language = value;
            }
            i18n.init({lng: language, resGetPath: config.getlocalesPath(), fallbackLng: false}, function (t) {
                $("html").i18n();
                window.STR_TIP_SELECT_TAG = t("STR_TIP_SELECT_TAG");
                window.STR_LABEL_PAUSED = t("STR_LABEL_PAUSED");
                window.STR_LABEL_ACTIVE = t("STR_LABEL_ACTIVE");
                window.STR_TIP_REMOVE_TAG = t("STR_TIP_REMOVE_TAG");
                window.STR_MSG_AUTO_ADD_TO_HISTORY_EXTENSION = t("STR_MSG_AUTO_ADD_TO_HISTORY_EXTENSION");
                window.STR_MSG_SAVE_URL_AND_ADD_NOTE_EXTENSION = t("STR_MSG_?_CONFIRM_SAVE_NOTE_FOR_EXCLUDED_PAGE");
                window.STR_TIP_PIN_TAG = t("STR_TIP_PIN_TAG");
                window.STR_TIP_UNPIN_TAG = t("STR_TIP_UNPIN_TAG");
                window.STR_MSG_AUTO_ADD_TO_HISTORY_EXTENSION_FOR_ADDING_TAG = t("STR_MSG_AUTO_ADD_TO_HISTORY_EXTENSION_FOR_ADDING_TAG");
                window.STR_MSG_CONFIRM_SAVE_TAG_FOR_EXCLUDED_PAGE = t("STR_MSG_?_CONFIRM_SAVE_TAG_FOR_EXCLUDED_PAGE");
                if (typeof callback == "function") {
                    callback(callback);
                }
            });
        });
    },

    getListTag: function (callback) {
        User.getAuthication(function() {
            Tag.getListTag().then(function (resp) {
                if (!jQuery.isEmptyObject(resp.data)) {
                    var obj = resp.data,
                        strTagName =[];
                    if (obj.length > 0) {
                        for (var i = 0; i < obj.length; i++) {
                            strTagName.push(obj[i].name);
                        }
                        $("#pagTagsProcess").hide();
                    }
                    if (typeof  callback == "function") {
                        callback(strTagName);
                    }
                }
            });
        });
    },

    checkUrlIsBlackList : function(callback){
        Utils.getCurrentTab(function (info) {
            var url = info.url;
            BlackList.check(url).then(function(isBlackList){
                Document.isUrlExist(url).then(function (isUrlExits) {
                    if(typeof callback == "function"){
                        callback({"isBlackList": isBlackList, "isUrlExist": isUrlExits})
                    }
                });
            });
        });
    },

    countCharacter : function(){
        var CharLength = document.getElementById("txtNote").maxLength;
        var txtMsg = document.getElementById('txtNote');
        var lblCount = document.getElementById('lblCount');
        var colorwidth = txtMsg.value.length;
        if (txtMsg.value.length > CharLength) {
            txtMsg.value = txtMsg.value.substring(0, CharLength);
        }
        lblCount.innerHTML = CharLength - txtMsg.value.length;
        //auto grow height
        var textField = document.getElementById("txtNote");
        if (textField.clientHeight < textField.scrollHeight) {
            textField.style.height = textField.scrollHeight + "px";
            if (textField.clientHeight < textField.scrollHeight) {
                textField.style.height =
                    (textField.scrollHeight * 2 - textField.clientHeight) + "px";
            }
        }
    },

    removeTag : function (tagId, control) {
        Tag.removeTag(tagId).then(function (resp) {
            if (resp.success == "1") {
                UITag.remove(control);
            }
        });
    },
    /***
     *
     * Tag name should contain only a-z, 0-9 and 1 space between character.
     * @returns {boolean}
     */
    invalidTag : function (strTag) {
        console.log(strTag);
        return !/[^\s]/.test(strTag) || /[-'`~!@#$%^&*()_|+=?;:'",.<>\{\}\[\]\\\/]/.test(strTag) || strTag.length > limitCharater.tag ||
                strTag.indexOf('  ') != "-1"
    }
};
