var UITag = {
    tag : function(elment ,obj, Tooltip){
        var html = "";

        for(var i=0; i<obj.length; i++) {
            //1 page tag, 0 session tag
            var isPageTag = obj[i].isPageTag == "1" ? "1" : "0";
            var colorTag = obj[i].isPageTag == "1" ? "color:#AFAEAE" : "color:rgb(251, 136, 68)";
            var  strPin = isPageTag == "1" ? Tooltip.pin : Tooltip.Unpin ;
            var tagName = obj[i].tagName.length > 15 ? Utils.trunkString(obj[i].tagName, 15)+"..." : obj[i].tagName;
            html+= '<label class="tag">';
            html+= '    <input type="hidden" class="hdPin" value="'+ isPageTag +'">';
            html+= '    <input type="hidden" class="hdTagName" value="'+ obj[i].tagName +'">';
            html+= '    <input type="hidden" class="hdTagID" value="'+ obj[i].ID +'">';
            html+= '    <a class="tag-pin" title="'+ strPin +'" style="'+ colorTag +'"><i class="fa fa-thumb-tack fa-1x"></i></a>';
            html+= '    <a class="tag-action" title="'+ Tooltip.select +'">'+ tagName +'</a><a class="tag-delete" title="'+Tooltip.remove+'">x</a>';
            html+= '</label>'
        }
        $("#"+elment).append(html);
        //init tooltip
        $('.tag a').tooltipster({
            contentAsHTML: true,
            position: 'bottom'
        });
    },

    remove : function(obj){
        $(obj).closest('label').remove();
    },

    //1 is page tag, 0 is session tag
    pin : function(obj){
        $(obj).css("color", "rgb(251, 136, 68)");
        $(obj).closest('label').find('.hdPin').val("0");
    },

    unpin : function(obj){
        $(obj).css("color", "#AFAEAE");
        $(obj).closest('label').find('.hdPin').val("1");
    }

};

var UIIframe = {
    create : function(tabId, url){
      return "var divIframe = document.createElement( 'div' );" +
            "document.body.appendChild(divIframe);" +
            "divIframe.id = 'neeah-iframe';" +
            "divIframe.style.position = 'fixed';" +
            "divIframe.style.width = '500px';" +
            "divIframe.style.height = '340px';" +
            "divIframe.style.bottom = '0';" +
            "divIframe.style.left = '86%';" +
            "divIframe.style.top = '53%';" +
            "divIframe.style.zIndex = '99999';" +
            "divIframe.style.transform = 'translate(-50%, -50%)';" +
            "var iframe = document.createElement('iframe');" +
            "iframe.setAttribute('src', '" + url + "');" +
            "iframe.setAttribute('style', 'border:none; width:500px; height:500px');" +
            "iframe.setAttribute('scrolling', 'no');" +
            "iframe.setAttribute('frameborder', '0');" +
            "divIframe.appendChild(iframe);";
    }
};

var UIIntro = {
    openIntro : function (url) {
        return "var divIntro = document.createElement( 'div' );" +
            "document.body.appendChild( divIntro );" +
            "divIntro.id = 'divIntro';" +
            "divIntro.style.position = 'fixed';" +
            "divIntro.style.top = '0';" +
            "divIntro.style.left = '0';" +
            "divIntro.style.width = '100%';" +
            "divIntro.style.height = '100%';" +
            "divIntro.style.zIndex = '99999999';" +

            "var iframe = document.createElement('iframe');" +
            "iframe.setAttribute('src', '"+url+"');" +
            "iframe.setAttribute('style', 'border:none; width:100%; height:100%');" +
            "iframe.setAttribute('scrolling', 'no');" +
            "iframe.setAttribute('frameborder', '0');" +
            "divIntro.appendChild(iframe);";
    }
};

var UIblanket = new function() {
    var blanket = "var divBlanket = document.createElement( 'div' );" +
        "document.body.appendChild( divBlanket );" +
        "divBlanket.id = 'divBlanket';" +
        "divBlanket.style.position = 'fixed';" +
        "divBlanket.style.top = '0';" +
        "divBlanket.style.left = '0';" +
        "divBlanket.style.width = '100%';" +
        "divBlanket.style.height = '100%';" +
        "divBlanket.style.zIndex = '9999';" +
        "divBlanket.style.backgroundColor = '#000';" +
        "divBlanket.style.opacity = '0.5';";

    this.get = blanket;

};
var UIshare  = {

    dialogshare : function(url){
        return "var divShare = document.createElement( 'div' );" +
            "document.body.appendChild( divShare );" +
            "divShare.id = 'divShare';" +
            "divShare.style.position = 'fixed';" +
            "divShare.style.top = '40%';" +
            "divShare.style.left = '55%';" +
            "divShare.style.width = '52%';" +
            "divShare.style.height = '500px';" +
            "divShare.style.zIndex = '99999999';" +
            "divShare.style.transform = 'translate(-51%, -45%)';" +
            "divShare.style.webkitFilter = 'blur(0)';" +
            "divShare.style.mozFilter = 'blur(0)';" +
            "divShare.style.oFilter = 'blur(0)';" +
            "divShare.style.msFilter = 'blur(0)';" +
            "divShare.style.Filter = 'blur(0)';" +

            "var iframe = document.createElement('iframe');" +
            "iframe.setAttribute('src', '"+url+"');" +
            "iframe.setAttribute('style', 'border:none; width:600px; height:700px');" +
            "iframe.setAttribute('scrolling', 'no');" +
            "iframe.setAttribute('frameborder', '0');" +
            "divShare.appendChild(iframe);";
    },

    showEmail : function(email, element){
        var html = '<label class="email-share">' +
            '<a class="email-name">' + email + '</a>' +
            '<a class="email-remove">x</a>' +
            '</label>';
        $("#"+element).append(html);
    }
};

var UIComment = {
    create : function (obj, value, commentTime) {
        var html = "";
        html += "<div class='list-cmt' id='" + obj.ID + "'>";
        html += "<p class='cmt-info'>";
        html += "<input type='hidden' class='hdReplyValue' value='"+value+"'>";
        html += "<input type='hidden' class='idCmt'  value='" + obj.ID + "'>";
        html += "<input type='hidden' class='idUserCmt' value='" + obj.user.ID + "'>";
        html += "<label class='name' >" + obj.user.name + "</label>";
        html += "<label class='postday' >" + commentTime + "</label>";
        html += "<span>";
        html += "</span>";
        html += "</p>";
        html += "<p class='cmt-post' data-bind='text:content'>" + emojione.shortnameToImage(obj.content) + "</p>";
        html += "</div>";

        return html;
    }
};
var UIpopupAnnotate = {
    create: function(url, html){
        var nameFunc = 'closeMessage() { document.getElementById("annotate-show-popup").style.display = "none";}';
        return [
            'var d = document.createElement("div");',
            'd.setAttribute("id","annotate-show-popup");',
            'd.setAttribute("style", "'
            + 'background-color: #fff; '
            + 'border: 1px solid rgb(251, 136, 68); '
            + 'width: 345px'
            + ';height: 55px; '
            + 'position: absolute; '
            + 'top: 10px; '
            + 'padding-top: 5px; '
            + 'right: 10px; '
            + 'z-index: 999999; '
            + 'border-radius: 5px;'
            + '");',
            'document.body.appendChild(d);',
            //close
            'var close = document.createElement("a");',
            'close.setAttribute("onclick","closeMessage();");',
            'close.innerHTML = "x"',
            'close.setAttribute("style", "'
            + 'position: absolute; '
            + 'right: 8px; '
            + 'margin-left: 20px; '
            + 'cursor: pointer; '
            + 'font-weight: bold; '
            + 'font-size: 1em; '
            + 'margin-top: -7px; '
            + 'color: #b1b1b1; '
            + '");',
            'var script = document.createElement("script");',
            'script.setAttribute("type", "text/javascript");',
            'script.innerHTML=function ' + nameFunc,

            'var pText = document.createElement("p");',
            'pText.setAttribute("id","link_neeah");',
            'pText.setAttribute("style", "'
            + 'position: absolute; '
            + 'margin-top: 7px; '
            + 'margin-left: 20px; '
            + 'color: #434a54; '
            + 'width: 300px; '
            + 'font-size: 0.75em;'
            + 'cursor: pointer; '
            + 'text-decoration: none;'
            + '");',
            'pText.innerHTML = "' + html + ' "',
            'd.appendChild(pText)',
            'd.appendChild(close)',
            'd.appendChild(script)'
        ].join("\n");
    }
};
var UIhidden = {
    create: function(id, value){
        var str =  "var hdName = document.createElement('input');"+
                    "hdName.type = 'hidden';"+
                    "hdName.value = '"+value+"';"+
                    "hdName.id= '"+ id+"';"+
                    "document.body.appendChild(hdName)";
        return str;
    }
};

var UISearch = {
    mini : function (keySearch, width, result, host) {
        var nameFunc = 'closeMessage() { document.getElementById("intercept-search").style.display = "none";}';
        var fontSize = (host == "search.aol.com") ? "0.813em" : "100%";
        return [
            'var d = document.createElement("div");',
            'd.setAttribute("id","intercept-search");',
            'd.setAttribute("style", "'
            + 'background-color: #FF7F27; '
            + 'width:' + width
            + ';height: 40px; '
            + 'position: absolute; '
            + 'top: 10px; '
            + 'right: 10px; '
            + 'z-index: 999999; '
            + 'border-radius: 5px;'
            + 'box-shadow: 1px 1px 0 #FF7F27;'
            + 'font-size:' + fontSize
            + ';white-space: nowrap;'
            + '");',
            'document.body.appendChild(d);',
            'var dChild = document.createElement("div");',

            'var a = document.createElement("a");',
            'a.setAttribute("onclick","openNeeah();");',
            'a.setAttribute("target","_blank");',
            'a.setAttribute("id","link_neeah");',
            'a.setAttribute("style", "'
            + 'position: absolute; '
            + 'margin-top: 12px; '
            + 'margin-left: 20px; '
            + 'color: white; '
            + 'cursor: pointer; '
            + 'text-decoration: none;'
            + '");',
            'a.innerHTML = "' + result + ' "',

            'var close = document.createElement("a");',
            'close.setAttribute("onclick","closeMessage();");',
            'close.innerHTML = "x"',
            'close.setAttribute("style", "'
            + 'position: absolute; '
            + 'right: 8px; '
            + 'margin-left: 20px; '
            + 'cursor: pointer; '
            + 'font-weight: bold; '
            + 'font-size: 1.5em; '
            + 'margin-top: 7px; '
            + 'color: white; '
            + '");',
            'var script = document.createElement("script");',
            'script.setAttribute("type", "text/javascript");',
            'script.innerHTML=function ' + nameFunc,

            'var script1 = document.createElement("script");',
            'script1.setAttribute("type", "text/javascript");',
            'script1.innerHTML=function openNeeah(){window.open("' + config.url() + '/app/search?q=' + keySearch + '&page=1&intercept=1");}',

            'd.appendChild(dChild);',
            'dChild.appendChild(a);',
            'dChild.appendChild(close);',
            'd.appendChild(script);',
            'd.appendChild(script1);'
        ].join("\n");
    },

    expand : function(url){
        return "var divIntercept = document.createElement( 'div' );" +
            "document.body.appendChild( divIntercept );" +
            "divIntercept.id = 'intercept-search';" +
            "divIntercept.style.position = 'absolute';" +
            "divIntercept.style.top = '10px';" +
            "divIntercept.style.right = '0';" +
            "divIntercept.style.zIndex = '99999';" +
            "divIntercept.style.width = '440px';" +
            "var iframe = document.createElement('iframe');" +
            "iframe.setAttribute('src', '"+url+"');" +
            "iframe.setAttribute('style', 'border:none; width:435px; height:230px');" +
            "iframe.setAttribute('scrolling', 'no');" +
            "iframe.setAttribute('frameborder', '0');" +
            "divIntercept.appendChild(iframe);";
    }
};
