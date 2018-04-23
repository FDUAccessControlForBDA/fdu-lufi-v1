/**
 * Created by Sunny on 2018/4/3.
 */
angular.module('info.controllers', [])
    .controller('lawCtrl', function($rootScope, $scope, $http) {

    })

    .controller('privacyCtrl', function($rootScope, $scope, $http) {

    })

    .controller('aboutCtrl', function($rootScope, $scope, $http) {

    })

    .controller('contactCtrl', function($rootScope, $scope, $http) {
        $scope.feedback={};
        $scope.submitFeedback = function () {
            if($scope.feedback.contact == undefined || $scope.feedback.contact == null)
                $scope.feedback.contact = "";
            $http(
                {
                    method:'POST',
                    url  : $rootScope.hostUrl + 'uploadFeedback',
                    data: {
                        content: $scope.feedback.text,
                        contact: $scope.feedback.contact
                    },
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    transformRequest:  $rootScope.transformRequest
                })
                .success(function(ret) {
                    if(ret == true){
                        alert('您的反馈已成功提交');
                        $scope.feedback.text = null;
                        $scope.feedback.contact = null;
                    } else {
                        alert('很抱歉，因网络原因无法提交');
                    }
                })
                .error(function() {
                    alert('很抱歉，因网络原因无法提交');
                });
        }
    })

    .controller('profileCtrl', function($rootScope, $scope, $http) {
        $scope.showDetail = false;

        $http.get($rootScope.hostUrl + "getHistories", {
            params: {
                userId: $scope.userInfo.userId
            }
        })
            .success(function(ret) {
                if(ret != null && ret.code == 200){
                    $scope.history = ret.historyList;
                } else {
                    $scope.history = null;
                }
            })
            .error(function() {
                alert('很抱歉，因网络原因无法获取历史记录');
            });

        $scope.countFile = function(files){
            var fileList = files.split('|');
            return fileList.length;
        }

        $scope.firstFile = function(files){
            var fileList = files.split('|');
            return fileList[0];
        }
        // var history = [
        //     {
        //         id:'1',
        //         date:'2017/03/20 13:29:00',
        //         files: 'file name',
        //         fileNum: '4'
        //     },
        //     {
        //         id:'2',
        //         date:'2017/03/20 13:29:00',
        //         files: 'file name',
        //         fileNum: '4'
        //     },
        //     {
        //         id:'3',
        //         date:'2017/03/20 13:29:00',
        //         files: 'file name',
        //         fileNum: '4'
        //     }
        // ];
        // $scope.history = history;

        $scope.deleteHistory = function (index, id) {
            var confirm = confirm('确定删除历史记录？');
            if(confirm == true){
                $http({
                    method:'POST',
                    url  : $rootScope.hostUrl + 'deleteHistory',
                    data: {
                        historyId: id
                    },
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    transformRequest:  $rootScope.transformRequest
                })
                    .success(function(ret) {
                        if(ret != null && ret == true){
                            $scope.history.splice(index,1);
                            alert('您的历史记录已删除');
                        } else {
                            alert('很抱歉，因网络原因无法删除历史记录');
                        }
                    })
                    .error(function() {
                        alert('很抱歉，因网络原因无法删除历史记录');
                    });
            }
        }

        $scope.showDetailInfo = function(id){
            $http.get($rootScope.hostUrl + "getHistory", {
                params: {
                    historyId: id
                }
            })
                .success(function(ret) {
                    if(ret != null && ret.code == 200){
                        $scope.detailHistory = ret.history;
                        var p_object = $('#p-pie-container');
                        var c_object = $('#p-column-container');
                        var detailData = JSON.parse($scope.detailHistory.detail);
                        $rootScope.paintReport(p_object, c_object, detailData);
                    } else {
                        alert('很抱歉，因网络原因无法获取历史记录');
                    }
                })
                .error(function() {
                    alert('很抱歉，因网络原因无法获取历史记录');
                });
            $scope.showDetail = true;
        }

        $scope.backToHistoryList = function(){
            $scope.showDetail = false;
            $scope.detailHistory = null;
            $('#p-pie-container').innerHTML = '';
            $('#p-column-container').innerHTML = '';
        }

    })
    .controller('navCtrl', function($rootScope, $scope){
        $rootScope.hostUrl = 'http://10.132.141.32:8080/';
        $rootScope.transformRequest = function(obj) {
            var str = [];
            for (var p in obj) {
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            }
            return str.join("&");
        }
        $scope.logOut = function(){
            $rootScope.userInfo = null;
            window.location.href='#main';
        }
    })
;