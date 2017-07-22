
angular.module('app.controller',['luegg.directives'])
    .controller('login', function(blockUI,$firebaseArray,Auth,data,$timeout,$location,$scope,$filter,cfpLoadingBar,$rootScope) {
        loading_screen.finish();
        $scope.myDate = new Date();
        var ref =  firebase.database().ref().child("users");
        var send = $firebaseArray(ref)
        $scope.login = function()
        {
            $scope.sub = true;
            if(!_.isEmpty($scope.loginForm.$error))
            {
            }
            else
            {
                $scope.sub = false;
            cfpLoadingBar.start();
            firebase.auth().signInWithEmailAndPassword($scope.name,$scope.passwd).catch(function(error) {

                var errorCode = error.code;
                $scope.sub = true;
                alert(errorCode + ":" + errorMessage)
                var errorMessage = error.message;
                // ...}
            });
            }
        }
        $scope.submit = function()
        {
            $scope.submitted = true;
           if(!_.isEmpty($scope.projectForm.$error))
           {}
            else
            {
                cfpLoadingBar.start();
                blockUI.start();
                Auth.$createUserWithEmailAndPassword($scope.project.clientEmail,$scope.user.passwd)
                    .then(function(result) {
                        send.$add({
                            "UID" : result.uid,
                            "Name" :$scope.project.clientName,
                        })
                        var u = firebase.auth().currentUser;
                        u.updateProfile({
                            displayName: $scope.project.clientName,
                            photoURL: "user_logo.png"
                        }).then(function() {
                            $rootScope.$broadcast('updated', { message: "update successful" })
                            blockUI.stop();
                        }, function(error) {
                            blockUI.stop();
                        });
                    }).catch(function(error) {
                });
            }
        }
        $scope.connect = function()
        {
            blockUI.start();
            cfpLoadingBar.start();
            Auth.$signInWithPopup("google",{"scope":"profile,email"}).then(function (result) {
                var found = _.findWhere(data.users,{UID : result.user.uid})
                if(!found){
                    var img;
                    if(result.user.photoURL == null) {
                        img = "user_logo.png";
                    }
                    else {
                        img = result.user.photoURL
                    }

                    send.$add({"UID" : result.user.uid,
                        "Name" : result.user.displayName,
                        "image_url" : img,
                    })

                }
                blockUI.stop();
            }).catch(function(error) {

                blockUI.stop();
            });
        }
    }
)
 .controller('chatctrl',function($q,$firebaseObject,$timeout,Firebase,Auth,$mdSidenav,$location,data,$scope,$firebaseArray,$filter,$rootScope)
{
    
    $scope.im = "logo.png";
    var current = firebase.auth().currentUser;
    var b = "all";
    var flag = false
    var prom = function()
   {
       var defered = $q.defer();
       var ref =  firebase.database().ref().child("chats");
       var ref_chats = $firebaseArray(ref)
       ref_chats.$loaded().then(function()
       {
           data.chats = ref_chats
           defered.resolve();
       })
       return defered.promise;
    }
    $scope.set = function(ev) {
        $mdDialog.show({
            templateUrl: 'dialog.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true
        })
    }
    var flag = false
    var evens;
    $scope.show = function(result)
    {
        if(result ==1)
        {
            b = "all";
            var k = _.filter(data.chats,function(a){ return (a.TO == "all")});
                $scope.chats = k;
            $scope.im = "logo.png";
        }
        else
        {
        flag = true;
        b = result;
        evens = _.filter(data.chats,function(a){ return (a.UID == b && a.TO == current.uid) ||
            (a.UID == current.uid && a.TO == b)});
        $scope.chats = evens;
            fil = _.filter(data.users,function(a){return a.UID==b})
             $scope.im = fil[0].image_url;
    }}
    var ref_chats = firebase.database().ref("chats")
    ref_chats.on("value",function()
    {

        if(flag)
        prom().then(function()
        {
            evens = _.filter(data.chats,function(a){
                return (a.UID == b && a.TO == current.uid) ||
                    (a.UID == current.uid && a.TO == b)});

            $scope.chats = evens
        })
        else
        {
            prom().then(function()
            {

                evens  = _.filter(data.chats,function(a){ return (a.TO == b) ||
                    (a.UID == current.uid && a.TO == b) });
                $scope.chats  = evens
            })
        }
    })
    var userRef = firebase.database().ref("connect" + "/" + current.uid)
    var testRef = firebase.database().ref("connect")
    var connectedRef = firebase.database().ref(".info/connected");
    $timeout(function()
    {
        connectedRef.on("value", function(snap) {
            if (snap.val() === true) {
                userRef.set(true)
                userRef.onDisconnect().set(firebase.database.ServerValue.TIMESTAMP)
            } else {
                userRef.set(firebase.database.ServerValue.TIMESTAMP);
            }
        });
    },0)
       var  file = document.getElementById("upload")
    file.addEventListener("change",upload,false)
    function upload()
    {
        var storageRef = firebase.storage().ref();
        var file = this.files[0];
         console.log(file.type);
        var metadata = {
            contentType: file.type
        };

// Upload file and metadata to the object 'images/mountains.jpg'
        var uploadTask = storageRef.child('images/' + file.name).put(file, metadata);

// Listen for state changes, errors, and completion of the upload.
        uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
            function(snapshot) {
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

                var myVar = setInterval(myTimer, 60000);
                function myTimer() {
                    if(progress!=100)
                    $scope.getvalue = (snapshot.bytesTransferred / snapshot.totalBytes) * 100

                }
                $timeout(function()
                {

                })

                $scope.getvalue =  (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                switch (snapshot.state) {
                    case firebase.storage.TaskState.PAUSED: // or 'paused'

                        break;
                    case firebase.storage.TaskState.RUNNING: // or 'running'

                        break;
                }
            }, function(error) {
                switch (error.code) {
                    case 'storage/unauthorized':
                        // User doesn't have permission to access the object
                        break;

                    case 'storage/canceled':
                        // User canceled the upload
                        break;
                        case 'storage/unknown':
                        // Unknown error occurred, inspect error.serverResponse
                        break;
                }
            }, function() {
                // Upload completed successfully, now we can get the download URL
                var downloadURL = uploadTask.snapshot.downloadURL;

                var o
                if(downloadURL.search(/[A-Z a-z]*((.pdf)|(.PDF))/)>0)
                 o = "<a href =" + downloadURL + ">" + downloadURL + "</a>";
                else
                    o = downloadURL;
                var a =  firebase.database().ref().child("chats");
                var ref = $firebaseArray(a);
                ref.$add({
                    timestamp: firebase.database.ServerValue.TIMESTAMP,
                    data: o,
                    user: current.displayName,
                    image: url,
                    UID : current.uid,
                    TO : b
                }).then(function()
                {

                    $scope.yo();
                })
            });
    }
    var q = firebase.database().ref("connect");
    var ref =  firebase.database().ref().child("users");
    ref_users = $firebaseArray(ref)
    testRef.on('value',function(data)
    {
        var w = $firebaseArray(q).$loaded(function(result){
            var id = current.uid;
              console.log("came in here");
            var i;
            for(i=0;i<ref_users.length;i++)
            {

                var found = _.findWhere(ref_users,{UID : result[i].$id})

                if(result[i].$value == true)
                {
                    found['color'] = "green"
                }
                else
                    found['color'] = "red"
                
                ref_users.$save(found)
            }
        });
        })

    $timeout(
     function()
     {

         var a  = _.reject(data.users,function(b){

             return(b.UID == current.uid)})

              $scope.users = a
     },0
    )

    $scope.$on('updated', function (event, args) {

        var url = current.photoURL;
        if(current.photoURL == null)
            url = "user_logo.png";

        $scope.UID = current.uid
        //$scope.users = _.reject(a,function(b){return(b.UID == current.uid)})
        var date = new Date();
        $scope.image = url;
        $scope.name = current.displayName;

    });
    var url = current.photoURL;
    if(current.photoURL == null)
        url = "user_logo.png";

    $scope.UID = current.uid
    //$scope.users = _.reject(a,function(b){return(b.UID == current.uid)})
    $scope.chats = evens;
    var date = new Date();
    $scope.image = url;
    $scope.name = current.displayName;

    loading_screen.finish();
    $scope.send = function($event){

        var getKeyboardEventResult = function (keyEvent, keyEventDesc)
        {
            if(keyEvent.keyCode == 13 || keyEvent.which == 13)
                event.preventDefault();
            return (window.event ? keyEvent.keyCode : keyEvent.which);
        };
        var onKeyPressResult = getKeyboardEventResult($event, "Key press");

        if (onKeyPressResult == 13 && $scope.ip != "") {
            $scope.scrol = "true"
            var text = $scope.ip;
            var a =  firebase.database().ref().child("chats");
            var ref = $firebaseArray(a);
            console.log("came here");
            console.log(b);
            ref.$add({
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                data: text,
                user: current.displayName,
                image: url,
                UID : current.uid,
                TO : b
            });
            }}
$scope.signout = function()
{
    userRef.onDisconnect().cancel();
    userRef.set(firebase.database.ServerValue.TIMESTAMP)
    Auth.$signOut();
    $location.path("/");
}
})


    .factory("Auth", ["$firebaseAuth",
        function($firebaseAuth) {
            return $firebaseAuth();
        }
    ])