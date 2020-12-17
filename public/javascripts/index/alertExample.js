var Example = (function() {
    "use strict";

    var elem,
    hideHandler,
    that = {};


    that.show = function(text) {
       elem = $(".bb-alert");
       clearTimeout(hideHandler);

       elem.find("span").html('<b><i class="icon-check"></i></b> ' + text);
       elem.delay(200).fadeIn().delay(4000).fadeOut();
   };

   return that;
}());

var toTop = (() => {
    $('body, html').animate({
        scrollTop: 0
    }, 800);
})

var blockui = ((elem, callback) => {
    $(elem).block(
        {
            message: '<b><i class="icon-spinner4 spinner"></i><b> Procesando...', 
            fadeIn: 800, 
            timeout: 1000,
            overlayCSS: {
                backgroundColor: '#fff', 
                opacity: 0.8, 
                zIndex: 1200, 
                cursor: 'wait'
            },
            css: {
                border: 0, 
                color: '#37474F', 
                zIndex: 1201, 
                padding: 0, 
                backgroundColor: '#fff'
            },
            onUnblock: () =>{
                callback();
            }                
    });
});
