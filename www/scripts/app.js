angular.module('starter', ['ionic',
    'starter.controllers',
    'starter.services',
    'ngCordova',
    'ngStorage',
    'angular-svg-round-progress',
    'ngMask'])

  .run(function($ionicPlatform, $cordovaDialogs, $cordovaDevice, $localStorage, $rootScope) {
    $localStorage.TKATOVersion = "1.2.0";

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

    $localStorage.isWebView = ionic.Platform.isWebView();
    $localStorage.isIPad = ionic.Platform.isIPad();
    $localStorage.isIOS = ionic.Platform.isIOS();
    $localStorage.isAndroid = ionic.Platform.isAndroid();
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

    $ionicConfigProvider.backButton.text('Geri').icon('ion-arrow-left-c');
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
        };
        modelCtrl.$parsers.push(capitalize);
        capitalize(scope[attrs.ngModel]); // capitalize initial value
      }
    };
  })

  .directive('emailValidate', function() {
    return {
      require: 'ngModel',
      link: function(scope, elm, attrs, ctrl) {
        ctrl.$parsers.unshift(function(viewValue) {

          scope.wordAt = viewValue.split("@");
          scope.isValidEmail = (scope.wordAt && scope.wordAt >= 5 ? 'valid' : undefined);

          if(scope.isValidEmail) {
            ctrl.$setValidity('valid', true);
            //elm.$setValidity('pwd', true); //<-- I WANT THIS TO WORK! (or something like it)

            return viewValue;
          } else {
            ctrl.$setValidity('noValid', false);
            //elm.$setValidity('pwd', false); //<-- I WANT THIS TO WORK! (or something like it)

            return undefined;
          }

        });
      }
    };
  });
