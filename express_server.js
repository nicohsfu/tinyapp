const { findUserByEmail } = require("./helpers");
const express = require("express");
const morgan = require('morgan');
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');
const app = express();
const PORT = 8080;

const generateRandomString = function() {
  let strOutput = "";
  let lettersAndNumArr = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  for (let i = 0; i < 6; i++) {
    let randomLetter = lettersAndNumArr[Math.floor(Math.random() * 61)];
    strOutput += randomLetter;
  }

  return strOutput;
};

const urlsForSpecificUser = function(id) {
  let outputObj = {};

  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      outputObj[shortURL] = urlDatabase[shortURL];
    }
  }

  return outputObj;
};

app.set("view engine", "ejs");

app.use(morgan('dev'));
app.use(cookieSession({
  name: 'tinyapp',
  keys: ['secret']
}));

app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.get("/login", (req, res) => {
  const templateVars = {
    userInfo: users[req.session.user_id]
  };

  if (req.session.user_id) {
    return res.redirect("/urls");
  }

  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const specificUser = findUserByEmail(email, users);

  if (!specificUser) {
    return res.status(403).send('Email cannot be found');
  }

  if (specificUser) {
    const password = req.body.password;
    const hashedPassword = users[specificUser].password;

    if (!bcrypt.compareSync(password, hashedPassword)) {
      return res.status(403).send('Incorrect password!');
    }
  }

  req.session.user_id = findUserByEmail(email, users);

  res.redirect("/urls/");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login/");
});

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlsForSpecificUser(req.session.user_id),
    userInfo: users[req.session.user_id]
  };

  if (!req.session.user_id) {
    return res.status(401).send('Cannot view "My URLs", you are not logged in');
  }

  res.render("urls_index", templateVars);
});

app.get("/urls/:id/delete", (req, res) => {
  const specificURL = urlsForSpecificUser(req.session.user_id);

  const id = req.params.id;

  if (!req.session.user_id) {
    return res.status(401).send("You're not logged in");
  }

  if (!urlDatabase[id]) {
    return res.status(401).send("Short URL ID doesn't exist");
  }

  if (!specificURL[id]) {
    return res.status(401).send("Unauthorized to delete, this is not your short URL");
  }

  delete urlDatabase[id];
  res.redirect("/urls/");
});

app.post("/urls/:id/delete", (req, res) => {
  const specificURL = urlsForSpecificUser(req.session.user_id);

  const id = req.params.id;

  if (!req.session.user_id) {
    return res.status(401).send("You're not logged in");
  }

  if (!urlDatabase[id]) {
    return res.status(401).send("Short URL ID doesn't exist");
  }

  if (!specificURL[id]) {
    return res.status(401).send("Unauthorized to delete, this is not your short URL");
  }

  delete urlDatabase[id];
  res.redirect("/urls/");
});

app.get("/register", (req, res) => {
  const templateVars = { userInfo: users[req.session.user_id] };

  if (req.session.user_id) {
    return res.redirect("/urls");
  }

  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  let userObj = {};
  let userID = generateRandomString();

  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send('Cannot have an empty email or password');
  }

  const user = findUserByEmail(req.body.email, users);

  if (user) {
    return res.status(400).send('Email already in use');
  }

  req.session.user_id = userID;

  userObj.id = userID;
  userObj.email = req.body.email;

  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  userObj.password = hashedPassword;

  users[userID] = userObj;

  console.log("users object: ", users);

  res.redirect('/urls');
});

app.get("/urls/new", (req, res) => {
  const templateVars = { userInfo: users[req.session.user_id] };

  if (!req.session.user_id) {
    return res.redirect("/login");
  }

  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const specificURL = urlsForSpecificUser(req.session.user_id);

  const id = req.params.id;

  if (!urlDatabase[id]) {
    return res.status(401).send("Short URL ID doesn't exist");
  }

  if (!req.session.user_id) {
    return res.status(401).send("You're not logged in");
  }

  if (!specificURL[id]) {
    return res.status(401).send("Unauthorized to edit, this is not your short URL");
  }

  if (!specificURL[req.params.id]) {
    return res.status(401).send("Cannot access these URLs!");
  }

  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id]["longURL"],
    userInfo: users[req.session.user_id]
  };

  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  let shortId = req.params.id;
  const specificURL = urlsForSpecificUser(req.session.user_id);
  const id = req.params.id;

  if (!urlDatabase[id]) {
    return res.status(401).send("Short URL ID doesn't exist");
  }

  if (!req.session.user_id) {
    return res.status(401).send("You're not logged in");
  }

  if (!specificURL[id]) {
    return res.status(401).send("Unauthorized to edit, this is not your short URL");
  }

  urlDatabase[shortId].longURL = req.body.editURL;

  res.redirect("/urls/");
});

app.get("/u/:id", (req, res) => {
  let shortId = req.params.id;
  const longURL = urlDatabase[shortId];

  if (!longURL) {
    return res.status(404).send('Shortened URL does not exist');
  }

  res.redirect(longURL['longURL']);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();

  if (!req.session.user_id) {
    return res.status(401).send('You are not logged in');
  }

  if (!urlDatabase[shortURL]) {
    urlDatabase[shortURL] = {};
  }

  if (!req.body.longURL) {
    return res.status(400).send("Link cannot be empty");
  }

  urlDatabase[shortURL].longURL = req.body.longURL;
  urlDatabase[shortURL].userID = req.session.user_id;

  res.redirect(`/urls/${shortURL}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
