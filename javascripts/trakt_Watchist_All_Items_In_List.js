//复制粘贴到控制栏，自动将当前列表所有 未观看/未添加列表 的电影加入watchlist 方便radarr抓取

setTimeout(() => {
    let token;
    $("head > meta").each(function () {
        if ($(this).attr('name') == 'csrf-token') token = $(this).attr('content');
    })
    //console.log(token);
    if (token) {
        $("#sortable-grid > div").each(function (num) {
            console.log('processing: ' + num);
            if ($(this).find('div.quick-icons.smaller > div.actions > a.watch.selected').length + $(this).find('div.quick-icons.smaller > div.actions > a.list.selected').length)
                return;
            //else
            console.log('keep processing: ' + num);
            let id;
            try { id = this.getAttribute('data-movie-id'); }
            catch (e) { console.error(e); return; }
            let name = this.getAttribute('data-url');
            let trakturl = 'https://trakt.tv' + name + '/watchlist';
            console.log(id + ' ' + trakturl);
            fetch(trakturl, {
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
                "referrer": document.URL,
                "referrerPolicy": "strict-origin-when-cross-origin",
                "body": "type=movie&trakt_id=" + id,
                "method": "POST",
                "mode": "cors",
                "credentials": "include"
            }).then(function (response) {
                console.log('返回了:' + response.status);
                if (response.ok);
            });
        })
    }
}, 5000);
