angular.module('starter.controllers', [])

  .controller('DistsCtrl', function($scope, $ionicLoading, $pouchDB, $localStorage,
                                    $rootScope, $filter, Server, $cordovaDialogs) {
    $pouchDB.setDatabase("syncDatabase");
    $pouchDB.sync(Server.CouchDevelopment + $localStorage.UserId);
    //$pouchDB.sync(Server.CouchProduct + $localStorage.UserId);
    $pouchDB.startListening();

    $scope.items = {};
    $ionicLoading.show();

    $scope.clearSearch = function() {
      $scope.data.searchQuery = '';
    };

    $rootScope.$on("$pouchDB:change", function(event, data) {
      $ionicLoading.show();
      $scope.items[data.doc._id] = data.doc;
      $scope.$apply();
      $ionicLoading.hide();
    });

    $rootScope.$on("$pouchDB:delete", function(event, data) {
      delete $scope.items[data.doc._id];
      $scope.$apply();
    });
  })

  .controller('DistDetailCtrl', function($scope, $stateParams, $pouchDB, $rootScope, $q,
                                         $ionicLoading, $http, $timeout, $ionicModal,
                                         $cordovaCamera, $cordovaDialogs, $localStorage,
                                         $cordovaGeolocation, $state, Server, ToastService) {

    if($rootScope.workingOnMission == null)
    {
      $cordovaDialogs.confirm('Bu göreve başlamak istediğinize emin misiniz? Eğer başlarsanız tamamlayana kadar başka göreve geçemezsiniz.',
        'Görev Başlama Uyarısı', ['Göreve Başla', 'Görev Listesine Git'])
        .then(function(buttonIndex) {
          if(buttonIndex == 1)
            $rootScope.workingOnMission = $stateParams.distId;
          else
            $state.go('tab.dists');
        });
    }
    else if($rootScope.workingOnMission == $stateParams.distId)
    {
      $rootScope.workingOnMission = $stateParams.distId;
    }
    else
    {
      $cordovaDialogs.alert('Lütfen görevinizi tamamlamadan diğerine geçmeyiniz.', 'Görev Geçiş Uyarısı', 'Görev Listesine Git')
        .then(function() {
          $state.go('tab.dists');
        });
    }

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

    $scope.previousObjectId = null;
    $ionicLoading.show();
    $scope.dist = {};
    $scope.receiverForm = {};
    $scope.oneselfInfos = {};
    $scope.noVisitCardForm = {};
    $scope.done = false;
    $scope.isNotPhotoBuildingButton = false;
    $scope.isNotPhotoCompanyButton = false;
    $scope.isNotPhotoTaxButton = false;
    $scope.isNotPhotoBusinessCardButton = false;
    $scope.isNotPhotoSignatureButton = false;
    var mytimeout = null;
    $scope.smsPass = "";
    $scope.lat  = 0;
    $scope.long = 0;
    $scope.phaseDescription = "";
    $scope.isReceiverEqualOneself = false;
    $scope.isOutsideMaxPhotoCount = false;
    $scope.isInsideMaxPhotoCount = false;
    $scope.isOutsideMinPhotoCount = false;
    $scope.OutsideMin = 0;
    $scope.OutsideMax = 0;
    $scope.InsideMin = 0;
    $scope.InsideMax = 0;
    $scope.isInsideMinPhotoCount = false;
    $scope.gsmNumber = "";
    $scope.visitCardChoice = 'visitCardOk';
    $scope.visitChoice = $scope.visitCardChoice;
    $scope.OutsidePhotoCount = 0;
    $scope.InsidePhotoCount = 0;
    $scope.outsideCount = 0;
    $scope.insideCount = 0;
    $scope.isReceiverEqualOneself = false;
    $scope.receiverNameSurname = "";
    $scope.receiverTelNumber = "";
    var jsonDocument = {};
    var imageJsonDocument = {
      "Image": "",
      "CreateDate": "",
      "Lat": 0,
      "Long": 0,
      "Accuracy": 0
    };
    var FeedbackResult = {
      "ImageInfos": {
        "OutsideImages": {"BuildingImages": [], "TaxCertificateImages": [], "CompanySignboards": []},
        "InsideImages": {"BusinessCardImages": [], "SignatureImages": []}
      },
      "ReceiverInfos": {
        "Interviewed": {
          "NameSurname": null,
          "JobDescription": null,
          "PhoneNumber": null,
          "Email": null
        },
        "Oneself": {
          "NameSurname": null,
          "PhoneNumber": null,
          "Email": null,
          "TCKN": null
        },
        "Accountancy": {
          "NameSurname": null,
          "TCKN": null,
          "PhoneTelNumber": null,
          "Email": null
        },
        "NoVisitCard": {
          "Email": null,
          "StaticTelNumber": null,
          "FaxNumber": null,
          "PhoneTelNumber": null,
          "WebPage": null
        }
      },
      "DeliveryStatusInfos": {
        "IsDelivery": null,
        "Id": null,
        "Description": null
      },
      "SmsConfirmInfos": {
        "IsSent": null,
        "Description": null
      },
      "DeviceProperties": {
        "UUID": null,
        "Platform": null,
        "Model": null,
        "Version": null,
        "AppVersion": null,
        "TKATOVersion": null
      }
    };
    var attachments = {
      Out_BuildingImage: { content_type: 'text/plain', data: ''},
      Out_TaxCertificateImage: { content_type: 'text/plain', data: ''},
      Out_CompanySignBoardImage: { content_type: 'text/plain', data: ''},
      In_BusinessCardImage: { content_type: 'text/plain', data: ''},
      In_SignatureImage: { content_type: 'text/plain', data: ''}
    };

    if($localStorage.previousObjectId != null)
      $scope.previousObjectId = $localStorage.previousObjectId;

    var posOptions = {timeout: 10000, enableHighAccuracy: false};
    $cordovaGeolocation
      .getCurrentPosition(posOptions)
      .then(function (position) {
        $scope.lat  = position.coords.latitude;
        $scope.long = position.coords.longitude;
      }, function(err) {
        // error
        //ToastService.setToastInit("Lokasyon bilgisi alınamadı!", "short", "top");
      });

    var confirmShow = function (confirmText) {
      $ionicLoading.show({
        template: '<i class="ion-checkmark-round bigIcon"></i><br/>' + confirmText + '',
        noBackdrop: true,
        number: 3000
      });
    };

    var errorShow = function () {
      $cordovaDialogs.alert('Kayıt sırasında teknik bir hata oluştu. Lütfen tekrar deneyin.', 'Uyarı', 'Tamam');
    };

    var warningShow = function (txt) {
      $cordovaDialogs.alert(txt, 'Uyarı', 'Tamam')
    };

    var phaseList = ['phase1', 'phase2', 'phase3', 'phase4', 'phase5', 'phase6', 'phase7', 'phase8', 'phase9', 'phase10', 'phase11', 'phase12'];

    var phase0 = function() {
      $scope.isLoading = true;
      $scope.isOutsideMinPhotoCount = true;
      $scope.isInsideMinPhotoCount = true;
      $scope.isStatusChecked = true;
      $scope.isDeliveryStatusChecked = true;
      $scope.isNotPhotoBuildingButton = false;
      $scope.isNotPhotoCompanyButton = false;
      $scope.isNotPhotoTaxButton = false;
      $scope.isNotPhotoBusinessCardButton = false;
      $scope.isNotPhotoSignatureButton = false;
    };
    var phase1 = function() {
      $scope.phaseDescription = "Mekan Fotoğraf Çekimi";
      $scope.isPhase1 = true;
      $scope.isPhase2 = false;
      $scope.isPhase3 = false;
      $scope.isPhase4 = false;
      $scope.isPhase5 = false;
      $scope.isPhase6 = false;
      $scope.isPhase7 = false;
      $scope.isPhase8 = false;
      $scope.isPhase9 = false;
      $scope.isPhase10 = false;
      $scope.isPhase11 = false;
      $scope.isPhase12 = false;
    };
    var phase2 = function() {
      $scope.phaseDescription = "Statü Seçimi";
      $scope.isPhase1 = false;
      $scope.isPhase2 = true;
      $scope.isPhase3 = false;
      $scope.isPhase4 = false;
      $scope.isPhase5 = false;
      $scope.isPhase6 = false;
      $scope.isPhase7 = false;
      $scope.isPhase8 = false;
      $scope.isPhase9 = false;
      $scope.isPhase10 = false;
      $scope.isPhase11 = false;
      $scope.isPhase12 = false;
    };
    var phase3 = function() {
      $scope.phaseDescription = "Güncellendi Statü Seçimi";
      $scope.isPhase1 = false;
      $scope.isPhase2 = false;
      $scope.isPhase3 = true;
      $scope.isPhase4 = false;
      $scope.isPhase5 = false;
      $scope.isPhase6 = false;
      $scope.isPhase7 = false;
      $scope.isPhase8 = false;
      $scope.isPhase9 = false;
      $scope.isPhase10 = false;
      $scope.isPhase11 = false;
      $scope.isPhase12 = false;
    };
    var phase4 = function() {
      $scope.phaseDescription = "Güncellenemedi Statü Seçimi";
      $scope.isPhase1 = false;
      $scope.isPhase2 = false;
      $scope.isPhase3 = false;
      $scope.isPhase4 = true;
      $scope.isPhase5 = false;
      $scope.isPhase6 = false;
      $scope.isPhase7 = false;
      $scope.isPhase8 = false;
      $scope.isPhase9 = false;
      $scope.isPhase10 = false;
      $scope.isPhase11 = false;
      $scope.isPhase12 = false;
    };
    var phase5 = function() {
      $scope.phaseDescription = "Kartvizit Seçimi";
      $scope.isPhase1 = false;
      $scope.isPhase2 = false;
      $scope.isPhase3 = false;
      $scope.isPhase4 = false;
      $scope.isPhase5 = true;
      $scope.isPhase6 = false;
      $scope.isPhase7 = false;
      $scope.isPhase8 = false;
      $scope.isPhase9 = false;
      $scope.isPhase10 = false;
      $scope.isPhase11 = false;
      $scope.isPhase12 = false;
    };
    var phase6 = function() {
      $scope.phaseDescription = "Firma Bilgileri";
      $scope.isPhase1 = false;
      $scope.isPhase2 = false;
      $scope.isPhase3 = false;
      $scope.isPhase4 = false;
      $scope.isPhase5 = false;
      $scope.isPhase6 = true;
      $scope.isPhase7 = false;
      $scope.isPhase8 = false;
      $scope.isPhase8 = false;
      $scope.isPhase9 = false;
      $scope.isPhase10 = false;
      $scope.isPhase11 = false;
      $scope.isPhase12 = false;
    };
    var phase7 = function() {
      $scope.phaseDescription = "İmza Yetkili Kişi Bilgileri";
      $scope.isPhase1 = false;
      $scope.isPhase2 = false;
      $scope.isPhase3 = false;
      $scope.isPhase4 = false;
      $scope.isPhase5 = false;
      $scope.isPhase6 = false;
      $scope.isPhase7 = true;
      $scope.isPhase8 = false;
      $scope.isPhase9 = false;
      $scope.isPhase10 = false;
      $scope.isPhase11 = false;
      $scope.isPhase12 = false;
    };
    var phase8 = function() {
      $scope.phaseDescription = "Muhasebe Yetkili Kişi Bilgileri";
      $scope.isPhase1 = false;
      $scope.isPhase2 = false;
      $scope.isPhase3 = false;
      $scope.isPhase4 = false;
      $scope.isPhase5 = false;
      $scope.isPhase6 = false;
      $scope.isPhase7 = false;
      $scope.isPhase8 = true;
      $scope.isPhase9 = false;
      $scope.isPhase10 = false;
      $scope.isPhase11 = false;
      $scope.isPhase12 = false;
    };
    var phase9 = function() {
      $scope.phaseDescription = "Görüşülen Kişi Bilgileri";
      $scope.isPhase1 = false;
      $scope.isPhase2 = false;
      $scope.isPhase3 = false;
      $scope.isPhase4 = false;
      $scope.isPhase5 = false;
      $scope.isPhase6 = false;
      $scope.isPhase7 = false;
      $scope.isPhase8 = false;
      $scope.isPhase9 = true;
      $scope.isPhase10 = false;
      $scope.isPhase11 = false;
      $scope.isPhase12 = false;
    };
    var phase10 = function() {
      $scope.phaseDescription = "Döküman Fotoğraf Çekimi";
      $scope.isPhase1 = false;
      $scope.isPhase2 = false;
      $scope.isPhase3 = false;
      $scope.isPhase4 = false;
      $scope.isPhase5 = false;
      $scope.isPhase6 = false;
      $scope.isPhase7 = false;
      $scope.isPhase8 = false;
      $scope.isPhase9 = false;
      $scope.isPhase10 = true;
      $scope.isPhase11 = false;
      $scope.isPhase12 = false;
    };
    var phase11 = function() {
      $scope.phaseDescription = "Sms Onayı";
      $scope.isPhase1 = false;
      $scope.isPhase2 = false;
      $scope.isPhase3 = false;
      $scope.isPhase4 = false;
      $scope.isPhase5 = false;
      $scope.isPhase6 = false;
      $scope.isPhase7 = false;
      $scope.isPhase8 = false;
      $scope.isPhase9 = false;
      $scope.isPhase10 = false;
      $scope.isPhase11 = true;
      $scope.isPhase12 = false;
    };
    var phase12 = function() {
      $scope.phaseDescription = "Genel Bilgi Gösterimi";
      $scope.isPhase1 = false;
      $scope.isPhase2 = false;
      $scope.isPhase3 = false;
      $scope.isPhase4 = false;
      $scope.isPhase5 = false;
      $scope.isPhase6 = false;
      $scope.isPhase7 = false;
      $scope.isPhase8 = false;
      $scope.isPhase9 = false;
      $scope.isPhase10 = false;
      $scope.isPhase11 = false;
      $scope.isPhase12 = true;
    };
    $scope.next = function(phase) {
      if(phase == 1)
        phase1();
      else if(phase == 2)
        phase2();
      else if(phase == 3)
        phase3();
      else if(phase == 4)
        phase4();
      else if(phase == 5)
        phase5();
      else if(phase == 6)
        phase6();
      else if(phase == 7)
        phase7();
      else if(phase == 8)
        phase8();
      else if(phase == 9)
        phase9();
      else if(phase == 10)
        phase10();
      else if(phase == 11)
        phase11();
      else if(phase == 12)
        phase12();

    };

    var loadData = function(document) {
      $ionicLoading.show();
      phase0();
      var outsidePhotoCount = 0;
      var insidePhotoCount = 0;

      jsonDocument = document;

      if(jsonDocument.FeedbackResult != null)
      {
        FeedbackResult = jsonDocument.FeedbackResult;

        if(jsonDocument._attachments.Out_BuildingImage.data != "" &&
           jsonDocument._attachments.Out_BuildingImage.length != 0) {
          $scope.isNotPhotoBuildingButton = true;
          outsidePhotoCount = outsidePhotoCount + 1;
          base64ToBlob(jsonDocument._attachments.Out_BuildingImage.data).then(function (response) {
            attachments.Out_BuildingImage.data = response;
          }, function (error) {
            //attachments.Out_BuildingImage.data = "";
          });
        }
        if(jsonDocument._attachments.Out_CompanySignBoardImage.data != "" &&
           jsonDocument._attachments.Out_CompanySignBoardImage.length != 0) {
          $scope.isNotPhotoCompanyButton = true;
          outsidePhotoCount = outsidePhotoCount + 1;
          base64ToBlob(jsonDocument._attachments.Out_CompanySignBoardImage.data).then(function (response) {
            attachments.Out_CompanySignBoardImage.data = response;
          }, function (error) {
            //attachments.Out_CompanySignBoardImage.data = "";
          });
        }
        if(jsonDocument._attachments.Out_TaxCertificateImage.data != "" &&
           jsonDocument._attachments.Out_TaxCertificateImage.length != 0) {
          $scope.isNotPhotoTaxButton = true;
          outsidePhotoCount = outsidePhotoCount + 1;
          base64ToBlob(jsonDocument._attachments.Out_TaxCertificateImage.data).then(function (response) {
            attachments.Out_TaxCertificateImage.data = response;
          }, function (error) {
            //attachments.Out_TaxCertificateImage.data = "";
          });
        }
        if(jsonDocument._attachments.In_BusinessCardImage.data != "" &&
           jsonDocument._attachments.In_BusinessCardImage.length != 0) {
          $scope.isNotPhotoBusinessCardButton = true;
          insidePhotoCount = insidePhotoCount + 1;
          base64ToBlob(jsonDocument._attachments.In_BusinessCardImage.data).then(function (response) {
            attachments.In_BusinessCardImage.data = response;
          }, function (error) {
            //attachments.In_BusinessCardImage.data = "";
          });
        }
        if(jsonDocument._attachments.In_SignatureImage.data != "" &&
           jsonDocument._attachments.In_SignatureImage.length != 0) {
          $scope.isNotPhotoSignatureButton = true;
          insidePhotoCount = insidePhotoCount + 1;
          base64ToBlob(jsonDocument._attachments.In_SignatureImage.data).then(function (response) {
            attachments.In_SignatureImage.data = response;
          }, function (error) {
            //attachments.In_SignatureImage.data = "";
          });
        }

        $scope.outsideCount = outsidePhotoCount;
        $scope.insideCount = insidePhotoCount;
        $scope.OutsidePhotoCount = $scope.outsideCount;
        $scope.InsidePhotoCount = $scope.insideCount;
        $scope.WorkOrderDataStatus = jsonDocument.WorkOrderDataStatus;

        $scope.OutsideMin = jsonDocument.PhotoRequirements.Outside.Min;
        $scope.OutsideMax = jsonDocument.PhotoRequirements.Outside.Max;
        $scope.InsideMin = jsonDocument.PhotoRequirements.Inside.Min;
        $scope.InsideMax = jsonDocument.PhotoRequirements.Inside.Max;

        /*$scope.outsideCount = FeedbackResult.ImageInfos.OutsideImages.BuildingImages.length +
                           FeedbackResult.ImageInfos.OutsideImages.CompanySignboards.length +
                           FeedbackResult.ImageInfos.OutsideImages.TaxCertificateImages.length;
        $scope.insideCount = FeedbackResult.ImageInfos.InsideImages.BusinessCardImages.length +
                          FeedbackResult.ImageInfos.InsideImages.SignatureImages.length;


        if(FeedbackResult.ImageInfos.OutsideImages.BuildingImages.length != 0)
          $scope.isNotPhotoBuildingButton = true;
        if(FeedbackResult.ImageInfos.OutsideImages.CompanySignboards.length != 0)
          $scope.isNotPhotoCompanyButton = true;
        if(FeedbackResult.ImageInfos.OutsideImages.TaxCertificateImages.length != 0)
          $scope.isNotPhotoTaxButton = true;
        if(FeedbackResult.ImageInfos.InsideImages.BusinessCardImages.length != 0)
          $scope.isNotPhotoBusinessCardButton = true;
        if(FeedbackResult.ImageInfos.InsideImages.SignatureImages.length != 0)
          $scope.isNotPhotoSignatureButton = true;*/

        if(!FeedbackResult.SmsConfirmInfos.Description &&
          $scope.InsideMax != $scope.InsidePhotoCount &&
          $scope.InsidePhotoCount != 0 &&
          FeedbackResult.ReceiverInfos.Oneself.NameSurname)
          phase10();

        if($scope.InsideMax <= $scope.InsidePhotoCount &&
          !FeedbackResult.SmsConfirmInfos.Description)
          phase11();

        if($scope.InsideMax <= $scope.InsidePhotoCount &&
          FeedbackResult.SmsConfirmInfos.Description)
          phase12();

        if($scope.OutsideMax <= $scope.OutsidePhotoCount &&
          FeedbackResult.DeliveryStatusInfos.IsDelivery == false)
          phase12();

        if(!FeedbackResult.ReceiverInfos.Oneself.NameSurname &&
          FeedbackResult.DeliveryStatusInfos.IsDelivery == true &&
          $scope.visitChoice != 'visitCardOk')
          phase6();

        if(!FeedbackResult.ReceiverInfos.Oneself.NameSurname &&
          FeedbackResult.DeliveryStatusInfos.IsDelivery == true &&
          $scope.visitChoice == 'visitCardOk')
          phase7();

        if(!FeedbackResult.ReceiverInfos.Oneself.NameSurname &&
          FeedbackResult.DeliveryStatusInfos.IsDelivery == true &&
          !FeedbackResult.ReceiverInfos.NoVisitCard.NameSurname == true)
          phase5();

        if((FeedbackResult.ReceiverInfos.Oneself.NameSurname || FeedbackResult.ReceiverInfos.NoVisitCard.StaticTelNumber) &&
          FeedbackResult.DeliveryStatusInfos.IsDelivery == true && $scope.InsidePhotoCount == 0)
        {
          if(FeedbackResult.ReceiverInfos.NoVisitCard.StaticTelNumber &&
            !FeedbackResult.ReceiverInfos.Oneself.NameSurname &&
            $scope.visitChoice != 'visitCardOk')
            phase7();

          if(FeedbackResult.ReceiverInfos.Oneself.NameSurname &&
            !FeedbackResult.ReceiverInfos.Accountancy.NameSurname)
            phase8();

          if(FeedbackResult.ReceiverInfos.Accountancy.NameSurname &&
            !FeedbackResult.ReceiverInfos.Interviewed.NameSurname)
            phase9();

          if(FeedbackResult.ReceiverInfos.Interviewed.NameSurname &&
            $scope.InsidePhotoCount == 0)
            phase10();
        }

        if($scope.OutsideMax <= $scope.OutsidePhotoCount &&
          !FeedbackResult.DeliveryStatusInfos.Description)
          phase2();
        else if($scope.OutsideMax > $scope.OutsidePhotoCount)
          phase1();
      }
      else
      {
        saveDeviceProperties();
        //phase1();
        FeedbackResult.ImageInfos.OutsideImages.BuildingImages = [];
        FeedbackResult.ImageInfos.OutsideImages.CompanySignboards = [];
        FeedbackResult.ImageInfos.OutsideImages.TaxCertificateImages = [];
        attachments.Out_BuildingImage.data = "";
        attachments.Out_CompanySignBoardImage.data = "";
        attachments.Out_TaxCertificateImage.data = "";
        attachments.In_BusinessCardImage.data = "";
        attachments.In_SignatureImage.data = "";
        $scope.OutsidePhotoCount = 0;
        $scope.InsidePhotoCount = 0;
        $scope.isNotPhotoBuildingButton = false;
        $scope.isNotPhotoCompanyButton = false;
        $scope.isNotPhotoTaxButton = false;
        $scope.isReceiverEqualOneself = false;
        $scope.receiverNameSurname = "";
        $scope.receiverTelNumber = "";
      }

      $scope.isLoading = false;
      $ionicLoading.hide();
    };

    var base64ToBlob = function (base64Data) {
      var deferred = $q.defer();
      blobUtil.base64StringToBlob(base64Data).then(function (blob) {
        deferred.resolve(blob);
      }).catch(function (error) {
        //error
        deferred.reject(null);
      });
      return deferred.promise;
    };

    $pouchDB.get($stateParams.distId).then(function(response) {
      $scope.dist = response;

      loadData(response);

      $scope.$apply();

    }, function(error) {
      //console.log("ERROR -> " + error);
      ToastService.setToastInit("Veritabanından bilgi getirilemedi!", "short", "top");
      $ionicLoading.hide();
    });

    $scope.$on("$pouchDB:change", function(event, data) {
      if(data.doc._id == $stateParams.distId)
      {
        $scope.dist = data.doc;

        loadData(data.doc);

        $scope.$apply();
      }
    });

    var saveDB = function (feedback, confirmText, phase) {
      $ionicLoading.show();
      if($stateParams.distId) {
        jsonDocument["_id"] = $stateParams.distId;
        jsonDocument["FeedbackResult"] = feedback;
        if(confirmText == "Properties Save DB" ||
           confirmText == "Process return")
          jsonDocument["_attachments"] = attachments;
      }
      $pouchDB.save(jsonDocument).then(function(response) {
        if(response.ok == true)
        {
          //loadData(jsonDocument);
          //confirmShow(confirmText);
          $ionicLoading.hide();
          $scope.next(phase);
        }
        else
        {
          $ionicLoading.hide();
          $cordovaDialogs.alert('Kayıt sırasında hata oluştu: Lütfen tekrar deneyin!', 'Uyarı', 'Tamam');
        }

      }, function(error) {
        $ionicLoading.hide();
        $cordovaDialogs.alert('' + error , 'Uyarı', 'Tamam');
      });
    };

    var previousMissionPhotoGet = function () {
      $ionicLoading.show();
      $pouchDB.get($localStorage.previousObjectId).then(function(response) {
        $ionicLoading.hide();
        $scope.previousMissionPhoto = response._attachments.Out_BuildingImage.data;

      }, function(error) {
        $ionicLoading.hide();
        $cordovaDialogs.alert('Senkronizasyon gerçekleştiği için eski fotoğraf getirilemedi. Bir önceki görevin fotoğrafını artık kullanamazsınız.',
                              'Fotoğraf Eklenemedi!', 'Tamam');
      });
    };

    $ionicModal.fromTemplateUrl('templates/dist-detail-image-popup.html', {
      id: 1,
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modalAccount = modal;
    });
    $scope.openModal = function() {
      $scope.modalAccount.show();
      previousMissionPhotoGet();
    };
    $scope.closeModal = function(buttonIndex) {
      if(buttonIndex == 1)
        base64toBlobData($scope.previousMissionPhoto, 1);
      else
        $scope.previousMissionPhoto = null;
      $ionicLoading.hide();
      $scope.modalAccount.hide();
    };
    $scope.$on('$destroy', function() {
      $scope.modalAccount.remove();
    });

    $scope.isPreviousMissionPhotoGet = function () {
      $cordovaDialogs.confirm('Bir önceki görevin çekilen ilk dış fotoğrafını, bu göreve de dış fotoğraf olarak eklemek istediğinize emin misiniz?',
                              'Dış Fotoğraf Kullanımı', ['Evet','Hayır'])
        .then(function(buttonIndex) {
          if(buttonIndex == 1)
            $scope.openModal();
        });
    };

    var processReturn = function () {
      $scope.isReceiverEqualOneself = false;
      $scope.receiverNameSurname = "";
      $scope.receiverTelNumber = "";
      $scope.InsidePhotoCount = 0;
      attachments.In_BusinessCardImage.data = "";
      attachments.In_SignatureImage.data = "";
      FeedbackResult.ImageInfos.InsideImages.BusinessCardImages = [];
      FeedbackResult.ImageInfos.InsideImages.SignatureImages = [];
      FeedbackResult.DeliveryStatusInfos = {"IsDelivery": null, "Id": null, "Description": null};
      FeedbackResult.ReceiverInfos = {
        "Interviewed": {
          "NameSurname": null,
          "JobDescription": null,
          "PhoneNumber": null,
          "Email": null
        },
        "Oneself": {
          "NameSurname": null,
          "PhoneNumber": null,
          "Email": null,
          "TCKN": null
        },
        "Accountancy": {
          "NameSurname": null,
          "TCKN": null,
          "PhoneTelNumber": null,
          "Email": null
        },
        "NoVisitCard": {
          "Email": null,
          "StaticTelNumber": null,
          "FaxNumber": null,
          "PhoneTelNumber": null,
          "WebPage": null
        }
      };
      FeedbackResult.SmsConfirmInfos = { "IsSent": null, "Description": null };
      saveDB(FeedbackResult, "Process return", 2);
    };

    $scope.isProcessReturn = function () {
      $cordovaDialogs.confirm('Bu görevi başa çekmek istediğinize emin misiniz?', 'Görevi Başa Çek', ['Evet','Hayır'])
        .then(function(buttonIndex) {
          if(buttonIndex == 1)
            processReturn();
        });
    };

    $scope.takePhoto = function (clickStatus) {
      var options = {
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.CAMERA,
        allowEdit: false,
        targetWidth: 1500,
        targetHeight: 1500,
        encodingType: Camera.EncodingType.JPEG,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false
      };

      if(clickStatus == 1 || clickStatus == 2 || clickStatus == 3)
        options = {
          destinationType: Camera.DestinationType.DATA_URL,
          sourceType: Camera.PictureSourceType.CAMERA,
          allowEdit: false,
          targetWidth: 1000,
          targetHeight: 1000,
          encodingType: Camera.EncodingType.JPEG,
          popoverOptions: CameraPopoverOptions,
          saveToPhotoAlbum: false
        };

      $cordovaCamera.getPicture(options).then(function (imageData) {
        base64toBlobData(imageData, clickStatus);
        //saveOutsideImage(imageData, clickStatus);
      }, function (error) {
        warningShow("Cihazdaki kamera bilgisi hata verdi. Lütfen Tekrar fotoğraf çekiniz.");
      });
    };

    var base64toBlobData = function (imgdata, status) {
      blobUtil.base64StringToBlob(imgdata).then(function (blob) {
        if($stateParams.distId) {
          jsonDocument["_id"] = $stateParams.distId;
          if(status == 1)
            attachments.Out_BuildingImage.data = blob;
          else if(status == 2)
            attachments.Out_CompanySignBoardImage.data = blob;
          else if(status == 3)
            attachments.Out_TaxCertificateImage.data = blob;
          else if(status == 4)
            attachments.In_BusinessCardImage.data = blob;
          else if(status == 5)
            attachments.In_SignatureImage.data = blob;

          jsonDocument["_attachments"] = attachments;
          //jsonDocument["FeedbackResult"] = FeedbackResult;
        }
        saveAttachment(jsonDocument, status);
      }).catch(function (error) {
        warningShow("Resim, geçerli formata dönüştürülemedi. Hata : " + error);
      });
    };

    var saveAttachment = function (data, clickStatus) {
      $pouchDB.save(data).then(function(response) {
        if(response.ok == true) {
          $ionicLoading.hide();
          if(clickStatus == 1)
            ToastService.setToastInit("Bina Fotoğrafı Kaydedildi", "short", "top");
          else if(clickStatus == 2)
            ToastService.setToastInit("Firma Tabela Fotoğrafı Kaydedildi", "short", "top");
          else if(clickStatus == 3)
            ToastService.setToastInit("Vergi Levhası Fotoğrafı Kaydedildi", "short", "top");
          else if(clickStatus == 4)
            ToastService.setToastInit("Kartvizit Fotoğrafı Kaydedildi", "short", "top");
          else if(clickStatus == 5)
            ToastService.setToastInit("Kaşe Fotoğrafı Kaydedildi", "short", "top");

          if(clickStatus == 1 || clickStatus == 2 || clickStatus == 3) {


            if($scope.previousMissionPhoto != null)
              $scope.previousMissionPhoto = null;
          }
        }
      }, function(error) {
        warningShow("Kayıt esnasında hata oluştu. Hata : " + error);
      });
    };

    var saveDeviceProperties = function() {
      FeedbackResult.DeviceProperties.AppVersion = $localStorage.appVersion;
      FeedbackResult.DeviceProperties.Model = $localStorage.model;
      FeedbackResult.DeviceProperties.Platform = $localStorage.platform;
      FeedbackResult.DeviceProperties.UUID = $localStorage.uuid;
      FeedbackResult.DeviceProperties.Version = $localStorage.version;
      FeedbackResult.DeviceProperties.TKATOVersion = $localStorage.TKATOVersion;
      saveDB(FeedbackResult, "Properties Save DB", 1);
    };

    var saveOutsideImage = function(imageData, photoStatus) {
      var now = new Date();
      imageJsonDocument = {};
      imageJsonDocument.Image = imageData;
      imageJsonDocument.CreateDate = now.addDays(1).addHours(-21).toISOString().slice(0, 19);
      imageJsonDocument.Lat = $scope.lat;
      imageJsonDocument.Long = $scope.long;
      imageJsonDocument.Accuracy = 0;
      if(photoStatus == 1)
        FeedbackResult.ImageInfos.OutsideImages.BuildingImages.push(imageJsonDocument);
      if(photoStatus == 2)
        FeedbackResult.ImageInfos.OutsideImages.CompanySignboards.push(imageJsonDocument);
      if(photoStatus == 3)
        FeedbackResult.ImageInfos.OutsideImages.TaxCertificateImages.push(imageJsonDocument);

      if($scope.OutsideMax == $scope.OutsidePhotoCount+1)
        saveDB(FeedbackResult, "Mekan Fotoğrafı Kaydedildi!", 2);
      else
        saveDB(FeedbackResult, "Mekan Fotoğrafı Kaydedildi!", 1);

      if($scope.previousMissionPhoto != null)
        $scope.previousMissionPhoto = null;
    };

    var saveInsideImage = function(imageData, photoStatus) {
      var now = new Date();
      imageJsonDocument = {};
      imageJsonDocument.Image = imageData;
      imageJsonDocument.CreateDate = now.addDays(1).addHours(-21).toISOString().slice(0, 19);
      imageJsonDocument.Lat = $scope.lat;
      imageJsonDocument.Long = $scope.long;
      imageJsonDocument.Accuracy = 0;
      if(photoStatus == 4)
        FeedbackResult.ImageInfos.InsideImages.BusinessCardImages.push(imageJsonDocument);
      if(photoStatus == 5)
        FeedbackResult.ImageInfos.InsideImages.SignatureImages.push(imageJsonDocument);

      if($scope.InsideMax == $scope.InsidePhotoCount+1)
        saveDB(FeedbackResult, "İç Fotoğraf Kaydedildi!", 11);
      else
        saveDB(FeedbackResult, "İç Fotoğraf Kaydedildi!", 10);
    };

    var checkTCKN = function(value) {
      value = value.toString();
      var totalX = 0;
      for (var i = 0; i < 10; i++) {
        totalX += Number(value.substr(i, 1));
      }
      var isRuleX = totalX % 10 == value.substr(10,1);
      var totalY1 = 0;
      var totalY2 = 0;
      for (var i = 0; i < 10; i+=2) {
        totalY1 += Number(value.substr(i, 1));
      }
      for (var i = 1; i < 10; i+=2) {
        totalY2 += Number(value.substr(i, 1));
      }
      var isRuleY = ((totalY1 * 7) - totalY2) % 10 == value.substr(9,0);
      return isRuleX && isRuleY;
    };

    $scope.statusChange = function (status) {
      if(status) {
        $scope.isStatusChecked = false;
        if(status == 5)
          $scope.deliveryStatus = true;
        else
          $scope.deliveryStatus = false;
      }
      else
        warningShow("Lütfen statü seçiniz!");
    };

    $scope.deliveryStatusChangeItem = function () {
      $scope.isDeliveryStatusChecked = false;
    };

    $scope.statusSelected = function (status) {

      if(status == 5) {
        FeedbackResult.DeliveryStatusInfos.Description = "TESLİM";
        FeedbackResult.DeliveryStatusInfos.Id = 1;
        FeedbackResult.DeliveryStatusInfos.IsDelivery = $scope.deliveryStatus;
        saveDB(FeedbackResult, "Statü kaydedildi!", status);
      }
      else
        $scope.next(status);
    };

    $scope.deliveryStatusChange = function (status) {
      if(status) {
        $scope.isDeliveryStatusChecked = false;

        FeedbackResult.DeliveryStatusInfos.Description = status.Description;
        FeedbackResult.DeliveryStatusInfos.Id = status.Id;
        FeedbackResult.DeliveryStatusInfos.IsDelivery = $scope.deliveryStatus;

        if ($scope.deliveryStatus == true)
          saveDB(FeedbackResult, "Statü kaydedildi!", 5);
        else if ($scope.deliveryStatus == false)
          saveDB(FeedbackResult, "Statü kaydedildi!", 11);
      }
      else
        warningShow("Lütfen statü seçiniz!");
    };

    $scope.nextVisitPhase = function (visitChoice) {
      if(visitChoice) {
        $scope.visitChoice = visitChoice;
        if(visitChoice == 'visitCardOk')
          $scope.next(7);
        if(visitChoice == 'visitCardNon')
          $scope.next(6);
      }
      else
        warningShow("Lütfen kartvizit seçiniz!");
    };

    $scope.noVisitCardInfos = function (staticTelNumber, phoneTelNumber, faxNumber, webPage, noVisitCardEmail) {
      if(staticTelNumber != null || staticTelNumber != undefined || staticTelNumber != "") {
        FeedbackResult.ReceiverInfos.NoVisitCard.StaticTelNumber = staticTelNumber;
        if(noVisitCardEmail == null || noVisitCardEmail == undefined || noVisitCardEmail == "")
          FeedbackResult.ReceiverInfos.NoVisitCard.Email= "";
        else
          FeedbackResult.ReceiverInfos.NoVisitCard.Email = noVisitCardEmail;

        if(faxNumber == null || faxNumber == undefined || faxNumber == "")
          FeedbackResult.ReceiverInfos.NoVisitCard.FaxNumber= "";
        else
          FeedbackResult.ReceiverInfos.NoVisitCard.FaxNumber = faxNumber;

        if(phoneTelNumber == null || phoneTelNumber == undefined || phoneTelNumber == "")
          FeedbackResult.ReceiverInfos.NoVisitCard.PhoneTelNumber = "";
        else
          FeedbackResult.ReceiverInfos.NoVisitCard.PhoneTelNumber = phoneTelNumber;

        if(webPage == null || webPage == undefined || webPage == "")
          FeedbackResult.ReceiverInfos.NoVisitCard.WebPage = "";
        else
          FeedbackResult.ReceiverInfos.NoVisitCard.WebPage = webPage;

        saveDB(FeedbackResult, "Firma Bilgisi kaydedildi!", 7);
      }
      else
        warningShow("Lütfen Firma Sabit Telefon Numarasını boş bırakmayınız!");
    };

    $scope.oneselfInfos = function (nameSurname, telNumber, tckn, email) {
      var isValidTckn = true;
      if(tckn != "" && tckn != null && tckn != undefined)
        isValidTckn = checkTCKN(tckn);
      if(!isValidTckn && tckn != "" && tckn != null && tckn != undefined)
        warningShow("T.C. Kimlik Numarası Doğrulanamadı!");
      else if(nameSurname != null || nameSurname != undefined || nameSurname != "") {
        FeedbackResult.ReceiverInfos.Oneself.NameSurname = nameSurname;

        if(email == null || email == undefined || email == "")
          FeedbackResult.ReceiverInfos.Oneself.Email = "";
        else
          FeedbackResult.ReceiverInfos.Oneself.Email = email;

        if(tckn == null || tckn == undefined || tckn == "")
          FeedbackResult.ReceiverInfos.Oneself.TCKN = "";
        else
          FeedbackResult.ReceiverInfos.Oneself.TCKN = tckn;

        if(telNumber == null || telNumber == undefined || telNumber == "")
          FeedbackResult.ReceiverInfos.Oneself.PhoneNumber = "";
        else
          FeedbackResult.ReceiverInfos.Oneself.PhoneNumber = telNumber;

        saveDB(FeedbackResult, "İmza Yetkili kişi bilgileri kaydedildi!", 8);
      }
      else
        warningShow("Lütfen Ad Soyad alanını boş bırakmayınız!");
    };

    $scope.accountancyInfos = function (nameSurname, phoneTelNumber, tckn, email) {
      var isValidTckn = true;
      if(tckn != "" && tckn != null && tckn != undefined)
        isValidTckn = checkTCKN(tckn);
      if(!isValidTckn && tckn != "" && tckn != null && tckn != undefined)
        warningShow("T.C. Kimlik Numarası Doğrulanamadı!");
      else {
        if(nameSurname == null || nameSurname == undefined || nameSurname == "")
          FeedbackResult.ReceiverInfos.Accountancy.NameSurname = " ";
        else
          FeedbackResult.ReceiverInfos.Accountancy.NameSurname = nameSurname;

        if(email == null || email == undefined || email == "")
          FeedbackResult.ReceiverInfos.Accountancy.Email = "";
        else
          FeedbackResult.ReceiverInfos.Accountancy.Email = email;

        if(tckn == null || tckn == undefined || tckn == "")
          FeedbackResult.ReceiverInfos.Accountancy.TCKN = "";
        else
          FeedbackResult.ReceiverInfos.Accountancy.TCKN = tckn;

        if(phoneTelNumber == null || phoneTelNumber == undefined || phoneTelNumber == "")
          FeedbackResult.ReceiverInfos.Accountancy.PhoneTelNumber = "";
        else
          FeedbackResult.ReceiverInfos.Accountancy.PhoneTelNumber = phoneTelNumber;

        saveDB(FeedbackResult, "Muhasebe Yetkili kişi bilgileri kaydedildi!", 9);
      }
    };

    $scope.receiverInfos = function (nameSurname, telNumber, jobDescription, email) {
      if((nameSurname != null || nameSurname != undefined || nameSurname != "") &&
        (telNumber != null || telNumber != undefined || telNumber != "") &&
        (jobDescription != null || jobDescription != undefined || jobDescription != "")) {
        FeedbackResult.ReceiverInfos.Interviewed.JobDescription = jobDescription;
        FeedbackResult.ReceiverInfos.Interviewed.NameSurname = nameSurname;
        FeedbackResult.ReceiverInfos.Interviewed.PhoneNumber = telNumber;

        if(email == null || email == undefined || email == "")
          FeedbackResult.ReceiverInfos.Interviewed.Email = "";
        else
          FeedbackResult.ReceiverInfos.Interviewed.Email = email;

        saveDB(FeedbackResult, "Görüşülen kişi bilgileri kaydedildi!", 10);
      }
      else
        warningShow("Lütfen alanları boş bırakmayınız!");
    };

    $scope.receiverEqualOneself = function (isReceiverEqualOneself) {
      $scope.isReceiverEqualOneself = isReceiverEqualOneself;
      if(isReceiverEqualOneself)
      {
        $scope.receiverNameSurname = FeedbackResult.ReceiverInfos.Oneself.NameSurname;
        $scope.receiverTelNumber = FeedbackResult.ReceiverInfos.Oneself.PhoneNumber;
      }
      else
      {
        $scope.receiverNameSurname = "";
        $scope.receiverTelNumber = "";
      }
    };

    $scope.sendSms = function () {
      $scope.smsPassword = Math.floor(1000 + Math.random() * 9000);
      $scope.gsmNumber = FeedbackResult.ReceiverInfos.Interviewed.PhoneNumber;
      $scope.smsNameSurname = FeedbackResult.ReceiverInfos.Interviewed.NameSurname;
      $scope.message = 'Sn.' + $scope.smsNameSurname + ', ATO Üye firma bilgileriniz, ' +
                       $scope.smsPassword + ' onay kodu ile güncellenmiştir. ' +
                       '' + $scope.dist.WorkOrderDataInfo[0].Label + ' : ' +
                       '' + $scope.dist.WorkOrderDataInfo[0].Description + ' ' +
                       'İmza Yetkilisi : ' + FeedbackResult.ReceiverInfos.Oneself.NameSurname + '';
      $scope.isSend = false;

      //Server.Development + 'Message/Create
      $http({
        method: 'POST',
        url: Server.Development + 'ATO/Message/Create', // 'http://rlservice.telekurye.com.tr:9810/Message/Create',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded',
          'Access-Control-Allow-Origin': '*',
          'Authorization': $localStorage.Token},
        data: 'GSMNo=' + $scope.gsmNumber + '&Message=' + $scope.message
      })
        .success(function (data, status, headers, config) {
          $scope.isSend = true;
          //ToastService.setToastInit("Sms " + $scope.gsmNumber + " numarasına gönderildi.", "short", "center");
          warningShow("Sms " + $scope.gsmNumber + " numarasına gönderildi.");
        })
        .error(function (data, status) {
          $scope.done = false;
          $scope.isSend = false;
          warningShow("Sms gönderimi sırasında hata oluştu. Tekrar deneyiniz.");
        });
    };

    $scope.smsConfirmed = function (passw) {
      $scope.passw = passw;

      if($scope.smsPassword.toString() == $scope.smsPass.toString() ||
        $scope.smsPassword.toString() == $scope.passw.toString())
      {
        FeedbackResult.SmsConfirmInfos.IsSent = true;
        FeedbackResult.SmsConfirmInfos.Description = $scope.message;
        saveDB(FeedbackResult, "Sms bilgisi doğrulandı!", 12);
        $scope.pauseTimer();
        $scope.done = true;
      }
      else
      {
        $scope.done = false;
        warningShow("Gönderilen şifre ile doğrulamak için yazdığınız şifre uyuşmuyor. Lütfen tekrar deneyin.");
      }
    };

    $scope.onTimeout = function() {
      if ($scope.timer === 0) {
        $scope.$broadcast('timer-stopped', 0);
        warningShow("Belirlenen süre içerisinde doğrulama yapılamadı. Lütfen Tekrar deneyin.");
        $timeout.cancel(mytimeout);
        return;
      }
      $scope.timer--;
      mytimeout = $timeout($scope.onTimeout, 1000);
    };

    $scope.startTimer = function() {
      mytimeout = $timeout($scope.onTimeout, 1000);
      $scope.started = true;
    };

    $scope.stopTimer = function(closingModal) {
      if (closingModal != true) {
        $scope.$broadcast('timer-stopped', $scope.timer);
      }
      $scope.timer = $scope.timeForTimer;
      $scope.started = false;
      $scope.paused = false;
      $timeout.cancel(mytimeout);
    };

    $scope.pauseTimer = function() {
      $scope.$broadcast('timer-stopped', $scope.timer);
      $scope.started = false;
      $scope.paused = true;
      $timeout.cancel(mytimeout);
    };

    $scope.$on('timer-stopped', function(event, remaining) {
      if (remaining === 0) {
        if(!$scope.done)
        {
          $scope.stopTimer(false);
          $scope.modal.hide();
        }
      }
    });

    $scope.selectTimer = function(val) {
      $scope.timeForTimer = val;
      $scope.timer = val;
      $scope.started = false;
      $scope.paused = false;
      $scope.done = false;
    };

    $scope.humanizeDurationTimer = function(input, units) {
      // units is a string with possible values of y, M, w, d, h, m, s, ms
      if (input == 0) {
        return 0;
      } else {
        var duration = moment().startOf('day').add(input, units);
        var format = "";
        if (duration.hour() > 0) {
          format += "H[h] ";
        }
        if (duration.minute() > 0) {
          format += "m[m] ";
        }
        if (duration.second() > 0) {
          format += "s[s] ";
        }
        return duration.format(format);
      }
    };

    $ionicModal.fromTemplateUrl('templates/timer.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;

      if($scope.isSend == false)
      {
        $scope.modal.hide();
      }
    });

    $scope.confirmMission = function () {
      var now = new Date();
      var CreateDate = now.addDays(1).addHours(-21).toISOString().slice(0, 19);
      if($stateParams.distId) {
         jsonDocument["_id"] = $stateParams.distId;
         jsonDocument["Lat"] = $scope.lat;
         jsonDocument["Long"] = $scope.long;
         jsonDocument["Accuracy"] = 0;
         jsonDocument["IsComplete"] = true;
         jsonDocument["IsVisible"] = false;
         jsonDocument["CreateDate"] = CreateDate;
      }
     $pouchDB.save(jsonDocument).then(function(response) {
       if(response.ok == true)
       {
         ToastService.setToastInit("Görev tamamlandı. Diğer göreve geçebilirsiniz.", "short", "center");

         //confirmShow("Görev tamamlandı. Diğer göreve geçebilirsiniz.");
         $rootScope.workingOnMission = null;
         $localStorage.previousObjectId = $stateParams.distId;
         $state.go('tab.dists');
       }

       }, function(error) {
          warningShow("Teknik bir hata oluştu. Tekrar deneyiniz.");
     });
    }
  })

  .controller('InformationsCtrl', function($scope, $ionicLoading, InformationService,
                                           $localStorage, $cordovaGeolocation, $cordovaDialogs) {

    //ConnectivityMonitor.startWatching();

    /*$scope.$watch(function() {
      $scope.isOnlineNetworkWatch = $localStorage.isOnlineNet;
    });*/

    //$scope.isOnlineNetworkWatch = $localStorage.isOnlineNet;

    $scope.getDatas = function () {
      $ionicLoading.show();

      InformationService.getData($localStorage.UserId).then(function(data) {
        $ionicLoading.hide();

        $scope.information = data;

        if($scope.information != null || $scope.information != undefined || $scope.information != "" || $scope.information != {}) {
          $scope.information = data.Information;
        }
        else {
          $cordovaDialogs.alert('Kullanıcı bilgisi sunucu tarafından doğrulanamadı.', 'Hakediş Bilgisi Çekilemedi', 'Tamam');
        }
      }, function(err) {
        $cordovaDialogs.alert('' + err, 'Hakediş Bilgisi Çekilemedi', 'Tamam');
      })
      .finally(function() {
        $scope.$broadcast('scroll.refreshComplete');
        $ionicLoading.hide();
      });

      var posOptions = {timeout: 10000, enableHighAccuracy: false};
      $cordovaGeolocation
        .getCurrentPosition(posOptions)
        .then(function (position) {
          $scope.latitude  = position.coords.latitude;
          $scope.longitude = position.coords.longitude;
        }, function(err) {
          // error
        });

      $scope.platform = $localStorage.platform;
      $scope.uuid = $localStorage.uuid;
      $scope.version = $localStorage.version;
      $scope.model = $localStorage.model;
      $scope.appVersion = $localStorage.appVersion;
      $scope.tkatoVersion = $localStorage.TKATOVersion;
    };

    $scope.doRefresh = function() {
      $scope.getDatas();
    };

    $scope.getDatas();

  })

  .controller('LoginCtrl', function($scope, LoginService, $state, $cordovaDialogs, AlertDialog,
                                    $localStorage, $ionicLoading, $cordovaFileTransfer,
                                    $timeout, $cordovaFileOpener2, ProgressDialog, VersionService) {
    $localStorage.Token = null;
    $scope.form = {};
    $scope.username = "";
    $scope.password = "";
    $scope.version = {};
    $scope.information = {};

    $ionicLoading.show();

    var versionUpdate = function(data) {
      document.addEventListener('deviceready', function () {
        var url = data.URL;
        var targetPath = cordova.file.externalRootDirectory + "/Download/tkato.apk";
        var trustHosts = true;
        var options = {};

        ProgressDialog.setProgressIndicator("Lütfen Bekleyiniz!", "İndirme esnasında uygulamayı kapatmayınız! Güncelleme indirildikten sonra 'YÜKLE' butonuna basınız. Güncelleme indiriliyor...", false);

        $cordovaFileTransfer.download(url, targetPath, options, trustHosts)
          .then(function(result) {
            updateApp(result);
          }, function(err) {
            AlertDialog.setDialogInit(err, 'İndirme başarısız!', 'Tamam')
              .then(function() {
              ionic.Platform.exitApp();
            });
          }, function (progress) {
            $timeout(function () {
              var downloadProgress = parseInt((progress.loaded / progress.total) * 100);
              ProgressDialog.setProgressPercent(downloadProgress);
            });
          });

      }, false);

      var updateApp = function(entry) {
        $cordovaFileOpener2.open(
          entry.nativeURL,
          'application/vnd.android.package-archive'
        ).then(function() {
          isInstalled();
        }, function(err) {
          AlertDialog.setDialogInit(err, 'İndirme başarısız!!', 'Tamam')
            .then(function() {
            ionic.Platform.exitApp();
          });
        });
      };

      var isInstalled = function () {
        $cordovaFileOpener2.appIsInstalled('io.telekurye.tkato').then(function(res) {
          if (res.status === 0) {
            ProgressDialog.setProgressDismiss();
            AlertDialog.setDialogInit('TKATO yüklenemedi!', 'Yükleme başarısız!', 'Tamam')
              .then(function() {
              ionic.Platform.exitApp();
            });

          } else {
            ProgressDialog.setProgressDismiss();
            ionic.Platform.exitApp();
          }
        });
      };
    };

    if(!$localStorage.isAndroid) {
      VersionService.check().then(function(data) {
        $scope.version = data;

        $ionicLoading.hide();
        if($scope.version != null || $scope.version != undefined || $scope.version != "" || $scope.version != {}) {
          if($localStorage.TKATOVersion != $scope.version.VersionNumber)
              versionUpdate(data);
        }
        else {
          $ionicLoading.hide();
          $cordovaDialogs.alert('Lütfen internet bağlantınızı kontrol ediniz. Versiyon kontrolü yapılamadığı için uygulamaya giriş yapılamamaktadır.', 'Versiyon Kontrol Uyarısı', 'Uygulamadan Çık')
            .then(function() {
              ionic.Platform.exitApp();
            });
        }
      }, function(err) {
        $ionicLoading.hide();
        $cordovaDialogs.alert('Lütfen internet bağlantınızı kontrol ediniz. Versiyon kontrolü yapılamadığı için uygulamaya giriş yapılamamaktadır.', 'Versiyon Kontrol Uyarısı', 'Uygulamadan Çık')
          .then(function() {
            ionic.Platform.exitApp();
          });
      });
    }
    else
      $ionicLoading.hide();

    $scope.login = function(username, password) {
      $ionicLoading.show();
      LoginService.loginUser(username, password).then(function(data) {
        $scope.data = data;

        $ionicLoading.hide();

        if($scope.data.length) {
          $state.go('tab.dists');
        }
        else {
          $ionicLoading.hide();
          AlertDialog.setDialogInit('Lütfen kullanıcı bilgilerinizi kontrol ediniz.', 'Giriş başarısız!', 'Tamam');
        }
      }, function(err) {
        $ionicLoading.hide();
        AlertDialog.setDialogInit('Lütfen kullanıcı bilgilerinizi kontrol ediniz.', 'Giriş başarısız!', 'Tamam');
      });
    };

  });
