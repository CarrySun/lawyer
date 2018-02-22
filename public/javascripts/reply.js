var app = angular.module("reply", ["ui.bootstrap", "page","angularMoment"]);
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
app.controller("replyCtrl", function(
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
  console.log($scope.user);
  $http.defaults.headers.post["Content-Type"] = "application/json";
  $scope.reply = [];
  $scope.topic = {};
  $scope.replyContent = "";
  /*首次加载*/
  var href = location.href; //取得整个地址栏
  urlValue = href.substr(href.indexOf("=") + 1);
  reply_topicId = decodeURI(urlValue);
  console.log(reply_topicId);
  $http({
    method: "post",
    url: "list_reply",
    data: {
      reply_topicId: reply_topicId
    }
  })
    .then(function(result) {
      var data = result.data;
      $scope.topic = data.topic;
      console.log($scope.topic);
      if (data.tip == "notNull") {
        $scope.paginationConf.currentPage = 1;
        $scope.paginationConf.totalItems = data.length;
        document.getElementById("totle").innerHTML = data.length;
        $scope.reply = data.reply;
      } else if (data.tip == "isNull") {
        document.getElementById("totle").innerHTML = 0;
        // console.log(data.data)
      } else {
        console.log(data.tip);
      }
    })
    .catch(function(err) {
      console.log("出错啦");
    });
  /*分页*/
  $scope.paginationConf = {
    currentPage: 1, // itemsPerPage: 10,
    pagesLength: 10,
    perPageOptions: [],
    onChange: function() {
      scrollTo(0, 0);
      document.scrollTop = 0;
      $http({
        method: "post",
        url: "list_reply",
        data: {
          start: ($scope.paginationConf.currentPage - 1) * 10,
          end: 10
        }
      })
        .then(function(result) {
          var data = result.data;
          if (data.tip == "notNull") {
            $scope.reply = data.data;
          } else if (data.tip == "isNull") {
            // console.log(data.data)
          } else {
            console.log(data.tip);
          }
        })
        .catch(function(err) {
          console.log("出错啦");
        });
    }
  };
  $scope.addReply = function() {
    if (!$scope.user.user_name) {
      console.log("请先登录");
    } else if ($scope.replyContent == "") {
      console.log("内容不许为空");
    } else {
      $http({
        method: "post",
        url: "add_reply",
        data: {
          reply_topicId: reply_topicId,
          reply_content: $scope.replyContent,
          user: $scope.user
        }
      }).then(function(result) {
        var data = result.data;
        console.log(data);
        if (data.tip == "success") {
          $scope.replyContent = "";
          $scope.reply.unshift(data.data);
          $scope.paginationConf.totalItems++;
          document.getElementById("totle").innerHTML++;
        } else {
          console.log(data.tip);
        }
      });
    }
  };
  $scope.openLog = function() {
    location.href = "/log?from=reply?topicId=" + reply_topicId;
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
