const express = require("express");
const morgan = require('morgan');
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080

const generateRandomString = function() {
  let strOutput = "";
  let lettersAndNumArr = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  for (let i = 0; i < 6; i++) {
    let randomLetter = lettersAndNumArr[Math.floor(Math.random() * 61)];
    strOutput += randomLetter;
  }

  return strOutput;
};

app.set("view engine", "ejs");

// these app.use lines are middlewares
app.use(morgan('dev'));
app.use(cookieParser());

// body parser that's built-in to express
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

const findUserByEmail = (email) => {
  for (const userId in users) {
    const userFromDb = users[userId];

    if (userFromDb.email === email) {
      // we found our user
      return userId;
    }
  }

  return null;
};

app.get("/login", (req, res) => {
  const templateVars = {
    userInfo: users[req.cookies["user_id"]]
  };

  if (req.cookies["user_id"]) {
    return res.redirect("/urls");
  }

  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email; // from the input form

  const user = findUserByEmail(req.body.email);

  if (!user) {
    return res.status(403).send('email cannot be found');
  }

  if (user) {
    if (users[user].password !== req.body.password) {
      return res.status(403).send('incorrect password!');
    }
  }

  res.cookie("user_id", findUserByEmail(email));

  res.redirect("/urls/");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id"); //clearCookie("") just takes in 1 argument, the key
  res.redirect("/urls/");
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    userInfo: users[req.cookies["user_id"]]
  };

  // structure is: res.render(ejsTemplateName, variablesInsideEjsTemplate)
  res.render("urls_index", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls/");
});

app.get("/register", (req, res) => {
  const templateVars = { userInfo: users[req.cookies["user_id"]] };

  if (req.cookies["user_id"]) {
    return res.redirect("/urls");
  }

  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  let userObj = {};
  let userID = generateRandomString();

  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send('cannot have an empty email or password');
  }

  const user = findUserByEmail(req.body.email);

  //check if we found a user
  if (user) {
    return res.status(400).send('Email already in use');
  }

  res.cookie("user_id", userID);

  userObj.id = userID;
  userObj.email = req.body.email;
  userObj.password = req.body.password;
  users[userID] = userObj;

  console.log("users object: ", users);

  res.redirect('/urls');
});

app.get("/urls/new", (req, res) => {
  const templateVars = { userInfo: users[req.cookies["user_id"]] };

  if (!req.cookies["user_id"]) {
    return res.redirect("/login");
  }

  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], userInfo: users[req.cookies["user_id"]] };
  res.render("urls_show", templateVars);
});
// ^ to test: http://localhost:8080/urls/b2xVn2

app.post("/urls/:id", (req, res) => {
  let shortId = req.params.id; // if the info is coming from the URL
  let longURL = req.body.longURL; // if the info is coming from the input form

  urlDatabase[shortId] = longURL;

  res.redirect("/urls/");
});

app.get("/u/:id", (req, res) => {
  let shortId = req.params.id;
  const longURL = urlDatabase[shortId];

  if (!longURL) {
    return res.status(404).send('shortened URL does not exist');
  }

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

  if (!req.cookies["user_id"]) {
    return res.status(401).send('you are not logged in');
  }

  // assign user-inputted longURL to a generated shortURL
  urlDatabase[shortURL] = req.body.longURL;

  const templateVars = { userInfo: users[req.cookies["user_id"]] };

  res.redirect(`/urls/${shortURL}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
