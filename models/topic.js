'use strict'
var mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId
var TopicSchema = new mongoose.Schema({
  topic_content:String,
  topic_userId:{
    type: ObjectId, 
    ref: 'User'
  },
  topic_replyId:[{
    type: ObjectId, 
    ref: 'Reply'
  }],
  topic_time:Date,
  meta: {
    createAt: {
      type: Date,
      default: Date.now()
    },
    updateAt: {
      type: Date,
      default: Date.now()
    },
  }
})
TopicSchema.pre('save', function(next) {
  if (!this.isNew) {
    this.meta.updateAt = Date.now()
  } else {
    this.meta.createAt = this.meta.updateAt = Date.now()
  }
  next()
})
module.exports = mongoose.model('Topic', TopicSchema)