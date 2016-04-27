var PUBLISHABLE_KEY = "pk_test_603NZHSvZv5GT8Ngz3gVdAjV"; // for test;
// var PUBLISHABLE_KEY = "pk_live_Bckm5VAjrMy64H0XdFUc4fVZ"; // for live;


function getQuery(href) {
    var j = {}
    var q;
    if(href.indexOf("?") != -1){
        q = href.split("?")[1].split("&");
        $.each(q, function(i, arr) {
            arr = arr.split('=');
            return j[arr[0]] = arr[1];
        });
    }
    return j;
}