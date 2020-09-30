const express = require("express");
const cookieParser = require('cookie-parser');


const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

function generateRandomString() { //random string for shortened url
  let result = '';
  const charList = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < 6; i++) {
    const newIndex = Math.floor(Math.random() * charList.length);
    result += charList[newIndex];
  }
  return result;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};


app.get("/", (req, res) => { //landing page
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => { //returns all urls in json string
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => { //indexes all urls and its shortened url
  //console.log(req.cookies);
  const templateVars = {
    username: req.cookies['username'],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => { // POST new url
  const templateVars = {
    username: req.cookies["username"],
    // ... any other vars
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => { //GET url

  const templateVars = {
    username: req.cookies['username'],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  //console.log(req.body);
  const longURL = urlDatabase[req.params.shortURL];
  //console.log(longURL);
  if (longURL) {
    res.redirect(longURL);
  } else {
    
  }
  
});

app.get("/register", (req, res) => { //GET url

  const templateVars = {
    username: req.cookies['username']};

  res.render("register", templateVars);
});

app.post("/urls", (req, res) => {
  //console.log(req.body);  // Log the POST request body to the console
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.statusCode = 200;
  
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = longURL;
  
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];

  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie('username', username);


  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  //const username = req.body.username;

  res.clearCookie('username');
  //console.log("LOGOUT");

  res.redirect('/urls');
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const newUser = {
    id,
    email,
    password
  };
  res.cookie('user_id', id);
  users[id] = newUser;
  res.redirect('/urls');
  console.log('Users: ', users);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});