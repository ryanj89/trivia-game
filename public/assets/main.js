$(document).ready(function() {
  // Get leaderboard scores
  $.get('https://galvanize-leader-board.herokuapp.com/api/v1/leader-board/', function(results) {
    var highScores = results.filter(function(leader) {
      if (leader.game_name === 'TRVA') {
        return leader;
      }
    })
    var sortedScores = highScores.sort(function(score1, score2) {
      return score1.score < score2.score;
    })
    // console.log(highScores);
    sortedScores.forEach(function(score, i) {
      var $leaderScore = $('<li>').text( (i + 1) + '. ' + score.score + " - " + score.player_name);
      $('.scores').append($leaderScore);
    })
  })
})


var counter;
// Get questions
$('#get-questions').on('click', function() {
  var triviaQuery = setFilterOptions();
  getTriviaData(triviaQuery);
  $('#filter-options').addClass('hidden');
  $('.trivia-rounds').removeClass('hidden');
  $('.trivia-card').fadeIn(500);
  $('.trivia-card').removeClass('hidden');
});

function getTriviaData(triviaQuery) {
  var playerScore = 0;
  var answeredCorrectly = 0;
  var questions = [ ];
  var currentRound = 0;
  $.get(triviaQuery)
    .then(getTriviaQuestions)
    .catch(getRejected);


  function getTriviaQuestions(triviaData) {
    triviaData.results.forEach(function(question) {
      questions.push(question);
    })
    populateCategories(questions);
    // Start new round
    newRound(questions, currentRound);

    function populateCategories(questions) {
      var $questionList = $('.question-list');
      $('.total-questions').text(questions.length);
      $('.current-round').text(1);
      questions.forEach(function(question) {
        var $category = $('<li>' + '<span class="trivia-status glyphicon glyphicon-question-sign" aria-hidden="true"></span> ' + question.category + '</li>');
        $questionList.append($category);
      })
    }

    function newRound(questions, currentRound) {
      var currentRound = currentRound;
      var currentQuestion = questions[currentRound];

      // Start timer
      var timerCount = 30;
      counter = setInterval(timer, 1000);
      function timer() {
        timerCount = timerCount - 1;
        if (timerCount <= 0){
          clearInterval(counter);
          document.getElementById("timer").innerHTML = "TIME'S UP!";
          currentRound++;
          timerCount = 30;
          counter = setInterval(timer, 1000);
          return showQuestion(questions, currentRound);

        }
        document.getElementById("timer").innerHTML = timerCount + " secs";
      }
      // Show current question
      showQuestion(questions, currentRound);

      // Select answer
      $('#answer-btn').on('click', function(event) {
        event.preventDefault();
        var playerChoice = $('input[type="radio"]:checked').val();
        var correctAnswer = getAnswer(questions, currentRound);

        if (playerChoice === correctAnswer) {
          alert('CORRECT!');
          var currentCategory = $('.trivia-status:eq('+currentRound+ ')');
          currentCategory.removeClass('glyphicon-question-sign');
          currentCategory.addClass('glyphicon-ok-sign');
          clearInterval(counter);
          timerCount = 30;
          counter = setInterval(timer, 1000);
          answeredCorrectly++;
          addScore();
        } else {
          alert('WRONG!');
          var currentCategory = $('.trivia-status:eq('+currentRound+ ')');
          currentCategory.removeClass('glyphicon-question-sign');
          currentCategory.addClass('glyphicon-remove-sign');
          clearInterval(counter);
          timerCount = 30;
          counter = setInterval(timer, 1000);
        }
        currentRound++;
        $('.current-round').text(currentRound + 1);
        showQuestion(questions, currentRound);
      })

      function getAnswer(questions, currentRound) {
        return questions[currentRound].correct_answer;
      }

      function addScore() {
        var questionValue = questions[currentRound].difficulty;
        var $score = $('#score');
        if (questionValue === "easy") {
          playerScore += 25;
        } else if (questionValue === "medium") {
          playerScore += 50;
        } else if (questionValue === "hard") {
          playerScore += 100;
        };
        $score.text(playerScore);
      }
    }

    // Create trivia card and elements to show on page
    function showQuestion(questions, currentRound) {
      $('.trivia-card').fadeIn(500);
      if (currentRound > 0) {
        $('#player-answer').empty();
      }
      if (currentRound === questions.length) {
        console.log('END');
        $('.trivia-card').fadeOut(500);
        $('#timer').addClass('hidden');
        $('.trivia-rounds').fadeOut(500);
        clearInterval(counter);
        $('.correct').text(answeredCorrectly);
        $('.final').text($('#score').text());
        $('.final-score').removeClass('hidden').fadeIn(500);
      }
      var currentQuestion = questions[currentRound];
      // console.log(currentQuestion);

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

      $category.text(currentQuestion.category);
      $question.html(currentQuestion.question);

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
      // console.log(answers);
      allAnswers.forEach(function(answer, index) {
        var answerChoice = document.createElement('div')
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
    }
  }

  function getRejected() {
    console.log('COULD NOT GET DATA');
  }
}

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


$('#leaderboard').on('click', function() {
  var playerData = {
    "game_name": "TRVA",
    "player_name": $('#userName').val(),
    "score": parseInt($('#score').text())
  };
  console.log(JSON.stringify(playerData));

  // Post to leaderboards
  $.ajax("https://galvanize-cors-proxy.herokuapp.com/https://galvanize-leader-board.herokuapp.com/api/v1/leader-board", {
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify(playerData)
  })
  .then(postSuccess)
  .catch(postFailed);

  function postSuccess(results) {
    console.log('SUCCESS!');
  }
  function postFailed(results) {
    console.log('POSTING FAILED');
  }


})
