var Cache = {
    add : function (url, html, description, title, thumbImg, hidden) {
        var obj = {
            uri : url,
            data : html
        };
        if(hidden){
            obj.hidden = hidden;
        }
        if(description) obj.description = description;
        if(title) obj.title = title;
        if(thumbImg) obj.thumbImg = thumbImg;

        var defer = $.Deferred();

        api.post(connect.cache, JSON.stringify(obj), function(resp, status){
            if(status.success) {
                defer.resolve(resp);
            } else {
                defer.reject();
            }
        });

        return defer.promise();
    },
    getLast: function(url, discussionID){
        var obj = {
            uri: url,
            getlist: false
        }

        if(discussionID) obj.discussion_id = discussionID;
        var defer = $.Deferred();

        api.get(connect.cache, obj, function(resp, status){
            if(status.success) {
                defer.resolve(resp);
            } else {
                defer.reject();
            }
        });

        return defer.promise();
    },
    getList: function(url, discussionID){
        var obj = {
            uri: url,
            getlist: true
        }

        if(discussionID) obj.discussion_id = discussionID;
        var defer = $.Deferred();

        api.get(connect.cache, obj, function(resp, status){
            if(status.success) {
                defer.resolve(resp);
            } else {
                defer.reject();
            }
        });

        return defer.promise();
    },
    update: function(id, html){
        var obj = {
            id: id,
            data: html
        }

        var defer = $.Deferred();

        api.put(connect.cache, JSON.stringify(obj), {"dataType": "json", "contentType":"application/json; charset=UTF-8"}, function(resp, status){
            if(status.success) {
                defer.resolve(resp);
            } else {
                defer.reject();
            }
        });

        return defer.promise();
    }
};
