const express = require("express");
const morgan = require('morgan');
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080

function generateRandomString() {
  let strOutput = "";
  let lettersAndNumArr = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  for (let i = 0; i < 6; i++) {
    let randomLetter = lettersAndNumArr[Math.floor(Math.random() * 61)];
    strOutput += randomLetter;
  }

  return strOutput;
}

app.set("view engine", "ejs");

app.use(morgan('dev'));

app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.post("/login", (req, res) => {
  const username = req.body.username; // from the input form
  res.cookie("username", username);
  res.redirect("/urls/");
});

app.post("/logout", (req, res) => {
  const username = req.body.username;
  res.clearCookie("username", username);
  res.redirect("/urls/");
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls/");
});

app.get("/register", (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render("register", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

app.post("/urls/:id", (req, res) => {
  let shortId = req.params.id; // if the info is coming from the URL
  let longURL = req.body.longURL; // if the info is coming from the input form

  urlDatabase[shortId] = longURL;

  res.redirect("/urls/");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});
// ^ to test: http://localhost:8080/urls/b2xVn2

app.get("/u/:id", (req, res) => {
  let shortId = req.params.id;
  const longURL = urlDatabase[shortId];
  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls", (req, res) => {
  console.log("req.body: ", req.body); // Log the POST request body to the console

  let shortURL = generateRandomString();
  // console.log("req.body.longURL: ", req.body.longURL); // test
  urlDatabase[shortURL] = req.body.longURL; // assign user-inputted longURL to a generated shortURL

  // console.log("urlDatabase :", urlDatabase); // test
  // res.send("Ok"); // Respond with 'Ok' (we will replace this)

  res.redirect(`/urls/${shortURL}`);
  // res.redirect(`/u/${shortURL}`);

  // res.redirect(`/u/:id`); // wrong implementation as per mentor
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
