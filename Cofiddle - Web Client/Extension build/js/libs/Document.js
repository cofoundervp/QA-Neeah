var Document = {
    // All Chrome browsers support Array.map but others might not
    // Check compatibility if this Object gets ported to another browser
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map#Browser_compatibility
    add : function(listUrl, save){
        if(!Array.isArray(listUrl)){
            return "";
        }

        var obj = {
            "browser" : 1,
            "history" : listUrl.map(function(url){
                return {url: url};
            })
        };

        if(save){
            obj.saved = save;
        }

        var data = {
            "action" : "addDocuments",
            "data"   : JSON.stringify(obj)
        };


        var defer = $.Deferred();

        api.post(connect.document, data, function(resp, status){
            if(status.success) {
                defer.resolve(resp);
            } else {
                defer.reject();
            }
        });

        return defer.promise();
    },

    addAndShare : function(shareType, urls, emails, message, type ){
        //shareType: email | share | facebook
        var obj = {
            "browser" : 1,
            "history"   : [urls]
        };

        if(message){
            obj.message =  message;
        }

        if(emails){
            obj.listShare = emails;
        }

        var data = {
            "action" : shareType,
            "data"   : JSON.stringify(obj),
            "sharedVia": type
        };

        var defer = $.Deferred();

        api.post(connect.document, data, function(resp, status){
            if(status.success) {
                defer.resolve(resp);
            } else {
                defer.reject();
            }
        });

        return defer.promise();
    },

    getPageTag : function(url, cb){
        var data = {
            action: 'getURLTag',
            url: url
        };
        var defer = $.Deferred();

        api.post(connect.document, data, function(resp, status){
            if(status.success) {
                defer.resolve(resp);
            } else {
                defer.reject();
            }
        });
        return defer.promise();
    },

    addNote : function (url, comment){
        var data = {
                "action"  : "updateDocumentPageNote",
                "url"     : url,
                "comment" : comment
            };

        var defer = $.Deferred();

        api.post(connect.note, data, function(resp, status){
            if(status.success) {
                defer.resolve(resp);
            } else {
                defer.reject();
            }
        });

        return defer.promise();
    },

    getPageNote : function (url) {
        var data = {
            "action" : "getDocumentPageNote",
            "url"    : url
        };

        var defer = $.Deferred();
        api.post(connect.note, data, function(resp, status){
            if(status.success) {
                defer.resolve(resp);
            } else {
                defer.reject();
            }
        });

        return defer.promise();

    },

    updateTag : function(tagName, url){
        var data = {
            "action": "attachedURLToTag",
            "tagName": tagName,
            "url": url
        };

        var defer = $.Deferred();

        api.post(connect.document, data, function(resp, status){
            if(status.success) {
                defer.resolve(resp);
            } else {
                defer.reject();
            }
        });

        return defer.promise();
    },

    isUrlExist : function(url){
        var data = {
            action: "isURLExists",
            url: url
        };

        var defer = $.Deferred();

        api.post(connect.document, data, function(resp, status){
            if(status.success) {
                defer.resolve(resp);
            } else {
                defer.reject();
            }
        });

        return defer.promise();
    },

    checkCache: function(url){
        var obj = {
            action: "restful",
            uri: url
        }

        var defer = $.Deferred();

        api.get(connect.document, obj, function(resp, status){
            if(status.success) {
                defer.resolve(resp);
            } else {
                defer.reject();
            }
        });

        return defer.promise();
    },
    remove : function(listUrl, isAll){
        var obj = {
            action: 'removeDocuments'
        };
        if(isAll){
            obj.data = "[]";
            obj.option = "all";
        }else{
            obj.data = listUrl;
        }
        var defer = $.Deferred();

        api.post(connect.document, obj, function(resp, status){
            if(status.success) {
                defer.resolve(resp);
            } else {
                defer.reject();
            }
        });

        return defer.promise();
    },
    getActivityStream: function(url, limit, page){
        var obj = {
            action: "getActivityStream",
            url: url
        }
        limit = arguments[1] != "undefined" ?  arguments[1] : 20;
        page = arguments[2] != "undefined" ?  arguments[2] : 1;

        obj.limit = limit;
        obj.page = page;

        var defer = $.Deferred();

        api.post(connect.document, obj, function(resp, status){
            if(status.success) {
                defer.resolve(resp);
            } else {
                defer.reject();
            }
        });

        return defer.promise();
    }
};
