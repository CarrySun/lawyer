var app = angular.module('lawyer', ['ui.bootstrap', 'page']);
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
app.controller('lawyerCtrl', function ($scope, $http, $window, $modal, $location, locals, $timeout, $log, $rootScope) {
  $http.defaults.headers.post["Content-Type"] = "application/json";
  console.log(locals.getObject('user'))
  $scope.user = locals.getObject('user')
  /*首次加载*/
  $http({
    method: 'post',
    url: 'list_lawyer',
    data: {
      place: "",
      major: "",
      start: 0,
      end: 10
    }
  }).then(function (result) {
    var data = result.data
    if (data.tip == "notNull") {
      $scope.paginationConf.currentPage = 1;
      $scope.paginationConf.totalItems = data.length;
      $scope.lawyer = data.data;
      document.getElementById("totle").innerHTML = data.length;
    } else if (data.tip == "isNull") {
      document.getElementById("totle").innerHTML = 0;
      alert(data.data)
    } else {
      alert(data.tip);
    }
  })
    .catch(function (err) {
      alert('出错啦')
    })
  /*搜索*/
  $scope.search = function ($event) {
    var searchText = document.getElementById("searchText").value;
    if (searchText == "") {
      searchText = "WWW.51DAGUANSI.TOP"
    }
    // $event.target.href="https://www.baidu.com/baidu?ie=utf-8&wd="+searchText;
    $event.target.href = "https://www.baidu.com/s?ie=utf-8&f=8&rsv_bp=0&rsv_idx=1&tn=baidu&wd=" + searchText + "&rsv_pq=89b73ed90003509c&rsv_t=1242P49xDO%2FKOrXIYCL5phtbeMj5hjFg0F%2BOo7I03LzrdR0yozS84twOjio&rqlang=cn&rsv_enter=1&rsv_sug3=4&rsv_sug1=3&rsv_sug7=100&rsv_sug2=0&inputT=442&rsv_sug4=576";
  }
  $scope.provinces = ["全国", "北京", "上海", "天津", "重庆", "河北", "山西", "内蒙古", "辽宁", "吉林", "黑龙江", "江苏", "浙江", "安徽", "福建", "江西", "山东", "河南", "湖北", "湖南", "广东", "广西", "海南", "四川", "贵州", "云南", "西藏", "陕西", "甘肃", "宁夏", "青海", "新疆", "香港", "澳门", "台湾", "海外"]
  $scope.selected = "全国";
  /*分页*/
  $scope.paginationConf = {
    currentPage: 1,
    // itemsPerPage: 10,
    pagesLength: 10,
    perPageOptions: [],
    onChange: function () {
      scrollTo(0, 0);
      document.scrollTop = 0;
      if (document.getElementById('place'))
        place = document.getElementById('place').innerHTML
      else
        place = ""
      $http({
        method: 'post',
        url: 'list_lawyer',
        data: {
          place: place,
          major: document.getElementById('major').innerHTML,
          start: ($scope.paginationConf.currentPage - 1) * 10,
          end: 10
        }
      })
        .then(function (result) {
          var data = result.data
          if (data.tip == "notNull") {
            $scope.lawyer = data.data;
          } else if (data.tip == "isNull") {
            document.getElementById("totle").innerHTML = 0;
            console.log(data.data)
          } else {
            alert(data.tip);
          }
        })
        .catch(function (err) {
          alert('出错啦')
        })
    }
  };

  /*改变专长*/
  $scope.queryLawyersByMajorAndPlace = function ($event) {
    $http({
      method: 'post',
      url: 'list_lawyer',
      data: {
        place: document.getElementById('place').innerHTML,
        major: $event.target.innerHTML,
        start: 0,
        end: 10
      }
    }).success(function (data) {
      if (data.tip == "notNull") {
        $scope.paginationConf.currentPage = 1;
        $scope.paginationConf.totalItems = data.length;
        $scope.lawyer = data.data;
        document.getElementById("totle").innerHTML = data.length;
        document.getElementById("major").innerHTML = $event.target.innerHTML
      } else if (data.tip == "isNull") {
        alert(data.data)
      } else {
        alert(data.tip);
      }
    })
  }
  /*改变地址*/
  $scope.lawyer = "";
  $scope.info = "";
  $scope.openPlace = function (size) {
    var modalInstance = $modal.open({
      templateUrl: 'place.html',
      controller: 'PlaceCtrl', // specify controller for modal
      size: size,
      resolve: {
        place: function () {
          return {
            select: $scope.selected,
            provinces: $scope.provinces,
          }
        }
      }
    });
    modalInstance.result.then(function (selected) {
      var oldPlace = document.getElementById('place').innerHTML;
      $http({
        method: 'post',
        url: 'list_lawyer',
        data: {
          place: selected,
          major: document.getElementById('major').innerHTML,
          start: 0,
          end: 10
        }
      }).success(function (data) {
        if (data.tip == "notNull") {
          $scope.paginationConf.currentPage = 1;
          $scope.paginationConf.totalItems = data.length;
          $scope.lawyer = data.data;
          document.getElementById("totle").innerHTML = data.length;
          $scope.selected = selected;
        } else if (data.tip == "isNull") {
          alert(data.data)
          //   document.getElementById("place").innerHTML=oldPlace;
        } else {
          alert(data.tip);
        }
      })
    }, function () {
      $log.info('Modal dismissed at: ' + new Date())
    });
  }
  /*显示律师信息*/
  $scope.openInfo = function (x) {
    var modalInstance = $modal.open({
      templateUrl: 'info.html',
      controller: 'InfoCtrl', // specify controller for modal
      resolve: {
        id: function () {
          return x._id;
        }
      }
    });
  }
  /*登陆注册*/
  $scope.openLog = function (x) {
    var modalInstance = $modal.open({
      templateUrl: 'log.html',
      controller: 'LogCtrl', // specify controller for modal
      size: 'sm',
      resolve: {
        type: function () {
          return x.target.getAttribute('id')
        }
      }
    });
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
/*地址列表*/
app.controller('PlaceCtrl', function ($scope, $http, $modalInstance, place) {
  $scope.reader = new FileReader(); //创建一个FileReader接口
  $scope.place = place;
  $scope.selected = {
    province: place.select
  };
  $scope.ok = function () {
    $modalInstance.close($scope.selected.province);

  };
  // cancel click
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  }
})
/*律师信息*/
app.controller('InfoCtrl', function ($scope, $http, $modalInstance, id) {
  $scope.reader = new FileReader(); //创建一个FileReader接口
  $scope.id = id;
  $http({
    method: 'post',
    url: 'queryInfoById',
    data: {
      id: id
    }
  }).success(function (data) {
    if (data.tip == "success") {
      $scope.info = data.data;
      console.log($scope.info)
    } else {
      alert(data.tip);
    }
  })
  $scope.ok = function () {
    $modalInstance.dismiss('cancel');
  };
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  }
})
/*退出登陆*/
app.controller('LogoutCtrl', function ($scope, $http, $window, $modalInstance) {
  $scope.reader = new FileReader(); //创建一个FileReader接口
  $scope.ok = function () {
    $modalInstance.dismiss('cancel');
    localStorage.removeItem('user')
    $window.location.reload();
  };
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  }
})
$(document).ready(function () {
  var boxs = $(".menu_box");
  for (var i = 0; i < boxs.length; i++) {
    boxs[i].onmouseover = function () {
      $(this).find(".menu_sub").eq(0).removeClass("dn")
      this.style.boder = "0px";
      $(this).find(".menu_main").eq(0).addClass("current")
    }
    boxs[i].onmouseout = function () {
      $(this).find(".menu_sub").eq(0).addClass("dn")
      $(this).find(".menu_main").eq(0).removeClass("current")
    }
  }
  var boxs_a = $(".menu_box a");
  for (var i = 0; i < boxs_a.length; i++) {
    boxs_a[i].onclick = function () {
      $(this).closest('.menu_box').find(".menu_sub").eq(0).addClass("dn");
      $(this).closest('.menu_box').find(".menu_main").eq(0).removeClass("current");
    }
  }
})