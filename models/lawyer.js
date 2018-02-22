'use strict'
var mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId
var LawyerSchema = new mongoose.Schema({
  lawyer_name:{
    type:String,
    unique: true
  }, 
  lawyer_clickrate:{
    type:Number,
    default:0
  },
  lawyer_charternum:String,
  lawyer_charterloc:String,
  lawyer_major:[String],
  lawyer_password:{
    type: String,
    default: '123321'
  },
  lawyer_place:String,
  lawyer_add:String,
  lawyer_email:String,
  lawyer_tel:String,
  lawyer_authed:{
    type:Boolean,
    default:false
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
LawyerSchema.pre('save', function(next) {
  if (!this.isNew) {
    this.meta.updateAt = Date.now()
  } else {
    this.meta.createAt = this.meta.updateAt = Date.now()
  }
  next()
})
module.exports = mongoose.model('Lawyer', LawyerSchema)