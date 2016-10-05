jQuery(function ($) {
    initAnnotator();
    $(window).on("resize", function(){
        $(".cofiddle-indicator-box").each(function(){
            var annotationId = $(this).attr("id"),
                $img = $('IMG[data-annotation-id="'+annotationId+'"]');
            var top = $img.offset().top + $img.outerHeight(),
                left = $img.offset().left + $img.width(),
                css = {
                        position: "absolute",
                        top: top - 30,
                        left: left - 30
                   };
            $(this).css(css);
        });
    });
});
function initAnnotator (){
    var url = window.location.href;
    var a = $('<a>', { href:url } )[0],
        hostname = a.hostname;
    if (hostname.indexOf("neeah") != -1) {
        return ;
    }
    chrome.storage.local.get("JWT", function (obj) {
        var jwt = obj.JWT,
            discussionId = $("#discussionId").val(),
            obj = {
                uri: window.location.href
            };
        if(discussionId){
            obj.discussion_id = discussionId;
        }
        if(jwt){
            $.ajaxSetup({
                headers: { 'Authorization': 'Bearer '+jwt}
            });
            chrome.runtime.sendMessage({action: "GET_CURRENT_API"}, function(response) {
                $('body').annotator().annotator('addPlugin', 'Store', {
                  prefix: response.api +"/api",
                  urls: {
                      create:  '/annotations',
                      update:  '/annotations?id=:id',
                      destroy: '/annotations?id=:id',
                    //   read:    '/annotations?'+$.param(obj) ,
                      search:  '/annotations?id=:id'
                  }
                })
                .annotator('subscribe', 'beforeAnnotationCreated', function(annotation) {
                    console.log('saving annotation with url', window.registeredUrl);
                    annotation.uri = window.registeredUrl;
                    // console.log(Annotator.Util.nodeFromXPath('/div[2]', $('body')[0]));
                })
                .annotator('addPlugin', 'PermissionsShared');
            });
        }
    });
}
Annotator.prototype.checkXpathAnnotation = function(annotation, forced, cb){
    console.log(annotation);
    var xpath = annotation.ranges[0].start,
        $body = window.CACHE_DATA.$html.find('body')[0],
        $el = Annotator.Util.nodeFromXPath(xpath, $body);
    if(!$el || forced){
        updateCache(cb);
    }else{
        if(annotation.haveImage){
            var src = $el.currentSrc,
                newSrc = $(annotation.highlights)[0].currentSrc;
            if(src != newSrc){
                updateCache(cb);
            }else{
                if(cb && typeof cb == "function"){
                    cb(true);
                }
            }
        }else{
            if(cb && typeof cb == "function"){
                cb(true);
            }
        }
    }
}
Annotator.prototype.onSelectPreviewColor = function(event){
    var target = $(event.target),
        classColor = target.attr("data-class"),
        item = $("cofiddle-highlight[data-view=annotations-color]");
    if($("IMG[data-annotation=image-annotation]").length > 0){
        item = $("IMG[data-annotation=image-annotation]");
        annotation = item.data("annotation");
        var color = this.convertClassToRGB(classColor);
        item.css("border", "3px solid " + color);
    }else{
        annotation = item.data("annotation");
        $("cofiddle-highlight[data-annotation-id='"+annotation.id+"']").removeAttr("style").removeAttr("class").addClass(classColor);
    }
};
Annotator.prototype.onRemovePreviewColor = function(event){
    var item = $("cofiddle-highlight[data-view=annotations-color]"),
        cssClass, annotation = item.data("annotation");
    if(item.length > 0 && typeof annotation == "object"){
        cssClass = this.convertColorToClass(item.data("annotation").color);
        $("cofiddle-highlight[data-annotation-id='"+annotation.id+"']").removeAttr("class").addClass(cssClass);

    }else{
        $("IMG[data-annotation='image-annotation']").removeAttr("style");
    }
};
//highlight text
Annotator.prototype.onAdderHighLightClick = function(event){
    var annotation, position, _this = this,
        haveImage = $("IMG[data-annotation=image-annotation]").length > 0 ? true : false;
    _this.ignoreMouseup = false;
    if($(".cofiddle-modal[data-step='3']").length > 0){
        return;
    }
    if (event != null ) {
        event.preventDefault()
    }
    _this.adder.hide();
    // if(window.EXCEED_LIMIT){
    //     Annotator.showNotification("Your current content storage usage exceeds the storage capacity of your plan. Please upgrade immediately to avoid losing data.", Annotator.Notification.ERROR);
    // }
    position = _this.adder.position();
    var cssClass = _this.getLastColor();

    if(haveImage){
        var currentImage = $("IMG[data-annotation=image-annotation]");
        currentImage.addClass(cssClass);
        annotation = _this.setupAnnotation(_this.createAnnotation(), cssClass.toString());
        setTimeout(function(){
            annotation = _this.publish("annotationCreated", [annotation]);
        }, 500);
    }else{
        annotation = _this.setupAnnotation(_this.createAnnotation(), cssClass.toString());
        _this.publish("annotationCreated", [annotation]);
    }
    if(_this.adderHideTimer > 0){
        clearTimeout(_this.adderHideTimer);
    }
    return _this.removeSelect();

};
Annotator.prototype.onDeleleteHighLightClick = function(event){
    var item, annotation;
    if($("IMG[data-annotation=image-annotation]").length > 0){
        item = $("IMG[data-annotation=image-annotation]");

    }else{
        item = $("cofiddle-highlight[data-view=annotations-color]");
    }
    annotation = item.data("annotation");
    this.publish("annotationDeleted", [annotation]);
    if($("IMG[data-annotation=image-annotation]").length > 0){
        if($(item.prev().hasClass("cofiddle-indicator-box"))){
            $(item.prev(".cofiddle-indicator-box")).remove();
        }
    }else{
        if($(item.next().hasClass("cofiddle-indicator-box"))){
            var currentTarget = $("cofiddle-highlight[data-annotation-id='"+annotation.id+"']");
            currentTarget.last().next(".cofiddle-indicator-box").remove();
            currentTarget.contents().unwrap();
        }
    }
    var cssClass = this.convertColorToClass(annotation.color);
    this.adder.hide();
    $("#"+annotation.id).remove();
    item.removeAttr("data-annotation-id");
    item.removeClass(cssClass);
    item.removeData("annotation");
};
Annotator.prototype.onCopyClipboard = function(){
    document.execCommand('copy');
    this.adder.hide();
    $("#cofiddle-note").html("Copied to clipboard ");
    $("#cofiddle-note").slideToggle(500);
    setTimeout(function(){
         $("#cofiddle-note").slideUp("slow");
    }, 5000);
     this.ignoreMouseup = false;
};
Annotator.prototype.onHoverColor = function(event){
    var $listColor = $(".annotator-list-color");
    $listColor.show();
}
Annotator.prototype.removeListColor = function(event){
    var $listColor = $(".annotator-list-color");
    $listColor.hide();
}
Annotator.prototype.checkObjectAnnotator = function(annotator, key){
    if(typeof annotator[key] != "undefined"){
        return  annotator[key] != "" ? true : false;
    }
    return false;
}
//Choice color
Annotator.prototype.onSelectDefaultColor = function(event){
    if (event != null ) {
        event.preventDefault();
    }
    isMouseSelect = true;
    var annotations = null,
        _this = this,
        className = $(event.target).attr("data-class"),
        item = $("cofiddle-highlight[data-view=annotations-color]"),
        $currentTarget = $(event.target);
    var updateColor = function($element, color){
        $element.each(function(){
            var $el = $(this);
            if(typeof $el.data("annotation") == "object" && !jQuery.isEmptyObject($el.data("annotation"))){
                if ($el.prop('tagName') == 'IMG') {
                    if($el.length > 0 && !jQuery.isEmptyObject($el.data("annotation"))){
                        var currentClass = $el.attr("class"),
                            classArr = currentClass.split(' '),
                            classOld = "";
                        for (var i = 0; i < classArr.length; i++) {
                            if (classArr[i].indexOf("annotator") != "-1") {
                                classOld = classArr[i];
                                break;
                            }
                        }
                        $el.removeClass(classOld).addClass(className);
                    }
                }else{
                    $el.removeAttr("class").addClass(className);
                }
                $el.data("annotation").color = color;
            }
        });
    };
    chrome.runtime.sendMessage({action: "SAVE_COLOR_HIGHLIGHT", className: className}, function(){
        var haveImage = $("IMG[data-annotation=image-annotation]").length > 0 ? true : false;

        $(".cofiddle-action-color i").removeClass("active");
        $currentTarget.addClass("active");
        $("#hdLastColor").val(className);
        if(haveImage){
            item = $("IMG[data-annotation=image-annotation]");
            var currentClass = item.attr("class"),
                classArr = currentClass.split(' '),
                classOld = "";
            for(var i = 0; i < classArr.length; i++){
                if(classArr[i].indexOf("annotator") != "-1"){
                    classOld = classArr[i];
                    break;
                }
            }
            item.removeClass(classOld).addClass(className);
            annotation = item.data("annotation");
        }else{
            annotation = item.data("annotation");
            $("cofiddle-highlight[data-annotation-id='"+annotation.id+"']").removeAttr("class").addClass(className);
            //apply to all current markups
            // $("cofiddle-highlight").each(function(){
            //     $(this).removeAttr("class").addClass(className);
            // });
        }
        if(typeof annotation.id != "undefined"){
            if(className == "annotator-hl-blue")   annotation.color = "(102,255,255, 0.5)";
            if(className == "annotator-hl-green")  annotation.color = "(102,255,102, 0.5)";
            if(className == "annotator-hl-pink")   annotation.color = "(255,153,255, 0.5)";
            if(className == "annotator-hl-yellow")   annotation.color = "(255, 255, 10, 0.5)";
            var color = annotation.color;
            updateColor($("cofiddle-highlight"), color);
            updateColor($("IMG"), color);
            annotation.update_color = true;
            _this.publish("annotationUpdated", [annotation])
        }
    });
    //save current select color
    // sessionStorage.setItem("lastColorHighLight", className);
};
//plugin add checkbox ask before shared
Annotator.Plugin.PermissionsShared = function (element, options) {
  Annotator.Plugin.apply(this, arguments);
};

// Set the plugin prototype. This gives us all of the Annotator.Plugin methods.
Annotator.Plugin.PermissionsShared.prototype = new Annotator.Plugin();

Annotator.Plugin.PermissionsShared.prototype.pluginInit = function () {
    var _this = this;
    this.annotator.editor.addField({
        type: "checkbox",
        label: Annotator._t("Private"),
        id: "annotationShared",
    })
};
//END SHARED

Annotator.prototype.highlightText = function(event){
    // event.stopPropagation();
    var annotation, position, _this = this;
    if (event != null ) {
        event.preventDefault();
    }

    var selectText = window.getSelection().toString();
    position = _this.adder.position();
    _this.adder.hide();

    var lastColorHighLight = _this.getLastColor();
    cssClass = "temporary-highlight " + lastColorHighLight;
    _this.setupAnnotation(_this.createAnnotation(), cssClass.toString());

    // chrome.storage.sync.get("lastColorHighLight", function (obj) {
    //     var cssClass = "temporary-highlight annotator-hl";
    //     if(!jQuery.isEmptyObject(obj)){
    //         cssClass = "temporary-highlight " +obj.lastColorHighLight;
    //     }
    //     _this.setupAnnotation(_this.createAnnotation(), cssClass.toString());
    // });
}
//remove high light text
Annotator.prototype.removeHighLightText = function(e){
    this.currentPosition = 0;
    this.timer = 0;
    this.currentTarget = null;
    $(".temporary-highlight").contents().unwrap();
};
Annotator.prototype.getLastColor = function(){
    return $("#hdLastColor").length > 0 ? $("#hdLastColor").val().toString() : "annotator-hl-yellow"; //sessionStorage.getItem("lastColorHighLight") ||"annotator-hl-yellow" ;
};

Annotator.prototype.onMouseLeaveIconNote = function(){
    // this.viewer.hide();
};
Annotator.prototype.removeSelect = function(){
    if (window.getSelection) {
      if (window.getSelection().empty) {  // Chrome
        window.getSelection().empty();
      } else if (window.getSelection().removeAllRanges) {  // Firefox
        window.getSelection().removeAllRanges();
      }
    } else if (document.selection) {  // IE?
      document.selection.empty();
    }
};
//save selection
Annotator.prototype.saveSelectionRange = function(){
    if (window.getSelection) {
        sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            return sel.getRangeAt(0);
        }
    } else if (document.selection && document.selection.createRange) {
        return document.selection.createRange();
    }
    return null;
};
//restore selection range
Annotator.prototype.restoreSelectionRange = function(range){
    if (range) {
        if (window.getSelection) {
            sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        } else if (document.selection && range.select) {
            range.select();
        }
    }
};
