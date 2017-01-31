


// Get questions
$('button').on('click', function() {
  var triviaQuery = setFilterOptions();
  getTriviaData(triviaQuery);

});


function getTriviaData(triviaQuery) {
  $.get(triviaQuery)
    .then(getTriviaQuestions)
    .catch(getRejected);




  function getTriviaQuestions(triviaData) {
    var questions = triviaData.results;
    createTriviaCards(questions);
    console.log(questions);
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
    $('main').append($card);

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

    // Fisher-Yates shuffle
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
