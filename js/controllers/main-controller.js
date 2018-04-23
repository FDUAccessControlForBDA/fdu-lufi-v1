/**
 * Created by Sunny on 2018/4/3.
 */
angular.module('lufiApp.controllers', [])
    .controller('mainCtrl', function($scope, $http, $rootScope){
        $scope.fileList = [];
        $scope.hasFile = false;
        $scope.displayMode = 'upload-mode';
        $scope.jobFinished = false;
        $scope.detectPath = '';

        var target = $(".upload-window")[0];
        target.addEventListener("dragenter", function () {
            target.style.borderColor = "#3D9EE5";
        });
        target.addEventListener("dragleave", function () {
            target.style.borderColor = "rgba(51, 122, 183, 0.5)";
        });
        target.addEventListener("dragover", function (event) {
            event.stopPropagation();
            event.preventDefault();
            target.style.borderColor = "#3D9EE5";
        })
        target.addEventListener("drop", function (event) {
            event.stopPropagation();
            event.preventDefault();
            $scope.getFile(event.dataTransfer.files);
            target.style.borderColor = "rgba(51, 122, 183, 0.5)";
        });


        $scope.getFile = function(files){
            if( $rootScope.userInfo == undefined ||  $rootScope.userInfo == null){
                var r = confirm('请先登录');
                if(r == true)
                    window.location.href='#login';

            }else{
                for(var i = 0; i < files.length && i < 10 ; i++){
                    var file = files[i];
                    if(file.size <= 209715200)
                        $scope.fileList.push(file);
                }
                angular.element('#changeState').triggerHandler('click');
            }
        }

        $scope.showFile = function() {
            if( $scope.fileList.length > 0)
                $scope.hasFile = true;

        }

        $scope.deleteFile = function (index){
            $scope.fileList.splice(index,1);
            if($scope.fileList.length == 0)
                $scope.hasFile = false;
        }

        $scope.changeUnit = function (size){
            if(size < 1024)
                return size+'B';
            else if(size < 1048576)
                return (size/1024).toFixed(1) + 'KB';
            else
                return (size/1048576).toFixed(1) + 'MB';
        }

        $scope.emptyList = function(){
            $scope.fileList = [];
            $scope.hasFile = false;
        }

        $scope.chooseModule = function(){
            $scope.displayMode = 'pattern-mode';
        }

        $scope.showDetection = function (){
            var sum = 0;
            for(var i = 0; i < $scope.fileList.length; i++){
                sum += $scope.fileList[i].size
            }
            if(sum <= 209715200){
                $scope.displayMode = 'detection-mode';

                $('#process').css('display', 'block');

                // 上传文件
                var fd = new FormData();
                for (var i=0; i<$scope.fileList.length; i++) {
                    fd.append("files", $scope.fileList[i]);
                }
                fd.append("id", $rootScope.userInfo.userId);
                $http({
                    method:'POST',
                    url  : $rootScope.hostUrl + 'upload',
                    data: fd,
                    headers: {'Content-Type':undefined},
                    transformRequest: angular.identity
                }).success(function (ret) {
                    if(ret != null)
                        asynctask(ret);
                }).error(function () {
                    $('#process').css('display', 'none');
                    alert('因网络问题无法上传文件');
                });
            }else{
                alert('文件总量过大，请调整需要上传的文件大小');
            }
        };

        function asynctask(timestamp){
            $http({
                method:'get',
                url:$rootScope.hostUrl + 'asynctask',
                params: {
                    'timestamp': timestamp,
                    'id': $rootScope.userInfo.userId
                },
                timeout: 5000
            }).success(function(ret){
                    if(ret != null && ret == true){
                        var preprocess = false;
                        var intervalId = setInterval(checkAsyncTaskCompleted, 1000);
                        function checkAsyncTaskCompleted() {
                            var p_object = $('#pie-container');
                            var c_object = $('#column-container');

                            $http.get($rootScope.hostUrl + 'fetch',{
                                params:{
                                    'timestamp': timestamp,
                                    'id': $rootScope.userInfo.userId
                                }
                            })
                                .success(function (data) {
                                    if(data != null && preprocess == false){
                                        preprocess = true;
                                        $('#process').css('display', 'none');
                                    }
                                    if(data != null && data.flag == false)
                                        $rootScope.paintReport(p_object, c_object, data);
                                    else if(data != null && data.flag == true){
                                        $rootScope.paintReport(p_object, c_object, data);
                                        clearInterval(intervalId);
                                        $scope.jobFinished = true;
                                        $scope.detectPath = data.reportName;
                                    }
                                })
                                .error(function () {
                                    $('#process').css('display', 'none');
                                    alert('因网络原因无法获取检测数据');
                                })
                        }
                    }
                })
                .error(function () {
                    $('#process').css('display', 'none');
                    alert('因网络原因无法开始检测任务');
                })

        }

        $rootScope.download = function(fileName){
            var url = $rootScope.hostUrl + 'download';
            $.fileDownload(url,{
                httpMethod: 'POST',
                data:{
                    "fileName": fileName
                },
                prepareCallback:function(url){
                },
                successCallback:function(url){
                },
                failCallback: function (html, url) {
                }
            });
        }

        $scope.finishJob = function () {
            $scope.emptyList();
            $scope.jobFinished = false;
            $scope.displayMode = 'upload-mode';
        }

        // 绘制图表
        $rootScope.paintReport = function(p_object, c_object, data){
            var p_chart = {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                animation: false
            };
            var p_title = {
                text: '已检测隐私信息所占比例'
            };
            var p_tooltip = {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            };
            var p_plotOptions = {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}%</b>: {point.percentage:.1f} %',
                        style: {
                            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                        }
                    },
                    colors:['#7CB5EC', '#B1181E']
                },
                series: { animation: false }
            };
            var p_series= [{
                type: 'pie',
                name: '所占比',
                data: [
                    ['非隐私信息',   (data.sum - data.priv) / data.sum],
                    {
                        name: '隐私信息',
                        y: (data.priv / data.sum),
                        sliced: true,
                        selected: true
                    }
                ]
            }];

            var p_json = {};
            p_json.chart = p_chart;
            p_json.title = p_title;
            p_json.tooltip = p_tooltip;
            p_json.series = p_series;
            p_json.plotOptions = p_plotOptions;
            // $('#pie-container').highcharts(p_json);
            p_object.highcharts(p_json);

            var c_chart = {
                type: 'column',
                inverted: true,
                animation: false
            };
            var c_title = {
                text: '各隐私信息数量'
            };
            var c_xAxis = {
                categories: ['身份证号','银行卡号','电话号码','邮箱','地址','IP地址','MAC地址'],
                crosshair: true
            };
            var c_yAxis = {
                min: 0,
                title: {
                    text: '数量 (条)'
                }
            };
            var c_tooltip = {
                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:.1f} 条</b></td></tr>',
                footerFormat: '</table>',
                shared: true,
                useHTML: true
            };
            var c_plotOptions = {
                column: {
                    pointPadding: 0.2,
                    borderWidth: 0
                },
                series: { animation: false }
            };
            var credits = {
                enabled: false
            };

            var legend = {
                enabled: false
            }

            var c_series= [{
                name: '数量',
                data: [data.id, data.bank, data.phone, data.email, data.address, data.ip, data.mac],
                color: '#B1181E'}];

            var c_json = {};
            c_json.chart = c_chart;
            c_json.title = c_title;
            c_json.tooltip = c_tooltip;
            c_json.xAxis = c_xAxis;
            c_json.yAxis = c_yAxis;
            c_json.series = c_series;
            c_json.plotOptions = c_plotOptions;
            c_json.credits = credits;
            c_json.legend = legend;
            //$('#column-container').highcharts(c_json);
            c_object.highcharts(c_json);
        }
    });