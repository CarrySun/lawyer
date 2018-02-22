var mongoose = require('mongoose')
var db = 'mongodb://localhost/lawyer'
mongoose.Promise = require('bluebird')
mongoose.connect(db, {
    useMongoClient: true
})
var cheerio = require('cheerio');
var request = require('request');
var async = require('async');
var Lawyer = require('./models/lawyer')
var baseUrl = "http://lawyer.110.com/lawyer/class/cid/";
var pageUrl = 'http://lawyer.110.com/lawyer/class/cid/1/p/';
var lawyerUrlArr = [];
var count = 0;
var start = new Date().getTime();

var i = 1;
var options = {
    method: 'GET',
    charset: "utf-8",
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.93 Safari/537.36",
    }
};
//抓取每一类的数据
function fetchType(url) {
    options.url = url + i;
    var min = ((new Date().getTime() - start) / 1000 / 60).toFixed(1);
    // console.log('~~~~~~~~~~~~~~~~~当前为第' + i + '类~~~~~~~~~~~~~~~~~');
    request(options, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            $ = cheerio.load(body);
            var totalNum = $('.page-totlerecord').text();
            var totalPage = 1;
            var index;
            if (totalNum != '当前只有一页') {
                totalPage = $('.page-totlepages').text();
                index = totalPage.indexOf('/') + 1;
                totalPage = totalPage.slice(index)
            }
            // console.log('共'+totalNum+'条数据');
            // console.log('共'+totalPage+'页');
            var pageUrls = [];
            for (var j = 0; j < totalPage; j++) {
                pageUrl = 'http://lawyer.110.com/lawyer/class/cid/' + i + '/p/' + (j + 1);
                pageUrls.push(pageUrl)
            }
            async.mapLimit(pageUrls, 10, function(url, callback) {
                var header = {
                    url: url,
                    method: 'GET',
                    charset: "utf-8",
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.93 Safari/537.36",
                    }
                }
                request(header, function(error, response, body) {
                    if (!error && response.statusCode == 200) {
                        $ = cheerio.load(body);
                        fetchPage(body, url, totalNum, callback);
                    } else if (error) {
                        console.log('出错：pageUrls=' + url);
                        console.log(error);
                    } else {
                        console.log(response.statusCode);
                    }
                })
            })

            if (i < 70) {
                i++;
                fetchType(baseUrl)
            } else {
                var min = ((new Date().getTime() - start) / 1000 / 60).toFixed(2);
                console.log('共抓取' + lawyerUrlArr.length + '条数据，花费了' + min + '分钟')
                console.log(lawyerUrlArr)
            }
        } else if (error) {
            console.log('出错：fetchType=' + url);
            console.log(error);
        } else {
            console.log(response.statusCode);
        }
    })
}
//抓取每一页的数据
function fetchPage(body, url, totalNum, callback) {
    // console.log("---------正在爬取的是"+url+'--------------');
    var lawyerUrls = []
    $ = cheerio.load(body);
    $('.p01txt').each(function(index, element) {
        lawyerUrls.push(
            $(element).find('span[class = s01]').children()[0].attribs.href
        );
        lawyerUrlArr.push(
            $(element).find('span[class = s01]').children()[0].attribs.href
        );
    })
    async.mapLimit(lawyerUrls, 10, function(url, callback) {
        var header = {
            url: url,
            method: 'GET',
            charset: "utf-8",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.93 Safari/537.36",
            }
        }
        request(header, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                $ = cheerio.load(body);
                fetchContent(body, totalNum, url, callback);
            } else if (error) {
                console.log('出错：lawyerUrls=' + url);
                console.log(error);
            } else {
                console.log(response.statusCode);
            }
        })
    })
    callback();
}
//抓取每一个律师数据
function fetchContent(body, totalNum, url, callback) {
    $ = cheerio.load(body);
    var data = {};
    var lawyer_name = $('.name').text();
    var pattern = /特邀/g;
    if (pattern.test(lawyer_name)) {
        var lawyer_major = '';
        var majorLis = $('.speciality').find('ul').find('li');
        var lawyer_major = new Array();
        majorLis.each(function(index, element) {
            lawyer_major.push($(element).text().trim());
        })
        var lawyer_place = $('.banner').text().trim();
        lawyer_place = lawyer_place.slice(0, lawyer_place.indexOf(' '))
        data = {
            lawyer_name: $('.name').text().replace('特邀', '').toString().trim(),
            lawyer_charternum: $('.lawyer_left_b').find('p').eq(4).text().toString().replace('执业证号：', '').trim(),
            lawyer_charterloc: $('.lawyer_left_b').find('p').eq(3).text().replace('执业机构：', '').trim(),
            lawyer_major: lawyer_major,
            lawyer_place: lawyer_place,
            lawyer_add: $('.lawyer_left_b').find('p').eq(5).text().replace('地址：', '').trim(),
            lawyer_email: $('.lawyer_left_b').find('p').eq(2).text().replace('Email:', '').trim(),
            lawyer_tel: $('.lawyer_left_b').find('p').eq(1).text().replace('电话：', '').toString().trim(),
            lawyer_clickrate: parseInt($('.in_c').text().replace('点击量: ', '')),
        }
    } else {
        var lawyer_major = new Array();
        var major = $('.ic').eq(0).text().trim()
        if (major) {
            lawyer_major = major.split("  ");
        }
        var lawyer_place = $('.banner').text().trim();
        lawyer_place = lawyer_place.slice(0, lawyer_place.indexOf(' '))
        data = {
            lawyer_name: $('.name').text().trim(),
            lawyer_charternum: $('.ic').eq(4).text().toString().trim(),
            lawyer_charterloc: $('.ic').eq(3).text().trim(),
            lawyer_major: lawyer_major,
            lawyer_place: lawyer_place,
            lawyer_add: $('.ic').eq(5).text().trim(),
            lawyer_email: $('.ic').eq(2).text().trim(),
            lawyer_tel: $('.ic').eq(1).text().replace('(电话咨询律师请说明来自110法律咨询网)', '').toString().trim(),
            lawyer_clickrate: parseInt($('.ci2').text().replace('点击量：', '')),
        }
    }
    lawyer = new Lawyer({
        lawyer_name: data.lawyer_name,
        lawyer_clickrate: data.lawyer_clickrate,
        lawyer_charternum: data.lawyer_charternum,
        lawyer_charterloc: data.lawyer_charterloc,
        lawyer_major: data.lawyer_major,
        lawyer_place: data.lawyer_place,
        lawyer_add: data.lawyer_add,
        lawyer_email: data.lawyer_email,
        lawyer_tel: data.lawyer_tel,
        lawyer_authed: true,
    })
    lawyer.save(function(err) {
        if (err) {
            // console.log('重复了哟～')
        }
    })
    var delay = parseInt((Math.random() * (10 - 2 + 1) + 2) * 1000, 10);
    setTimeout(function() {
        count++
        console.log("正在爬取的是" + url);
        callback();
    }, delay);
}
fetchType(baseUrl)
    // var lawyer = {
    //   lawyer_name: ;
    //   lawyer_password: ;
    //   lawyer_charternum: ;
    //   lawyer_charterloc: ;
    //   lawyer_major: ;
    //   lawyer_add: ;
    //   lawyer_email: ;
    //   lawyer_tel: ;
    // }