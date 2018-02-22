var app = angular.module('myApp', []);
app.factory('locals', ['$window', function ($window) {
    return {        //存储单个属性
        set: function (key, value) {
            $window.localStorage[key] = value;
        },        //读取单个属性
        get: function (key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        },        //存储对象，以JSON格式存储
        setObject: function (key, value) {
            $window.localStorage[key] = JSON.stringify(value);//将对象以字符串保存
        },        //读取对象
        getObject: function (key) {
            return JSON.parse($window.localStorage[key] || '{}');//获取字符串并解析成对象
        }

    }
}]);
app.controller('myCtrl', function ($scope, $http, $window, $location, locals) {
    $http.defaults.headers.post["Content-Type"] = "application/json";
    var href = location.href; //取得整个地址栏
    urlValue = href.substr(href.indexOf("=") + 1);
    from = decodeURI(urlValue);
    console.log(from)
    $scope.regUser = {};
    $scope.logUser = {};
    $scope.regLawyer = {};
    $scope.logLawyer = {};
    $scope.log = 'log';
    $scope.reg = 'reg';
    $scope.type = 'log';
    $scope.lawyer = false;
    $scope.userLog = true;
    $scope.userReg = true;
    $scope.changeType = function (x) {
        $scope.type = x.target.getAttribute('id')
    }
    $scope.onLogUser = function () {
        $http({
            method: 'post',
            url: 'logUser',
            data: $scope.logUser
        }).then(function (result) {
            var data = result.data
            console.log(data)
            if (data.tip == "success") {
                console.log('登陆成功');
                $scope.user = data.data;
                console.log(data.data)
                var user = {
                    user_name: data.data.user_name,
                    _id: data.data._id,
                }
                locals.setObject('user', user)
                if(from == 'index'){
                    location.href = '/';
                }else{
                    location.href = '/'+from;
                }
            } else {
                alert(data.tip);
            }
        }).catch(function (err) {
            console.log(err)
        })
    }
    $scope.onRegUser = function () {
        $http({
            method: 'post',
            url: 'regUser',
            data: $scope.regUser
        }).then(function (result) {
            var data = result.data
            console.log(data)
            if (data.tip == "success") {
                $scope.user = data.data;
                console.log($scope.user)
                var user = {
                    user_name: data.data.user_name,
                    _id: data.data._id,
                }
                locals.setObject('user', user)
                if(from == 'index'){
                    location.href = '/';
                }else{
                    location.href = '/'+from;
                }
            } else {
                alert(data.tip);
            }
        }).catch(function (err) {
            console.log(err)
        })
    }
    $scope.onRegLawyer = function () {
        $http({
            method: 'post',
            url: 'regLawyer',
            data: $scope.regLawyer
        }).then(function (result) {
            var data = result.data
            console.log(data)
            if (data.tip == "success") {
                alert('注册成功,审核通过后您的信息将显示在主页');
                $scope.user = data.data;
                console.log($scope.user)
                var user = {
                    user_name: data.data.user_name,
                    _id: data.data._id,
                }
                locals.setObject('user', user)
                if(from == 'index'){
                    location.href = '/';
                }else{
                    location.href = '/'+from;
                }
            } else {
                alert(data.tip);
            }
        }).catch(function (err) {
            console.log(err)
        })
    }
})