var setting = {
    loadMoreComment: false,
    openReply: true,
    lastOffset: null
}
var inject = {
    html : function(positionInsert, html, $el){
        document.body.insertAdjacentHTML( positionInsert, html);
    }
};
// var cofiddleGuide = {};
var cofiddleGuide = {
    initEvent : function(){
        $(document).on("click", "#cofiddleHub", function(){
            cofiddleGuide.showTour();
        }).on("click", "#btnShowMeHow, #btnStep2, #btnStep3, #btnStep4", function(event) {
            cofiddleGuide.goNextStep(event);
        }).on("click", "#btnNotThisPage", function(event) {
            cofiddleGuide.removeEl($(".cofiddle-modal"));
            cofiddleGuide.removeEl($(".cofiddle-dimmer"));
        }).on("click", "#btnSearchAlertGotIt", function(){
            var isChecked = false;
            if($(".ckb-dont-show").is(":checked")){
                 isChecked = true;
            }
            chrome.runtime.sendMessage({action: "GOT_SEARCH_ALERT", isChecked: isChecked});
            cofiddleGuide.removeEl($(".cofiddle-modal"));
        }).on("click", "#btnCachedGotIt", function(){
            if($(".ckb-dont-show").is(":checked")){
                chrome.runtime.sendMessage({action: "UPDATE_TOUR_STEP", exclusion: "-1"});
            }
            cofiddleGuide.removeEl($(".cofiddle-modal"));
            cofiddleGuide.removeEl($(".cofiddle-dimmer"));
        }).on("click", ".cofiddle-praticipating, #btnStep5", function(){
            if($(this).hasClass("icon-selected") || $(this).find('.disabled-icon').length > 0) return;
            cofiddleGuide.notShowXFTUE();
            // chrome.runtime.sendMessage({action: "SHARE_PAGE_FROM_HUB"});
            $(".cofiddle-modal-hub div").removeClass("icon-selected");
            $(this).addClass("icon-selected");
            hubControl.showShareTool();
        })
        .on("click", ".cofiddle-share-opition", function(){
            if($(this).hasClass("icon-selected") || $(this).find('.disabled-icon').length > 0) return;
            var obj = $(this).data();
            chrome.runtime.sendMessage({action: "SAVE_LAST_SHARED", data: obj});
            hubControl.share(obj);
            $(".share-markups").remove();
            $(".cofiddle-modal-hub").hide();
            $("#cofiddleHub").show();
            $(".cofiddle-modal-hub div").removeClass("icon-selected");
        })
        .on("click", "#cofiddleClickHere", function(){
            chrome.runtime.sendMessage({action: "UPDATE_TOUR_STEP", annotation: "-1"});
            cofiddleGuide.notShowXFTUE();
        }).on("click", ".annotator-wrapper", function(event){
            var target = event.target;
            if(target.className == "annotator-icon-highlight" || target.className == "annotator-icon-close"){
                return;
            }
            if(target.id == "annotator-save"){
                $("#btnStep4").removeAttr("disabled")
                              .removeClass("cofiddle-disabled");
            }
        }).on("click", ".share-us", function(){
            chrome.runtime.sendMessage({action: "SHARE_PAGE_FROM_HUB", email: "hello@cofiddle.com", url: window.registeredUrl});
            cofiddleGuide.notShowXFTUE();
        })
        .on("mouseenter", ".cofiddle-hub", function(){
            if($(".cofiddle-modal").length > 0) return;
            cofiddleGuide.showHub();
        })
        //make element can dropable
        // .on("mouseenter", ".cofiddle-modal-hub", function(){
        //     var $el = $(this);
        //      $el.draggable({
        //           axis: "y",
        //           start: function (event, ui) {
        //               start = ui.position.top;
        //               $("#cofiddleHub").css("top", ui.position.top);
        //           },
        //           stop: function (event, ui) {
        //               stop = ui.position.top;
        //               $("#cofiddleHub").css("top", ui.position.top);
        //           }
        //      });
        // })
        .on("mouseleave", ".cofiddle-modal-hub", function(evt){
            if($(".cofiddle-box-activity").length > 0) return;
            if($(".cofiddle-modal").length > 0) return;
            $("#cofiddleHub").show().stop();

            $(".cofiddle-modal-hub").hide('slide', {direction: 'right'}, 200);
        })
        .on("mouseenter", ".cofiddle-exclusion", function(){
            $('.cofiddle-exclusion').tooltipster('content', cofiddleGuide.toolTipExclusion());
        })
        .on("click",".cofiddle-exclusion",  function(){
            var type, isBlacklist = sessionStorage.getItem("isBlackList"),
                isRobot = sessionStorage.getItem("isRobot");
            if(isRobot == "1"){
                if(isBlacklist == "1") type = "unExcludeForceSaving";
                else type = "forceSaving";
            }else{
                if(isBlacklist == "1") type = "unExcludeForceSaving";
                else type = "excludeSite";
            }
            var msgCallback = function(resp){
                if(!resp) return;
                if(isRobot == "1"){
                    if(isBlacklist == "1") $("#cofiddle-note").html("Page cached and removed from blacklist.");
                    else $("#cofiddle-note").html("Page cached");
                }else{
                    if(isBlacklist == "1") {
                        sessionStorage.setItem("isBlackList", 0);
                        $(".cofiddle-exclusion i").removeAttr("class").addClass("fa fa-minus-circle");
                        $("#cofiddle-note").html("Page cached and removed from blacklist.");
                    } else {
                        sessionStorage.setItem("isBlackList", 1);
                        $(".cofiddle-exclusion i").removeAttr("class").addClass("fa fa-plus-circle");
                        $("#cofiddle-note").html("Page excluded");
                    }
                }
                $("#cofiddle-note").slideToggle(500);
                setTimeout(function(){
                     $("#cofiddle-note").slideUp("slow");
                }, 5000);
            };
            if (isRobot == '1' || isBlacklist == '1') {
                addNewCache(function(resp) {
                    if (resp) {
                        if (isBlacklist == '1') {
                            chrome.runtime.sendMessage({
                                action: "ADD_EXCLUSION_PAGE",
                                type: "unExcludeForceSaving",
                                url: window.registeredUrl
                            }, msgCallback);
                        } else msgCallback(true);
                    } else msgCallback(false);
                });
            } else {
                chrome.runtime.sendMessage({
                    action: "ADD_EXCLUSION_PAGE",
                    type: "excludeSite",
                    url: window.registeredUrl
                }, msgCallback);
            }
        })
        .on("click", ".cofiddle-add-note", function(){
            if($(this).hasClass("icon-selected") && $(".cofiddle-box-activity").length > 0) return;
            if($(this).find(".disabled-icon").length > 0) return;
            $(".cofiddle-box-activity").remove();
            $(".cofiddle-modal-hub div").removeClass("icon-selected");
            $(this).addClass("icon-selected");
            setting.lastOffset = null;
            hubControl.showActivity();
            hubControl.initTooltip($("#cofiddleInvite"));
        })
        .on("click",".latest-comment[data-discussion-id]", function(){
            var id = $(this).attr("data-discussion-id");
            hubControl.getComment(id);
        })
        .on("click", ".del-comment", function(){
            var $el = $(this).closest(".action-comment"),
                commentId = $el.attr("data-comment-id");
            hubControl.delComment(commentId, $(this));
        })
        .on("keypress", "#txtComment", function(e){
            if(e.which == "13"){
                var message = $(this).val();
                hubControl.addComment(message);
                return false;
            }
        })
        .on("click","#leftTab", function(){
            $("#rightTab").removeClass("active-tab").addClass("disabled-tab");
            $("#leftTab").addClass("active-tab").removeClass("disabled-tab");
            $("cofiddle-discussion").hide();
            $("cofiddle-content").show();
            $("cofiddle-text").hide();
        })
        .on("click", "#cofiddleInvite", function(){
            hubControl.inviteUser();
        })
        .on("click", ".count-number", function(){
            var $el = $(this).closest(".action-comment");
            if(!setting.openReply) {
                var $parent = $el.closest("cofiddle-section");
                while($parent.next().attr("class").indexOf("reply-2") != "-1"){
                    if($parent.next().css('display') != 'none' && $(this).find('i').attr("class").indexOf("fa-angle-up") != "-1"){
                        $parent.next().slideUp(200);
                    }else{
                        $parent.next().slideToggle(700);
                    }
                    $parent = $parent.next();
                }
                // Check shore-more-reply-1 only when we finish looping through the child replies
                if ($parent.next().hasClass('show-more-reply-1')) {
                    if($parent.next().css('display') != 'none') $parent.next().hide();
                    else $parent.next().show();
                }
                if($(this).find('i').attr("class").indexOf("fa-angle-up") != "-1"){
                    $(this).find('i').removeClass("fa-angle-up").addClass("fa-angle-down");

                }
                else $(this).find('i').removeClass("fa-angle-down").addClass("fa-angle-up");
                return false;
            };
            var commentId = $el.attr("data-comment-id"),
                obj = $el.data();
            setting.loadMoreComment = false;
            setting.openReply = false;
            hubControl.showReplies(commentId, obj, null, 5, null, false);
        })
        .on("click", ".cofiddle-header-activity", function(){
             if($(".latest-comment").is(":visible")) return;
             if(!$(".cofiddle-add-note").hasClass("icon-selected")) return;
            var action = $("#cofiddleBack").attr("data-action");
            $("cofiddle-discussion").removeAttr("style");
            var $node = $(".root-comment .action-comment");
            $(".root-comment").remove();
            $("#listDiscussion").html("");
            $("#listDiscussion").attr("data-offset", 0);
            if(action == "backListComment"){
                var commentId = $node.data().commentId;
                $("cofiddle-discussion").html("");
                $("cofiddle-discussion").attr("data-page", 1);
                var groupId = $("cofiddle-discussion").data().groupId;
                sessionStorage.setItem("index", "1");
                hubControl.getComment(groupId);
                var scrollToComment = function(){
                    setTimeout(function(){
                        debugger;
                        var $el = $("span.action-comment[data-comment-id='"+commentId+"']");
                        if($el.length > 0){
                            // var scrollTop = $el.offset().top;
                            // $("#listComment").scrollTop(scrollTop);
                            $el.focus();
                        }else{
                            var  $elComment = $('#listComment');
                            $elComment.scrollTop($elComment.prop("scrollHeight"))
                            scrollToComment();
                        }
                    }, 1000);
                }
                scrollToComment();
                return sessionStorage.removeItem("currentPage");
            }
            else if(action == "backListDiscusion"){
                $("#listComment").hide();
                $("cofiddle-discussion").html("");
                $("cofiddle-discussion").attr("data-page", 1);
                $("#cofiddleTitle").text("Discussions");
                $("cofiddle-content").data({pageNumber : 1});
                $("#listDiscussion").attr("data-offset", 0);
                setting.lastOffset = null;
                hubControl.showActivity();
                $("#listDiscussion").show();
            }else{
                $("cofiddle-discussion").html("");
                $("cofiddle-discussion").attr("data-page", 1);
                $("#cofiddleTitle").text("Discussions");
                $("cofiddle-content").data({pageNumber : 1});
                setting.lastOffset = null;
                return hubControl.showActivity();
            }
            $("#listComment").unbind("scroll");
            setting.loadMoreComment = false;
        })
        .on("click", "#cofiddleClose", function(){
            $(".cofiddle-modal-hub div").removeClass("icon-selected");
            $(".cofiddle-box-activity").remove();
            $(".cofiddle-modal-hub").hide("slide", {direction: "right"}, 200);
            $("#cofiddleHub").show(300);
            setting.lastOffset = null;
            return false;
        })
        .on("click", ".show-emoji-smiley", function(){
            var $emoji = $(".gallery-ecomji");
            if ($emoji.css('display') == 'none') {
                var icon = $(".emoji-list").html();
                icon = emojione.unicodeToImage(icon);
                $(".emoji-list").html(icon);
                $emoji.show(100);
            } else {
                $emoji.hide(100);
            }
        })
        .on('mouseover', '.emoji-list li img', function (e) {
              var name = emojione.toShort(this.alt);
              $("#icon-name").html(name);
              $("#icon-image").html(emojione.shortnameToImage(name));
          })
        .on('click', '.emoji-list li img', function (e) {
              var txtToAdd = emojione.toShort(this.alt), control;
              if($(".textarea-custom").is(":visible")){
                   control = $("#txtComment");
              }else{
                  control = $("#txtAddReply");
              }
              Utils.insertAtTextareaCursor(control, txtToAdd);
              $(".gallery-ecomji").hide();
        })
        .mouseup(function (e) {
            var container = $(".gallery-ecomji");
            if (!container.is(e.target)
                && container.has(e.target).length === 0) {
                container.hide();
            }
        })
        .on("click", ".show-more-reply", function(){
            var obj = $(this).closest("cofiddle-section").data();
            var pageNumber = $(this).attr("data-value");
                pageNumber = parseInt(pageNumber);
            var $el = $(this).closest(".action-comment"),
                commentId = $(this).attr("data-comment-id");
            hubControl.showReplies(commentId, null, null, 10, pageNumber, true);
            $(this).remove();
        })
        .on("click", ".cofiddle-markup", function(){
            if($(this).hasClass("icon-selected") || $(this).find('.disabled-icon').length > 0) return;
            $(".cofiddle-modal-hub div").removeClass("icon-selected");
            $(this).addClass("icon-selected");
            $(".cofiddle-box-activity").remove();
            hubControl.showMarkupTools();
        })
        .on("click", "#imageMarkup", function(){
            hubControl.imageMarkup();
            $(".cofiddle-modal-hub").hide();
            $("#cofiddleHub").show();
            $(".cofiddle-modal-hub div").removeClass("icon-selected");
        })
        .on("click", ".rep-comment", function(){
            var currentPage = sessionStorage.getItem("currentPage"),
                commentId;
            $(".input-text-comment").remove();
            $("#listComment").unbind("scroll");
            setting.loadMoreComment = false;
            setting.openReply = false;
            if(currentPage == "replies"){
                var $el = $(this).closest(".action-comment");
                commentId = $el.attr("data-comment-id");
                if($(this).closest(".root-comment").length > 0) $("cofiddle-discussion").prepend(cofiddleHtml.insertTextBox);
                else {
                    $(cofiddleHtml.insertTextBox).insertAfter($el);
                    $(".input-text-comment").addClass("text-box-reply")
                }
            }else{
                var $el = $(this).closest(".action-comment"),
                    obj = $el.data();
                commentId = $el.attr("data-comment-id");
                hubControl.showReplies(commentId, obj, true, 5, null, false);
            }
            setTimeout(function(){
                $("#txtAddReply").attr("data-comment-id", commentId).focus();
            }, 700);
        })
        .on("keypress", "#txtAddReply", function(e){
            if(e.which == 13){
                var commentId = $(this).attr("data-comment-id");
                hubControl.addReply(commentId, $(this).val());
            }

        })
        .on("click", ".show-more-reply-1", function(){
            var replyId = $(this).attr("data-comment-id"),
                offset = $(this).attr("data-offset");
            $(this).attr("data-offset", parseInt(offset) + 10);
            $(this).prev().removeClass("no-bottom");
            hubControl.nextReply(replyId, parseInt(offset), $(this));
        })
        .on("keypress", ".config-search-box", function(e){
            if(e.which == 13){
                var str = $(this).val(),
                    url = config.url() + "/app/web-journal?q="+str;
                $(".configuration-tools").hide();
                $(".cofiddle-box-activity").remove();
                window.open(url, "_blank");
                $(".cofiddle-modal-hub").hide();
                $("#cofiddleHub").show();
                $(".cofiddle-modal-hub div").removeClass("icon-selected");
            }
        })
        .on("click", ".config-tool", function(){
            var action = $(this).attr("data-action");
            if(action == "web-journal") {
                if(!sessionStorage.getItem("ID_User")){
                    window.open(config.url() + "/app/signin", "_blank");
                }else{
                    window.open(config.url() + "/app/web-journal", "_blank");
                }
            }
            if(action == "faq") window.open("https://cofiddle.freshdesk.com/support/home", "_blank");
            if(action == "feedback")   window.location.assign('mailto:feedbacks@cofiddle.com');
            if(typeof action != "undefined"){
                $(".cofiddle-box-activity").remove();
                $(".cofiddle-modal-hub").hide();
                $("#cofiddleHub").show();
                $(".cofiddle-modal-hub div").removeClass("icon-selected");
            }
        })
        .on("click", ".state-journalling i", function(){
            var state = $(this).attr("data-value");
            //state current is activate
            if(state == "active"){
                $(this).removeAttr("class").addClass("fa fa-play fa-1x");
                $(this).attr("data-value", "paused");
                $(".status-journalling-text").html("Paused").removeClass("cofiddle-green").addClass("cofiddle-gray");
                $(".state-journalling").removeClass("cofiddle-gray").addClass("cofiddle-green");
                chrome.runtime.sendMessage({action: "AUTO_JOURNALLING", state: "off"});
            }else{
                $(this).removeAttr("class").addClass("fa fa-pause fa-1x");
                $(this).attr("data-value", "active");
                $(".status-journalling-text").html("Active").removeClass("cofiddle-gray").addClass("cofiddle-green");
                $(".state-journalling").removeClass("cofiddle-green").addClass("cofiddle-gray");
                chrome.runtime.sendMessage({action: "AUTO_JOURNALLING", state: "on"});
            }
        })
        .on("click", ".expand-tutorial", function(){
            if($(".cofiddle-tutorial").is(":visible")){
                $("#expandTutorial").removeAttr("class").addClass("fa fa-angle-down fa-1x tutorial-expand");
                $(".cofiddle-tutorial").slideUp(400);
            }else{
                $("#expandTutorial").removeAttr("class").addClass("fa fa-angle-up fa-1x tutorial-expand");
                $(".cofiddle-tutorial").slideToggle(400);
            }
            $(".cofiddle-modal-hub div").removeClass("icon-selected");
        })
        .on("click", ".cofiddle-tutorial span", function(){
            var action = $(this).data();
            $(".cofiddle-box-activity").remove();
            if(action.value == "markup"){
                inject.html("beforeend", cofiddleHtml.dimmer);
                inject.html("beforeend", cofiddleHtml.step_1);
            }
            if(action.value == "search"){
                inject.html("beforeend", cofiddleHtml.searchAlert);
                $(".replay-alert").show();
            }
            if(action.value == "exclusion"){
                inject.html("beforeend", cofiddleHtml.dimmer);
                inject.html("beforeend", cofiddleHtml.notCache);
            }
            $(".cofiddle-modal-hub").hide();
            $("#cofiddleHub").show();
        })
        .on("click", ".cofiddle-gear", function(){
            if($(this).hasClass("icon-selected")) return false;
            $(".cofiddle-box-activity").remove();
            $(".cofiddle-modal-hub div").removeClass("icon-selected");
            $(this).addClass("icon-selected");
            inject.html("beforeend", cofiddleHtml.configurationTools);
            chrome.runtime.sendMessage({action: "GET_SEARCH_ALERT"}, function(res){
                if (res == "mini" || res == "expand") {
                    $("#" + res).prop("checked", true);
                } else {
                    $("#expand").prop("checked", true);
                }
            });
            //sync auto journalling
            chrome.runtime.sendMessage({action: "GET_AUTO_JOURNALLING"}, function(res){
                var state = res.state;
                if(state == "off"){
                    $(".state-journalling i").removeAttr("class").addClass("fa fa-play fa-1x");
                    $(".state-journalling i").attr("data-value", "paused");
                    $(".status-journalling-text").html("Paused").removeClass("cofiddle-green").addClass("cofiddle-gray");
                    $(".state-journalling").removeClass("cofiddle-gray").addClass("cofiddle-green");
                }else{
                    $(".state-journalling i").removeAttr("class").addClass("fa fa-pause fa-1x");
                    $(".state-journalling i").attr("data-value", "active");
                    $(".status-journalling-text").html("Active").removeClass("cofiddle-gray").addClass("cofiddle-green");
                    $(".state-journalling").removeClass("cofiddle-green").addClass("cofiddle-gray");
                }
            });
            //check if current not login, disable all icon
            if(!sessionStorage.getItem("ID_User")){
                $(".config-tool").not(".config-tool[data-action]").hide();
                $(".config-tool-journalling").hide();
                $(".config-tool-alert").hide();
                $(".config-tutorial").hide();
            }
        })
        .on("change", "input:radio[name='search-alert']", function(){
            if ($(this).is(':checked')) {
                chrome.runtime.sendMessage({action: "SAVE_SEARCH_ALEART", type: $(this).val()});
            }
        })
        .on('mousewheel DOMMouseScroll', "#listComment, #listDiscussion", function(e) {
            //   var scrollTo = null;
            //   if(e.type === 'mousewheel') {
            //      scrollTo = (e.originalEvent.wheelDelta * -1);
            //   }else if(e.type === 'DOMMouseScroll') {
            //      scrollTo = 40 * e.originalEvent.detail;
            //   }
            //   if(scrollTo) {
            //      e.preventDefault();
            //      $(this).scrollTop(scrollTo + $(this).scrollTop());
            //   }
            var event = e.originalEvent,
               delta = event.wheelDelta || -event.detail;

            this.scrollTop += ( delta < 0 ? 1 : -1 ) * 30;
            e.preventDefault();
        });
    },
    fireHandle : function($node, eventHandle, functionName){
        if($node){
            $(document).on(eventHandle, $node, cofiddleGuide[functionName]);
        }
    },
    notShowXFTUE : function(){
        if($(".ckb-dont-show").is(":checked")){
            chrome.runtime.sendMessage({action: "UPDATE_TOUR_STEP", annotation: "-1"});
        }
        cofiddleGuide.removeEl($(".cofiddle-modal"));
        cofiddleGuide.removeEl($(".cofiddle-dimmer"));
    },
    goNextStep : function(event){
        var currentStep = $(event.target).attr("data-current-step"),
            currentPosition;
        if(typeof currentStep == "undefined") return;
        if($('.cofiddle-modal').length > 0){
            curentPostion = {
                top: $('.cofiddle-modal').position().top - 20,
                left: $('.cofiddle-modal').position().left,
                position: "absolute"
            };
        }
        if(currentStep == 1) {
            cofiddleGuide.removeEl($(".cofiddle-modal"));
            inject.html("beforeend", cofiddleHtml.step_2);
            cofiddleGuide.removeEl($(".cofiddle-dimmer"));
            $(document).on("mouseup", 'body', function(evt){
                cofiddleGuide.showStep_3(evt);
            });
            currentStep = "2";
        }else if(currentStep == 2) {
            cofiddleGuide.removeEl($(".cofiddle-modal"));
            cofiddleGuide.removeEl($(".cofiddle-dimmer"));
            $(document).on("mouseup", 'body', function(evt){
                cofiddleGuide.showStep_3(evt);
            });
        }else if(currentStep == 3) {
            inject.html("beforeend", cofiddleHtml.step_4);
            $(".cofiddle-modal").css(curentPostion);
            $("#btnStep4").removeClass("cofiddle-disabled");
        }else if(currentStep == 4) {
            cofiddleGuide.removeEl($(".cofiddle-modal"));
            inject.html("beforeend", cofiddleHtml.dimmer);
            // inject.html("beforeend", cofiddleHtml.hubModal);
            cofiddleGuide.showHub();
            inject.html("beforeend", cofiddleHtml.step_5);
            $(".cofiddle-modal-hub").show();
            $("#cofiddleHub").hide();
            currentStep = "5";
            $(document).off("mouseup", 'body');
        }
        else {
            if($(".ckb-dont-show").is(":checked")){
                currentStep = "-1";
            }
            cofiddleGuide.removeEl($(".cofiddle-hub"));
            cofiddleGuide.removeEl($(".cofiddle-modal"));
            cofiddleGuide.removeEl($(".cofiddle-dimmer"));
        }
        chrome.runtime.sendMessage({action: "UPDATE_TOUR_STEP", annotation: currentStep});
    },
    showStep_3 : function(evt){
        // debugger;
    //    if($("#nextMarkup").length == 0) return;
       if (window.getSelection().toString()) {
           if($("#nextMarkup").length > 0) cofiddleGuide.removeEl($(".cofiddle-modal"));
           if($(".annotator-editor").css('display') == 'block'
                || evt.target.className == 'annotator-icon-edit'
                || $(".cofiddle-modal").attr("data-step") == '4'
                || $(evt.target).parent().attr("class") == "cofiddle-modal") return;
           var selected = window.getSelection(),
               textRange = selected.getRangeAt(0),
               postion = textRange.getBoundingClientRect();
           setTimeout(function(){
               var curentPostion = {
                   top: $(".annotator-adder").offset().top + 50,
                   left: $(".annotator-adder").offset().left - 80,
                   position: "absolute"
               }
               inject.html("beforeend", cofiddleHtml.step_3);
               $(".cofiddle-modal").css(curentPostion);
               $(".cofiddle-dimmer").unbind("click");
               $("#btnStep3").attr("disabled", true);
           }, 200);
       }else{
           if($(".cofiddle-modal").attr("data-step") == '4'
              || $(".cofiddle-modal").attr("data-step") == '3') return;
           cofiddleGuide.removeEl($(".cofiddle-modal"))
       }
    },
    removeEl : function($el){
        $el.remove();
    },
    showHub : function(){
        var $hub = $(".cofiddle-modal-hub");
        if($hub.css('display') == 'none') {
            var isBlacklist = sessionStorage.getItem("isBlackList"),
                isRobot = sessionStorage.getItem("isRobot");
            if(isBlacklist != "1" && isRobot != "1") {
                $(".cofiddle-exclusion i").removeAttr("class").addClass("fa fa-minus-circle");
            }
            else if(isBlacklist == "1" || isRobot == "1") {
                $(".cofiddle-exclusion i").removeAttr("class").addClass("fa fa-plus-circle");
            }
            $hub.show();
            $("#cofiddleHub").hide().stop();

        }
        else{
            $("#cofiddleHub").show();
            $hub.fadeOut(400);
        }
        //check discussion existed
        chrome.runtime.sendMessage({action: "CHECK_DISCUSSION", url: window.registeredUrl}, function(res){
            if(!res) $("#iconComment").addClass("disabled-icon");
            else{
                $("#iconComment").removeClass("disabled-icon")
            }
        });
        //check if current not login, disable all icon
        if(sessionStorage.getItem("ID_User")){
            // $(".cofiddle-modal-hub div").addClass("enable-hover");
            $(".cofiddle-modal-hub div").each(function(){
                if($(this).find("i").hasClass("disabled-icon")){
                    $(this).addClass("disable-hover");
                }else{
                    $(this).addClass("enable-hover");
                }
            });
        }else{
            $("#iconComment").addClass("disabled-icon").parent().addClass("disable-hover");
            $("#iconMarkup").addClass("disabled-icon").parent().addClass("disable-hover");
            $("#iconShare").addClass("disabled-icon").parent().addClass("disable-hover");
            $("#iconSettings").parent().addClass("enable-hover");
        }
    },
    showTour : function(){
        chrome.runtime.sendMessage({action: "GET_CURRENT_TOUR_STEP"}, function(resp){
            var step = parseInt(resp.annotation);
            if(step != "-1"){
                if($(".cofiddle-dimmer").length > 0) return;
                if(step == 1) {
                    inject.html("beforeend", cofiddleHtml.dimmer);
                    inject.html("beforeend", cofiddleHtml.step_1);
                }
                if(step == 2) {
                    // inject.html("beforeend", cofiddleHtml.dimmer);
                    inject.html("beforeend", cofiddleHtml.step_2);
                    $(document).on("mouseup", 'body', function(evt){
                        cofiddleGuide.showStep_3(evt);
                    });
                }
                if(step == 3 || step == 4){
                    $(document).on("mouseup", 'body', function(evt){
                        cofiddleGuide.showStep_3(evt);
                    });
                }
                if(step == 5) {
                    inject.html("beforeend", cofiddleHtml.dimmer);
                    if($(".cofiddle-modal-hub").length == 0){
                        inject.html("beforeend", cofiddleHtml.hubModal);
                    }
                    inject.html("beforeend", cofiddleHtml.step_5);
                    $(".cofiddle-modal-hub").show();
                    $("#cofiddleHub").hide();
                }
            }
        });
    },
    toolTipExclusion : function(){
        var strTooltip, isBlacklist = sessionStorage.getItem("isBlackList"),
            isRobot = sessionStorage.getItem("isRobot");
        if(isRobot == "1"){
            if(isBlacklist == "1") strTooltip = "Un-exclude and force saving";
            else strTooltip = "Force saving";
        }else{
            if(isBlacklist == "1") strTooltip = "Un-exclude and force saving";
            else strTooltip = "Exclude this site";
        }
        return strTooltip;
    }
};
var hubControl = {
    share : function(obj){
        var shareCache = function(cacheInfo) {
            if (!cacheInfo.id) return;
            var cacheId = cacheInfo.id;
            if(obj.value == shareVia.facebook){
                chrome.extension.sendMessage({
                    action: "SHARE_ON_SOCIAL",
                    type: "facebook",
                    url: window.registeredUrl,
                    cacheId: cacheId
                });
            }else if(obj.value == shareVia.twitter){
                chrome.extension.sendMessage({
                    action: "SHARE_ON_SOCIAL",
                    type: "twitter",
                    url: window.registeredUrl,
                    cacheId: cacheId
                });
            }else if(obj.value == shareVia.clipboard){
                chrome.runtime.sendMessage({
                    action: "COPPY_TO_CLIPBOARD_URL",
                    url: window.registeredUrl,
                    cacheId: cacheId,
                    cacheData: window.CACHE_DATA
                }, function(res){
                    if(res){
                        var showMsgFunc = function(){
                            var msg = 'The Cofiddle sharing link for this page has been copied to your clipboard.';
                            $("#cofiddle-note").html(msg);
                            $("#cofiddle-note").slideToggle(500);
                            setTimeout(function(){
                                 $("#cofiddle-note").slideUp("slow");
                            }, 5000);
                        };
                        if(res.exceed){
                            setTimeout(function(){
                                showMsgFunc();
                                // var msg = 'The Cofiddle sharing link for this page has been copied to your clipboard.';
                                // $("#cofiddle-note").html(msg);
                                // $("#cofiddle-note").slideToggle(500);
                                // setTimeout(function(){
                                //      $("#cofiddle-note").slideUp("slow");
                                // }, 5000);
                            }, 7000)
                        }else{
                            showMsgFunc();
                        }


                    }
                });
            }else if(obj.value == shareVia.email){
                chrome.runtime.sendMessage({
                    action: "SHARE_PAGE_FROM_HUB",
                    url: window.registeredUrl,
                    cacheId: cacheId
                });
            }
        };
        if (!window.CACHE_ID) {
            addNewCache(shareCache);
        } else shareCache({id: window.CACHE_ID});
    },
    showActivity : function(addScroll){
        if($("#listComment").is(":visible")) return false;
        if($(".cofiddle-box-activity").length == 0) inject.html("beforeend", cofiddleHtml.activityDiscussion);
        $section = $("cofiddle-content");
        $("#cofiddleBack").hide();
        // var pageNumber = $("cofiddle-content").data().pageNumber ? parseInt($("cofiddle-content").data().pageNumber) : 1;
        var offset = typeof $("#listDiscussion").attr("data-offset") != "undefined" ? $("#listDiscussion").attr("data-offset") : 0;
        if(offset == "0") $section.html("");
        if(setting.lastOffset == offset) return false;
        setting.lastOffset = offset;
        chrome.extension.sendMessage({
            action: "GET_LAST_COMMENT_DISCUSSION",
            offset: parseInt(offset),
            url: window.registeredUrl
        }, function(resp){
            if(resp && !jQuery.isEmptyObject(resp)){
                for(var i = 0; i < resp.length; i++){
                    if(jQuery.isEmptyObject(resp[i].lastComment)){
                        var localDate = Utils.convertUTCDate(resp[i].createdAt.toString()),
                            shortDateString = Utils.convertToLocalDateString(localDate, {
                                year: "numeric", month: "long",
                                day: "numeric"
                            }, "en");
                        var strHtml = '<cofiddle-section class="latest-comment comment-bottom" data-discussion-id="'+resp[i].id+'">'+
                            '<cofiddle-avatar class="textavatar">'+
                            '</cofiddle-avatar>'+
                            '<cofiddle-text>'+
                                '<span>'+
                                    '<strong class="user-name">'+Utils.trunkString(resp[i].owner.name, 13)+'</strong>'+
                                    '<span class="date-time">'+shortDateString+'</span>'+
                                '</span>'+
                            '</cofiddle-text>'+
                        '</cofiddle-section>';
                        $section.append(strHtml);
                        $(".textavatar").attr("data-name", resp[i].owner.name)
                                        .textAvatar({
                                            width: 49
                                        });
                    }else{
                        var localDate = Utils.convertUTCDate(resp[i].lastComment.commentTime.toString()),
                            shortDateString = Utils.convertToLocalDateString(localDate, {
                                year: "numeric", month: "long",
                                day: "numeric"
                            }, "en"),
                            unread = resp[i].lastComment.unread == 1 ? "unread-comment" : "hidden";

                        var strHtml = '<cofiddle-section class="latest-comment comment-bottom" data-discussion-id="'+resp[i].id+'">'+
                            '<span style="display:none"><i class="fa fa-circle '+unread+'"></i></span>'+
                            '<cofiddle-avatar class="textavatar">'+
                            '</cofiddle-avatar>'+
                            '<cofiddle-text>'+
                                '<span>'+
                                    '<strong class="user-name">'+Utils.trunkString(resp[i].lastComment.user.name, 13)+'</strong>'+
                                    '<span class="date-time">'+shortDateString+'</span>'+
                                '</span>'+
                                '<p class="user-comment">'+
                                    ''+Utils.trunkString(resp[i].lastComment.content, 40)+''+
                                '</p>'+
                            '</cofiddle-text>'+
                        '</cofiddle-section>';
                        $section.append(strHtml);
                        $(".textavatar").attr("data-name", resp[i].lastComment.user.name)
                                        .textAvatar({
                                            width: 49
                                        });
                    }
                }
                offset = parseInt(offset) + 10;
                $("#listDiscussion").attr("data-offset", offset);
                $("cofiddle-discussion").hide();
                $(".textarea-box").hide();
                // $section.data({pageNumber : pageNumber}).show();
                if(!addScroll) $("#listDiscussion").bind("scroll", hubControl.showMoreListDiscussion);
                $(".cofiddle-add-note ").prop('disabled', false);
            }
        });


    },
    expandReply : function(obj){
        if(obj.user.ID == sessionStorage.getItem("ID_User")){
            hubControl.renderComment(obj.content, obj.commentTime, obj.ID, obj.numberReply, obj.user.ID, obj.user.name, false);
        }else{
            hubControl.renderComment(obj.content, obj.commentTime, obj.ID, obj.numberReply, obj.user.ID, obj.user.name, true);
        }
        if(obj.numberReply != "0"){
            var data = obj.replies,
                count = data.length < 5 ? data.length : 5
            for(var j=0; j< count; j++){
                hubControl.expandReply(data[j]);
            }
        }
    },
    getComment : function(groupId, isGetMember){
        var pageNumber = parseInt($("cofiddle-discussion").attr("data-page"));
        chrome.extension.sendMessage({ action: "GET_COMMENT_DISCUSSION",pageNumber: pageNumber,  groupId: groupId}, function(resp){
            if(resp.success){
                var $section = $("cofiddle-discussion"),
                    obj = resp.data, currentDate = null;
                    // count = obj.length > 10 ? 10 : obj.length;
                $("#listDiscussion").html("");
                $("#listComment").unbind("scroll");
                for(var i = 0; i <  obj.length; i++){
                    if(currentDate != obj[i].commentTime.substring(0, 10)){
                        var localDate = Utils.convertUTCDate(obj[i].commentTime.toString()),
                            shortDateString = Utils.convertToLocalDateString(localDate, {
                                year: "numeric", month: "long",
                                day: "numeric",  hour: "2-digit", minute: "2-digit"
                            }, "en");
                        var strGroupTime = '<div class="separate-signin strike"><span>'+shortDateString+'</span></div>';
                        $section.append(strGroupTime);
                        currentDate = obj[i].commentTime.substring(0, 10);
                        $(".separate-signin").prev(".right-section").addClass("no-bottom");
                    }
                    if(obj[i].user.ID == sessionStorage.getItem("ID_User")){
                        hubControl.renderComment(obj[i].content, obj[i].commentTime, obj[i].ID, obj[i].numberReply, obj[i].user.ID, obj[i].user.name, false, false);
                    }else{
                        hubControl.renderComment(obj[i].content, obj[i].commentTime, obj[i].ID, obj[i].numberReply, obj[i].user.ID, obj[i].user.name, true, false);
                    }
                }
                var $textAreaBox = $('<cofiddle-text/>');
                    $textArea = $('<textarea/>',{
                        class: 'textarea-custom',
                        placeholder: 'Add a comment'
                    });
                $("cofiddle-text").show();
                $section.show("slide", {direction: "right"}, 500);
                $section.data({groupId: groupId});
                $("cofiddle-content").hide();
                $("#leftTab").removeClass("active-tab").addClass("disabled-tab");
                $("#rightTab").addClass("active-tab").removeClass("disabled-tab");
                hubControl.getMember();
                $("#cofiddleTitle").text("Discussion");
                $("#cofiddleBack").attr("data-action", "backListDiscusion");
                //remove session
                sessionStorage.removeItem("currentPage");
                $("#cofiddleBack").show();
                setting.loadMoreComment = true;
                setting.openReply = true;
                //update page number
                if(!jQuery.isEmptyObject(resp.data)){
                    var pageNumber = parseInt($("cofiddle-discussion").attr("data-page")) + 1;
                    $("cofiddle-discussion").attr("data-page", pageNumber);
                    $("#listComment").bind("scroll", hubControl.showMoreComment);
                }else{
                    $("#listComment").unbind("scroll");
                }
            }
        });
    },
    filterUnread : function(cmtList, maxNumber) {
        return cmtList.slice(0, maxNumber).filter(function(cmt) {
            return cmt.unRead;
        }).map(function(cmt) {
            cmt.replies = cmt.replies ? hubControl.filterUnread(cmt.replies, maxNumber) : [];
            return cmt;
        });
    },
    showRootComment : function(content, commentTime, commentId, numberReply, userId, userName){
        var name = userId == sessionStorage.getItem("ID_User") ? "You" : userName,
            isDel = userId == sessionStorage.getItem("ID_User") ? 'inline-block' : 'none';
            str = ''+
                '<cofiddle-section class="root-comment">'+
                    '<cofiddle-section class="cofiddle-scroll scrollbar">'+
                        '<cofiddle-avatar class="left-avatar username-left-align">'+name+'</cofiddle-avatar>'+
                        '<cofiddle-comment class="left-content">'+
                            '<span class="content-comment">'+content+'</span>'+
                        '</cofiddle-comment>'+
                    '</cofiddle-section>'+
                    '<span class="action-comment" data-comment-id="'+commentId+'">'+
                        '<span style="display: inline-block" class="cofiddle-counter"><a class="count-number">'+numberReply+' Replies</a></span>'+
                        '<span class="coffidle-reply-comment" style="display:inline-block"><a class="rep-comment" data-action="" ><i class="fa fa-reply fa-1x"></i></a></span>'+
                        '<span><a class="del-comment" style="display: '+isDel+'"><i class="fa fa-trash-o fa-1x"></i></a></span>'+
                    '</span>'+
                '</cofiddle-section>';
        $section = $("cofiddle-discussion");
        $(str).insertBefore($section);
        // $section.append(str);

    },
    renderComment : function(content, commentTime, commentId, numberReply, userId, userName, isLeft, haveShowMore, levelReply, addAsTop){
        var $section = $("cofiddle-discussion"), $el;
        if(addAsTop){
            var $lastEl = $("cofiddle-discussion .strike:first-child"),
                d = new Date(),
                hh = d.getHours(),
                mm = d.getMinutes();
            if($lastEl.length > 0 && $lastEl.text().indexOf("Today") != "-1"){
                $section = $lastEl;
                $lastEl.find("span").text('Today, '+hh+':'+mm+'');
                $el = $('<cofiddle-section/>');
                $el.insertAfter($section);
                // $el.insertBefore($("cofiddle-discussion .right-section:first-child"));
            }else{
                var $strLine = $('<div class="separate-signin strike"><span>Today, '+hh+':'+mm+'</span></div>');
                $el = $('<cofiddle-section/>').prependTo($section);
                $strLine.insertBefore($el);
            }
        }
        else $el = $('<cofiddle-section/>').appendTo($section)
        var    $avatar = $('<cofiddle-avatar/>'),
            $content = $('<cofiddle-comment/>'),
            $comment = $('<span/>', {
                class: 'content-comment',
                html: emojione.shortnameToImage(content)
            }),
            $time = $('<span/>',{
                class: 'cofiddle-date-time',
                text: commentTime
            }),
            displayDel = userId == sessionStorage.getItem("ID_User")  ? "inline-block" : "none",
            displayRep = levelReply == 2 ? "none" : "inline-block",
            displayCount = levelReply == 2 ? "none" : "inline-block",
        action = levelReply ? "replyComment" : "", strShowMore = "", strReply ="";
        if(levelReply){
            strReply = '<i class="fa fa-angle-down fa-1x icon-show-reply"></i>';
        }
        var index = sessionStorage.getItem("index") ? 1 : parseInt(sessionStorage.getItem("index"));
        repCount = '<span class="action-comment" data-comment-id="'+commentId+'" tabindex="'+index+'">'+
                        '<span class="cofiddle-counter" style="display:'+displayCount+'"></i><a class="count-number" >'+numberReply+' replies '+strReply+'</a></span>'+
                        '<span class="coffidle-reply-comment" style="display:'+displayRep+'"><a class="rep-comment" data-action="'+action+'" ><i class="fa fa-reply fa-1x"></i></a></span>'+
                        '<span><a class="del-comment" style="display:'+displayDel+'"><i class="fa fa-trash-o fa-1x"></i></a></span>'+
                    '</span>';
        sessionStorage.setItem("index", index + 1);
        $comment.appendTo($content);

        $avatar.appendTo($el);
        $content.appendTo($el);
        $avatar.attr("class", "left-avatar");
        $el.attr("class", "right-section");
        if(levelReply){
            var className = levelReply == 1 ? "reply-1" : "reply-2";
                $el.addClass(className);
                if(className == "reply-2") $el.hide();
                $(".textarea-box").hide();
        }
        $el.append(repCount);
        if($el.next(".strike").length > 0){
            $el.addClass("no-bottom");
        }
        if(userId == sessionStorage.getItem("ID_User")){
            $avatar.text("You");
        }else{
            $avatar.text(userName);
        }
        $avatar.attr("class", "left-avatar username-left-align");
        $content.attr("class", "left-content");
        if(typeof objReply != "undefined"){
            $el.attr("data-comment-id", commentId)
                    .data(objReply);
        }
        $(".action-comment[data-comment-id="+commentId+"]").data({
            content: content,
            commentTime: commentTime,
            commentId: commentId,
            numberReply: numberReply,
            userId:userId,
            userName:userName
        });
    },
    addComment : function(message){
        // var groupId = $("cofiddle-discussion").attr("data-discussion-id");
        var groupId = $("cofiddle-discussion").data().groupId;
        chrome.extension.sendMessage({action: "ADD_COMMENT", groupId: groupId, message: message}, function(resp){
            if(resp.success){
                var className = $("cofiddle-discussion").children().last().attr("class");
                    // className = $("cofiddle-discussion cofiddle-section").attr("class")[temp-1];
                $(".textarea-custom").val("");
                hubControl.renderComment(message, "Just now", resp.newID, 0, resp.user.ID, resp.user.name, false, null, null, true);
                $('#listComment').scrollTop(0);
            }
        });
    },
    addReply : function(commentId, message){
        var groupId = $("cofiddle-discussion").data().groupId;
        chrome.extension.sendMessage({action: "ADD_REPLY", groupId: groupId, commentId: commentId, message: message}, function(resp){
            if(resp.success){
                var className = $(".input-text-comment").parent().attr("class");
                if(className.indexOf("reply-1") != "-1") className = "right-section reply-2";
                else className = "right-section  reply-1";
                var endReply = className.indexOf("reply-2") != "-1" ? "none" : "inline-block";
                var str = '<cofiddle-section class="'+className+'" data-comment-id="'+resp.newID+'">'+
                    '<cofiddle-avatar class="left-avatar username-left-align"><strong>You</strong></cofiddle-avatar>'+
                    '<cofiddle-comment class="left-content"><span class="content-comment">'+emojione.shortnameToImage(message)+'</span>'+
                    '</cofiddle-comment><span class="action-comment" data-comment-id="'+resp.newID+'">'+
                    '<span class="cofiddle-counter" style="display: '+endReply+'"><a class="count-number">0 replies <i class="fa fa-angle-down fa-1x icon-show-reply"></i></a></span>'+
                    '<span class="coffidle-reply-comment" style="display:'+endReply+'"><a class="rep-comment"  data-action="replyComment"><i class="fa fa-reply fa-1x"></i></a></span>'+
                    '<span><a class="del-comment" style="display:inline-block"><i class="fa fa-trash-o fa-1x"></i></a></span>'+
                '</cofiddle-section>';
                var $el = $(".input-text-comment").parent();

                if($el.attr("class").indexOf("root-comment") != "-1" || $el.attr("class").indexOf("cofiddle-scroll") != "-1") {
                    $("cofiddle-discussion").prepend(str);
                }
                else {
                    $(str).insertAfter($el);
                    //update comment counter
                    var count = parseInt($el.find(".count-number").text()),
                        count = count + 1;
                    if($el.find(".count-number").length > 0){
                        var strHTML = count + ' replies <i class="fa fa-angle-down fa-1x icon-show-reply"></i>';
                        $el.find(".count-number").html(strHTML);
                    }
                }
                if(className.indexOf("reply-1") != "-1"){
                    var totalCount = parseInt($(".root-comment").find(".count-number").text()),
                        totalCount = totalCount + 1;
                    $(".root-comment").find(".count-number").text(totalCount + " replies");
                }
                $(".input-text-comment").remove();
            }
        });
    },
    delComment : function(id, $el){
        var groupId = $("cofiddle-discussion").data().groupId;
        chrome.extension.sendMessage({action: "DELETE_COMMENT", commentId : id, groupId: groupId}, function(resp){
            if(resp.success){
                //remove child comment
                if($el.closest("cofiddle-section").hasClass("reply-1")){
                    var $parent = $el.closest("cofiddle-section");
                        while(typeof $parent.next().attr("class") != "undefined" && $parent.next().attr("class").indexOf("reply-2") != "-1"){
                            $parent.next().remove();
                            // $childReply = $el.closest("cofiddle-section").next()
                            //truong
                        }
                    $el.closest("cofiddle-section").remove();
                    var count = parseInt($(".root-comment .count-number").text()) - 1;
                    $(".root-comment .count-number").text(count +" Replies");
                }else{
                    //remove only current comment
                    if(!$el.closest("cofiddle-section").hasClass("root-comment")){
                        var $countParent = $el.closest("cofiddle-section").prevAll('.reply-1:first').find(".count-number");
                        //first element closest
                        var count = parseInt($countParent.text());
                        if(count > 0){
                            var strHTML = count - 1 + ' replies <i class="fa fa-angle-down fa-1x icon-show-reply"></i>'
                            $countParent.html(strHTML);
                        }
                        var $currentEl = $el.closest("cofiddle-section");
                        if($currentEl.next().hasClass("strike")){
                            if($currentEl.prev().hasClass("strike")){
                                $currentEl.prev().remove();
                            }else{
                                $currentEl.prev().addClass("no-bottom");
                            }
                        }
                        if($("#listComment .right-section").length == 1){
                            $(".separate-signin").remove();
                        }
                        $el.closest("cofiddle-section").remove();
                    }else{
                        //root comment, back to discussion
                        $("cofiddle-discussion").html("");
                        $("cofiddle-discussion").attr("data-page", 1);
                        var groupId = $("cofiddle-discussion").data().groupId;
                        $(".root-comment").remove();
                        hubControl.getComment(groupId);
                        sessionStorage.removeItem("currentPage");
                    }
                }
            }
        });
    },
    updateComment : function(){

    },
    inviteUser : function(){
        var groupId = $("cofiddle-discussion").data().groupId;
        chrome.extension.sendMessage({action: "OPEN_DIALOG_INVITE_USER", groupId: groupId});
    },
    getMember : function(){
        var groupId = $("cofiddle-discussion").data().groupId;
        chrome.extension.sendMessage({action: "GET_MEMBER_DISCUSSION", groupId: groupId}, function(res){
            if(res.success){
                var obj = res.data,
                    content = "",
                    count = obj.length > 5 ? 5 : obj.length;
                for(var i=0; i< count; i++){
                    content += "<p>"+obj[i]+"</p>";
                }
                if(obj.length > 5) content += "<p> and "+obj.length - count+" others</p>";
                $('#cofiddleMember').tooltipster({
                    position: 'top',
                    contentAsHTML: true,
                    content: content
                });
            }
        });
    },
    nextReply : function(replyId, offset, $el){
        var groupId = $("cofiddle-discussion").data().groupId;
        chrome.extension.sendMessage({action: "GET_REPLIES_COMMENT", cmtId: replyId, groupId: groupId, limit: 11, pageNumber: null, offset: offset}, function(res){
            if(res.success && !jQuery.isEmptyObject(res.data)){
                var obj = res.data;
                    strReply ="",
                    count = obj.length > 10 ? 10 : obj.length;
                for(var i=0; i< count; i++){
                    var isDel = obj[i].yourComment == 1 ? 'inline-block' : 'none';
                    var userName = obj[i].user.ID == sessionStorage.getItem("ID_User") ? "You" : obj[i].user.name;
                    strReply+= '<cofiddle-section class="right-section reply-2">'+
                                    '<cofiddle-avatar class="left-avatar username-left-align">'+userName+'</cofiddle-avatar>'+
                                    '<cofiddle-comment class="right-content"><span class="content-comment">'+obj[i].content+'</span></cofiddle-comment>'+
                                    '<span class="action-comment" data-comment-id="'+obj[i].ID+'">'+
                                        '<span><a class="del-comment" style="display:'+isDel+'"><i class="fa fa-trash-o fa-1x"></i></a></span>'+
                                    '</span>'+
                                '</cofiddle-section>';
                }
                $(strReply).insertBefore($el);
                setTimeout(function(){
                    $(".show-more-reply-1").prev().addClass("no-bottom");
                }, 300);
                //end of item
                if(obj.length < 10) $el.remove();
            }
        });
    },
    showReplies : function(commentId, dataComment, addTextbox, limit, pageNumber, showMore){
        limit = limit ? limit : 10;
        pageNumber = pageNumber ? pageNumber : 1;
        var offset = $(".show-more-reply").attr("data-value") ? $(".show-more-reply").attr("data-value") : 0 ;
        var groupId = $("cofiddle-discussion").data().groupId;
        chrome.extension.sendMessage({action: "GET_REPLIES_COMMENT", cmtId: commentId, groupId: groupId, limit: 11, offset: offset}, function(res){
            if(res.success){
                var obj = res.data;
                var $section = $("cofiddle-discussion");
                if(!showMore) $section.html("");
                // if(dataComment) hubControl.renderComment(dataComment.content, dataComment.commentTime, dataComment.commentId, 0, dataComment.userId, dataComment.userName, true, true);
                if(dataComment) hubControl.showRootComment(dataComment.content,dataComment.commentTime, dataComment.commentId, dataComment.numberReply, dataComment.userId, dataComment.userName);
                //check end reply
                var count = obj.length > 10 ? 10 : obj.length;
                for(var i = 0; i < count; i++){
                    hubControl.renderComment(obj[i].content, obj[i].commentTime, obj[i].ID, obj[i].numberReply, obj[i].user.ID, obj[i].user.name, true, null, 1);
                    if(obj[i].replies){
                        var data = obj[i].replies;
                        var countLevel2 = data.length > limit ? limit : data.length;
                        for(var j=0; j < data.length; j++){
                            hubControl.renderComment(data[j].content, data[j].commentTime, data[j].ID, data[j].numberReply, data[j].user.ID, data[j].user.name, true, null, 2);
                        }
                        //add show more of reply-1
                        if(data.length > limit){
                            var strShowMoreReply = '<span class="show-more-reply-1" data-comment-id="'+obj[i].ID+'" data-offset="11" style="display: inline-block">Show more...</span>';
                            $("cofiddle-discussion").append(strShowMoreReply);
                            $(".show-more-reply-1").hide();
                            setTimeout(function(){
                                $(".show-more-reply-1").prev().addClass("no-bottom");
                            }, 300);
                        }
                    }
                }
                if(obj.length > 10){
                    offset = parseInt(offset)+10;
                    var $strShowMore = $('<span class="show-more-reply" data-comment-id="'+commentId+'" data-value="'+offset+'" style="display: inline-block">Show more...</span>');
                    $section.append($strShowMore[0].outerHTML).css("height", "270px");
                    setTimeout(function(){
                        console.log($(".show-more-reply").prev().html());
                        $(".show-more-reply").prev().addClass("no-bottom");
                    }, 300);
                }

                sessionStorage.setItem("currentPage", "replies");
                $section.show();
                $("#cofiddleTitle").text("Replies");
                $("#cofiddleBack").attr("data-action", "backListComment");
                if(addTextbox){
                    $(".textarea-box-bottom").hide();
                    $("cofiddle-discussion").prepend(cofiddleHtml.insertTextBox);
                    setTimeout(function(){
                        $("#txtAddReply").focus();
                    }, 200);
                }else{
                    $(".textarea-box-bottom").hide();
                }
            }
        })
    },
    showMoreListDiscussion : function(){
        if($(this).scrollTop() + $(this).innerHeight()>=$(this)[0].scrollHeight){
            hubControl.showActivity(true);
        }
    },
    showMoreComment : function(event){
        if(!setting.loadMoreComment || !$("#listComment").is(":visible")) return;
        if($("#listComment").scrollTop() + $("#listComment").innerHeight()>=$("#listComment")[0].scrollHeight){
            var groupId = $("cofiddle-discussion").data().groupId;
            hubControl.getComment(groupId);
        }
    },
    //mark up tool
    showMarkupTools : function(){
        if($(".image-markup-tools").is(":visible")) return;
        inject.html("beforeend", cofiddleHtml.markupTools);
        if(sessionStorage.getItem("markupImage") == "1"){
            $(".markup-selected i").show();
            $(".cofiddle-markup-opition").addClass("option-selected");
        }else{
            $(".markup-selected i").hide();
            $(".cofiddle-markup-opition").removeClass("option-selected");
        }
    },
    imageMarkup : function(){
        var $el = $(".markup-selected i");
        if($el.is(":visible")) {
            $el.hide();
            sessionStorage.setItem("markupImage", 0);
            // $('html').css({'cursor': 'default'});
        }
        else {
            $el.show();
            sessionStorage.setItem("markupImage", 1);
            // $('html').css({'cursor': 'url(chrome-extension://hbchcjeppddbockfcdiejdpnimjbdcpm/images/c2.cur), default'});
        }
        $(".cofiddle-box-activity").remove();
    },
    showShareTool : function(){
        $(".cofiddle-box-activity").remove();
        cofiddleHtml.shareTools(function(str){
            inject.html("beforeend", str);
        })
    },
    initTooltip : function($el){
        $el.tooltipster({
            position: 'top',
            contentAsHTML: true
        });
    }
};
$(function(){
    //remove session when page redirect
    sessionStorage.removeItem("isBlackList");
    sessionStorage.removeItem("isRobot");

    cofiddleGuide.showTour();
    inject.html("beforeend", cofiddleHtml.logoIcon);
    inject.html("beforeend", cofiddleHtml.hubModal);

    setTimeout(function(){
        // $(".cofiddle-exclusion").attr("title",  cofiddleGuide.toolTipExclusion());
        $('.cofiddle-modal-hub .cofiddle-tooltip').tooltipster({
            position: 'top',
            contentAsHTML: true
        });
        $('.cofiddle-exclusion').tooltipster({
            position: 'top',
            contentAsHTML: true,
            functionInit: function(origin, content) {
                  return cofiddleGuide.toolTipExclusion();
            }
        });
    }, 1000);

    inject.html("beforeend", cofiddleHtml.hubNotication);
    cofiddleGuide.initEvent();
    //save session user id
    //remove old user id
    sessionStorage.removeItem("ID_User");
    chrome.runtime.sendMessage({action: "SESSION_USER_ID"}, function(id){
        sessionStorage.setItem("ID_User", id);
    });
});
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    switch (msg.action) {
    case 'CHECK_TOUR_SEARCH_ALERT':
        chrome.runtime.sendMessage({action: "GET_CURRENT_TOUR_STEP"}, function(resp){
            if(resp.searchAlert != "-1"){
                if($(".cofiddle-modal").length > 0) return;
                inject.html("beforeend", cofiddleHtml.searchAlert);
            }
        });
        break;
    case "CHECK_TOUR_CACHE":
        inject.html("beforeend", cofiddleHtml.dimmer);
        inject.html("beforeend", cofiddleHtml.notCache);
        break;
    case 'PAGE_LOADED':
        var cacheData = window.CACHE_DATA,
            newPage = true;
        if (cacheData) {
            var url = cacheData.url,
                newUrl = getLocation();
            if(url != newUrl){
                removedRatio = diffContent(cacheData.text, $('body').prop('textContent'));
                console.log('removedRatio', removedRatio);
                if (removedRatio > 0.05) {
                    sessionStorage.removeItem("cached");
                    sessionStorage.removeItem("isBlackList");
                    sessionStorage.removeItem("currentPage");
                    sessionStorage.removeItem("isRobot");
                    removeAnnotations($('html'));
                    //remove cache data
                    window.CACHE_ID = window.CACHE_DATA = null;
                    $("#cacheId").remove();
                    $("#neeahHdUrlExists").remove();
                } else newPage = false;
            } else newPage = false;
        }
        if (newPage && !Utils.isUrlImg(window.location.href)) {
            window.registeredUrl = getLocation();
            if (msg.autoCache) {
                addNewCache();
            } else if (msg.autoJournal) {
                chrome.runtime.sendMessage({action: 'ADD_DOCUMENT'});
            }
            //check BlackList
            chrome.runtime.sendMessage({ action: "CHECK_BLACKLIST_OR_ROBOT", url: window.registeredUrl }, function(resp){
                if(resp){
                    sessionStorage.setItem("isBlackList", resp.isBlackList);
                    sessionStorage.setItem("isRobot", resp.isRobot);
                }
            });
            chrome.runtime.sendMessage({action: "CHECK_DISCUSSION", url: window.registeredUrl}, function(res){
                if(!res) $("#iconComment").addClass("disabled-icon");
            });
        }
        break;
    }
});
