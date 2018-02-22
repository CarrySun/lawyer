'use strict'
var mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId
var UserSchema = new mongoose.Schema({
  user_name:String, 
  user_password:String,
  user_phone: String,
  user_lawyerId:{
    type: String, 
    ref:'Lawyer'
  },
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
UserSchema.pre('save', function(next) {
  if (!this.isNew) {
    this.meta.updateAt = Date.now()
  } else {
    this.meta.createAt = this.meta.updateAt = Date.now()
  }
  next()
})
module.exports = mongoose.model('User', UserSchema)