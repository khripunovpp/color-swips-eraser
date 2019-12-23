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

var timer = function(el, minutes) {
    function getTimeRemaining(endtime) {
        var t = Date.parse(endtime) - Date.parse(new Date());
        var seconds = Math.floor((t / 1000) % 60);
        var minutes = Math.floor((t / 1000 / 60) % 60);
        return {
            'total': t,
            'minutes': minutes < 10 ? '0' + minutes : minutes,
            'seconds': seconds < 10 ? '0' + seconds : seconds
        };
    }

    function initializeClock(el, endtime) {
        var clock = document.querySelectorAll(el);

        function updateClock() {
            var t = getTimeRemaining(endtime);

            $(clock).html(t.minutes + ':' + t.seconds)

            if (t.total <= 0) {
                clearInterval(timeinterval);
            }
        }

        updateClock();
        var timeinterval = setInterval(updateClock, 1000);
    }

    var _currentDate = new Date();
    var count = minutes || 15;
    var _toDate = new Date(_currentDate.getFullYear(),
        _currentDate.getMonth(),
        _currentDate.getDate(),
        _currentDate.getHours(),
        _currentDate.getMinutes() + count,
        1);
    initializeClock(el, _toDate);
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
        winnerAttempt: 1,
        prizesCount: 3,
        currentAttempt: 0,
        currentCardIndex: 0,
        timer: 5
    },
    init: function(options) {
        var _t = this,
            configs = _t.config;

        _t.stack = $('.stack');
        _t.cards = $('.stack__card .card');
        _t.erasers = $('.eraser');
        _t.cursor = $("#cursor");

        _t.timerStep = 0;

        _t.coloringCards(configs.colorPalette[configs.currentAttempt]);

        _t.openPopup('#popupStart');

        $('.popup__close').on('click', function(event) {
            event.preventDefault();
            var popupId = $(event.target).closest('.popup').attr('id');

            _t.closePopup('#' + popupId)
        });

        $('.js-start').on('click', function(event) {
            event.preventDefault();
            _t.closePopup('#popupStart', function() {
                _t.start();
                _t.timerInit();
                _t.counter();
            })
        });

        $('.js-restart').on('click', function(event) {
            event.preventDefault();
            _t.closePopup('#popupLoose', function() {
                _t.start();
            })
        });

        _t.stack.mousemove(function(e) {
            _t.cursor.show().css({
                "left": e.clientX - 30,
                "top": e.clientY - 20
            });
        }).mouseout(function() {
            _t.cursor.hide();
        });

        _t.comments();
    },

    start: function() {
        var _t = this,
            configs = _t.config;

        _t.stack.addClass('e-start');
        _t.cards.add(_t.erasers).removeClass('active disable');
        setTimeout(function() {
            _t.hideItems(function() {

                _t.colorTimer = setInterval(function() {
                    var palette = Util.shuffleArray(configs.colorPalette[configs.currentAttempt])
                    _t.coloringCards(palette);
                }, 400)
                setTimeout(function() {
                    _t.stopShuffle();
                }, 3000)

            });
        }, configs.currentAttempt >= configs.winnerAttempt ? 0 : 2000)


    },
    hideItems: function(cb) {
        var _t = this;
        _t.stack.addClass('e-hide');
        cb();
    },
    coloringCards: function(palette) {
        var _t = this,
            configs = _t.config;

        _t.cursor.css('opacity', '.5');

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
        _t.cursor.css('opacity', '1');
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
                completeRatio: configs.currentAttempt >= configs.winnerAttempt ? .5 : .25,
                completeFunction: _t.results.bind(_t)
            });
        });
    },
    disableErasers: function() {
        var _t = this,
            configs = _t.config;

        _t.erasers.each(function(index, el) {
            var currentEraser = $(el);
            index !== _t.currentCardIndex ?
                (currentEraser.addClass('disable').find('.eraser__layer').eraser('disable'), _t.cards.eq(index).addClass('disable')) :
                currentEraser.addClass('active');
            index === _t.currentCardIndex && configs.currentAttempt >= configs.winnerAttempt ?
                currentEraser.addClass('eraser--phone') :
                currentEraser.removeClass('eraser--phone');
        });
    },
    results: function() {
        var _t = this,
            configs = _t.config;

        configs.currentAttempt >= configs.winnerAttempt ? _t.won() : _t.loose();

        configs.currentAttempt++;
    },
    reBuild: function() {
        var _t = this;

        _t.erasers.each(function(index, el) {
            var el = $(el);
            el.removeClass('active').append('<img src="img/fake-img.png" class="eraser__layer" />');
        });
    },
    won: function() {
        var _t = this;

        _t.openPopup('#popupWin');
    },
    loose: function() {
        var _t = this;

        _t.showRealPlace()
    },
    showRealPlace: function() {
        var _t = this;
        var randIndex = 0;
        do {
            randIndex = Util.randomInteger(0, _t.erasers.length - 1);
        } while (randIndex === _t.currentCardIndex)

        _t.erasers.eq(randIndex).addClass('eraser--phone');
        _t.erasers.addClass('active');
        $('.eraser__layer').fadeOut(function() {
            $(this).remove();
        });
        setTimeout(function() {
            _t.reBuild();
            _t.openPopup('#popupLoose');
        }, 1700)
    },
    openPopup: function(query) {
        var _t = this;

        $('body').css('overflow', 'hidden');

        $(query).fadeIn(400, function() {
            $(this).addClass('showed')
        });
    },
    closePopup: function(query, cb) {
        var _t = this;

        $('body').css('overflow', 'initial');
        $(query).removeClass('showed')
        $(query).fadeOut(200, cb);
    },
    timerInit: function() {
        var _t = this,
            configs = _t.config;
        timer('.js-timer', configs.timer)
    },
    counter: function() {
        var _t = this,
            configs = _t.config;

        var el = $('.js-prizes'),
            count = configs.prizesCount;

        var timerId = setInterval(function() {
            count--;
            if (count === 1) clearInterval(timerId);
            el.text(count);
        }, 6000)
    },
    comments: function() {
        var _t = this;

        var comments = $('.comments__item').clone(),
            list = $('.comments__list'),
            maxComments = 5;

        list.html('');
        var spliced = comments.splice(maxComments);
        list.html(spliced);

        var i = comments.length,
            nextComment;

        var timer = setInterval(function() {
            i--;
            if (i == 0) clearInterval(timer);
            nextComment = comments.eq(i);
            $('.comments__item').first().html(nextComment);
        }, 5000)
    }
}

$(function() {
    swip.init();
});