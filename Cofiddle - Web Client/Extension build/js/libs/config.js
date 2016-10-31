
var config = new function () {
    this.url = function(){
        var globalUrl = "https://staging.neeah.cvp.io";
        return globalUrl;
    };

    this.getlocalesPath = function () {
        return "../_locales/__lng__/__ns__.json?version=2016.09.29";
    }
};

var getIDApp = new function (){
    this.googleClientID = function(){
        var id = "475827696052-bj6tnk2boh6cbprghoj2j3trg84tfqle.apps.googleusercontent.com";
        if(config.url() == "https://dev.neeah.cvp.io"){
            id = "815635573001-0rc4mcd3lirikkbtb96svrnj5l9dse6a.apps.googleusercontent.com";
        }else if(config.url() == "https://staging.neeah.cvp.io"){
            id = "815635573001-0rc4mcd3lirikkbtb96svrnj5l9dse6a.apps.googleusercontent.com";
        }
        return id;
    };
    this.facebook = function(){
        //default key production
        var id = "228776607501603";
        if(config.url() == "https://dev.neeah.cvp.io"){
            id = "1578635392400252";
        }else if(config.url() == "https://staging.neeah.cvp.io"){
            id = "852500544804041";
        }
        return id;
    };
    this.segment = function(){
        //default key production
        var id = "rCR4RqOrBXL5lHNowDK42ko1yHhSp1vQ";
        if(config.url() == "https://dev.neeah.cvp.io"){
            id = "VY3TmS2S1xHJVj2yHugWXb76M8f2a9Hk";
        }else if(config.url() == "https://staging.neeah.cvp.io"){
            id = "7otVdRvvNv6GiBVC4uYH73WXagd4jKDG";
        }
        return id;
    }

};
var ignore = new function(){
    this.url = ["chrome-extension",
                "neeah", "facebook.com", "github.com","login.yahoo", "mail.yahoo", "cofiddle.com",
                "twitter.com", "chrome-devtools","localhost", "outlook.office.com",
                "google.com", "trello.com", "jsoneditoronline.org","cofoundervp-my.sharepoint.com",
                "semantic-ui.com", "jira.cvp.io","annotatorjs.org", "linkedin.com",
                "search.yahoo.com", "baidu.com", "bing.com", "ask.com", "search.aol.com",
                "yandex.com", "login.skype.com", "web.skype.com"];
};
var listSearch = new function(){
    this.url = ["google.com", "search.yahoo.com", "baidu.com", "bing.com", "ask.com", "search.aol.com",
                "yandex.com"];
}
var connect = new function() {
    var url = config.url();

    this.user = url + "/api/user.php" ;

    this.document = url + "/api/document.php" ;

    this.tag = url + "/api/tag.php" ;

    this.cache = url + "/api/cache.php" ;

    this.annotation = url + "/api/annotations.php" ;

    this.note = url + "/api/pageNote.php" ;

    this.search = url + "/api/search.php" ;

    this.blacklist =  url + "/api/blackListUser.php" ;

    this.comment = url + "/api/comment.php" ;

    this.profile = url + "/api/profile.php" ;

    this.discussion = url + "/api/discussion.php" ;

    this.subscription = url + "/api/subscription.php" ;
};
var shareVia = new function() {
    this.facebook = 1;
    this.twitter = 2;
    this.clipboard = 3;
    this.email = 4;

}
var limitCharater = new function () {
  this.tag = 30;
};
