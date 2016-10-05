var BlackList = {
     get : function () {
         var data =  {
             action: "getBlackList",
             pageNumber: -1,
             option: "all"
         };
         var defer = $.Deferred();

         api.post(connect.blacklist, data, function(resp, status){
             if(status.success) {
                 defer.resolve(resp);
             } else {
                 defer.reject();
             }
         });

         return defer.promise();
     },

    check : function (url) {
        if (url.indexOf(config.url()) != -1) {
            return false;
        }
        var data    =  {
                action: "isBlackListedUrl",
                url: url
            };
        var defer = $.Deferred();

        api.post(connect.blacklist, data, function(resp, status){
            if(status.success && resp.success) {
                var isBlackList =  resp.isBlackList == "1" ? true : false;
                defer.resolve(isBlackList);
            } else {
                defer.reject();
            }
        });

        return defer.promise();
    },
    add : function(domain, path, apply){
        var obj = {
            action: "addBlackList",
            domain: domain
        };
        if(path){
             obj.path = path;
        }
        if(apply){
            obj.apply = apply;
        }
        var defer = $.Deferred();

        api.post(connect.blacklist, obj, function(resp, status){
            if(status.success && resp.success) {
                defer.resolve(resp);
            } else {
                defer.reject(resp);
            }
        });

        return defer.promise();
    },
    remove : function(url){
        var obj = {
            action: "deleteBlackList",
            url: url
        };

        var defer = $.Deferred();

        api.post(connect.blacklist, obj, function(resp, status){
            if(status.success && resp.success) {
                defer.resolve(resp);
            } else {
                defer.reject(resp);
            }
        });

        return defer.promise();
    },
    removeUrlBlacklist : function(domain, path){
        var obj = {
            action: "applyBlackListUser",
            domain: domain
        };
        if(path){
            obj.path = path;
        }
        var defer = $.Deferred();

        api.post(connect.blacklist, obj, function(resp, status){
            if(status.success && resp.success) {
                defer.resolve(resp);
            } else {
                defer.reject(resp);
            }
        });

        return defer.promise();
    }
};
