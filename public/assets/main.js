$(document).ready(function() {
  // Get leaderboard scores
  getLeaderboards();
  function getLeaderboards() {
    $.get('https://galvanize-leader-board.herokuapp.com/api/v1/leader-board/')
      .then(getHighScores)
      .then(sortHighScores)
      .catch(getScoresFailed);

    function getHighScores(results) {
      var highScores = results.filter(function(leader) {
        if (leader.game_name === 'TRVA') {
          return leader;
        }
      });
      return highScores;
    }
    function sortHighScores(highScores) {
      var sortedScores = highScores.sort((score1, score2) => score1.score < score2.score);

      sortedScores.forEach(function(score, i) {
        var $scoreRow = $('<tr>');
        var $scoreRank = $('<td>').text(i + 1);
        var $playerScore = $('<td>').text(score.score);
        var $playerName = $('<td>').text(score.player_name);
        $scoreRow.append($scoreRank, $playerName, $playerScore);
        $('.scores').append($scoreRow);
      })
    }
    function getScoresFailed() {
      console.log('Could not GET leaderboard scores');
    }
  }

  var counter;
  var currentRound = 0;
  var playerScore = 0;
  // Get questions
  $('#get-questions').on('click', function() {
    var triviaQuery = setFilterOptions();
    getTriviaData(triviaQuery);
    $('#filter-options').fadeOut('fast');
    $('.trivia-rounds').fadeIn(500);
    $('.trivia-card').fadeIn(500);
    $('.timer-area').delay(1400).slideDown('fast');
  });

  function getTriviaData(triviaQuery) {
    var questions = [ ];
    var answeredCorrectly = 0;
    $.get(triviaQuery)
      .then(getTriviaQuestions)
      .catch(getRejected);


    function getTriviaQuestions(triviaData) {
      questions = triviaData.results.map(function(question) {
        return question;
      });
      console.log(questions);
      populateCategories(questions);
      // Start new round
      newRound(questions, currentRound);

      function populateCategories(questions) {
        $('.trivia-rounds').fadeIn(500);
        var $questionList = $('.question-list');
        $('.total-questions').text(questions.length);
        $('.current-round').text(1);
        questions.forEach(function(question) {
          var $category = $('<li>' + '<span class="trivia-status glyphicon glyphicon-question-sign" aria-hidden="true"></span> ' + question.category + '</li>');
          $questionList.append($category);
        });
      }

      function newRound(questions, currentRound) {
        var currentQuestion = questions[currentRound];
        // Start timer
        var timerCount = 30;
        counter = setInterval(timer, 1000);
        function timer() {
          timerCount = timerCount - 1;
          if (timerCount < 4) {
            document.getElementById("timer").style.color = "#f41844";
          }
          if (timerCount <= 0){
            document.getElementById("timer").innerHTML = "TIME'S UP!";
            resetTimer();
            currentRound++;
            return showQuestion(questions, currentRound);

          }
          document.getElementById("timer").innerHTML = timerCount;
        }
        // Show current question
        showQuestion(questions, currentRound);

        // Select answer
        $('#answer-btn').on('click', function(event) {
          event.preventDefault();
          var playerChoice = $('input[type="radio"]:checked').val();
          var correctAnswer = getAnswer(questions, currentRound);
          var $currentCategory = $('.trivia-status:eq('+currentRound+ ')');

          if (playerChoice === correctAnswer) {
            $('.alert-correct>h2').text(getRandomSuccess());
            $('.alert-correct').fadeIn('slow').delay(1000).fadeOut('slow');
            $currentCategory.removeClass('glyphicon-question-sign');
            $currentCategory.addClass('glyphicon-ok-sign');
            resetTimer();
            addScore();
            answeredCorrectly++;
          } else {
            $('.alert-wrong>h2').text(getRandomFailure());
            $('.alert-wrong').fadeIn('fast').delay(1000).fadeOut('slow');
            $currentCategory.removeClass('glyphicon-question-sign');
            $currentCategory.addClass('glyphicon-remove-sign');
            resetTimer();
          }

          currentRound++;
          $('.current-round').text(currentRound + 1);
          showQuestion(questions, currentRound);
        })

        function getAnswer(questions, currentRound) {
          // console.log(questions);
          var answer = questions[currentRound].correct_answer;
          return answer;
        }

        function addScore() {
          var questionValue = questions[currentRound].difficulty;
          if (questionValue === "easy") {
            playerScore += 25;
          } else if (questionValue === "medium") {
            playerScore += 50;
          } else if (questionValue === "hard") {
            playerScore += 100;
          }
          $('#score').text(playerScore);
        }

        function resetTimer() {
          document.getElementById("timer").style.color = "#ecf0f1";
          timerCount = 30;
          clearInterval(counter);
          counter = setInterval(timer, 1000);
        }
      }

      // Create trivia card and elements to show on page
      function showQuestion(questions, currentRound) {
        $('.trivia-card').fadeIn(500);

        if (currentRound > 0) {
          $('#player-answer').empty();
        }
        if (currentRound === questions.length) {
          $('.trivia-card').fadeOut(500);
          $('.timer-area').hide();
          $('.trivia-rounds').fadeOut(500);
          clearInterval(counter);
          $('.correct').text(answeredCorrectly);
          $('.final').text($('#score').text());
          $('.final-score').fadeIn(500);
        } else {
          var currentQuestion = questions[currentRound];

          var $difficulty = $('.trivia-difficulty');
          var $category = $('.trivia-category');
          var $question = $('.trivia-question');

          var questionPoints = currentQuestion.difficulty;
          if (questionPoints === "easy") {
            $difficulty.text("25 pts.");
          } else if (questionPoints === "medium") {
            $difficulty.text("50 pts.");
          } else {
            $difficulty.text("100 pts.");
          }

          $category.text(currentQuestion.category).fadeIn('slow');
          $question.html(currentQuestion.question).fadeIn('slow');

          var allAnswers = [ ];
          // Get answers
          var correctAnswer = currentQuestion.correct_answer;
          console.log(correctAnswer);
          var wrongAnswers = currentQuestion.incorrect_answers;
          // Combine all answers and shuffle
          allAnswers.push(correctAnswer);
          wrongAnswers.forEach(function(answer) {
            allAnswers.push(answer);
          });
          shuffle(allAnswers);

          var answers = document.getElementById('player-answer');
          allAnswers.forEach(function(answer, index) {
            var answerChoice = document.createElement('div');
            answerChoice.className = 'radio';
            var label = document.createElement('label');
            label.className = 'trivia-answer';
            var radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'answer';
            radio.value = answer;

            label.appendChild(radio);
            label.appendChild(document.createTextNode(answer));
            answerChoice.appendChild(label);

            answers.appendChild(answerChoice);
          });
        }
      }
    }

    function getRejected() {
      console.log('COULD NOT GET DATA');
    }
  }

  $('#play-again').on('click', function() {
    resetGame();
  })




  // Get user selected filter options
  function setFilterOptions() {
    var url = 'https://opentdb.com/api.php?amount=';
    // # of Questions
    url += $('.num-questions option:selected').val();
    // Category
    var $category = $('.category-filter option:selected').val();
    if ( $category != 'any' ) {
      url += '&category=' + $category;
    }
    // Difficulty
    var $difficulty = $('.difficulty-filter option:selected').val();
    if ( $difficulty != 'any') {
      url += '&difficulty=' + $difficulty;
    }
    // Question Type
    var $type = $('.type-filter option:selected').val();
    if ( $type != 'any' ) {
      url += '&type=' + $type;
    }
    // console.log(url);
    return url;
  }


  // Post to leaderboards
  $('#leaderboard').on('click', function() {
    var playerData = {
      "game_name": "TRVA",
      "player_name": $('#userName').val(),
      "score": parseInt($('#score').text())
    };

    $.ajax("https://galvanize-cors-proxy.herokuapp.com/https://galvanize-leader-board.herokuapp.com/api/v1/leader-board", {
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(playerData)
    })
    .then(postSuccess)
    .catch(postFailed);

    resetGame();


    function postSuccess(results) {
      console.log('SUCCESS!');
    }
    function postFailed(results) {
      console.log('POSTING FAILED');
    }
  })

  // Reset game
  function resetGame() {
    counter = undefined;
    playerScore = 0;
    answeredCorrectly = 0;
    questions = [ ];
    currentRound = 0;
    $('#score').text(playerScore);
    $('.question-list').empty();
    $('#filter-options').fadeIn('slow');
    $('.final-score').fadeOut('slow');
  }




  // Shuffle
  function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  }

  function getRandomSuccess() {
    var success = [
      "Great job!",
      "Correct!",
      "Way to go!",
      "That's Right!",
      "So smart!",
      "Awesome!",
    ]
    return success[Math.floor(Math.random() * success.length)];
  }
  function getRandomFailure() {
    var failure = [
      "Wrong!",
      "Not Quite..",
      "Almost..",
      "So Close!",
      "Duh...",
      "..really?",
    ]
    return failure[Math.floor(Math.random() * failure.length)];
  }
})



$('.tag-line').mouseover(function() {
  $('.tag-line2').fadeIn('slow').css('display', 'inline-block');
})
