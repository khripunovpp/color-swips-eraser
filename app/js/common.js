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
    },
    hexToRgb: function(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? (parseInt(result[1], 16) + ', ' + parseInt(result[2], 16) + ', ' + parseInt(result[3], 16)) : null;
    },
    shuffleArray: function(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }
}

var swip = {
    config: {
        colorPalette: [
            [
                ['#ff8359', '#ffdf40'],
                ['#5ac8fa', '#50fbdc'],
                ['#ff5178', '#ff85ad'],
                ['#54d169', '#aff57a']
            ],
            [
                ['#ea5455', '#feb692'],
                ['#7367f0', '#ce9ffc'],
                ['#369a3a', '#6ad56a'],
                ['#ffc107', '#fff178']
            ]
        ],
        attempts: 3,
        currentAttempt: 0,
        currentCardIndex: 0,
        placeholderTpl: ''
    },
    init: function(options) {
        var _t = this,
            configs = _t.config;

        _t.stack = $('.stack');
        _t.cards = $('.stack__card .card');
        _t.erasers = $('.eraser');

        _t.timerStep = 0;

        _t.placeholderTpl = _t.erasers.eq(0).find('.eraser__layer').clone();

        _t.coloringCards(configs.colorPalette[configs.currentAttempt]);

        _t.start();

    },

    start: function() {
        var _t = this,
            configs = _t.config;

        _t.stack.addClass('e-start');
        _t.colorTimer = setInterval(function() {
            var palette = Util.shuffleArray(configs.colorPalette[configs.currentAttempt])
            _t.coloringCards(palette);
        }, 200)

        setTimeout(function() {
            _t.stopShuffle();
        }, 1500)
    },

    coloringCards: function(palette) {
        var _t = this,
            configs = _t.config;

        _t.cards.each(function(index, el) {
            var color1 = palette[index][0],
                color2 = palette[index][1]
            $(el).css({
                color: color1,
                backgroundImage: 'linear-gradient(-45deg, ' + color1 + ', ' + color2 + ')',
                boxShadow: '0 15px 45px rgba(' + Util.hexToRgb(color1) + ',.25)'
            })
            _t.erasers.eq(index).attr('data-config', '["' + palette[index][0] + '", "' + palette[index][1] + '"]');
        });
    },
    stopShuffle: function() {
        var _t = this,
            configs = _t.config;
        clearInterval(_t.colorTimer);
        _t.makeErasers();

    },
    makeErasers: function() {
        var _t = this,
            configs = _t.config;

        _t.erasers.each(function(index, el) {
            var gradientScheme = JSON.parse($(el).attr('data-config'));
            $(el).find('.eraser__layer').eraser({
                size: 25,
                gradient: [gradientScheme[0], gradientScheme[1]],
                progressFunction: function(progress, current) {
                    _t.currentCardIndex = $(current).closest('.eraser').index();
                    _t.disableErasers.call(_t);
                },
                completeRatio: configs.currentAttempt >= 1 ? .5 : .25,
                completeFunction: _t.results.bind(_t)
            });
        });

    },
    disableErasers: function() {
        var _t = this,
            configs = _t.config;

        _t.erasers.each(function(index, el) {
            var currentEraser = $(el);
            console.log(configs.currentAttempt)
            index !== _t.currentCardIndex ?
                currentEraser.find('.eraser__layer').eraser('disable') :
                currentEraser.addClass('active');
            index === _t.currentCardIndex && configs.currentAttempt >= 1 ?
                currentEraser.addClass('eraser--phone') :
                currentEraser.removeClass('eraser--phone')
        });
    },
    results: function() {
        var _t = this,
            configs = _t.config;

        _t.clear();

        configs.currentAttempt >= 1 ? _t.won() : _t.loose();

        configs.currentAttempt++;
    },
    clear: function() {
        var _t = this,
            configs = _t.config;

        _t.erasers.find('.eraser__layer').remove();
        _t.erasers.each(function(index, el) {
            var el = $(el);
            el.removeClass('active').append('<img src="img/fake-img.png" class="eraser__layer" />');
        });
    },
    won: function() {
        var _t = this,
            configs = _t.config;

        alert('win')
    },
    loose: function() {
        var _t = this,
            configs = _t.config;

        _t.start()
    }
}

$(function() {
    swip.init();
});