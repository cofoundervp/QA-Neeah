
var Search = {

    getNumFound : function(keyword){
        var data = {
            action    : 'getNumSearchResults',
            searchKey : keyword
        };
        var defer = $.Deferred();

        api.get(connect.search, data, function(resp, status){
            if(status.success) {
                defer.resolve(resp.numFound);
            } else {
                defer.reject();
            }
        });

        return defer.promise();
    },

    searchDocument: function (key, numPerPage, tag) {
        var data = {
            action: 'searchDocuments',
            searchKey: decodeURI(key),
            tag: tag,
            notrack: 1
        };

        var defer = $.Deferred();

        api.get(connect.search, data, function(resp, status){
            if(status.success) {
                defer.resolve(resp);
            } else {
                defer.reject();
            }
        });

        return defer.promise();
    }
};