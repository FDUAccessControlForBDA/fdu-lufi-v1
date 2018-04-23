/**
 * Created by Sunny on 2018/4/2.
 */
var lufiApp = angular.module('lufiApp', ['ui.router', 'lufiApp.controllers', 'info.controllers', 'login.controllers']);
lufiApp.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.when('', '/main');
    $stateProvider

        .state('login',{
            url: '/login',
            cache: 'false',
            templateUrl: 'templates/login.html',
            controller: 'loginCtrl'
        })

        .state('main', {
            url: '/main',
            cache: 'false',
            templateUrl: 'templates/main.html',
            controller: 'mainCtrl'
        })

        .state('law', {
            url: '/law',
            cache: 'false',
            templateUrl: 'templates/law.html',
            controller: 'lawCtrl'
        })

        .state('privacy', {
            url: '/privacy',
            cache: 'false',
            templateUrl: 'templates/privacy.html',
            controller: 'privacyCtrl'
        })

        .state('about', {
            url: '/about',
            cache: 'false',
            templateUrl: 'templates/about.html',
            controller: 'aboutCtrl'
        })

        .state('contact', {
            url: '/contact',
            cache: 'false',
            templateUrl: 'templates/contact.html',
            controller: 'contactCtrl'
        })

        .state('profile',{
            url: '/profile',
            cache: 'false',
            templateUrl: 'templates/profile.html',
            controller: 'profileCtrl'
        })
}]);