'use strict';

var app = angular.module('NO.Swagger');

app.controller('MainCtrl', function ($scope, $modal, appStates, api, $timeout) {
  $scope.gallery = [];
  $scope.user = appStates.getUser();

  function loadGallery() {
    api.loadGallery().then(function (images) {
      $scope.gallery = images;
    });
  }

  $scope.signUp = function () {
    var modalInstance = $modal.open({
      templateUrl: 'views/signUp.html',
      controller: 'UserActionCtrl',
      backdrop: 'static',
      animate: false,
      resolve: {
        userAction: function (api) {
          return 'signUp'
        }
      }
    });
  };

  $scope.login = function () {
    var modalInstance = $modal.open({
      templateUrl: 'views/login.html',
      controller: 'UserActionCtrl',
      backdrop: 'static',
      animate: true,
      resolve: {
        userAction: function (api) {
          return 'login'
        }
      }
    });

    modalInstance.result.then(function () {
      loadGallery();
    });
  };

  $scope.profile = function () {
    $modal.open({
      templateUrl: 'views/profile.html',
      controller: 'ProfileCtrl',
      backdrop: 'static',
      animate: true,
      resolve: {
        userProfile: ['api', function (api) {
          return api.getProfile().then(function (res) {
            return res.data;
          });
        }]
      }
    });
  };

  $scope.uploadImage = function (file) {
    var modalInstance = $modal.open({
      templateUrl: 'views/upload.html',
      controller: 'UploadCtrl',
      backdrop: 'static',
      animate: true,
      resolve: {
        userProfile: ['api', function (api) {
          return api.getProfile().then(function (res) {
            return res.data;
          });
        }]
      }
    });

    modalInstance.result.then(function () {
      loadGallery();
    });
  };

  $scope.removeImage = function (image) {
    api.removeImage(image.id).then(function () {
      var index = $scope.gallery.indexOf(image);
      $scope.gallery.splice(index, 1);
    });
  };

  $scope.logout = function () {
    api.logout().then(function () {
      $scope.gallery = [];
    });
  };

});

app.controller('UserActionCtrl', ['$modalInstance', '$scope', 'api', 'appStates', 'userAction',
  function ($modalInstance, $scope, api, appStates, userAction) {
    $scope.user = {};

    $scope.submit = function (user) {
      var form = $scope.Form;

      if ($scope.error || form.$invalid || form.$pristine) return;

      $scope.submitting = true;

      api[userAction](user).then(function (error) {
        $scope.submitting = false;

        if (error) {
          $scope.error = error;
        } else {
          $modalInstance.close();
        }
      });
    };

    $scope.changed = function () {
      $scope.error = '';
    };

    $scope.cancel = function () {
      $modalInstance.dismiss();
    };
  }
]);


app.controller('ProfileCtrl', ['$modalInstance', '$scope', 'api', 'userProfile',
  function ($modalInstance, $scope, api, userProfile) {
    $scope.user = userProfile;
    $scope.user.date_of_birth = new Date($scope.user.date_of_birth);

    var email = $scope.user.email;

    $scope.submit = function (user) {
      var form = $scope.Form;

      if ($scope.error || form.$invalid) return;

      $scope.submitting = true;

      if (email == $scope.user.email) {
        delete $scope.user.email;
      }

      api.updateProfile(user).then(function (error) {
        $scope.submitting = false;

        if (error) {
          $scope.error = error;
        } else {
          $modalInstance.close();
        }
      });
    };

    $scope.changed = function () {
      $scope.error = '';
    };

    $scope.cancel = function () {
      $modalInstance.dismiss();
    };
  }
]);


app.controller('UploadCtrl', ['$modalInstance', '$scope', 'api', '$timeout',
  function ($modalInstance, $scope, api, $timeout) {

    $scope.submit = function (file) {
      var upload = api.uploadImage(file);

      upload.progress(function (evt) {
        file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
        file.progress = file.progress > 0 ? file.progress : 1;
      });

      upload.success(function () {
        $modalInstance.close();
      });

      file.progress = 1;
    };

    $scope.cancel = function () {
      $modalInstance.dismiss();
    };
  }
]);
