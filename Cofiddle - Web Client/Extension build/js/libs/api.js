var api = {
    /**
     * Makes a HTTP Get Request
     * @param {String} url  - URL that the request is being made to
     * @param {Object} data - query params
     * @param {object} args - (optional) arguments to pass to the request
     * @param {object} cb   - Callback
     * @return {object | array} JSON Responce
     *
     * If you leave args out when you call api.get it will assume the param in it's place is the callback
     */
    get : function (url, data, args, cb) {
        if(args && typeof args === "function"){
            cb = args;
            args = null;
        }
        this.request('GET', url, data, args, cb);
    },
    /**
     * Makes a HTTP POST Request
     * @param {String} url  - URL that the request is being made to
     * @param {Object} data - query params
     * @param {object} args - (optional) arguments to pass to the request
     * @param {object} cb   - Callback
     * @return {object | array} JSON Responce
     *
     * If you leave args out when you call api.post it will assume the param in it's place is the callback
     */
    post : function (url, data, args, cb) {
        if(args && typeof args === "function"){
            cb = args;
            args = null;
        }
        this.request('POST', url, data, args, cb);
    },

    /**
     * Makes a HTTP Get Request
     * @param {String} url  - URL that the request is being made to
     * @param {Object} data - query params
     * @param {object} args - (optional) arguments to pass to the request
     * @param {object} cb   - Callback
     * @return {object | array} JSON Responce
     *
     * If you leave args out when you call api.put it will assume the param in it's place is the callback
     */
    put : function(url, data, args, cb){
        if(args && typeof args === "function"){
            cb = args;
            args = null;
        }
        this.request('PUT', url, data, args, cb);
    },

    /**
     * Makes a HTTP Get Request
     * @param {String} url  - URL that the request is being made to
     * @param {Object} data - query params
     * @param {object} args - (optional) arguments to pass to the request
     * @param {object} cb   - Callback
     * @return {object | array} JSON Responce
     *
     * If you leave args out when you call api.delete it will assume the param in it's place is the callback
     */
    delete : function(url, data, args, cb){
        if(args && typeof args === "function"){
            cb = args;
            args = null;
        }
        this.request('DELETE', url, data, args, cb);
    },

    /**
     * Makes a HTTP Request
     * @param {String} type - determines what kind of request to make, if empty it will make a Get Request
     * @param {String} url  - URL that the request is being made to
     * @param {Object} data - query params
     * @param {object} args - (optional) arguments to pass to the request
     * @param {object} cb   - Callback
     * @return {object | array} JSON Responce
     */
    request : function(type, url, data, args, cb){
        type = type || "GET";
        var options = {
                type : type,
                url : url,
                data: data
                // async : false
            };

        if(args) {
            for (var key in args) {
                if (args.hasOwnProperty(key)) {
                    options[key] = args[key];
                }
            }
        }
        options.success = function (res) {
            if (cb && typeof cb === "function") {
               if(typeof res != "object"){
                  res = JSON.parse(res);
               }
               return cb(res, {
                    "success": true
                }, null);
            }
        };

        options.error = function (xhr, errorType, exception) {
            cb(null, {
                "error": true
            }, exception || xhr.statusText);
        };
        $.ajax(options);
    },

    updateAuth : function(jwt){
        $.ajaxSetup({
            headers: { 'Authorization': 'Bearer '+ jwt}
        });
    }
};
