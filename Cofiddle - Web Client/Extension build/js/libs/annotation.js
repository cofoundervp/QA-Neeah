var annotation = {
    get : function (url) {
        var obj = {
            uri: url
        };


        var defer = $.Deferred();

        api.get(connect.annotation, obj, function(resp, status){
            if(status.success) {
                defer.resolve(resp);
            } else {
                defer.reject();
            }
        });

        return defer.promise();
    }
};
