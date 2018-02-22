var mongoose = require('mongoose')
var Admin = require('../models/admin');
var User = require('../models/user');
var Lawyer = require('../models/lawyer');
var async = require('async')
module.exports = {
  admin: function(req, res, next) {
    var resMap = {};
    async.parallel([
      function(callback){
        User.find().count(function(err, data) {
          callback(err,data)
        })
      },
      function(callback){
        Lawyer.find({lawyer_authed:true}).count(function(err, data) {
          callback(err,data)
        })
      },
      function(callback){
        Lawyer.find({lawyer_authed:false}).count(function(err, data) {
          callback(err,data)
        })
      },
    ], function(err, results) {
      if(err){
        console.log(err)
      }else{
        resMap.user = results[0];
        resMap.authedlawyer = results[1];
        resMap.unAuthedlawyer = results[2];
        res.send(resMap);
      }
    })
  },
  logAdmin: function (req, res, next) {
    var resMap = {}
    var obj = req.body;
    async.waterfall([
      function (cb) {
        Admin.findOne({
          admin_name: obj.admin_name
        }, function (err, name) {
          cb(null, name)
        })
      },
      function (name, cb) {
        if (!name) {
          resMap.tip = "该用户名尚未注册，请先进行注册"
          res.send(resMap);
        } else {
          Admin.findOne({
            admin_name: obj.admin_name,
            admin_password: obj.admin_password
          }, function (err, admin) {
            cb(null, admin)
          })
        }
      }
    ], function (err, admin) {
      if (err) {
        resMap.tip = "一不小心哪里出错了"
        res.send(resMap);
      } else if (!admin) {
        resMap.tip = "密码错误";
        res.send(resMap);
      } else if (admin) {
        var data = admin;
        req.session.admin = data;
        resMap.tip = "success";
        resMap.data = data;
        res.send(resMap);
      }
    })
  },
  authedLawyer: function (req, res, next) {
    var resMap = {}
    var obj = req.body;
    console.log(obj)
    async.parallel([
      function (cb) {
        User.findOne({
          user_lawyerId: obj.lawyer_id
        }, function (err, result) {
          result.user_name = result.user_name+'律师'
          var user = new User(result)
          try {
            user = user.save()
            cb(err,user)
          }catch(e){
            console.log(e)
          }
        })
      },
      function (cb) {
        Lawyer.findOne({
          _id: obj.lawyer_id
        }, function (err, result) {
          result.lawyer_name = result.lawyer_name+'律师'
          result.lawyer_authed = result.lawyer_authed+'律师'
          var lawyer = new Lawyer(result)
          try {
            lawyer = lawyer.save()
            cb(err,lawyer)
          }catch(e){
            console.log(e)
          }
        })
      }
    ], function (err, results) {
      if (err) {
        resMap.tip = "一不小心哪里出错了"
        res.send(resMap);
      } else {
        resMap.tip = "success";
        res.send(resMap);
      }
    })
  },
  list_user: function(req, res, next) {
    var resMap = {};
    var obj = req.body;
    async.parallel([
      function(callback){
        User.find().count(function(err, data) {
          callback(err,data)
        })
      },
      function(callback){
        User.find(function(err, data) {
          callback(err,data)
        }).skip(obj.start).limit(obj.end)
      },
    ], function(err, results) {
      if(err){
        console.log(err)
      }else{
        resMap.length = results[0];
        if(results[1].length > 0){
          resMap.tip="notNull";
          resMap.data=results[1];
        }else{
          resMap.tip="isNull";
          resMap.data = "还没有用户呢";
        }
        res.send(resMap);
      }
    })
  },
};