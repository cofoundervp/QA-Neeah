$(document).ready(function () {
    $("#process").hide();
    invite.setCurrentLang(function () {
       ready.load();
    });
});

var ready = {
    load : function(){
        $("#txtEmailShare").on('keypress', function (e) {
            if (e.which == 13) {
                invite.highlightEmail();
            }
        });
        $("#btnShareURL").click(function () {
            invite.inviteUser();
        });
        $("#txtEmailShare").on('keydown', function (e) {
            if (e.which == 9) {
                invite.highlightEmail();
            }
        });
        $("#btnCancelShare").click(function () {
            $("#popUpDiv").remove();
            Utils.sendMessage({ action: "CLOSE_DIALOG", frameName: "divShare" });
            Utils.sendMessage({ action: "CLOSE_DIALOG", frameName: "divBlanket" });
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
            invite.highlightEmail();
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
            $("#tagsEmailShare .email-share:last-child").remove();
            invite.deleteEmailAutoComplete(email);
            return;
        });
        $(document).on("click", '.email-remove', function (event) {
            var count = $(".email-share").length;
            $(this).closest("label").remove();
        });
    }
};

var invite = {
    groupId : function(){
        var getUrl = document.location.href;
        return Utils.getParameterByName("groupID", getUrl);
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
            if(typeof callback == "function"){
                callback(callback);
            }
        });
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
            var listEmail = $(this).text();
            if (emailShare == listEmail) {
                $(".tagsEmailShare input").val("");
                isExist = true;
                return;
            }
        });
        if (!isExist) {

            if (!Utils.validateEmail(emailShare) && emailShare.indexOf("@") != -1) {
                var extractEmail = Utils.extractEmails(emailShare);
                emailShare = extractEmail[0];
            }
            else if(!Utils.validateEmail(emailShare))
            {
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

    inviteUser : function(){
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
                return null;
            }
            else {
                arrEmail.push(email);
                isValid = true;
            }
        });
        if (isValid) {
            var listGroupId = [this.groupId()];
            listGroupId = JSON.stringify(listGroupId);
            var mess = $("#message").val();
            var title = $("#url").val();
            $("#process").show();
            $('#dialog-blanket').show();
            Utils.sendMessage({
                action: "INVITE_USER",
                listEmailShare: JSON.stringify(arrEmail),
                listGroupId: listGroupId,
                messageShare: mess
            }, function (resp) {
                $("#process").hide();
                $('#dialog-blanket').hide();
            });
        }
    },
    deleteEmailAutoComplete : function (email) {
        User.getAuthication(function(){
            User.deleteEmailAutoComplete(email);
        });
    }

};
