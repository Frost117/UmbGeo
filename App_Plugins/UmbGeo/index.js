angular.module("umbraco").controller("UmbGeoController", function ($scope, $http) {

    $scope.model.value = $scope.model.value || {
        latitude: 0,
        longitude: 0,
        elevation: 2
    };

    $scope.model.errors = {
        latitude: false,
        longitude: false,
        elevation: false
    };
    
    $scope.validateCoordinates = function () {
        $http.get("/umbraco/backoffice/GeoCoordinates/GeoCoordinatesApi/IsValid", {
            params: {
                latitude: $scope.model.value.latitude,
                longitude: $scope.model.value.longitude,
                elevation: $scope.model.value.elevation
            }
        })
            .then(function (response) {
                $scope.model.valid = response.data.isValid;
                $scope.model.errors.latitude = !response.data.isLatitudeValid
                $scope.model.errors.longitude = !response.data.isLongitudeValid;
                $scope.model.errors.elevation = !response.data.isElevationValid;
            })
            .catch(function (error) {
                console.error("Error:", error);
            });
    };

    $scope.$watch('model.value.latitude', $scope.validateCoordinates);
    $scope.$watch('model.value.longitude', $scope.validateCoordinates);
    $scope.$watch('model.value.elevation', $scope.validateCoordinates);
    
});