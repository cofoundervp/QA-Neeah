var User = {

    addEmailAutoComplete : function(email){
        var data = {
            action: 'addEmailAutoComplete',
            email: email
        };

        var defer = $.Deferred();

        api.post(connect.tag, data, function(resp, status){
            if(status.success) {
                defer.resolve(resp);
            } else {
                defer.reject();
            }
        });

        return defer.promise();
    },

    deleteEmailAutoComplete : function(email){
        var data = {
            action: 'deleteEmailAutoComplete',
            email: email
        };

        var defer = $.Deferred();

        api.post(connect.tag, data, function(resp, status){
            if(status.success) {
                defer.resolve(resp);
            } else {
                defer.reject();
            }
        });

        return defer.promise();
    },

    getEmailAutoComplete : function(email){
        var data = {
            action: 'getEmailAutoComplete',
            email: email
        };

        var defer = $.Deferred();

        api.post(connect.tag, data, function(resp, status){
            if(status.success) {
                defer.resolve(resp);
            } else {
                defer.reject();
            }
        });

        return defer.promise();
    },

    isUserActive : function () {
        var data = {
            action: 'isUserActived'
        };

        var defer = $.Deferred();

        api.post(connect.user, data, function(resp, status){
            if(status.success) {
                defer.resolve(resp);
            } else {
                defer.reject();
            }
        });

        return defer.promise();
    },

    updateTourStep : function(web, annotation, searchAlert, exclusion, recipient){
        var data = {
            action: 'updateTourStep',
        };
        if(web) data.step = web;
        var extension = {}
        if(annotation)  extension.annotation = annotation;
        if(searchAlert) extension.searchAlert = searchAlert;
        if(exclusion)   extension.exclusion = exclusion;
        if(extension){
            data.extension = extension;
        }
        if(recipient)   data.recipient = recipient;
        var defer = $.Deferred();

        api.post(connect.user, data, function (resp, status) {
            if(status.success) {
                defer.resolve(resp);
            } else {
                defer.reject();
            }
        });
        return defer.promise();
    },

    getUserInfo : function(key){
        var data = {
            action: 'getUserInfo'
        };
        var defer = $.Deferred();

        api.post(connect.user, data, function(resp, status){
            if(status.success && resp.success){
                if(typeof key !== "undefined"){
                    defer.resolve(resp.data[key]);
                } else {
                    defer.resolve(resp);
                }
            }
        });

        return defer.promise();
    },

    getCurrentLang : function(){
          var lang = "en-US";
          this.getUserInfo().then(function(resp){
              var obj = resp.data;
              if(obj){
                  lang = obj.lang;
              } else {
                  lang = navigator.language;

                  if (lang == "zh-TW" || lang == "zh-tw") {
                      lang = "zh_t";
                  }
                  if (lang == "zh-CN" || lang == "zh-cn") {
                      lang = "zh_s";
                  }
              }
         });
        return lang;
    },

    saveLangToCookie : function(){
        var lang = this.getCurrentLang();
        Cookie.setFromDomain(config.url(), "lang-neeah", lang, 30);
    },

    resentEmail : function(email){
        var data = {
            action: 'reSendEmail',
            email: email
        };
        var defer = $.Deferred();

        api.post(connect.user, data, function(resp, status){
            if(status.success) {
                defer.resolve(resp);
            } else {
                defer.reject();
            }
        });

        return defer.promise();
    },

    logout : function(){
        var data = {
            action: 'logoutUser'
        };

        var defer = $.Deferred();

        api.post(connect.user, data, function(resp, status){
            if(status.success) {
                defer.resolve(resp);
            } else {
                defer.reject();
            }
        });

        return defer.promise();
    },

    getAuthication : function(cb){
        chrome.storage.local.get("JWT", function (obj) {
            var jwt = obj.JWT;
            if(jwt){
                api.updateAuth(jwt);
                if(cb && typeof cb == "function"){
                    cb({"JWT": jwt});
                }
            }else {
                cb({"error": "0"});
            }
        });
    },

    getLastUnread : function(){
        var data = {
            action: 'getLastUnread'
        };

        var defer = $.Deferred();

        api.post(connect.user, data, function(resp, status){
            if(status.success) {
                defer.resolve(resp);
            } else {
                defer.reject();
            }
        });

        return defer.promise();
    },

    readMessage : function(id){
        var data = {
            action: 'readAMessage',
            messageID: id
        };
        var defer = $.Deferred();

        api.post(connect.user, data, function(resp, status){
            if(status.success) {
                defer.resolve(resp);
            } else {
                defer.reject();
            }
        });

        return defer.promise();
    },
    updateAutoWebJournal : function(autoJournal, autoCache){

        var data = {
            action: "updateProfile",
            autoJournal: autoJournal ? 1 : 0
        }
        if(autoCache !== undefined){
            data.autoCache = autoCache ? 1 : 0;
        }
        var defer = $.Deferred();

        api.post(connect.profile, data, function(resp, status){
            if(status.success) {
                defer.resolve(resp);
            } else {
                defer.reject();
            }
        });

        return defer.promise();
    },
    getPlan : function(){
        var defer = $.Deferred();

        api.get(connect.subscription, null ,{"dataType": "json", "contentType":"application/json; charset=UTF-8"}, function(resp, status){
            if(status.success) {
                defer.resolve(resp);
            } else {
                defer.reject();
            }
        });

        return defer.promise();
    }
};
