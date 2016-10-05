var Tag = {

    addUrl :  function(tagName, url){
        var data = {
            action  : "attachedURLToTag",
            tagName : tagName,
            url     : url
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

    removePageTag : function(tagID, url){
        var data = {
            action  : 'removeURLFromTag',
            tagID   : tagID,
            URL     : url
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

    add : function(tagName){
        var data = {
            action: "addTag",
            tagName: tagName
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

    get : function(){
        var data = {
            action: "getSessionTags"
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
    /**
     * Remove tag but keep it in database
     */
    removeSessionTag : function(tagID){
        var data = {
            action: "safeRemoveTag",
            tagID: tagID
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

    getListTag : function () {
        var data = {
            action: "getTags"
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

    /**
     * Remove tag and don't need to keep tag
     */
    removeTag : function (tagID) {
        var data = {
            action: "forceRemoveTag",
            tagID: tagID
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
    }
};