$(document).ready(function () {
    intercept.setCurrentLang(function () {
       intercept.load();
    });
    $(document).on("click", '#href-search', function (event) {
        analytics.track("Clicked Search Alert");
    });
    $("#number-result").click(function(){
        var keyWord = Utils.getParameterByName("keyword", document.location.href);
        var url = config.url() + '/app/web-journal?q=' + keyWord + '&page=1&intercept=1';
        var win = window.open(url, '_blank');
        win.focus();
    });
    $(document).on("click", "#close-mini, #btnCloseBox", function(event) {
        Utils.sendMessage({ action: "CLOSE_DIALOG", frameName: "intercept-search"});
    });
});

var intercept = {
      setCurrentLang : function(callback){
          var language = Cookie.get("lang-neeah");

          i18n.init({ lng: language, debug: true, resGetPath: config.getlocalesPath(), fallbackLng: false }, function (t) {
              window.STR_MSG_INTERCEPT_RESULT = t("STR_MSG_INTERCEPT_RESULT");
              window.STR_MSG_INTERCEPT_RESULT_MINI_TYPE = t("STR_MSG_INTERCEPT_RESULT_MINI_TYPE");
              if(typeof callback == "function"){
                  callback(callback);
              }
          });
      },

    load : function(){
        var typeSearch = Utils.getParameterByName("type", document.location.href);
        if(typeSearch == "mini"){
            $("#mini-search").show();
            $("#expand").hide();
            this.miniSearch();
        }else{
            $("#mini-search").hide();
            $("#expand").show();
            this.expandSearch();
        }
    },
    miniSearch : function(){
        var numberResult = parseInt(Utils.getParameterByName("numberResult", document.location.href));
        if(numberResult > 0){
            var result = window.STR_MSG_INTERCEPT_RESULT_MINI_TYPE.replace('{number}', numberResult);
            $("#number-result").html(result);
        }
    },

    expandSearch : function(){
        var getUrl = document.location.href;
        var keyWord = Utils.getParameterByName("key", getUrl);
        User.getAuthication(function () {
            Search.searchDocument(keyWord, 2, "all").then(function (resp) {

                var obj = resp.listResult;
                if (obj) {
                    var strHtml = '';
                    var n = 2;
                    if (obj.length <= 1) {
                        n = 1;
                    }
                    var numberOfResult = 0;
                    if (resp.numFound > 0) {
                        numberOfResult = eval(resp.numFound) - n;
                    }
                    var splitStr = keyWord.split(' ');

                    for (var i = 0; i < n; i++) {
                        var title = Utils.highlightText({
                            tag: 'strong',
                            words: splitStr,
                            text: obj[i].title
                        });
                        var content = Utils.highlightText({
                            tag: 'strong',
                            words: splitStr,
                            text: obj[i].textContent
                        });

                        strHtml += '<ul>';
                        strHtml += '    <li class="title">';
                        strHtml += '<a id="href-search" href="' + obj[i].url + '" target="_blank">' + title + '</a>';
                        strHtml += '   </li>';
                        strHtml += '   <li>';
                        strHtml += content;
                        strHtml += '   </li>';
                        strHtml += '</ul>';
                    }

                    if (numberOfResult > 0) {
                        var result = window.STR_MSG_INTERCEPT_RESULT.replace('{number}', numberOfResult);
                        var more = '<ul><li class="more-result">';
                        more += '<a href="' + config.url() + '/app/web-journal?q=' + keyWord + '&page=1&intercept=1" target="_blank"> ' + result + '</a>';
                        more += '   </li></ul>';
                        $("#moreSearch").html(more);
                    }
                    $(".box-intercept").html(strHtml);
                    $(".box-wrapper").show();
                }
            });
        });
    }
};
