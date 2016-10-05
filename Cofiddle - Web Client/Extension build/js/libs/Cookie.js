var Cookie = {

    get : function(cname){
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1);
            if (c.indexOf(name) != -1) return c.substring(name.length, c.length);
        }
        return "";
    },

    set : function(cname, cvalue, exdays, path){
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toGMTString();
        if (path == "1"){
            document.cookie = cname + "=" + cvalue + "; " + expires + ";domain=" + config.url() + ";path=/";
        }
        document.cookie = cname + "=" + cvalue + "; " + expires;
    },

    //remove cookie from local
    remove : function(urlBase, name){
        chrome.cookies.remove({url: urlBase, name: name});
    },

    delete : function(cname){
        document.cookie = cname + "=''";
    },

    removeAll : function(){
        var c = document.cookie.split("; ");
        for (var i in c) {
            if(c.hasOwnProperty(i)){
                if (c[i].indexOf("lang-neeah") != -1) {
                    continue;
                }
                document.cookie = /^[^=]+/.exec(c[i])[0] + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
            }
        }
    },

    getFromDomain : function (domain, name, cb) {
        try {
            chrome.cookies.get({"url": domain, "name": name}, function (cookie) {
                if (cb && typeof cb === "function") {
                    cb(cookie ? cookie.value : null);
                }
            });
        } catch(ex) {
           // console.warn(ex);
            return null; // ECMA 4.3.12 - primitive value that represents the intentional absence of any object value
        }
    },

    setFromDomain : function (domain, name, value, exdays, cb) {
        var expires = (new Date().getTime() / 1000) + (exdays * 24 * 60 * 60 * 1000);
        chrome.cookies.set({
            "url": domain,
            "name": name,
            value: value,
            path: "/",
            expirationDate: expires
        }, function (cookie) {
            if ((cb && typeof cb === "function")) {
                cb(cookie ? cookie.value : null);
            }
        });
    },

    //remove all cookie from url
    removeAllFromDomain : function (url) {
        chrome.cookies.getAll({ url: url }, function (cookie) {
            for (var i = 0; i < cookie.length; i++) {
                if (cookie[i].name == "lang-neeah") {
                    continue;
                }
                chrome.cookies.remove({ url: url + cookie[i].path, name: cookie[i].name });
            }
        });
    },

    removeEntire : function(){
        this.removeAll();
        this.removeAllFromDomain(config.url());
    }
};
