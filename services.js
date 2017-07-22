/**
 * Created by FCI on 16-06-2016.
 */
angular.module('app.services',[])
    .service('data',function()
    {
        this.users = [];
        this.chats = [];
        this.emoji = [];
        this.evens = [];
    }
)
