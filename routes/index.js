var express = require('express');
var router = express.Router();
var Lawyer = require('../controllers/lawyer');
var Advisor = require('../controllers/advisor');
var Admin = require('../controllers/admin');
var User = require('../controllers/user');

router.get('/', function(req, res, next) {
  res.render('web')
});
router.get('/topic', function(req, res, next) {
  res.render('topic')
});
router.get('/reply', function(req, res, next) {
  res.render('reply')
});

router.get('/admin',checkLogin);
router.get('/admin',function(req, res, next) {
  res.render('admin',{
    admin: req.session.admin,
  })
})

router.get('/lawyerList',checkLogin);
router.get('/lawyerList',function(req, res, next) {
  res.render('lawyerList')
})

router.get('/userList',checkLogin);
router.get('/userList',function(req, res, next) {
  res.render('userList')
})
router.get('/lawyerManage',checkLogin);
router.get('/lawyerManage',function(req, res, next) {
  res.render('lawyerManage')
})

router.get('/adminLogin',function(req, res, next) {
  res.render('adminLogin')
})
router.get('/adminLogOut',function(req, res, next) {
  req.session.admin = null
  console.log(req.session.admin)
  res.send('success');
})
router.post('/logAdmin', function(req, res, next) {
  Admin.logAdmin(req, res, next);
});

router.post('/admin', function(req, res, next) {
  Admin.admin(req, res, next);
});
router.post('/authedLawyer', function(req, res, next) {
  Admin.authedLawyer(req, res, next);
});
router.post('/list_user', function(req, res, next) {
  Admin.list_user(req, res, next);
});



function checkLogin(req,res,next){
  if(!req.session.admin){
      console.log('管理员未登录');
      return res.redirect('/adminlogin');
  }
  next();
}


router.get('/log',function(req, res, next) {
  res.render('login')
})
router.post('/list_lawyer', function(req, res, next) {
  Lawyer.queryLawyers(req, res, next);
});
router.post('/notAuthlawyer', function(req, res, next) {
  Lawyer.notAuthlawyer(req, res, next);
});
router.post('/queryInfoById', function(req, res, next) {
  Lawyer.queryInfoById(req, res, next);
});

router.post('/logUser', function(req, res, next) {
  User.logUser(req, res, next);
});
router.post('/regUser', function(req, res, next) {
  User.regUser(req, res, next);
});
router.post('/regLawyer', function(req, res, next) {
  User.regLawyer(req, res, next);
});

router.post('/list_topic', function(req, res, next) {
  Advisor.queryTopic(req, res, next);
});
router.post('/list_reply', function(req, res, next) {
  Advisor.queryReply(req, res, next);
});
router.post('/add_topic', function(req, res, next) {
  Advisor.addTopic(req, res, next);
});
router.post('/add_reply', function(req, res, next) {
  Advisor.addReply(req, res, next);
});

module.exports = router;