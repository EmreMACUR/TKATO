angular.module('starter.services', [])

  .constant('$ionicLoadingConfig', {
    template: '<ion-spinner></ion-spinner><br/>Lütfen Bekleyiniz...',
    number: 2000
  })
  .constant('Server', {
    Development : 'http://rlservice.telekurye.com.tr/',
    Product: 'http://192.168.1.175/',
    CouchDevelopment: 'http://couchdb.telekurye.com.tr:5984/db_',
    CouchProduct: 'http://192.168.1.8:5984/db_'
  })
  /*.constant('Server', {
   Product: 'http://rlservice.telekurye.com.tr/',
   Development: 'http://192.168.1.175/',
   CouchProduct: 'http://couchdb.telekurye.com.tr:5984/db_',
   CouchDevelopment: 'http://192.168.1.35:5984/db_'
   })*/
  /*.constant('Server', {
   Development : 'XXX',
   Product: 'XXX',
   CouchDevelopment: 'XXX',
   CouchProduct: 'XXX'
   })*/

  .service("$pouchDB", ["$rootScope", "$q", "$localStorage", "$cordovaDialogs",
    function($rootScope, $q, $localStorage, $cordovaDialogs) {
      Date.prototype.addHours= function(h){
        this.setHours(this.getHours()+h);
        return this;
      };

      Date.prototype.addDays = function(days)
      {
        var dat = new Date(this.valueOf());
        dat.setDate(dat.getDate() + days);
        return dat;
      };
    var database;
    var changeListener;
    var isMissionContinious = false;

    this.setDatabase = function(databaseName) {
      database = new PouchDB(databaseName, {adapter: 'websql', auto_compaction: true});
    };

    this.startListening = function() {
      changeListener = database.changes({
        live: true,
        include_docs: true
      }).on("change", function(change) {
        var minDate, maxDate, nowDate =  new Date().addDays(1).addHours(-21).toISOString().slice(0, 19), courierId;
        if(!change.deleted) {
          $rootScope.$broadcast("$pouchDB:change", change);
          courierId = "" + change.doc.CourierId;

          if(courierId != $localStorage.UserId)
            deleteNonDb(change.doc._id);
          else {
            minDate = Date.parse(change.doc.OperationDate.MinDate);
            maxDate = Date.parse(change.doc.OperationDate.MaxDate);
            nowDate = Date.parse(nowDate);
            if(minDate <= nowDate && nowDate <= maxDate)
              console.log();
            else
              deleteNonDb(change.doc._id);
          }

        } else {
          $rootScope.$broadcast("$pouchDB:delete", change);
        }
        getDbInfo().then(function(response) {
          $rootScope.dbInfo = response;
          $rootScope.distCount = response.doc_count;
          //missionContinious(response.doc_count);
        });
        cleanup();
        compact();
      });
    };

    var missionContinious = function (docCount) {
      if(docCount == 0 && !isMissionContinious)
      {
        isMissionContinious = true;
        $cordovaDialogs.alert('Dağıtım göreviniz bulunmamaktadır.', 'Bilgilendirme', 'Çıkış Yap')
        .then(function() {
          database.destroy().then(function (response) {
            if(response.ok)
              ionic.Platform.exitApp();
          }).catch(function (err) {
            $cordovaDialogs.alert('Cihazdaki veritabanı ile ilgili işlem yapılırken hata oluştu.', 'Cihaz Hatası!', 'Tamam');
          });
        });
    }};

    var deleteNonDb = function (docId) {
      database.get(docId).then(function (doc) {
        return database.remove(doc).catch(function(error) {
          // error
        });
      });
    };

    var getDbInfo = function() {
      var deferred = $q.defer();
      database.info().then(function(info) {
        deferred.resolve(info);
      }).catch(function(error) {
        deferred.reject(error);
      });
      return deferred.promise;
    };

    this.sync = function(remoteDatabase) {
      if($localStorage.UserId != 0 && $localStorage.UserId != null)
        database.sync(remoteDatabase, {
          live: true,
          retry: true});
      else
        $cordovaDialogs.alert('Senkronizasyon sırasında ana sunucuya bağlanamadı. Lütfen tekrar deneyin.', 'Sunucu Hatası!', 'Tamam');

      getDbInfo().then(function(response) {
        $rootScope.dbInfo = response;
        $rootScope.distCount = response.doc_count;
      });
    };

    var compact = function () {
      var deferred = $q.defer();
      database.compact().then(function(result) {
        deferred.resolve(result);
      }).catch(function(error) {
        deferred.reject(error);
      });
      return deferred.promise;
    };

    var cleanup = function () {
      var deferred = $q.defer();
      database.viewCleanup().then(function(result) {
        deferred.resolve(result);
      }).catch(function(error) {
        deferred.reject(error);
      });
      return deferred.promise;
    };

    this.save = function(jsonDocument) {
      var deferred = $q.defer();
      if(!jsonDocument._id) {
        database.post(jsonDocument).then(function(response) {
          deferred.resolve(response);
        }).catch(function(error) {
          deferred.reject(error);
        });
      } else {
        database.put(jsonDocument).then(function(response) {
          deferred.resolve(response);
        }).catch(function(error) {
          deferred.reject(error);
        });
      }
      return deferred.promise;
    };

    this.saveAttachment = function(_id, name, data, content_type) {
      var deferred = $q.defer();
        database.putAttachment(_id, name, data, content_type)
        .then(function(response) {
          deferred.resolve(response);
        }).catch(function(error) {
          deferred.reject(error);
        });
      return deferred.promise;
    };

    this.delete = function(documentId, documentRevision) {
      return database.remove(documentId, documentRevision);
    };

    this.get = function(documentId) {
      return database.get(documentId, {attachments: true});
    };

    this.destroy = function() {
      database.destroy();
    };

    this.stopListening = function() {
      changeListener.cancel();
    };
  }])

  .factory('ConnectivityMonitor', function($rootScope, $cordovaNetwork, $localStorage){
    return {
      isOnline: function(){
        if(ionic.Platform.isWebView()){
          return $cordovaNetwork.isOnline();
        } else {
          return navigator.onLine;
        }
      },
      isOffline: function(){
        if(ionic.Platform.isWebView()){
          return !$cordovaNetwork.isOnline();
        } else {
          return !navigator.onLine;
        }
      },
      getNetworkType: function(){
        return $cordovaNetwork.getNetwork();
      },
      startWatching: function(){
        /*$rootScope.$watch(function() {
         $rootScope.networkType = $cordovaNetwork.getNetwork();
         $rootScope.isOnlineNetwork = $cordovaNetwork.isOnline();
         $rootScope.isOfflineNetwork = $cordovaNetwork.isOffline();

         });
         $localStorage.isOnlineNet = $rootScope.isOnlineNetwork;*/

        document.addEventListener("deviceready", function () {

          $rootScope.networkType = $cordovaNetwork.getNetwork();
          $rootScope.isOnlineNetwork = $cordovaNetwork.isOnline();
          $rootScope.$apply();

          // listen for Online event
          $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
            $rootScope.isOnlineNetwork = true;
            $localStorage.isOnlineNet = true;
            $rootScope.networkType = $cordovaNetwork.getNetwork();

            $rootScope.$apply();
          });

          // listen for Offline event
          $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
            $rootScope.isOnlineNetwork = false;
            $localStorage.isOnlineNet = false;
            $rootScope.networkType = $cordovaNetwork.getNetwork();

            $rootScope.$apply();
          })

        }, false);
      }
    }
  })

  .service('CordovaNetwork', ['$ionicPlatform', '$q', function($ionicPlatform, $q) {
    var Connection = window.Connection || {
        "CELL"     : "cellular",
        "CELL_2G"  : "2g",
        "CELL_3G"  : "3g",
        "CELL_4G"  : "4g",
        "ETHERNET" : "ethernet",
        "NONE"     : "none",
        "UNKNOWN"  : "unknown",
        "WIFI"     : "wifi"
      };

    var asyncGetConnection = function () {
      var q = $q.defer();
      $ionicPlatform.ready(function () {
        if(navigator.connection) {
          q.resolve(navigator.connection);
        } else {
          q.reject('navigator.connection is not defined');
        }
      });
      return q.promise;
    };

    return {
      isOnline: function () {
        return asyncGetConnection().then(function(networkConnection) {
          var isConnected = false;

          switch (networkConnection.type) {
            case Connection.ETHERNET:
            case Connection.WIFI:
            case Connection.CELL_2G:
            case Connection.CELL_3G:
            case Connection.CELL_4G:
            case Connection.CELL:
              isConnected = true;
              break;
          }
          return isConnected;
        });
      }
    };
  }])

  .service('ProgressDialog', function () {

    this.setProgressIndicator = function(title, message, cancelable) {
      cordova.plugin.pDialog.init({
          theme: 'HOLO_DARK',
          title: title,
          message : message,
          progressStyle: 'HORIZONTAL'
        })
        .setProgress(0)
        .setCancelable(cancelable);
    };

    this.setProgressPercent = function (per) {
      cordova.plugin.pDialog.setProgress(per);
    };

    this.setProgressDismiss = function () {
      cordova.plugin.pDialog.dismiss();
    }
  })

  .service('AlertDialog', ['$cordovaDialogs', function($cordovaDialogs) {

    this.setDialogInit = function(message, title, buttonName) {
      $cordovaDialogs.alert(message, title, buttonName);
    };
  }])

  .service('ToastService', ['$cordovaToast', function($cordovaToast) {

    this.setToastInit = function(message, duration, position) {
      $cordovaToast.show(message, duration, position);
      // duration: 'short', 'long', '3000', 900
      // position: 'top', 'center', 'bottom'
    };

    this.setToastClose = function() {
      $cordovaToast.hide();
    };

  }])

  .service('LoginService', function($q, $http, $localStorage, UserService, Server) {
    return {
      loginUser: function(name, pw) {
        var deferred = $q.defer();
        var promise = deferred.promise;

        $localStorage.Token = null;
        var userId = 0;

        $http({
          method: 'POST',
          url: Server.Development + 'ATO/token', // 'http://rlservice.telekurye.com.tr/token',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
          data: 'grant_type=password&username=' + name + '&password=' + pw
        })
          .success(function (data, status, headers, config) {
            UserService.userInfos(name, pw).then(function(data) {
              userId = data;

              if(userId != 0) {
                $localStorage.Token = data.access_token;

                $localStorage.Token = 'Baraer ' + $localStorage.Token;

                if ($localStorage.Token != null) {
                  deferred.resolve($localStorage.Token);
                } else {
                  deferred.reject($localStorage.Token);
                }
              }
              else {
                deferred.reject(null);
              }
            }, function(err) {
              deferred.reject(null);
            });
          }).error(function (data, status) {
          deferred.reject($localStorage.Token);
        });

        promise.success = function(fn) {
          promise.then(fn);
          return promise;
        };
        promise.error = function(fn) {
          promise.then(null, fn);
          return promise;
        };
        return promise;
      }
    }
  })

  .service('UserService', function($q, $http, $localStorage, Server) {
    return {
      userInfos: function(name, pw) {
        var deferred = $q.defer();
        var promise = deferred.promise;

        $localStorage.UserId = 0;

        $http.get(Server.Development + 'ATO/UserInfo/Details/?username=' + name + '&password=' + pw).
        success(function(data, status, headers, config) {
            $localStorage.UserId = "" + data;

            if ($localStorage.UserId) {
              deferred.resolve($localStorage.UserId);
            } else {
              deferred.reject($localStorage.UserId);
            }
          }).
        error(function (data, status) {
            $localStorage.UserId = 0;
            deferred.reject($localStorage.UserId);
        });

        promise.success = function(fn) {
          promise.then(fn);
          return promise;
        };
        promise.error = function(fn) {
          promise.then(null, fn);
          return promise;
        };
        return promise;
      }
    }
  })

  .service('VersionService', function($q, $http, $localStorage, Server) {
    return {
      check: function() {
        var deferred = $q.defer();
        var promise = deferred.promise;

        var version = null;

        $http.get(Server.Development + 'ATOVersionCheck/Api/Check').
        success(function(data, status, headers, config) {
          if(status != 200)
            deferred.reject(null);
          else {
            version = data;

            if (version) {
              deferred.resolve(version);
            } else {
              deferred.reject(null);
            }
          }
        }).
        error(function (data, status) {
          version = null;
          deferred.reject(version);
        });

        promise.success = function(fn) {
          promise.then(fn);
          return promise;
        };
        promise.error = function(fn) {
          promise.then(null, fn);
          return promise;
        };
        return promise;
      }
    }
  });
