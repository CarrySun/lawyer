var mongoose = require('mongoose')
var Lawyer = require('../models/lawyer');
var async = require('async')
module.exports = {
  queryLawyers: function(req, res, next) {
    var resMap = {};
    var obj = req.body;
    var query = {}
    query.lawyer_authed = true
    if (obj.place != "全国" && obj.place != "") {
      query.lawyer_place = obj.place;
    }
    if (obj.major != "全部" && obj.major != "") {
      query.lawyer_major = {
        '$all': obj.major
      }
    }
    console.log(query)
    async.parallel([
      function(callback){
        Lawyer.find(query).count(function(err, data) {
          callback(err,data)
        })
      },
      function(callback){
        Lawyer.find(query, function(err, data) {
          callback(err,data)
        }).skip(obj.start).limit(obj.end).sort({lawyer_clickrate:-1})
      },
    ], function(err, results) {
      if(err){
        console.log(err)
      }else{
        resMap.length = results[0];
        resMap.data = results[1];
        if(results[1].length > 0){
          resMap.tip="notNull";
          var rows = results[1].concat();
          var lawyer_major = new Array();
          for (var i = 0; i < rows.length; i++) {
            if (rows[i].lawyer_major) {
              lawyer_major = rows[i].lawyer_major;
              var n = '';
              for (var j = 0; j < lawyer_major.length; j++) {
                var m = lawyer_major[j] + ' ';
                n += m;
              }
              rows[i].lawyer_major = n;
            }
          }
          resMap.data=rows;
        }else{
          resMap.tip="isNull";
          resMap.data = "当前城市"+obj.place+"没有"+obj.major+"律师";
        }
        res.send(resMap);
      }
    })
  },
  queryInfoById: function(req, res, next) {
    var resMap = {};
    obj = req.body;
    async.waterfall([
      function(callback){
        Lawyer.findOne({
          _id:obj.id
        },function(err, result) {
          callback(null,result)
        })
      },
      function(result,callback){
        var lawyer = result
        lawyer.lawyer_clickrate ++
        try{
          lawyer = lawyer.save()
          callback(null,result)
        }catch(e){
          console.log(e)
        }
      }
    ],function(err,result){
      if (result) {
        var lawyer_major = result.lawyer_major;
        if (lawyer_major) {
          var n = '';
          for (var j = 0; j < lawyer_major.length; j++) {
            var m = lawyer_major[j] + ' ';
            n += m;
          }
          result.lawyer_major = n;
        }
        var data = [];
        data[0] = result
        resMap.tip = "success";
        resMap.data = data;
      } else {
        resMap.tip = "error"
        resMap.data = err
      }
      res.send(resMap);
    })
  },
  notAuthlawyer: function(req, res, next) {
    var resMap = {};
    var obj = req.body;
    var query = {}
    query.lawyer_authed = false
    console.log(query)
    async.parallel([
      function(callback){
        Lawyer.find(query).count(function(err, data) {
          callback(err,data)
        })
      },
      function(callback){
        Lawyer.find(query, function(err, data) {
          callback(err,data)
        }).skip(obj.start).limit(obj.end).sort({lawyer_clickrate:-1})
      },
    ], function(err, results) {
      if(err){
        console.log(err)
      }else{
        resMap.length = results[0];
        resMap.data = results[1];
        if(results[1].length > 0){
          resMap.tip="notNull";
          var rows = results[1].concat();
          var lawyer_major = new Array();
          for (var i = 0; i < rows.length; i++) {
            if (rows[i].lawyer_major) {
              lawyer_major = rows[i].lawyer_major;
              var n = '';
              for (var j = 0; j < lawyer_major.length; j++) {
                var m = lawyer_major[j] + ' ';
                n += m;
              }
              rows[i].lawyer_major = n;
            }
          }
          resMap.data=rows;
        }else{
          resMap.tip="isNull";
          resMap.data = "没有未审核的律师";
        }
        console.log(resMap)
        res.send(resMap);
      }
    })
  },
}