app = angular.module("MafiaApp");
app.controller('AsyncJackCtrl', ['socket'], function(socket) {
    console.log(socket);
});
