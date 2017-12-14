class Helper {
    load(path) {
        return new Promise((resolve, reject) => {
            fetch(path).then(response => resolve(response.json()))
                .catch(error => {
                    throw new Error(error);
                    reject();
                })
        })
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}

class Game extends Helper {
    constructor() {
        super();

        this.load("../content/questions.json")
            .then(response => {
                this.game = response;

                this.board = document.createElement("div");

                this.init();
            })
            .catch(error => this.showError())
    }

    init() {
        // do some shit
        if (this.game.questions.length > 0) {
            this.game.atQuestion = 0;
            this.game.lastQuestion = this.game.questions.length;
            this.game.trackRecord = [];

            // this.game.questions = this.shuffle(this.game.questions);
            this.nextQuestion();

            document.getElementById("game-board").appendChild(this.board);

        } else {
            // some error
            this.showError();
        }
    }
    nextQuestion() {
        this.currentQuestion = this.game.questions[this.game.atQuestion];
        this.renderQuestion(
            this.currentQuestion,
            this.game.atQuestion++,
            this.game.lastQuestion
        )
    }

    //#region DOM initial
    createTracker() {
        this.tracker = document.createElement("span");
        this.board.appendChild(this.tracker);
    }
    createQuestion() {
        this.question = document.createElement("span");
        this.question.classList.add("question")
        this.board.appendChild(this.question);
    }
    createAnswerBoard() {
        this.answerBoard = document.createElement("div");
        this.answerBoard.classList.add("answer-board")
        this.board.appendChild(this.answerBoard);
    }
    createAudio() {
        this.audio = document.createElement("audio");
        this.audio.controls = 'controls';
        this.board.appendChild(this.audio);
    }
    createButton() {
        this.button = document.createElement("button");
        this.button.addEventListener("click", this.checkAnswer.bind(this), false);
        this.board.appendChild(this.button);
    }
    // #endregion

    // #region DOM
    renderQuestion(questionObject) {
        this.board.innerHTML = "";
        this.renderQuestionStaticItems(questionObject);

        questionObject.answers = this.shuffle(questionObject.answers);

        this.createAnswerBoard()
        questionObject.answers.forEach(element => this.renderAnswerBox(Object.assign(element, { folder: questionObject.folder })))
    }

    renderQuestionStaticItems(questionObject, newQuestion = true) {
        this.createTracker();
        this.createQuestion();
        if (newQuestion === false) {
            this.tracker.textContent = questionObject.number + " / " + this.game.lastQuestion;
        } else {
            this.createButton();
            this.tracker.textContent = (this.game.atQuestion) + " / " + this.game.lastQuestion;
            this.button.textContent = "Submit"
            this.button.disabled = true;
        }
        this.question.textContent = questionObject.question;

        if (questionObject.sound !== false || questionObject.sound != null || !Number.isNaN(parseInt(questionObject.sound))) {
            if (this.audio === undefined) {
                this.createAudio();
            }
            this.audio.src = "content/question-items/" + questionObject.folder + "/sound_" + parseInt(questionObject.sound) + ".mp3"
            this.audio.load();
        } else {
            this.audio.remove();
            this.audio = undefined;
        }
    }

    renderAnswerBox(answer, newQuestion = true) {
        let pictureName = "answer_" + parseInt(answer.pictureId);

        let div = document.createElement("div");
        div.setAttribute("id", pictureName);
        div.setAttribute("data-id", parseInt(answer.pictureId));
        div.classList.add("answer-box")
        if (!newQuestion) {
            if (answer.isCorrect === true) {
                div.classList.add("correct");
            } else if (answer.selected === true) {
                div.classList.add("wrong");
            }
        }
        this.enableSelection = true;
        div.addEventListener("click", this.changeSelection.bind(this), false);

        let span = document.createElement("span");
        span.textContent = answer.name;

        let image = document.createElement("img");
        image.src = "content/question-items/" + answer.folder + "/" + pictureName + ".jpg"

        div.appendChild(image);
        div.appendChild(span);

        this.answerBoard.appendChild(div);

    }

    changeSelection(event) {
        if (this.enableSelection) {
            let selectedId = event.currentTarget.getAttribute("id");
            this.answerBoard.childNodes.forEach(element => {
                let currentId = element.getAttribute("id");
                if (currentId === selectedId) {
                    element.classList.add("selected")
                } else {
                    element.classList.remove("selected")
                }
            })
            this.button.disabled = false;
        }
    }

    checkAnswer() {
        if (this.answerChecked === true) {
            if (this.finished) {
                this.resultPage();
            } else {
                this.answerChecked = false;
                this.nextQuestion();
            }
        } else {

            let correctAnswer = this.currentQuestion.answers.find(x => x.isCorrect === true).pictureId;

            this.answerBoard.childNodes.forEach(element => {
                let currentDataId = element.getAttribute("data-id");
                if (parseInt(currentDataId) === correctAnswer) {
                    element.classList.add("correct");
                }
                if (element.getAttribute("class").indexOf("selected") > -1) {
                    if (parseInt(currentDataId) !== correctAnswer) {
                        element.classList.add("wrong");
                    }
                    this.currentQuestion.answers.find(x => x.pictureId === parseInt(currentDataId)).selected = true;
                }
                this.enableSelection = false;
                element.classList.remove("selected");
            })
            this.currentQuestion.number = this.game.atQuestion;
            this.game.trackRecord.push({ ...this.currentQuestion });
            if (this.game.atQuestion === this.game.lastQuestion) {
                this.button.textContent = "Finalize";
                this.finished = true;
            } else {
                this.button.textContent = "Next Question";
            }
            this.answerChecked = true;
        }
    }

    resultPage() {
        this.board.innerHTML = "";
        if (this.resultDiv === undefined) {
            this.resultDiv = document.createElement("div");
            let title = document.createElement("span");
            title.textContent = "Review your answers";

            let table = document.createElement("table");

            table.appendChild(this.createTableRow(["question", "result", "your answer", "correct answer"]))

            this.game.trackRecord.forEach((element, index) => {
                let correctAnswer = element.answers.find(x => x.isCorrect === true).name;
                let selectedAnswer = element.answers.find(x => x.selected === true).name;
                let tr = this.createTableRow([
                    index++,
                    selectedAnswer === correctAnswer ? "correct" : "wrong",
                    selectedAnswer,
                    correctAnswer
                ])

                tr.cells[1].style.color = selectedAnswer === correctAnswer ? "#6a9d21" : "#9d2138";
                tr.addEventListener("click", _ => { this.returnToQuestion(element) }, false)
                table.appendChild(tr);
            })

            this.resultDiv.appendChild(title);
            this.resultDiv.appendChild(table);
        }
        this.board.appendChild(this.resultDiv);

    }

    returnToQuestion(questionObject) {
        this.board.innerHTML = "";
        this.audio = undefined;
        this.renderQuestionStaticItems(questionObject, false);
        this.createAnswerBoard();
        questionObject.answers.forEach(element => this.renderAnswerBox(Object.assign(element, { folder: questionObject.folder }), false))
        
        let back = document.createElement("button");
        back.textContent ="back";
        back.addEventListener("click", _ => {this.resultPage()}, false);
        this.board.appendChild(back);
    }

    createTableRow(columns) {
        let tr = document.createElement('tr');

        for (let i = 0; i < columns.length; i++) {
            tr.appendChild(document.createElement('td'));
            tr.cells[i].appendChild(document.createTextNode(columns[i]));
        }
        return tr;
    }


    showError() {

    }
    // #endregion
}
new Game();
