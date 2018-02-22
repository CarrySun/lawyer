var app = angular.module("topic", ["ui.bootstrap", "page", "angularMoment"]);
app.factory("locals", [
  "$window",
  function($window) {
    return {
      //存储单个属性
      set: function(key, value) {
        $window.localStorage[key] = value;
      }, //读取单个属性
      get: function(key, defaultValue) {
        return $window.localStorage[key] || defaultValue;
      }, //存储对象，以JSON格式存储
      setObject: function(key, value) {
        $window.localStorage[key] = JSON.stringify(value); //将对象以字符串保存
      }, //读取对象
      getObject: function(key) {
        return JSON.parse($window.localStorage[key] || "{}"); //获取字符串并解析成对象
      }
    };
  }
]);
app.controller("topicCtrl", function(
  $scope,
  $http,
  $window,
  $modal,
  $location,
  locals,
  $timeout,
  $log,
  $rootScope
) {
  $scope.user = locals.getObject("user");
  console.log(locals.getObject("user"));
  $http.defaults.headers.post["Content-Type"] = "application/json";
  $scope.topic = [];
  $scope.topicContent = "";
  /*首次加载*/
  $http({
    method: "post",
    url: "list_topic",
    data: {
      start: 0,
      end: 10
    }
  })
    .then(function(result) {
      var data = result.data;
      if (data.tip == "notNull") {
        $scope.paginationConf.currentPage = 1;
        $scope.paginationConf.totalItems = data.length;
        $scope.topic = data.data;
        document.getElementById("totle").innerHTML = data.length;
      } else if (data.tip == "isNull") {
        document.getElementById("totle").innerHTML = 0;
        // alert(data.data);
      } else {
        // alert(data.tip);
      }
    })
    .catch(function(err) {
      alert("出错啦");
    });

  /*分页*/
  $scope.paginationConf = {
    currentPage: 1,
    // itemsPerPage: 10,
    pagesLength: 10,
    perPageOptions: [],
    onChange: function() {
      scrollTo(0, 0);
      document.scrollTop = 0;
      $http({
        method: "post",
        url: "list_topic",
        data: {
          start: ($scope.paginationConf.currentPage - 1) * 10,
          end: 10
        }
      })
        .then(function(result) {
          var data = result.data;
          if (data.tip == "notNull") {
            $scope.topic = data.data;
          } else if (data.tip == "isNull") {
            // alert(data.data)
          } else {
            alert(data.tip);
          }
        })
        .catch(function(err) {
          alert("出错啦");
        });
    }
  };
  $scope.addTopic = function() {
    if (!$scope.user.user_name) {
      alert("请先登录");
    } else if ($scope.topicContent == "") {
      alert("内容不许为空");
    } else {
      $http({
        method: "post",
        url: "add_topic",
        data: {
          topic_content: $scope.topicContent,
          user: $scope.user
        }
      }).then(function(result) { 
        var data = result.data;
        console.log(data);
        if (data.tip == "success") {
          $scope.topicContent = "";
          data.data.topic_replyNumber = 0;
          $scope.topic.unshift(data.data);
          $scope.paginationConf.totalItems++;
          document.getElementById("totle").innerHTML++;
        } else {
          alert(data.tip);
        }
      });
    }
  };
  $scope.toReply = function(x) {
    if (x.topic_id) {
      var hre = "/reply?topicId=" + x.topic_id;
      location.href = hre;
    }
  };
  // 退出登录
  $scope.logOut = function() {
    var modalInstance = $modal.open({
      templateUrl: "logOut.html",
      controller: "LogoutCtrl", // specify controller for modal
      size: "sm"
    });
  };
});
/*退出登陆*/
app.controller("LogoutCtrl", function($scope, $http, $window, $modalInstance) {
  $scope.reader = new FileReader(); //创建一个FileReader接口
  $scope.ok = function() {
    $modalInstance.dismiss("cancel");
    localStorage.removeItem("user");
    $window.location.reload();
  };
  $scope.cancel = function() {
    $modalInstance.dismiss("cancel");
  };
});
