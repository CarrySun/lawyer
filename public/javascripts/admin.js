var app = angular.module('admin', ['ui.bootstrap']);
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

app.controller('adminCtrl', function ($scope, $http, $modal,$window, $location, $rootScope,locals) {
    $http.defaults.headers.post["Content-Type"] = "application/json";
    console.log(locals.getObject('admin'))
    $scope.admin = locals.getObject('admin')

    $scope.user = 0;
    $scope.authedlawyer = 0;
    $scope.unAuthedlawyer = 0;
    $http({
        method: 'post',
        url: 'admin',
    }).then(function (result) {
        var data = result.data
        console.log(data)
        $scope.user = data.user;
        $scope.authedlawyer = data.authedlawyer;
        $scope.unAuthedlawyer = data.unAuthedlawyer;
    })

    $scope.onLogAdmin = function () {
        $http({
            method: 'post',
            url: 'logAdmin',
            data: $scope.logAdmin
        }).then(function (result) {
            var data = result.data
            console.log(data)
            if (data.tip == "success") {
                console.log('登陆成功');
                $scope.user = data.data;
                var admin = {
                    admin_name: data.data.admin_name,
                }
                locals.setObject('admin', admin)
                location.href = '/admin'
            } else {
                alert(data.tip);
            }
        }).catch(function (err) {
            console.log(err)
        })
    }
    // 退出登录
    $scope.logOut = function () {
        var modalInstance = $modal.open({
            templateUrl: 'logOut.html',
            controller: 'LogoutCtrl', // specify controller for modal
            size: 'sm',
        });
    }
})
/*退出登陆*/
app.controller('LogoutCtrl', function ($scope, $http, $window, $modalInstance) {
  $scope.ok = function () {
    $http({
        method: 'get',
        url: 'adminLogOut',
    }).then(function (result) {
        if(result.data == 'success'){
            $modalInstance.dismiss('cancel');
            localStorage.removeItem('admin')
            $window.location.reload();
        }
    })
  };
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  }
})