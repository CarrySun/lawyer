var mongoose = require("mongoose");
var Topic = require("../models/topic");
var Reply = require("../models/reply");
var async = require("async");
var userFields = ["user_name"];
var replyFields = ["_id"];
module.exports = {
  submitAdvisor: function(req, res, next) {
    var resMap = {};

    res.send(resMap);
  },
  queryTopic: function(req, res, next) {
    var resMap = {};
    var obj = req.body;
    async.parallel(
      [
        function(callback) {
          Topic.find().count(function(err, data) {
            callback(err, data);
          });
        },
        function(callback) {
          Topic.find(function(err, data) {
            callback(err, data);
          })
            .skip(obj.start)
            .limit(obj.end)
            .sort({ topic_time: -1 })
            .populate("topic_userId", userFields.join(" "));
        }
      ],
      function(err, results) {
        if (err) {
          console.log(err);
        } else {
          resMap.length = results[0];
          if (results[1].length > 0) {
            resMap.tip = "notNull";
            var rows = [];
            for (var i = 0; i < results[1].length; i++) {
              rows[i] = {
                topic_content: results[1][i].topic_content,
                topic_time: results[1][i].topic_time,
                topic_userId: results[1][i].topic_userId.user_name,
                topic_replyId: results[1][i].topic_replyId,
                topic_replyNumber: results[1][i].topic_replyId.length,
                topic_id: results[1][i]._id
              };
            }
            resMap.data = rows;
          } else {
            resMap.tip = "isNull";
            resMap.data = "您是第一个来资讯的人哟";
          }
          res.send(resMap);
        }
      }
    );
  },
  queryReply: function(req, res, next) {
    var resMap = {};
    var obj = req.body;
    async.parallel(
      [
        function(callback) {
          Reply.find({
            reply_topicId: obj.reply_topicId
          }).count(function(err, data) {
            callback(err, data);
          });
        },
        function(callback) {
          Topic.findOne(
            {
              _id: obj.reply_topicId
            },
            function(err, data) {
              callback(err, data);
            }
          ).populate("topic_userId", userFields.join(" "));
        },
        function(callback) {
          Reply.find(
            {
              reply_topicId: obj.reply_topicId
            },
            function(err, data) {
              callback(err, data);
            }
          )
            .sort({ topic_time: -1 })
            .populate("reply_userId", userFields.join(" "));
        }
      ],
      function(err, results) {
        if (err) {
          console.log(err);
        } else {
          resMap.length = results[0];
          if (results[1]) {
            resMap.topic = {
              topic_content: results[1].topic_content,
              topic_time: results[1].topic_time,
              topic_userId: results[1].topic_userId.user_name,
              topic_id: results[1]._id
            };
          }
          if (results[2].length > 0) {
            resMap.tip = "notNull";
            var rows = [];
            for (var i = 0; i < results[2].length; i++) {
              rows[i] = {
                reply_content: results[2][i].reply_content,
                reply_time: results[2][i].reply_time,
                reply_userId: results[2][i].reply_userId.user_name,
                reply_id: results[2][i]._id
              };
            }
            resMap.reply = rows;
          } else {
            resMap.tip = "isNull";
            resMap.data = "您是第一个来评论的人哟";
          }
          res.send(resMap);
        }
      }
    );
  },
  addTopic: function(req, res, next) {
    var resMap = {};
    var obj = req.body;
    var topicObj = {
      topic_content: obj.topic_content,
      topic_userId: obj.user._id,
      topic_time: new Date()
    };
    var topic = new Topic(topicObj);
    var topic_id = topic._id;
    try {
      topic = topic.save();
      resMap.tip = "success";
      resMap.data = {
        topic_content: obj.topic_content,
        topic_userId: obj.user.user_name,
        topic_time: topicObj.topic_time,
        topic_id: topic_id
      };
    } catch (e) {
      console.log(e);
      resMap.tip = "出错啦";
      resMap.data = e;
    }
    res.send(resMap);
  },
  addReply: function(req, res, next) {
    var resMap = {};
    var obj = req.body;
    var replyObj = {
      reply_topicId: obj.reply_topicId,
      reply_content: obj.reply_content,
      reply_userId: obj.user._id,
      reply_time: new Date()
    };
    var reply = new Reply(replyObj);
    var reply_id = reply._id;
    try {
      reply = reply.save();
      Topic.findOne(
        {
          _id: obj.reply_topicId
        },
        function(err, data) {
          if (data) {
            data.topic_replyId.push(reply_id);
            // console.log(data);
            topic = data.save();
          }
        }
      );
      resMap.tip = "success";
      resMap.data = {
        reply_content: obj.reply_content,
        reply_userId: obj.user.user_name,
        reply_time: replyObj.reply_time
      };
    } catch (e) {
      // console.log(e);
      resMap.tip = "出错啦";
      resMap.data = e;
    }
    res.send(resMap);
  }
};
