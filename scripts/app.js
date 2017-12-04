

function populate() {
    if(quiz.isEnded()) {
        //showScores();
    }
    else {

        var choices = quiz.getQuestionIndex().choices;
        for (var i = 0; i < choices.length; i++) {

            var element = document.getElementById("choice" + i);
            element.innerHTML = choices[i];

        }


    }
}


var questions = [
    new Question(["Bär","Tiger","Amsel","Renntier"], "Bär"),
    new Question(["Forelle","Schildkrötte","Frosh","Katze"], "Frosh")
];

var quiz = new quiz(questions);