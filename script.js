function toggleDarkLight() {
  var body = document.getElementById("cls");
  var currentClass = body.className;
  currentClass === "dark-mode" ? lightMode() : darkMode();
}
function lightMode() {
  document.getElementById("cls").className = "light-mode";
}

function darkMode() {
  document.getElementById("cls").className = "dark-mode";
}
let fields = {};

document.addEventListener("DOMContentLoaded", function () {
  fields.name = document.getElementById("name");
  fields.email = document.getElementById("email");
  fields.phone = document.getElementById("phone");
  fields.message = document.getElementById("message");
});

function isNotEmpty(value) {
  if (value == null || typeof value == "undefined") return false;
  return value.length > 0;
}

function isNumber(num) {
  return num.length > 0 && !isNaN(num);
}

function isEmail(email) {
  const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(String(email).toLowerCase());
}

function fieldValidation(field, validationFunction) {
  if (field == null) return false;

  let isFieldValid = validationFunction(field.value);
  if (!isFieldValid) {
    field.className = "placeholderRed";
  } else {
    field.className = "";
  }

  return isFieldValid;
}

function isValid() {
  var valid = true;
  valid = fieldValidation(fields.name, isNotEmpty);
  console.log(valid);
  valid = fieldValidation(fields.email, isEmail);
  console.log(valid);
  valid = fieldValidation(fields.phone, isNotEmpty);
  console.log(valid);
  valid = fieldValidation(fields.message, isNotEmpty);
  console.log(valid);
  return valid;
}

function sendContact() {
  if (isValid()) {
    alert(`thanks for the message.`);
  } else {
    alert("There was an error");
  }
}

class InvalidArgumentException {
  constructor(argument, value, message) {
    this.name = "InvalidArgumentException";
    this.argument = argument;
    this.value = value;

    if (typeof message !== "undefined") {
      this.message = message;
    } else {
      this.message = `Invalid argument ${argument} with value: ${value}.`;
    }
  }

  getArgument() {
    return this.argument;
  }

  getValue() {
    return this.value;
  }

  getMessage() {
    return this.message;
  }
}

class DadJokeApi {
  constructor() {
    this.apiUrl = "https://icanhazdadjoke.com";
    this.id = null;
    this.count = null;
    this.cache = {};
  }

  getCount(callback) {
    if (!(callback instanceof Function)) {
      throw new InvalidArgumentException(
        "callback",
        callback,
        'The parameter "callback" has to be a function!'
      );
    }

    if (this.count !== null) {
      callback(this.count);
      return;
    }

    $.getJSON(`${this.apiUrl}/search`, {
      limit: 1,
    })
      // HTTP Status == 200
      .done((data) => {
        if (data.status === 200 && data.hasOwnProperty("total_jokes")) {
          this.count = data.total_jokes;
          callback(this.count);
        } else {
          callback(null);
        }
      })
      // HTTP Status != 200
      .fail((data) => {
        callback(null);
      });
  }

  getOneByOne(page, callback) {
    $.getJSON(`${this.apiUrl}/search`, {
      limit: 1,
      page: page,
    })
      // HTTP Status == 200
      .done((data) => {
        if (data.status === 200 && data.hasOwnProperty("results")) {
          let previous = null;
          let next = null;

          if (data.previous_page !== page) {
            previous = data.previous_page;
          }

          if (data.next_page !== page) {
            next = data.next_page;
          }

          callback({
            joke: data.results[0].joke,
            current: page,
            previous: previous,
            next: next,
            total: data.total_pages,
          });
        } else {
          callback(null);
        }
      })
      // HTTP Status != 200
      .fail((data) => {
        callback(null);
      });
  }
}

class DadJokeForm {
  constructor() {
    this.elements = {
      controls: {
        random: $("#joke-control-random"),
      },
      text: $("#joke-text"),
    };

    this.DadJokes = new DadJokeApi();
    this.page = 1;
    this.totalPages = null;
  }

  init() {
    this.registerEvents();

    this.DadJokes.getOneByOne(this.page, (data) => {
      if (data === null) {
        this.showError(
          "We could not load a Joke from the API. Please try again later."
        );
      } else {
        this.totalPages = data.total;
        this.showJoke(data);
      }
    });
  }

  registerEvents() {
    this.elements.controls.random.click((e) => {
      e.preventDefault();
      this.loadRandom();
    });
  }

  loadPage(page) {
    this.DadJokes.getOneByOne(page, (data) => {
      if (data === null) {
        this.showError(
          "We could not load a Joke from the API. Please try again later."
        );
      } else {
        this.showJoke(data);
      }
    });
  }
  loadRandom() {
    const page = this.getRandomIntInclusive(1, this.totalPages);
    this.loadPage(page);
  }

  showJoke(data) {
    this.elements.text.html(data.joke);
    this.elements.text.removeClass("hidden");
  }

  getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

const jokeForm = new DadJokeForm();
jokeForm.init();
