var app = angular.module('user', ['ui.bootstrap', 'page']);
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
app.controller('userCtrl', function ($scope, $http, $window, $modal, $location, locals, $timeout, $log, $rootScope) {
  $http.defaults.headers.post["Content-Type"] = "application/json";
  console.log(locals.getObject('admin'))
  $scope.admin = locals.getObject('admin')
  /*首次加载*/
  $http({
    method: 'post',
    url: 'list_user',
    data: {
      start: 0,
      end: 10
    }
  }).then(function (result) {
    var data = result.data
    if (data.tip == "notNull") {
      $scope.paginationConf.currentPage = 1;
      $scope.paginationConf.totalItems = data.length;
      $scope.user = data.data;
      document.getElementById("totle").innerHTML = data.length;
    } else if (data.tip == "isNull") {
      document.getElementById("totle").innerHTML = 0;
      console.log(data.data)
    } else {
      console.log(data.tip);
    }
  })
    .catch(function (err) {
    alert('出错啦')
    })
  /*分页*/
  $scope.paginationConf = {
    currentPage: 1,
    // itemsPerPage: 10,
    pagesLength: 10,
    perPageOptions: [],
    onChange: function () {
      scrollTo(0, 0);
      document.scrollTop = 0;
      $http({
        method: 'post',
        url: 'list_user',
        data: {
          start: ($scope.paginationConf.currentPage - 1) * 10,
          end: 10
        }
      })
        .then(function (result) {
          var data = result.data
          if (data.tip == "notNull") {
            $scope.user = data.data;
          } else if (data.tip == "isNull") {
            document.getElementById("totle").innerHTML = 0;
            console.log(data.data)
          } else {
            console.log(data.tip);
          }
        })
        .catch(function (err) {
          alert('出错啦')
        })
    }
  };
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