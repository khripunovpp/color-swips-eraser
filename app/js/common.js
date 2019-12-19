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

var colorPalette = [
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
];

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
        currentAttempt: 0
    },
    init: function(options) {

    }
}

$(function() {
    swip.init();
    $('.eraser__layer').eraser({
        gradient: ['#369a3a', '#6ad56a']
    });
});