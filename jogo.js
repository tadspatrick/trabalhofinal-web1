class Settings {
  constructor() {
    this.quizElement = document.querySelector(".quiz");
    this.settingsElement = document.querySelector(".settings");
    this.category = document.querySelector("#category");
    this.difficulty = [
      document.querySelector("#easy"),
      document.querySelector("#medium"),
      document.querySelector("#hard"),
    ];
    this.startButton = document.querySelector("#start");

    this.quiz = {};

    this.startButton.addEventListener("click", this.startQuiz.bind(this));
  }

  async startQuiz() {
    try {
      const categoryId = this.category.value;
      const difficulty = this.getCurrentDifficulty();
      const url = `https://opentdb.com/api.php?amount=9&category=${categoryId}&difficulty=${difficulty}&type=multiple`;

      let data = await this.fetchData(url);
      this.toggleVisibility();
      this.quiz = new Quiz(this.quizElement, data.results);
    } catch (error) {
      alert(error);
    }
  }

  toggleVisibility() {
    this.settingsElement.style.visibility = "hidden";
    this.quizElement.style.visibility = "visible";
  }

  async fetchData(url) {
    const response = await fetch(url);
    const result = await response.json();

    return result;
  }

  getCurrentDifficulty() {
    const checkedDifficulty = this.difficulty.filter(
      (element) => element.checked
    );

    if (checkedDifficulty.length === 1) {
      return checkedDifficulty[0].id;
    } else {
      throw new Error("Antes de continuar selecione uma dificuldade");
    }
  }
}

class Quiz {
  constructor(quizElement, questions) {
    this.quizElement = quizElement;
    this.currentElement = document.querySelector(".current");
    this.totalElement = document.querySelector(".total");
    this.nextButton = document.querySelector("#next");
    this.finalElement = document.querySelector(".final");

    this.errorcount = 0;
    this.totalAmount = 9;
    this.answeredAmount = 0;
    this.questions = this.setQuestions(questions);

    this.nextButton.addEventListener("click", this.nextQuestion.bind(this));
    this.renderQuestion();
  }

  setQuestions(questions) {
    return questions.map((question) => new Question(question));
  }

  renderQuestion() {
    this.questions[this.answeredAmount].render();
    this.currentElement.innerHTML = this.answeredAmount + 1;
    this.totalElement.innerHTML = this.totalAmount;
  }

  nextQuestion() {
    const checkedElement = this.questions[
      this.answeredAmount
    ].answerElements.filter((el) => el.firstChild.checked);
    if (checkedElement.length === 0) {
      alert("Você precisa selecionar uma alternativa");
    } else {
      this.questions[this.answeredAmount].answer(checkedElement);
      this.showResult();
      this.answeredAmount++;
      this.answeredAmount < this.totalAmount
        ? this.renderQuestion()
        : this.endQuiz();
    }
  }

  showResult() {
    this.calculateCorrectAnswers();
    if (this.questions[this.answeredAmount].isCorrect) {
      alert("Você acertou");
    } else {
      alert(
        "Você errou, a resposta correta era: " +
          this.questions[this.answeredAmount].correctAnswer
      );
      this.errorcount = this.errorcount + 1;
      if (this.errorcount == 3) {
        this.endQuiz();
      }
    }
  }

  endQuiz() {
    const categoria = category.options[category.selectedIndex].text;
    const correctAnswersTotal = this.calculateCorrectAnswers();
    this.final = new Final(correctAnswersTotal, this.totalAmount, categoria);
    this.quizElement.style.visibility = "hidden";
    this.finalElement.style.visibility = "visible";
  }

  calculateCorrectAnswers() {
    let count = 0;

    this.questions.forEach((el) => {
      if (el.isCorrect) {
        count++;
      }
    });
    return count;
  }
}

class Question {
  constructor(question) {
    this.questionElement = document.querySelector("#question");
    this.answerElements = [
      document.querySelector("#a1"),
      document.querySelector("#a2"),
      document.querySelector("#a3"),
      document.querySelector("#a4"),
    ];

    this.correctAnswer = question.correct_answer;
    this.question = question.question;
    this.isCorrect = false;

    this.answers = this.shuffleAnswers([
      question.correct_answer,
      ...question.incorrect_answers,
    ]);
  }

  shuffleAnswers(answers) {
    for (let i = answers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * i);
      const temp = answers[i];
      answers[i] = answers[j];
      answers[j] = temp;
    }
    return answers;
  }

  answer(checkedElement) {
    this.isCorrect =
      checkedElement[0].textContent === this.correctAnswer ? true : false;
  }

  render() {
    this.questionElement.innerHTML = this.question;
    this.answerElements.forEach((el, index) => {
      el.innerHTML =
        '<input type="radio" name="radio"><span class="checkmark-resposta"></span>' +
        this.answers[index];
    });
  }
}

class Final {
  constructor(count, totalAmount, categoria) {
    this.scoreElement = document.querySelector(".resultado");
    this.restartButton = document.querySelector("#restart");

    this.render(count, totalAmount, categoria);
    this.restartButton.addEventListener(
      "click",
      location.reload.bind(location)
    );
  }

  render(count, totalAmount, categoria) {
    this.scoreElement.innerHTML = `Você respondeu corretamente ${count} de ${totalAmount} perguntas da categoria ${categoria}`;
  }
}

new Settings();
