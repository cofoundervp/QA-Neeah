var comment = {
    addComment : function (groupID, message, ownerID) {
        var data = {
            action  : "addComment",
            groupID : groupID,
            content : message
        };
        if(ownerID) data.ownerID = ownerID;

        var defer = $.Deferred();

        api.post(connect.comment, data, function(resp, status){
            if(status.success) {
                defer.resolve(resp);
            } else {
                defer.reject();
            }
        });

        return defer.promise();
    },

    getComment : function(pageNumber, groupID){
        var data = {
            action      : "getComments",
            pageNumber  : pageNumber,
            groupID     : groupID
        };

        var defer = $.Deferred();

        api.post(connect.comment, data, function(resp, status){
            if(status.success) {
                defer.resolve(resp);
            } else {
                defer.reject();
            }
        });

        return defer.promise();
    },

    getGroupMember : function(groupID){
        var data = {
            action: "getGroupMember",
            groupID: groupID
        };

        var defer = $.Deferred();

        api.post(connect.comment, data, function(resp, status){
            if(status.success) {
                defer.resolve(resp);
            } else {
                defer.reject();
            }
        });

        return defer.promise();
    },

    getReplies : function(idCmt, replyComment, groupID, limit, pageNumber, offset){
        var data = {
            action      : "getReplies",
            commentID   : idCmt,
            replyComment: replyComment,
            groupID     : groupID,
            recursive   : 1,
            limit: limit
        };
        if(pageNumber) data.pageNumber = pageNumber;
        if(offset != null) data.offset = offset;
        var defer = $.Deferred();

        api.post(connect.comment, data, function(resp, status){
            if(status.success) {
                defer.resolve(resp);
            } else {
                defer.reject();
            }
        });

        return defer.promise();
    },

    getNumberUnread : function(arrayID){
        var data = {
            action  : "getNumberUnreadComment",
            groupID : arrayID
        };

        var defer = $.Deferred();

        api.post(connect.comment, data, function(resp, status){
            if(status.success) {
                defer.resolve(resp);
            } else {
                defer.reject();
            }
        });

        return defer.promise();
    },

    inviteUser : function(arrGroupID, arrEmail, message){
        var data = {
            action      : "inviteUser",
            groupID     : arrGroupID,
            listInvite  : arrEmail,
            message     : message
        };

        var defer = $.Deferred();

        api.post(connect.comment, data, function(resp, status){
            if(status.success) {
                defer.resolve(resp);
            } else {
                defer.reject();
            }
        });

        return defer.promise();
    },

    doesDiscussionExist : function(url, isGetComment){
        var data = {
            action      : 'isDiscussionExist',
            url         : url,
            getComment  : isGetComment
        };

        var defer = $.Deferred();

        api.post(connect.comment, data, function(resp, status){
            if(status.success) {
                defer.resolve(resp);
            } else {
                defer.reject();
            }
        });

        return defer.promise();
    },

    addDiscussion: function(listUrl, listEmail, message, shareVia, includeMarkup){
        var obj = {
            action: "addDiscussion",
            data: listUrl,
            public: shareVia == "email" ? 0 : 1,
            includeMarkup: 1
        };
        if(shareVia) obj.sharedVia = shareVia;
        if(message) obj.message = message;
        if(listEmail) obj.emails = listEmail;
        var defer = $.Deferred();

        api.post(connect.comment, obj, function(resp, status){
            if(status.success) {
                defer.resolve(resp);
            } else {
                defer.reject();
            }
        });

        return defer.promise();
    },
    delete : function(commentID, groupID){
        var data = {
                action: "deleteComment",
                commentID: commentID,
                groupID: groupID
        };

        var defer = $.Deferred();

        api.post(connect.comment, data, function(resp, status){
            if(status.success) {
                defer.resolve(resp);
            } else {
                defer.reject();
            }
        });

        return defer.promise();
    },
    get : function(pageNumber, groupID, getReply){
        var data = {
            action      : "getComments",
            pageNumber  : pageNumber,
            groupID     : groupID,
            limit: 11
        };
        if(typeof getReply != "undefined"){
            data.getReply = 1;
        }
        var defer = $.Deferred();

        api.post(connect.comment, data, function(resp, status){
            if(status.success) {
                defer.resolve(resp);
            } else {
                defer.reject();
            }
        });

        return defer.promise();
    },
    getListDiscussion : function(url, offset){
        var data = {
            uri: url,
            offset: offset,
            limit: 10
        };
        if(typeof getReply != "undefined"){
            data.getReply = 1;
        }
        var defer = $.Deferred();

        api.get(connect.discussion, data, function(resp, status){
            if(status.success) {
                defer.resolve(resp);
            } else {
                defer.reject();
            }
        });

        return defer.promise();
    },
    addReply : function(groupID, commentID, message){
        var data = {
            action  : "addReply",
            groupID : groupID,
            commentID: commentID,
            content : message
        };

        var defer = $.Deferred();

        api.post(connect.comment, data, function(resp, status){
            if(status.success) {
                defer.resolve(resp);
            } else {
                defer.reject();
            }
        });

        return defer.promise();
    }
};
