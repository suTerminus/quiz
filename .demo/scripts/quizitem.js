function QuizItem(question, audio, variants, answer, enabled, replied, selectionOfUser) {
    this.question = question;
    this.audio = audio;
    this.variants = variants;
    this.answer = answer;
    this.enabled = enabled;
    this.replied = replied;
    this.selectionOfUser = selectionOfUser;
}

var quizQuestions = [];

quizQuestions[0] = new QuizItem(
    "Welches Tier hören Sie:",
    'animal00.mp3',
    [   '/question00/answer00.jpg',
        '/question00/answer01.jpg',
        '/question00/answer02.jpg',
        '/question00/answer03.jpg'
    ],
    2,
    false,
    false,
    undefined);

quizQuestions[1] = new QuizItem(
    "Welches Tier hören Sie:",
    'animal01.mp3',
    [   '/question01/answer00.jpg',
        '/question01/answer01.jpg',
        '/question01/answer02.jpg',
        '/question01/answer03.jpg'
    ],
    3,
    false,
    false,
    undefined);

