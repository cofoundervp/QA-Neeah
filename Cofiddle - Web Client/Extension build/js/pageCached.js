chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {
    var request = msg.action;
    switch (request) {
    case "GET_NEW_CACHE":
        var data = getNewCache();
        sendResponse(data);
        break;
    }
});

function getNewCache() {
    var cacheHtml = getHtmlPage();

    var description = document.querySelector('meta[property="og:description"]') ?
                          document.querySelector('meta[property="og:description"]').content : "" ;

    if(!description) {
        description = document.querySelector('meta[name="description"]') ?
                      document.querySelector('meta[name="description"]').content : "";
    }

    var title = document.title;

    if(!title) {
        title = document.querySelector('meta[name="title"]') ?
                document.querySelector('meta[name="title"]').content : "";
    }

    var thumbImg = document.querySelector('meta[property="og:image"]') ?
                   document.querySelector('meta[property="og:image"]').content : "";

    if(!thumbImg){
        thumbImg = document.querySelector('meta[name="image"]') ?
                   document.querySelector('meta[name="image"]').content : "";
    }

    return {
        url: getLocation(),
        $html: cacheHtml.$html,
        content: cacheHtml.content,
        text: cacheHtml.text,
        encoding: cacheHtml.encoding,
        description: description,
        title: title,
        thumbImg: thumbImg
    };
}

function addNewCache(cb) {
    var cacheData = getNewCache();
    window.CACHE_DATA = Object.assign({}, cacheData);
    cacheData.action = 'ADD_CACHE';
    chrome.runtime.sendMessage(cacheData, function(resp) {
        if (resp && resp.id) {
            window.CACHE_ID = resp.id;
        }
        if (typeof cb == 'function') cb(resp);
    });
}

function updateCache(cb) {
    var cacheId = window.CACHE_ID;
    if (!cacheId) cb(false);

    var cacheHtml = getHtmlPage();
    window.CACHE_DATA = Object.assign(window.CACHE_DATA, cacheHtml);
    var action = {
        action: 'UPDATE_CACHE_PAGE',
        cacheId: cacheId,
        content: cacheHtml.content
    }
    chrome.runtime.sendMessage(action, cb);
}

function getHtmlPage(){
    var $html = $('html').clone(),
        removeElement, unwrapElement, removedAttr, removedClasses, escapeScript,
        // listUnwrapElement = [
        //      "cofiddle-highlight[class='annotator-hl-pink']",
        //      "cofiddle-highlight[class='annotator-hl-green']",
        //      "cofiddle-highlight[class='annotator-hl-blue']",
        //      "cofiddle-highlight[class='annotator-hl-yellow']"
        // ],
        listRemoveElement = [
              "style#annotator-dynamic-style",
              ".annotator-adder",
              ".annotator-notice",
              ".annotator-outer",
              "#neeahHdUrlExists",
              "#hdLastColor",
              "#hbchcjeppddbockfcdiejdpnimjbdcpm",
              "#annotate-show-popup",
              ".cofiddle-modal-hub",
              "#cofiddleHub",
              ".cofiddle-box-activity",
              ".cofiddle-modal"
        ],
        // listAttributeName = [
        //       "data-annotation",
        //       "data-annotation-id"
        // ],
        // listClassName = [
        //     "annotator-hl-pink",
        //     "annotator-hl-green",
        //     "annotator-hl-blue",
        //     "annotator-hl-yellow",
        //     "annotation-temporary",
        //     "annotator-wrapper"
        // ],
        removeElement = function($, selectors, $html){
            selectors.forEach(function(selector) {
                $html.find(selector).remove();
            });
            return $html;
        };

        unwrapElement = function($, selectors, $html){
            selectors.forEach(function(selector) {
                $html.find(selector).contents().unwrap();
            });
            return $html;
        };

        removedAttr = function(target, listAttr, $html) {
            listAttr.forEach(function(attrName) {
                $html.find(target).removeAttr(attrName);;
            });
            return $html;
        };
        removedClasses = function(target, listClassName, $html) {
            listClassName.forEach(function(className) {
                $html.find(target).removeClass(className);;
            });
            return $html;
        };
        removeStyleImg = function($html){
            $html.find("IMG").removeAttr("style");
            return $html;
        };
        escapeScript = function($html) {
            $html.find('script').each(function () {
                // dynamic loading script may have </script at the end, so need to replace it by <\/script
                var $this = $(this),
                    html = $this.html().replace(/<\/script/g, '<\\/script');
                $this.html(html);
            });
            return $html;
        }
    $html = removeAnnotations($html);
    $html = removeElement($, listRemoveElement, $html);
    // $html = unwrapElement($, listUnwrapElement, $html);
    // $html = removedClasses("IMG", listClassName, $html);
    // $html = removedAttr("IMG", listAttributeName, $html);
    $html = removeStyleImg($html);
    $html = escapeScript($html);
    // var html = $html.prop('outerHTML');

    return {
        $html: $html,
        content: $html.prop('outerHTML'),
        text: $html.find('body').prop('textContent'),
        encoding: document.charset.toLowerCase()
    }
};

function removeAnnotations($html) {
    var listAttributeName = [
            "data-annotation",
            "data-annotation-id"
        ],
        listClassName = [
            "annotator-hl-pink",
            "annotator-hl-green",
            "annotator-hl-blue",
            "annotator-hl-yellow",
            "annotation-temporary",
            "annotator-wrapper"
        ];

    var $img = $html.find('IMG');
    listAttributeName.forEach(function(attrName) {
        $img.removeAttr(attrName);;
    });
    listClassName.forEach(function(className) {
        $img.removeClass(className);;
    });
    $html.find("cofiddle-highlight").contents().unwrap();
    $html.find(".cofiddle-indicator-box").remove();

    return $html; // necessary?
}

function getLocation() {
    return window.location.protocol + '//' + window.location.host + window.location.pathname + window.location.search;
}

function diffContent(oldText, newText) {
    var diff = JsDiff.diffWords(oldText, newText).filter(function(change) {
        return change.removed;
    });
    var originalLength = oldText.length,
        removedLength = 0;
    diff.forEach(function(change) {
        removedLength += change.value.length;
    });
    // Return ratio between removed length and original length as indicator of whether content changes or not
    return removedLength / originalLength;
}
