// ==UserScript==
// @name         SosacToKodi
// @namespace    kodisosac
// @version      0.1
// @description  try to take over the world!
// @author       long
// @match        http://movies.sosac.tv/cs/player/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js
// ==/UserScript==

(function() {
    'use strict';
    function a2hex(str) {
        var arr = [];
        for (var i = 0, l = str.length; i < l; i ++) {
            var hex = Number(str.charCodeAt(i)).toString(16);
            arr.push(hex);
        }
        return arr.join('');
    }

    function pluginUrl(plugin, params) {
        var str = 'plugin://'+plugin+'/?';
        for (var key in params) {
            str += key + '=' + a2hex(params[key]) + '&';
        }
        return str;
    }

    function extractUrl(){
        var urls=[];
        const regex = /www\.streamuj\.tv\/video\/(\w+)(\?)?/g;
        $("iframe[src^='http://www.streamuj.tv/video/']").each(function() {
            var src = $(this).attr("src");
            var m = regex.exec(src);
            if(m !== null)
            {
                var id = m[1];
                console.log(id);
                var url = pluginUrl('plugin.video.sosac.ph', {
                    play: id,
                    cp: 'sosac.ph',
                    title: 'title'
                });
                console.log(url);
                urls.push(url);
            }
        });
        return urls;
    }

    function setupIpPort(ipport)
    {
        console.log("testing ipport");
        while(!/^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\:[0-9]{1,4}$/.test(ipport))
        {
            ipport = prompt("Please enter kodis ip:port", "127.0.0.1:8080");
            GM_setValue("sos_ipport", ipport);
        }
    }

    function getIpPort()
    {
        var ipport = GM_getValue("sos_ipport", "");
        console.log(ipport);
        if(!ipport || 0 === ipport.length)
        {
            setupIpPort(ipport);
        }
        return ipport;
    }

    function playInKodi(url){
        var ipport = getIpPort();

        //construct url for the RPC call
        url = encodeURIComponent(url);
        var json = "{ \"jsonrpc\": \"2.0\", \"method\": \"Player.Open\", \"params\": { \"item\": { \"file\": \""+url+"\" } }, \"id\": 1 }";
        var rpcUrl = "http://"+ipport+"/jsonrpc?request="+json;
        console.log(rpcUrl);
        GM_xmlhttpRequest({
            method: "GET",
            url: rpcUrl,
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Accept": "application/json, text/javascript, */*; q=0.01"
            },
            onload: function(response) {
                try {
                    var result = JSON.parse(response.responseText);
                    console.log(result);
                }
                catch(err) {
                    console.log(err);
                   
                }
            }
        });
    }

    function play()
    {
        var urls = extractUrl();
        if(urls.length > 0)
        {
            playInKodi(urls[0]);
        }
    }

    function setupUI()
    {
        var spanToAddStuff = $("span.additionald");
        var ipport = GM_getValue("sos_ipport", "");
        var ipPortButton = $("<button type=\"button\">Kodi address:"+ipport+"</button>");

        var playButton = $("<button type=\"button\">Play in kodi</button>");
        spanToAddStuff.append(" ");
        ipPortButton.appendTo(spanToAddStuff);
        spanToAddStuff.append(" ");
        playButton.appendTo(spanToAddStuff);

        ipPortButton.click(function() {setupIpPort("");});
        ipPortButton.click(play);
    }

    setupUI();
})();
