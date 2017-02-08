

// Get questions
$('button').on('click', function() {
  var triviaQuery = setFilterOptions();
  getTriviaData(triviaQuery);
  $('#filter-options').addClass('hidden');

  // Start new round
  newRound();
});

function newRound() {
  // Start timer
  var timerCount = 30;
  var counter = setInterval(timer, 1000);
  function timer() {
    timerCount = timerCount - 1;
    if (timerCount <= 0){
      clearInterval(counter);
      return;
    }
    document.getElementById("timer").innerHTML = timerCount + " secs";
  }

  // Select answer
  $('#answer-btn').on('click', function(event) {
    event.preventDefault();
    console.log('Hello');
  })

}


function getTriviaData(triviaQuery) {
  $.get(triviaQuery)
    .then(getTriviaQuestions)
    // .then(populateCategories)
    .catch(getRejected);




  function getTriviaQuestions(triviaData) {
    var questions = triviaData.results;
    createTriviaCards(questions);

    return questions;
  }
  function populateCategories(questions) {

    var $questionList = $('.question-list');
    questions.forEach(function(question) {
      var $category = $('<li>' + '<span class="glyphicon glyphicon-question-sign" aria-hidden="true"></span> ' + question.category + '</li>');
      $questionList.append($category);
    })
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




// Create trivia card and elements to show on page
function createTriviaCards(questions) {
  questions.forEach(function(question) {
    var $card = $('<article class="trivia-card">');
    var $difficulty = $('<h5 class="trivia-difficulty">').text(question.difficulty);
    var $category = $('<h3 class="trivia-category">').text(question.category);
    var $question = $('<p class="trivia-question">').html(question.question);
    $card.append($difficulty).append($category).append($question);
    $('.question-row').append($card);

    // Get answers
    var allAnswers = [ ];
    var correctAnswer = question.correct_answer;
    var wrongAnswers = question.incorrect_answers;
    // Combine all answers and shuffle
    allAnswers.push(correctAnswer);
    wrongAnswers.forEach(function(answer) {
      allAnswers.push(answer);
    });
    shuffle(allAnswers);

    // Append answers to trivia card
    var $answers = $('<div class="trivia-answers"></div>');
    allAnswers.forEach(function(answer) {
      var $answer = $('<label><input class="answer" type="radio" name="answer">' + answer + '</label>');
      $answers.append($answer);
    })
    $card.append($answers);
    $card.append($('<button id="answer-btn" class="btn btn-primary btn-block">Submit Answer</button>'))
    // console.log($answers);

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
  });
}
