var flag = false;
var countDel = 0;
$(document).ready(function () {
    $("#process").hide();
    share.setCurrentLang(function () {
       ready.load();
    });
});

var ready = {
    load: function(){
        //set title
        // var title = Utils.getParameterByName("title", location.href);
        chrome.extension.sendMessage({action: "GET_TITLE"}, function(resp){
                $("#url").val(resp.title);
        });
        //open share dialog
        share.open();
        //event click
        $("#btnShareURL").click(function () {
            share.shareEmail();
        });

        $("#txtEmailShare").on('keypress', function (e) {
            if (e.which == 13) {
                share.highlightEmail();
            }
        });
        $("#btnCancelShare").click(function () {
            if($("#support").css('display') == 'block') {
                $("#support").hide();
            }
            $("#popUpDiv").remove();
            Utils.sendMessage({ action: "CLOSE_DIALOG", frameName: "divBlanket"});
            Utils.sendMessage({ action: "CLOSE_DIALOG", frameName: "divShare" });
        });
        $("#txtEmailShare").autocomplete({
            source: function (request, response) {
                User.getAuthication(function () {
                    User.getEmailAutoComplete($("#txtEmailShare").val()).then(function (resp) {
                        response(resp.data);
                    });
                });

            },
            open: function () {
                $(this).autocomplete("widget").css({
                    "width": "400",
                    "left": "100px",
                    "height": "130",
                    "overflow-y": "scroll",
                    "overflow-x": "hidden",
                    "background": "#fff"
                });
            },
            messages: {
                noResults: '',
                results: function () { }
            },
            select: function (event, ui) {
                event.preventDefault();
                return false;
            }
        });

        //autocomplete select email
        $('#txtEmailShare').on('autocompleteselect', function (e, ui) {
            var str = ui.item.value;
            $("#txtEmailShare").val(str);
            share.highlightEmail();
        });

        //custom render autocomplete
        $.ui.autocomplete.prototype._renderItem = function (ul, item) {
            var term = this.term.split(' ').join('|');
            var re = new RegExp("(" + term + ")", "gi");
            var t = item.label.replace(re, "<b>$1</b>");
            return $("<li style='font-size:0.80em'></li>")
                .data("item.autocomplete", item)
                .append("<div style='float:left'><a class='itemEmail'>" + t + "</a></div><div style='float:right;display:none' class='removeEmail'><i class='fa  fa-remove fa-1x'></i></div>")
                .appendTo(ul);
        };

        //hover email
        $(document).on('mouseover', '.ui-menu-item', function () {
            $(this).closest('li').find('.removeEmail').show()
        });
        $(document).on('mouseout', '.ui-menu-item', function () {
            $(this).closest('li').find('.removeEmail').hide()
        });

        //remove email
        $(document).on('click', '.removeEmail', function () {
            var email = $(this).closest('li').find('a').text();
            share.deleteEmailAutoComplete(email);
        });
        $(document).on("click", '.email-remove', function () {
            var count = $(".email-share").length;
            $(this).closest("label").remove();
        });

        //skip tour
        $(document).on("click", ".skip-tour", function () {
            User.getAuthication(function(){
                tracking.event("FTUE skipped at screen #4");
                User.updateTourStep("-1");
                Utils.sendMessage({action: "CLOSE_DIALOG", frameName: "divBlanket"});
                Utils.sendMessage({action: "CLOSE_DIALOG", frameName: "divShare"});
            });
        });
        $(document).on("click", "#btnResend", function(){
            flag = true;
            // var email = cookie.get("email_Neeah") || $("#emailSignUp").text();
            User.resentEmail().then(function(resp){
                if(resp.success){
                    $("#alertify-ok").click();
                    alertify.alert(window.STR_MSG_EMAIL_RESENT_SUCCESS, function(){
                        Utils.sendMessage({action: "CLOSE_DIALOG", frameName: "divBlanket"});
                        Utils.sendMessage({action: "CLOSE_DIALOG", frameName: "divShare"});
                    });
                }else{
                    $("#alertify-ok").click();
                    $("#alertify").remove();
                    alertify.alert(window.STR_ERR_UNABLE_TO_SEND_EMAIL);
                }
            })
        });
        //event checkbox
        // $(document).on("change", "#shareMarkup", function(){
        //     var isCheck = $(this).is(":checked");
        //     console.log(Cookie.get("name_value"));
        //     if(isCheck){
        //         var message = "Take a look at my markups on this page!\n -" + Cookie.get("name_value");
        //         $("#message").val(message);
        //     }else{
        //         $("#message").val("-"+Cookie.get("name_value"));
        //     }
        // })
        //check blacklist of user
        share.checkBlackListUser();
    }
};

var share =  {
    open : function(){
        User.getAuthication(function(){
            User.isUserActive().then(function (resp) {
                if(resp.success == "0"){
                    var str = window.STR_MSG_VERIFY_EMAIL_TO_SHARE_1 + " " + window.STR_MSG_VERIFY_EMAIL_TO_SHARE_2;
                    alertify.alert(str, function(){
                            if(flag) return;
                            Utils.sendMessage({action: "CLOSE_DIALOG", frameName: "divBlanket"});
                            Utils.sendMessage({action: "CLOSE_DIALOG", frameName: "divShare"});
                    });
                    $("#alertify-cover").hide();
                } else{
                    $("#share-user").show();
                    var email = Utils.getParameterByName("email", location.href);
                    if(typeof email === 'string' && email !== "undefined") {
                        $("#txtEmailShare").val(email);
                        share.highlightEmail();
                    }
                    // var message = "Take a look at my markups on this page!\n -" + Cookie.get("name_value");
                    // $("#message").val(message);
                }
            });
        });
    },

    shareEmail : function(){
        var url = Utils.getParameterByName("url", location.href);
        var checkList = $("#listEmail").hasClass("email-share");
        if (!checkList) {
            var currentEmail = $("#txtEmailShare").val();
            if (currentEmail != "") {
                this.highlightEmail();
            }
        }
        var isValid = false;
        var arrEmail = [];
        $(".email-name").each(function () {
            var email = $(this).text();
            if (!Utils.validateEmail(email)) {
                alert(window.STR_ERR_INVALID_EMAIL);
                return;
            }
            else {
                arrEmail.push(email);
                isValid = true;
            }
        });
        if (isValid) {
            var mess = $("#message").val();
            var title = $("#url").val(),
                includeMarkup = $("#shareMarkup").is(":checked") ? 1 : 0;
            $("#process").show();
            $('#dialog-blanket').show();
            Utils.sendMessage({
                    action: "SHARE_CURRENT_PAGE",
                    url: url,
                    listEmailShare: arrEmail,
                    messageShare: mess,
                    includeMarkup: includeMarkup
            });
        }
    },

    highlightEmail : function () {
        var isExist = false;
        var emailShare = $("#txtEmailShare").val();
        if (emailShare == "") {
            isExist = true;
            $(".share-error").hide();
            return;
        }
        $(".email-name").each(function () {
            var currentEmail = $(this).text();
            if (emailShare == currentEmail) {
                $(".tagsEmailShare input").val("");
                isExist = true;
                return;
            }
        });
        if (!isExist) {
            if (!Utils.validateEmail(emailShare) && emailShare.indexOf("@") != -1) {
                var extractEmail = Utils.extractEmails(emailShare);
                emailShare = extractEmail[0];
            } else if(!Utils.validateEmail(emailShare)) {
                $(".share-error").show();
                $(".tagsEmailShare input").val("");
                return;
            }
            $(".share-error").hide();
            UIshare.showEmail(emailShare, "listEmail");
            $(".tagsEmailShare input").val("");
            User.addEmailAutoComplete(emailShare);
        }
    },

    setCurrentLang : function (callback) {
        var language = User.getCurrentLang();
        i18n.init({lng: language, debug: true, resGetPath: config.getlocalesPath(), fallbackLng: false}, function (t) {
            $("html").i18n();
            window.STR_MSG_SAVE_URL_AND_SHARE = t("STR_MSG_SAVE_URL_AND_SHARE");
            window.STR_MSG_AUTO_ADD_TO_HISTORY = t("STR_MSG_AUTO_ADD_TO_HISTORY");
            window.STR_MSG_VERIFY_EMAIL_TITLE = t("STR_MSG_VERIFY_EMAIL_TITLE");
            window.STR_MSG_VERIFY_EMAIL_TO_SHARE_1 = t("STR_MSG_VERIFY_EMAIL_TO_SHARE_1");
            window.STR_MSG_VERIFY_EMAIL_TO_SHARE_2 = t("STR_MSG_VERIFY_EMAIL_TO_SHARE_2");
            window.STR_MSG_EMAIL_RESENT_SUCCESS = t("STR_MSG_EMAIL_RESENT_SUCCESS");
            window.STR_ERR_UNABLE_TO_SEND_EMAIL = t("STR_ERR_UNABLE_TO_SEND_EMAIL");

            window.STR_FTUE_4_SHARE_VIA_EMAIL_1 = t("STR_FTUE_4_SHARE_VIA_EMAIL_1");
            window.STR_FTUE_4_SHARE_VIA_EMAIL_2 = t("STR_FTUE_4_SHARE_VIA_EMAIL_2");
            window.STR_FTUE_4_SHARE_VIA_FACEBOOK_1 = t("STR_FTUE_4_SHARE_VIA_FACEBOOK_1");
            window.STR_FTUE_4_SHARE_VIA_FACEBOOK_2 = t("STR_FTUE_4_SHARE_VIA_FACEBOOK_2")
            window.STR_FTUE_4_SHARE_VIA_TWITTER_1 = t("STR_FTUE_4_SHARE_VIA_TWITTER_1");
            window.STR_FTUE_4_SHARE_VIA_TWITTER_2 = t("STR_FTUE_4_SHARE_VIA_TWITTER_2");
            if(typeof callback == "function"){
                callback(callback);
            }
        });
    },

    deleteEmailAutoComplete : function (email) {
        User.getAuthication(function(){
            User.deleteEmailAutoComplete(email);
        });
    },

    checkBlackListUser : function () {
        User.getAuthication(function () {
            var url = Utils.getParameterByName("url", location.href);
            BlackList.check(url).then(function (isBlackList) {
                Document.isUrlExist(url).then(function (isUrlExits) {
                    if (isBlackList) {
                        if (isUrlExits.urlExists == "1") {
                            $("#lblUrlExitst").html("");
                        } else {
                            $("#lblUrlExitst").html(window.STR_MSG_SAVE_URL_AND_SHARE);
                            return true;
                        }
                    } else {
                        if (isUrlExits.urlExists == "0") {
                            $("#lblUrlExitst").html(window.STR_MSG_AUTO_ADD_TO_HISTORY);
                            return true;
                        }
                    }
                });
            });
        })
    }
};
