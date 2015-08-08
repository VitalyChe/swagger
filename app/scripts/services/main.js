'use strict';

var app = angular.module('NO.Swagger');

app.service('appStates', [
  function () {

    var states = {
      user: {
        auth: false
      }
    };

    this.authorizeUser = function () {
      states.user.auth = true;
    };

    this.logoutUser = function () {
      states.user.auth = false;
    };

    this.getUser = function () {
      return states.user;
    };
  }
]);

app.service('api', ['$http', 'appStates', 'Upload', '$q',
  function ($http, appStates, Upload, $q) {

    var self = this;
    var key = null;
    var base = 'http://128.199.69.80:3000';
    var url = base + '/api/v1/';

    this.signUp = function (data) {
      return $http({
        url: url + 'users',
        method: 'POST',
        data: data
      }).then(function (res) {
        if (res.failed) return res.data.message;
        key = res.data.auth_token.auth_token;
        appStates.authorizeUser();
      });
    };

    this.login = function (data) {
      return $http({
        url: url + 'auth',
        method: 'POST',
        data: data
      }).then(function (res) {
        if (res.failed) return res.data.message;
        key = res.data.auth_token;
        appStates.authorizeUser();
      });
    };

    this.logout = function () {
      return $http({
        url: url + 'auth',
        headers: {api_key: key},
        method: 'DELETE'
      }).then(function () {
        key = null;
        appStates.logoutUser();
      });
    };

    this.getProfile = function () {
      return $http({
        url: url + 'users/me',
        headers: {api_key: key},
        method: 'GET'
      });
    };

    this.updateProfile = function (user) {
      return $http({
        url: url + 'users/' + user._id,
        headers: {api_key: key},
        method: 'PATCH',
        data: user
      }).then(function (res) {
        res = res.data;
        if (res.failed) return res.data.message;
      });
    };

    this.uploadImage = function (file) {
      return Upload.upload({
        url: url + 'users/images',
        headers: {api_key: key},
        file: file,
        fileFormDataName: 'image'
      });
    };

    this.loadGallery = function () {
      return this.getProfile().then(function (profile) {
        return $http({
          url: url + 'users/' + profile.data._id + '/images',
          headers: {api_key: key},
          method: 'GET'
        }).then(function (res) {
          var images = res.data.data;
          return _.map(images, function (img) {
            return {
              id: img._id,
              url: base + img.urls.standard
            };
          });
        });
      });
    };

    this.removeImage = function (imageId) {
      return $http({
        url: url + 'images/' + imageId,
        headers: {api_key: key},
        method: 'DELETE'
      });
    };

  }
]);


app.config(['$httpProvider',
  function ($httpProvider) {
    var interceptor = [
      function () {
        return {
          request: function (config) {
            return config;
          },
          response: function (response) {
            return response;
          },
          responseError: function (rejection) {
            rejection.failed = true;
            return rejection;
          }
        }
      }
    ];
    $httpProvider.interceptors.push(interceptor);
  }
]);
