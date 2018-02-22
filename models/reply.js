'use strict'
var mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId
var ReplaySchema = new mongoose.Schema({
  reply_topicId:{
    type: ObjectId, 
    ref: 'Topic'
  },
  reply_userId:{
    type: ObjectId, 
    ref: 'User'
  },
  reply_content:String,
  reply_time:Date,
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
ReplaySchema.pre('save', function(next) {
  if (!this.isNew) {
    this.meta.updateAt = Date.now()
  } else {
    this.meta.createAt = this.meta.updateAt = Date.now()
  }
  next()
})
module.exports = mongoose.model('Replay', ReplaySchema)