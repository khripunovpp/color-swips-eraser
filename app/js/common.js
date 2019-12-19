var Util = {
    randomInteger: function(min, max) {
        var rand = min + Math.random() * (max - min)
        rand = Math.round(rand);
        return rand;
    },
    scrollToEl: function(el, offset) {
        $("html,body").animate({ scrollTop: el.offset().top + (offset || 0) }, 500);
    },
    trimString: function(string) {
        return string.split(' ').join('');
    }
}

$(function() {

});