if (typeof ajax != 'undefined'){

    console.error('ajax definition failure');

} else{

/*
    var ajax = {};
    ajax.x = function () {
        if (typeof XMLHttpRequest !== 'undefined') {
            return new XMLHttpRequest();
        }
        var versions = [
            "MSXML2.XmlHttp.6.0",
            "MSXML2.XmlHttp.5.0",
            "MSXML2.XmlHttp.4.0",
            "MSXML2.XmlHttp.3.0",
            "MSXML2.XmlHttp.2.0",
            "Microsoft.XmlHttp"
        ];

        var xhr;
        for (var i = 0; i < versions.length; i++) {
            try {
                xhr = new ActiveXObject(versions[i]);
                break;
            } catch (e) {
            }
        }
        return xhr;
    };

    ajax.send = function (url, callback, method, data, async) {
        if (async === undefined) {
            async = true;
        }
        var x = ajax.x();
        x.open(method, url, async);
        x.onreadystatechange = function () {
            if (x.readyState == 4) {
                if (typeof callback == 'function') callback(x.responseText);
            }
        };
        if (method == 'POST' || method == 'DELETE') {
            x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        }
        x.send(data)
    };

    ajax.get = function (url, data, callback, async) {
        var query = [];
        for (var key in data) {
            query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
        }
        ajax.send(url + (query.length ? '?' + query.join('&') : ''), callback, 'GET', null, async)
    };

    ajax.post = function (url, data, callback, async) {
        var query = [];
        for (var key in data) {
            query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
        }
        ajax.send(url, callback, 'POST', query.join('&'), async)
    };

    ajax.delete = function (url, data, callback, async) {
        var query = [];
        for (var key in data) {
            query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
        }
        ajax.send(url, callback, 'DELETE', query.join('&'), async)
    };
*/


    var ajax = {};
    ajax.delete = function(url, data, callback, args){
        ajax.ajax('DELETE', url, ajax.transformQuery(data), callback, args);
    }
    ajax.post = function(url, data, callback, args){
        ajax.ajax('POST', url, ajax.transformQuery(data), callback, args);
    }
    ajax.upload = function(data, callback, args){
        ajax.ajaxupload('/upload', data, callback, args);
    }

    ajax.transformQuery = function(data){
        var query = [];
        for (var key in data) {
            query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
        }
        return query.join('&');
    }

    ajax.ajax = function(method, url, data, callback, args, isUpload){
        var xhr = new XMLHttpRequest()
        xhr.open(method, url, true)
        if (!isUpload){
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
        }
        xhr.send(data)
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 &&
                typeof callback == 'function'){

                if (Array.isArray(args)){
                    args.unshift(x.responseText);
                    callback.apply(null, args)
                } else{
                    callback(xhr.responseText, args);
                }
            }

        }
    }

    ajax.ajaxupload = function(url, data, callback, args, isUpload){
        if (data instanceof FormData){
            ajax.ajax('POST', url, data, callback, args, true)
        } else {
            var formData = new FormData()
            for (keys in data){
                formData.append(keys, data[keys])
            }
            ajax.ajax('POST', url, formData, callback, args, true)
        }
    }
}

function convertDom(str){
    var div = document.createElement('div')
    div.innerHTML = str
    if (div.childNodes.length){
        return div.childNodes[0]
    } else{
        return null
    }
}

function insertDomBefore(contentElem, targetElem){

    if (isDom(contentElem) && isDom(targetElem)){
        var targetParent = targetElem.parentElement;

        if (targetParent.nodeName &&
            (targetParent.nodeName != "HTML" ||
            targetParent.nodeName != "HEAD")){
            targetParent.insertBefore(contentElem, targetElem);
        }

    } else {
        console.log('Object must be DOM elements');
    }


}

function isDom(elem){
    return (elem.nodeName);
}

function elemsByData(dataName, dataValue, identifier){
    var elem = document.getElementById(identifier);
    if (elem){
        elem = [elem];
    } else {
        elem = document.getElementsByClassName(identifier);
    }
    if (!elem.length) elem = document.getElementsByName(identifier);
    if (!elem.length) elem = document.getElementsByTagName(identifier);
    if (elem.length){
        var outputArr = [];
        var elemList = [].slice.call(elem);
        for (var i = 0; i < elemList.length; i++) {
            if (elemList[i].dataset.hasOwnProperty(dataName)){
                if (elemList[i].dataset[dataName] === dataValue) outputArr.push(elemList[i]);
            }
        }
        return outputArr;
    }
    console.error('No element-data match');
    return null;
}


function hasClass(elem, className){
    var list = [].slice.call(elem.classList);
    if (elem.nodeName){
        for (var i = list.length - 1; i >= 0; i--) {
             if (list[i] == className) return true;
        }
        return false;
    } else{
        console.log('Object must be DOM elements');
    }
}