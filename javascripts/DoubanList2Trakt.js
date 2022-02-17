// ==UserScript==
// @name        豆瓣想看转trakt
// @namespace   Violentmonkey Scripts
// @match       *://movie.douban.com/people/goku911/wish
// @match       *://trakt.tv/movies/*
// @match       *://trakt.tv/shows/*
// @match       *://trakt.tv/search/imdb*
// @match       *://www.douban.com/doulist/*
// @match       *://movie.douban.com/subject/*
// @version     1.0
// @author      -
// @description 2022/1/27 上午11:42:01
// ==/UserScript==
function openTrakturl(url) {
    fetch(url).then(function (response) {
        return response.text();
    }).then(function (html) {
        let parser = new DOMParser();
        let doc = parser.parseFromString(html, 'text/html');
        if (!(document.querySelector("#content > div.grid-16-8.clearfix > div.article > div.episode_list"))) {
            let trakturl = 'https://trakt.tv/search/imdb?query=' + $(doc).find("#info span.pl:contains('IMDb')")[0].nextSibling.nodeValue.trim();
            if (trakturl) window.open(trakturl, 'gokutaggg' + url);
            //GM_openInTab($(this).find('a')[0].href)
        }
    })
}

function openDoubanUrl(List) {
    for (index in List) {
        window.open(List[index], 'gokuTagDouban' + index);
    }
}


(function () {
    if (document.URL.match('imdb') && document.URL.match('trakt') && window.name.match('gokutaggg')) {
        if ($('body > div.frame-wrapper > div.sidenav > div > h2 > strong:nth-child(1)')[0].innerHTML == '0') window.close();
    }
    if (document.URL.match('wish') && document.URL.match('douban')) {
        $("#db-usr-profile > div.info > ul > li:nth-child(13)").after('<a href="javascript:void(0);" id="batchOpenTrakt">转trakt</a>');
        $("#batchOpenTrakt").click(function () {
            $('ul.list-view > li').each(function () {
                openTrakturl($(this).find('a')[0].href);
            });
        })
    }
    else if (document.URL.match('doulist') && document.URL.match('douban')) {
        let list = []
        $('#content > div > div.article > div.doulist-filter > a:nth-child(5)').after('<span> · </span><a href="javascript:void(0);" id="batchOpenDouban">转trakt</a>');

        $('#content > div > div.article > div.doulist-filter > a:nth-child(5)').after('<span> · </span><a href="javascript:void(0);" id="showAll">showAll</a>');
        $("#showAll").click(function () {
            console.log('start showall');
            $('#showAll').attr('id', '');
            let pageNow = Number($('#content > div > div.article > div.paginator > span.thispage')[0].innerText);
            let pageTtl = Number($('#content > div > div.article > div.paginator > span.thispage')[0].getAttribute('data-total-page'));
            let $insertPos = $('#content > div > div.article > div.doulist-item:last');
            while (pageNow < pageTtl) {
                fetch(document.URL.replace(/start=\d+/, 'start=' + pageNow * 25))
                    .then(function (response) {
                        return response.text();
                    })
                    .then(function (html) {
                        let parser = new DOMParser();
                        let doc = parser.parseFromString(html, 'text/html');
                        $insertPos.after($(doc).find('#content > div > div.article > div.doulist-item'));
                    })
                pageNow++;
            }

        })

        $("#batchOpenDouban").click(function () {
            $('#batchOpenDouban').attr('id', '')

            let pageNow = $('#content > div > div.article > div.paginator > span.thispage')[0].innerText;
            let pageTtl = $('#content > div > div.article > div.paginator > span.thispage')[0].getAttribute('data-total-page');
            $('#content > div > div.article > div.doulist-item').each(function () {
                try {
                    list.push($(this).find('div > div.bd.doulist-subject > div.title > a')[0].href);
                }
                catch (e) { console.error(e); }
                //openTrakturl(url);
            })
            openDoubanUrl(list);
            if (pageNow == pageTtl) window.close();
            if (pageNow != pageTtl && pageNow != 1)
                window.open(document.URL.replace(/start=\d+/, 'start=' + pageNow * 25), target = '_self');
            else if (pageNow == 1 && pageTtl != 1)
                window.open(document.URL + '&start=25', target = '_self');
        })
    }
    else if (document.URL.match('subject') && window.name.match('gokuTagDouban')) {
        setTimeout(function () {
            console.log('working');
            let url = document.URL;
            //openTrakturl(url);
            let trakturl
            try {
                trakturl = 'https://trakt.tv/search/imdb?query=' + $("#info span.pl:contains('IMDb')")[0].nextSibling.nodeValue.trim();
            } catch (e) { console.error(e); }
            if (trakturl) window.open(trakturl, 'gokutaggg' + url);

            if (!$('#interest_sect_level > div > a').length) {
                let ck = $('#db-global-nav > div > div.top-nav-info > ul > li.nav-user-account > div > table > tbody > tr:nth-child(5) > td > a')[0].href.split('=').pop();
                fetch(url.replace("com/subject", 'com/j/subject') + "interest", {
                    "headers": {
                        "accept": "application/json, text/javascript, */*; q=0.01",
                        "accept-language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7",
                        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                        "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"98\", \"Google Chrome\";v=\"98\"",
                        "sec-ch-ua-mobile": "?0",
                        "sec-ch-ua-platform": "\"Windows\"",
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "x-requested-with": "XMLHttpRequest"
                    },
                    "referrer": document.URL,
                    "referrerPolicy": "unsafe-url",
                    "body": "ck=" + ck + "&interest=wish&foldcollect=F&tags=&comment=",
                    "method": "POST",
                    "mode": "cors",
                    "credentials": "include"
                }).then(function (response) {
                    console.log('返回了:' + response.status);
                    if (response.ok) window.close();
                });;
            }
            else window.close();
        }, 2000)

    }
    else if (document.URL.match('movies') && document.URL.match('trakt') && window.name.match('gokutaggg')) {
        {
            let cnt = 0;
            let interval = setInterval(() => {
                if (document.querySelector("#overview > div:nth-child(2) > div.col-lg-4.col-md-5.action-buttons > a.btn.btn-block.btn-summary.btn-list.selected")) window.close();
                else if (document.querySelector("#overview > div:nth-child(2) > div.col-lg-4.col-md-5.action-buttons > a.btn.btn-block.btn-summary.btn-watch.selected")) window.close();
                else if (document.URL.match('show')) window.close();
                else {
                    console.log("shittttt");
                    let token;
                    try {
                        $("head > meta").each(function () {
                            if ($(this).attr('name') == 'csrf-token') token = $(this).attr('content');
                        })
                    }
                    catch (e) { console.error(e); }
                    if (token) {
                        let trakturl = document.URL;
                        let traktid = document.querySelector("#summary-ratings-wrapper > div > div > div > ul.ratings > li.summary-user-rating").getAttribute('data-movie-id');
                        fetch(trakturl + "/watchlist", {
                            "headers": {
                                "accept": "*/*",
                                "accept-language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7",
                                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                                "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"98\", \"Google Chrome\";v=\"98\"",
                                "sec-ch-ua-mobile": "?0",
                                "sec-ch-ua-platform": "\"Windows\"",
                                "sec-fetch-dest": "empty",
                                "sec-fetch-mode": "cors",
                                "sec-fetch-site": "same-origin",
                                "x-csrf-token": token,
                                "x-requested-with": "XMLHttpRequest"
                            },
                            "referrer": trakturl,
                            "referrerPolicy": "strict-origin-when-cross-origin",
                            "body": "type=movie&trakt_id=" + traktid,
                            "method": "POST",
                            "mode": "cors",
                            "credentials": "include"
                        }).then(function (response) {
                            console.log('返回了:' + response.status);
                            if (response.ok) window.close();
                        });
                    }
                }
                if (cnt > 2) clearInterval(interval);
            }, 5000);

        }
        //window.close();
    }
})();
