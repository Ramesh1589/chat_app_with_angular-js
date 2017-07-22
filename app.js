
var app = angular.module('myapp', ['ngEmbed','ngMaterial','blockUI',"ngSanitize",'btford.markdown','ngAnimate','angular-loading-bar','app.services','app.controller','ngMaterial', 'ngMessages','ngRoute','firebase','yaru22.angular-timeago']);

app.constant('neeraj',function()
{

});
app.run(function(Auth,data,blockUI,$interval,neeraj,$firebaseArray,$window,cfpLoadingBar,$rootScope) {
        blockUI.stop();
        $rootScope.$on("$routeChangeError", function (a,b,c,error) {
            
            if (error === "AUTH_REQUIRED")
            {
                window.location.href = "http://localhost:8080/git_test/index.html#/"
                
            }
        });

    var ref =  firebase.database().ref().child("chats");
    var ref_chats = $firebaseArray(ref)
        data.chats = ref_chats;
        ref =  firebase.database().ref().child("users");
        ref_users = $firebaseArray(ref)
        data.users = ref_users;
    
}
);

app.config(function($mdThemingProvider,$routeProvider,blockUIConfig,cfpLoadingBarProvider) {
        cfpLoadingBarProvider.includeSpinner = false;
        blockUIConfig.autoInjectBodyBlock = false;
        blockUIConfig.blockBrowserNavigation = true;
        blockUIConfig.templateUrl = 'bubble.html'
    $mdThemingProvider.theme('default')
        .primaryPalette('cyan')
  
        $routeProvider
            .when('/',
        {
            templateUrl : "views/login_signup.html",
            controller : "login",
            resolve : {
                "curren": function($q,Auth,$location)
                {
                    var a = $q.defer();
                    Auth.$onAuthStateChanged(
                        function (authData) {
                            if (authData) {
                                $location.path("/chat")
                            } else {
                                
                                a.resolve();
                            }
                        }
                    )
                    return a.promise;

                }
            }

        })
    .when('/chat',
        {
            templateUrl : 'views/chat.html',
            controller : 'chatctrl',
            resolve :
            {
                current : function($q,Auth,data,$firebaseArray)
                {
                    var defered = $q.defer();
                    var ref =  firebase.database().ref().child("chats");
                    var ref_chats = $firebaseArray(ref)
                    refu =  firebase.database().ref().child("users");
                    var ref_users = $firebaseArray(refu)
                    ref_chats.$loaded().then(function()
                    {
                        data.chats = ref_chats
                        return ref_users.$loaded
                    }).then(
                        function()
                        {
                          
                            data.users = ref_users
                            defered.resolve()
                        }
                    )
                    return $q.all([Auth.$requireSignIn(),defered.promise])
                }
            }
        })
            .when('/error',
                {
                    templateUrl  : 'views/error.html'
                }).otherwise('/error')
})
    .directive('schrollBottom', function ($timeout) {
        return {
            scope: {
                schrollBottom: "="
            },
            link: function (scope, element) {
                scope.$watchCollection('schrollBottom', function (newValue) {
                    if (newValue)
                    {
                        $timeout(function()
                        {
                            $(element).scrollTop($(element)[0].scrollHeight);
                        },30)
                    }
                });
            }
        }
    })
.directive("bot",function($firebaseArray,$filter)
{
    return{
        link : function(scope,element,attr)
        {
            var i = 0;
           console.log(element[0]);
            element[0].onkeypress = function($event)
            {
                if($event.keyCode == 13)
                {
                    var str = scope.ip;
                    
                var res = str.match(/@neeraj/);
                   
                if(res == "@neeraj")
                {
                    
                    var a =  firebase.database().ref().child("chats");
                    var ref = $firebaseArray(a);
                    
                    var current = firebase.auth().currentUser;
                    if (i==0){
                    ref.$add({
                        timestamp:firebase.database.ServerValue.TIMESTAMP,
                        data: ("Hey Hi " + current.displayName),
                        user: "@neeraj",
                        image: "bot.png",
                        UID : "neeraj001",
                        TO : "all"
                    });}
                    i++;
                    var message;
                    var date = new Date();
                    var filtered_time = $filter('date')(date, "shortTime")
                    var msg =  str.replace("@neeraj", "");
                    msg = msg.replace(/\s+/g, '');
                    switch(msg)
                    {
                        case "howareyou":
                            message = "i am fine how about you?"
                            break;
                        case "whatsthetime":
                            message = "Time is" + filtered_time
                            break;
                        default:
                            message = "oops sorry I can't recognise"
                    }
                    ref.$add({
                        timestamp:firebase.database.ServerValue.TIMESTAMP,
                        data: message,
                        user: "@neeraj",
                        image: "bot.png",
                        UID : "neeraj001",
                        TO : 'all'
                    });

                }
                    scope.ip = "";
                }
                }

            }}
})
.directive("thumbnails",function($mdDialog,$timeout,$q,data)
{
    return {
        link : function(scope)
        {
            
            var ref_chats = firebase.database().ref("chats")
            ref_chats.on("value",function() {
                
            $timeout(function()
            {scope.yo();},0)
            })
                scope.yo = function()
                {
                   
              function testImage(url, callback, timeout,uid) {
                timeout = timeout || 5000;
                var timedOut = false, timer;
                var img = new Image();
                img.onerror = img.onabort = function() {
                    if (!timedOut) {
                        clearTimeout(timer);
                        callback(url, "error",uid);
                    }
                };
                img.onload = function() {
                    if (!timedOut) {
                        clearTimeout(timer);
                        callback(url, "success",uid);
                    }
                };
                img.src = url;
                timer = setTimeout(function() {
                    timedOut = true;
                    callback(url, "timeout",uid);
                }, timeout);
            }


            function record(url, result,uid) {
                
                if(result.match("success"))
                {
                    var img = document.createElement("img");
                    img.src = url;
                   
                    img.height = 60;
                    img.onclick = function()
                    {
                          $mdDialog.show({
                                template: "<a href = url><img src = " + img.src + " style ='height:310px;width:470px'></a>",
                                clickOutsideToClose:true
                            })
                        }
                    img.onload = function() {
                        window.URL.revokeObjectURL(this.src);
                        
                        var a = document.getElementById(uid);
                        
                        a.innerText = ""
                        
                        a.appendChild(img);
                    }
                }
            }
            function  async()
            {
                var deffered = $q.defer()
                scope.$watch('chats', function() {
                    if(scope.chats){
                        
                        deffered.resolve()
                    }
                });
                return deffered.promise
            }
                async().then(function()
                {
                    for(var i = 0;i<scope.chats.length;i++)
                    {
                        
                        testImage(scope.chats[i].data,record,0,scope.chats[i].data);
                    }
                }
                )
        }
        }
    }
})
    