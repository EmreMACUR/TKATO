angular.module('starter', ['ionic',
    'starter.controllers',
    'starter.services',
    'ngCordova',
    'ngStorage',
    'angular-svg-round-progress',
    'ngMask'])

  .run(function($ionicPlatform, $cordovaDialogs, $cordovaDevice, $localStorage, $rootScope) {
    //$localStorage.UserId = 79;

    $ionicPlatform.ready(function() {
      if(window.Connection) {
        if(navigator.connection.type == Connection.NONE) {
          $cordovaDialogs.alert('İnternetiniz bulunmamaktadır, lütfen açık alana çıkınız.', 'Uyarı', 'Tamam')
            .then(function() {
              ionic.Platform.exitApp();
            });
        }
      }

      if (window.cordova &&
        window.cordova.plugins &&
        window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
        cordova.plugins.Keyboard.disableScroll(false);

      }
      if (window.StatusBar) {
        StatusBar.styleDefault();
      }
    });

    document.addEventListener("deviceready", function () {
      $localStorage.platform = $cordovaDevice.getPlatform();
      $localStorage.uuid = $cordovaDevice.getUUID();
      $localStorage.version = $cordovaDevice.getVersion();
      $localStorage.model = '' + $cordovaDevice.getManufacturer() + ' ' + $cordovaDevice.getModel();
      $localStorage.appVersion = $cordovaDevice.getCordova();
    }, false);

    $rootScope.workingOnMission = null;
    $localStorage.previousObjectId = null;
  })

  .config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider,
                   $compileProvider) {

    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
      })

      .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html'
      })

      .state('tab.dists', {
        url: '/dists',
        views: {
          'tab-dists': {
            templateUrl: 'templates/tab-dists.html',
            controller: 'DistsCtrl'
          }
        }
      })
      .state('tab.dist-detail', {
        url: '/dists/:distId',
        views: {
          'tab-dists': {
            templateUrl: 'templates/dist-detail.html',
            controller: 'DistDetailCtrl'
          }
        }
      })

      .state('tab.informations', {
        url: '/informations',
        views: {
          'tab-informations': {
            templateUrl: 'templates/tab-informations.html',
            controller: 'InformationsCtrl'
          }
        }
      });

    $urlRouterProvider.otherwise('/login');

    $ionicConfigProvider.tabs.position('bottom');

    //$compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);

    $ionicConfigProvider.backButton.text('Geri');
  })

  .directive('capitalize', function() {
    return {
      require: 'ngModel',
      link: function(scope, element, attrs, modelCtrl) {
        var capitalize = function(inputValue) {
          if (inputValue == undefined) inputValue = '';
          var capitalized = inputValue.toUpperCase();
          if (capitalized !== inputValue) {
            modelCtrl.$setViewValue(capitalized);
            modelCtrl.$render();
          }
          return capitalized;
        }
        modelCtrl.$parsers.push(capitalize);
        capitalize(scope[attrs.ngModel]); // capitalize initial value
      }
    };
  });
