var Util = {
  randomInteger: function(min, max) {
    var rand = min + Math.random() * (max - min);
    rand = Math.round(rand);
    return rand;
  },
  scrollToEl: function(el, offset) {
    $("html,body").animate({ scrollTop: el.offset().top + (offset || 0) }, 500);
  },
  trimString: function(string) {
    return string.split(" ").join("");
  },
  hexToRgb: function(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? parseInt(result[1], 16) +
          ", " +
          parseInt(result[2], 16) +
          ", " +
          parseInt(result[3], 16)
      : null;
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
};

var timer = function(el, minutes) {
  function getTimeRemaining(endtime) {
    var t = Date.parse(endtime) - Date.parse(new Date());
    var seconds = Math.floor((t / 1000) % 60);
    var minutes = Math.floor((t / 1000 / 60) % 60);
    return {
      total: t,
      minutes: minutes < 10 ? "0" + minutes : minutes,
      seconds: seconds < 10 ? "0" + seconds : seconds
    };
  }

  function initializeClock(el, endtime) {
    var clock = document.querySelectorAll(el);

    function updateClock() {
      var t = getTimeRemaining(endtime);

      $(clock).html(t.minutes + ":" + t.seconds);

      if (t.total <= 0) {
        clearInterval(timeinterval);
      }
    }

    updateClock();
    var timeinterval = setInterval(updateClock, 1000);
  }

  var _currentDate = new Date();
  var count = minutes || 15;
  var _toDate = new Date(
    _currentDate.getFullYear(),
    _currentDate.getMonth(),
    _currentDate.getDate(),
    _currentDate.getHours(),
    _currentDate.getMinutes() + count,
    1
  );
  initializeClock(el, _toDate);
};

var swip = {
  config: {
    colorPalette: [
      [
        ["#ff8359", "#ffdf40"],
        ["#5ac8fa", "#50fbdc"],
        ["#ff5178", "#ff85ad"],
        ["#54d169", "#aff57a"]
      ],
      [
        ["#ea5455", "#feb692"],
        ["#7367f0", "#ce9ffc"],
        ["#369a3a", "#6ad56a"],
        ["#ffc107", "#fff178"]
      ]
    ],
    winnerAttempt: 1,
    prizesCount: Number($('.js-prizes').text()),
    currentAttempt: 0,
    currentCardIndex: 0,
    timer: 8,
    questions: {
      currentStep: 1,
      right: 0,
      wrong: 0
    }
  },
  init: function(options) {
    var _t = this,
      configs = _t.config;

    _t.stack = $(".stack");
    _t.cards = $(".stack__card .card");
    _t.erasers = $(".eraser");
    _t.cursor = $("#cursor");

    _t.timerStep = 0;

    _t.questionsSection = $(".questions");
    _t.questionsLayout = $(".layout__questions");
    configs.questions["length"] = $(".questions__questions-item").length;
    _t.questionsItems = $(".questions__questions-item");
    _t.progressItems = $(".progress__item");
    _t.answersItems = $(".questions__answers-list");

    var right = "right",
      wrong = "wrong";

    _t.countingLayout = $(".layout__counting");
    _t.resultsLayout = $(".layout__results");
    _t.cardsLayout = $(".layout__swips");

    _t.rightAnswersEl = $('.js-rightAnswers');
    _t.totalAnswersEl = $('.js-totalAnswers');

    _t.coloringCards(configs.colorPalette[configs.currentAttempt]);

    _t.openPopup("#popupStart");

    $(".popup__close").on("click", function(event) {
      event.preventDefault();
      var popupId = $(event.target)
        .closest(".popup")
        .attr("id");

      _t.closePopup("#" + popupId);
    });

    $(".js-start").on("click", function(event) {
      event.preventDefault();
      _t.closePopup("#popupStart", function() {
        _t.start();
        _t.timerInit();
      });
    });

    $(".js-startSecondStep").on("click", function(event) {
      event.preventDefault();
      _t.resultsLayout.hide(0, function() {
        $(".header__sign")
          .eq(1)
          .addClass("active")
          .siblings()
          .removeClass("active");
        _t.secondStep();
        _t.counter();
      });
    });

    $(".js-restart").on("click", function(event) {
      event.preventDefault();
      _t.closePopup("#popupLoose", function() {
        _t.secondStep();
      });
    });

    $(".questions__answer").on("click", function(event) {
      event.preventDefault();
      var answer = $(this),
        // isRight = answer.attr("data-right"),
        isRight = true,
        answerEl = answer.find(".questions__btn");
        
      answer.siblings().addClass("disabled");

      if (isRight) {
        answerEl.addClass(right);
        configs.questions[right]++;
      } else {
        answerEl.addClass(wrong);
        configs.questions[wrong]++;
      }

      setTimeout(function() {
        _t.nextQuestion(isRight);
      }, 200);
    });

    _t.stack
      .mousemove(function(e) {
        _t.cursor.show().css({
          left: e.clientX - 30,
          top: e.clientY - 20
        });
      })
      .mouseout(function() {
        _t.cursor.hide();
      });

    _t.comments();
  },
  start: function() {
    var _t = this;

    _t.firstStep();
  },
  nextQuestion: function(isRight) {
    var _t = this,
      configs = _t.config;

    if (configs.questions.currentStep < configs.questions.length) {
      _t.hideQuestion(configs.questions.currentStep - 1, isRight);
      configs.questions.currentStep++;
      _t.showQuestion(configs.questions.currentStep - 1);
    } else {
      _t.setProgress(
        configs.questions.currentStep - 1,
        isRight ? "right" : "wrong"
      );
      _t.counting();
    }
  },
  hideQuestion: function(i, isRight) {
    var _t = this;
    _t.questionsItems.eq(i).removeClass("active");
    _t.answersItems.eq(i).removeClass("active");
    _t.setProgress(i, isRight ? "right" : "wrong");
  },
  showQuestion: function(i) {
    var _t = this;
    _t.questionsItems.eq(i).addClass("active");
    _t.answersItems.eq(i).addClass("active");
  },
  setProgress: function(i, status) {
    var _t = this;
    _t.progressItems.siblings().removeClass("active");
    _t.progressItems.eq(i).addClass(status);
    _t.progressItems.eq(i + 1).addClass("active");
  },
  counting: function() {
    var _t = this,
    configs = _t.config;

    setTimeout(function() {
      _t.questionsLayout.hide(0, counting);
    }, 400);

    _t.rightAnswersEl.text(configs.questions.right);
    _t.totalAnswersEl.text(configs.questions.length);

    var interval = 60,
      items = $(".counting__item"),
      percentageEl = $(".loader__percentage"),
      loaderTrack = $(".loader__completeProgress"),
      totalTime = interval * 100,
      timePerItem = Math.ceil(totalTime / items.length);

    function counting() {
      _t.countingLayout.show(0);

      items.each(function(i) {
        setTimeout(function() {
          items.eq(i).addClass("active");
        }, (i + 1) * timePerItem);
      });

      var loading = 0,
        loadingTimer;

      loadingTimer = setInterval(function() {
        loading++;
        percentageEl.text(loading + "%");
        loaderTrack.css("width", loading + "%");
        if (loading >= 100) {
          clearInterval(loadingTimer);
        }
      }, interval);

      setTimeout(function() {
        _t.showResults();
      }, totalTime + 1000);
    }
  },
  showResults: function() {
    var _t = this;

    _t.countingLayout.hide(0);
    _t.resultsLayout.show(0);
  },
  firstStep: function() {
    var _t = this;

    _t.questionsLayout.show(0);
  },
  secondStep: function() {
    var _t = this,
      configs = _t.config;

    _t.cardsLayout.show(0);

    _t.cards
      .add(_t.erasers)
      .add(_t.stack)
      .removeClass("active disable e-start e-hide e-cloud");

    _t.stack.addClass("e-start");
    setTimeout(
      function() {
        _t.hideItems(function() {
          _t.colorTimer = setInterval(function() {
            var palette = Util.shuffleArray(
              configs.colorPalette[configs.currentAttempt]
            );
            _t.coloringCards(palette);
          }, 400);
          setTimeout(function() {
            _t.stopShuffle();
          }, 3000);
        });
      },
      configs.currentAttempt >= configs.winnerAttempt ? 0 : 2000
    );
  },
  hideItems: function(cb) {
    var _t = this;
    _t.stack.addClass("e-hide");
    cb();
  },
  coloringCards: function(palette) {
    var _t = this,
      configs = _t.config;

    _t.cursor.css("opacity", ".5");

    _t.cards.each(function(index, el) {
      var color1 = palette[index][0],
        color2 = palette[index][1];
      $(el).css({
        color: color1,
        backgroundImage:
          "linear-gradient(-45deg, " + color1 + ", " + color2 + ")"
      });
      _t.erasers
        .eq(index)
        .attr(
          "data-config",
          '["' + palette[index][0] + '", "' + palette[index][1] + '"]'
        );
    });
  },
  stopShuffle: function() {
    var _t = this,
      configs = _t.config;
    clearInterval(_t.colorTimer);
    _t.makeErasers();
    _t.stack.addClass("e-cloud");
    _t.cursor.css("opacity", "1");
  },
  makeErasers: function() {
    var _t = this,
      configs = _t.config;

    _t.erasers.each(function(index, el) {
      var gradientScheme = JSON.parse($(el).attr("data-config"));
      $(el)
        .find(".eraser__layer")
        .eraser({
          size: 25,
          gradient: [gradientScheme[0], gradientScheme[1]],
          progressFunction: function(progress, current) {
            _t.currentCardIndex = $(current)
              .closest(".eraser")
              .index();
            _t.disableErasers.call(_t);
          },
          completeRatio: configs.currentAttempt >= configs.winnerAttempt ? .5 : .35,
          completeFunction: _t.results.bind(_t)
        });
    });
  },
  disableErasers: function() {
    var _t = this,
      configs = _t.config;

    _t.erasers.each(function(index, el) {
      var currentEraser = $(el);
      index !== _t.currentCardIndex
        ? (currentEraser
            .addClass("disable")
            .find(".eraser__layer")
            .eraser("disable"),
          _t.cards.eq(index).addClass("disable"))
        : currentEraser.addClass("active");
      index === _t.currentCardIndex &&
      configs.currentAttempt >= configs.winnerAttempt
        ? currentEraser.addClass("eraser--phone")
        : currentEraser.removeClass("eraser--phone");
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
      el.removeClass("active").append(
        '<img src="img/fake-img.png" class="eraser__layer" />'
      );
    });
  },
  won: function() {
    var _t = this;

    _t.openPopup("#popupWin");
  },
  loose: function() {
    var _t = this;

    _t.showRealPlace();
  },
  showRealPlace: function() {
    var _t = this;
    var randIndex = 0;
    do {
      randIndex = Util.randomInteger(0, _t.erasers.length - 1);
    } while (randIndex === _t.currentCardIndex);

    _t.erasers.eq(randIndex).addClass("eraser--phone");
    _t.erasers.addClass("active");
    $(".eraser__layer").fadeOut(function() {
      $(this).remove();
    });
    setTimeout(function() {
      _t.reBuild();
      _t.openPopup("#popupLoose");
    }, 1700);
  },
  openPopup: function(query) {
    var _t = this;

    $("body").css("overflow", "hidden");

    $(query).fadeIn(400, function() {
      $(this).addClass("showed");
    });
  },
  closePopup: function(query, cb) {
    var _t = this;

    $("body").css("overflow", "initial");
    $(query).removeClass("showed");
    $(query).fadeOut(200, cb);
  },
  timerInit: function() {
    var _t = this,
      configs = _t.config;
    timer(".js-timer", configs.timer);
  },
  counter: function() {
    var _t = this,
      configs = _t.config;

    var el = $(".js-prizes"),
      count = configs.prizesCount;

    var timerId = setInterval(function() {
      count--;
      if (count === 1) clearInterval(timerId);
      el.text(count);
    }, 10000);
  },
  comments: function() {
    var _t = this;

    var comments = $(".comments__item").clone(),
      list = $(".comments__list"),
      maxComments = 5;

    list.html("");
    var spliced = comments.splice(maxComments);
    list.html(spliced);

    var i = comments.length,
      nextComment;

    var timer = setInterval(function() {
      i--;
      if (i == 0) clearInterval(timer);
      nextComment = comments.eq(i);
      list.prepend(nextComment);
      $(".comments__item")
        .last()
        .remove();
    }, Util.randomInteger(1000, 4000));
  }
};

$(function() {
  swip.init();
});
