var mongoose = require('mongoose')
var User = require('../models/user');
var Lawyer = require('../models/lawyer');
var async = require('async')
module.exports = {
  logUser: function (req, res, next) {
    var resMap = {}
    var obj = req.body;
    async.waterfall([
      function (cb) {
        User.findOne({
          user_phone: obj.user_phone
        }, function (err, phone) {
          cb(null, phone)
        })
      },
      function (phone, cb) {
        if (!phone) {
          resMap.tip = "该手机号尚未注册，请先进行注册"
          res.send(resMap);
        } else {
          User.findOne({
            user_phone: obj.user_phone,
            user_password: obj.user_password
          }, function (err, user) {
            cb(null, user)
          })
        }
      }
    ], function (err, user) {
      if (err) {
        resMap.tip = "一不小心哪里出错了"
        res.send(resMap);
      } else if (!user) {
        resMap.tip = "密码错误";
        res.send(resMap);
      } else if (user) {
        var data = user;
        resMap.tip = "success";
        resMap.data = data;
        console.log(resMap)
        res.send(resMap);
      }
    })
  },
  regUser: function (req, res, next) {
    var resMap = {}
    var obj = req.body;
    async.waterfall([
      function (cb) {
        User.findOne({
          user_phone: obj.user_phone
        }, function (err, phone) {
          cb(null, phone)
        })
      },
      function (phone, cb) {
        if (phone) {
          resMap.tip = "该手机号已经注册，请直接登陆"
          res.send(resMap);
        } else {
          User.findOne({
            user_name: obj.user_name
          }, function (err, name) {
            cb(null, name)
          })
        }
      },
      function (name, cb) {
        if (name) {
          resMap.tip = "用户名已存在"
          res.send(resMap);
        } else {
          var user = new User(obj)
          try {
            newUser = user.save()
            cb(null, user)
          } catch (e) {
            console.log(e)
          }
        }
      }
    ], function (err, user) {
      if (err) {
        resMap.tip = "一不小心哪里出错了"
        res.send(resMap);
      } else {
        console.log(user)
        var data = user;
        resMap.tip = "success";
        resMap.data = data;
        res.send(resMap);
      }
    })
  },
  regLawyer: function (req, res, next) {
    var resMap = {}
    var obj = req.body;
    async.waterfall([
      function (cb) {
        Lawyer.findOne({
          lawyer_name: obj.lawyer_name
        }, function (err, name) {
          cb(null, name)
        })
      },
      function (name, cb) {
        if (name) {
          resMap.tip = "您已经注册，请直接登陆"
          res.send(resMap);
        } else {
          var lawyer = new Lawyer(obj)
          var user = new User({
            user_lawyerId:lawyer._id,
            user_name:obj.lawyer_name,
            user_password:obj.lawyer_password,
            user_phone:obj.lawyer_tel
          })
          try {
            lawyer = lawyer.save()
            var newUser = user.save()
            cb(null, user)
          } catch (e) {
            console.log(e)
          }
        }
      }
    ], function (err, user) {
      if (err) {
        resMap.tip = "一不小心哪里出错了"
        res.send(resMap);
      } else {
        console.log(user)
        var data = user;
        resMap.tip = "success";
        resMap.data = data;
        console.log(resMap)
        res.send(resMap);
      }
    })
  }
};