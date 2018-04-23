/**
 * Created by Sunny on 2018/4/3.
 */
angular.module('login.controllers', [])
    .controller('loginCtrl', function($scope, $rootScope, $http){
        $rootScope.userInfo = null;
        $scope.registerdata={};
        $scope.logindata={};
        $scope.registerState = false;
        $scope.submitRegisterForm = function () {

            if ($scope.signUpForm.$invalid){
                alert("请检查您的信息！");
            }else{
                $http({
                    method:'POST',
                    url  : $rootScope.hostUrl + 'signup',
                    data: {
                        userName: $scope.registerdata.username,
                        password: $scope.registerdata.password2
                    },
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    transformRequest:  $rootScope.transformRequest
                }).success(function(ret) {
                        if(ret != null && ret.result == 'true'){
                            alert('注册成功');
                            $rootScope.userInfo = {
                                'userId': ret.message,
                                'userName': $scope.registerdata.username
                            };
                            $('user-info').innerHTML = '';
                            window.location.href='#main';
                        }else if(ret != null && ret.result == 'false'&& ret.message == 'duplication'){
                            alert('注册失败，用户名已存在');
                        } else {
                            alert('注册失败，因网络原因无法注册');
                        }
                    })
                    .error(function() {
                        alert('注册失败，因网络原因无法注册');
                    });
            }
        }

        $scope.submitLoginForm = function (){

            if ($scope.signInForm.$invalid){
                alert("请检查您的信息！");
            }else{
                $http({
                        method:'POST',
                        url  : $rootScope.hostUrl + 'signin',
                        data: {
                            userName: $scope.logindata.username,
                            password: $scope.logindata.password
                        },
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        transformRequest:  $rootScope.transformRequest
                })
                    .success(function(ret) {
                        if(ret != null && ret.result == 'true'){
                            $rootScope.userInfo = {
                                'userId': ret.message,
                                'userName': $scope.logindata.username
                            };
                            window.location.href='#main';
                        }else {
                            alert('登录失败，请检查用户名和密码');
                        }
                    })
                    .error(function() {
                        alert('登录失败，因网络原因无法登录');
                    });
            }
        }
    })

    .directive('compare', function () {
        var o = {};
        o.strict='AE';
        o.scope={
            orgText:'=compare'
        };
        o.require='ngModel';
        o.link=function(sco,ele,att,con){
            con.$validators.compare=function(v){
                return v==sco.orgText;
            };
            sco.$watch('orgText',function(){
                con.$validate();
            })
        };
        return o;
    });
