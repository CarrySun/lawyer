'use strict'
var mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId
var ManageSchema = new mongoose.Schema({
  manage_name:{
    type: String, 
    ref: 'Manage'
  },
  manage_password:String,
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
ManageSchema.pre('save', function(next) {
  if (!this.isNew) {
    this.meta.updateAt = Date.now()
  } else {
    this.meta.createAt = this.meta.updateAt = Date.now()
  }
  next()
})
module.exports = mongoose.model('Manage', ManageSchema)