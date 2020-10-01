const express = require("express");
//const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  keys: [
      'supersecretsecret', 'anotherreallylongrandomstring', 'knockknockwhosthereshhhitsasecret'
  ]
}))

app.set("view engine", "ejs");

const generateRandomString = function() { //random string for shortened url
  let result = '';
  const charList = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < 6; i++) {
    const newIndex = Math.floor(Math.random() * charList.length);
    result += charList[newIndex];
  }
  return result;
};

const urlDatabase = {

  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" }
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

const checkEmail = function(email, users) {
  //console.log("users in check: ", users);
  for (let id in users) {
    const user = users[id];
    if (user.email === email) {
      return user;
    }

  }
  return undefined;

};

const urlsForUser = function(id) {
  const urlList = {};
  for (let key in urlDatabase) {
    const url = urlDatabase[key];
    if (url.userID === id) {
      urlList[key] = {};
      urlList[key].userID = id;
      urlList[key].longURL = url.longURL;
    }
  }
  return urlList;
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
  const id = req.session.user_id;
  const user = users[id];
  const urls = urlsForUser(id);

  console.log("URLS ",urls);

  const templateVars = {
    user,
    urls
  };
  //console.log("FIRST URL DATA: ", urlDatabase);
  res.render("urls_index", templateVars);
  //console.log("FIRST URL DATA2222: ", urlDatabase);
});

app.get("/urls/new", (req, res) => { // POST new url
  const id = req.session.user_id;
  const user = users[id];
  const templateVars = {
    user
    
    // ... any other vars
  };
  if (user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
  
});

app.get("/urls/:shortURL", (req, res) => { //GET url
  //console.log(urlDatabase);
  const id = req.session.user_id;
  const user = users[id];
  
  const templateVars = {
    user,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL };
    //console.log("TEMPLATE VARS: ", templateVars)
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  //console.log(req.body);
  const longURL = urlDatabase[req.params.shortURL].longURL;
  //console.log(longURL);
  if (longURL) {
    res.redirect(longURL);
  }
  
});

app.get("/register", (req, res) => { //GET url
  const id = req.session.user_id;
  const user = users[id];

  const templateVars = {
    //username: req.cookies['username']
    user
  };

  res.render("register", templateVars);
});

app.get("/login", (req, res) => { //GET url
  const id = req.session.user_id;
  const user = users[id];

  const templateVars = {
    //username: req.cookies['username']
    user
  };

  res.render("login", templateVars);
});

app.post("/urls", (req, res) => {
  //console.log(req.body);  // Log the POST request body to the console
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL]['longURL'] = req.body.longURL;
  urlDatabase[shortURL].userID = req.session.user_id;
  res.statusCode = 200;
  
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = req.params.shortURL;
  console.log("THIS: ", urlDatabase[shortURL]);
  if ((urlDatabase[shortURL].userID === req.session.user_id)) {
  
    console.log("ID MATCH");
    const newURLObj = {
      longURL,
      userID: req.session.user_id
    };
    urlDatabase[shortURL] = newURLObj;

  }
  
 
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if ((urlDatabase[shortURL].userID === req.session.user_id)) {
    delete urlDatabase[shortURL];

  
  }
  res.redirect('/urls');
});

/*NEED TO CHANGE LOGIN COOKIES */

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  console.log("email: ", email);
  console.log("check: ", checkEmail(email, users));
  const user = checkEmail(email, users);
  const checkPassword = bcrypt.compareSync(password, user.password);
  console.log("PASSCHECK: ", checkPassword);
  if (user) {
    if (checkPassword) {
      req.session.user_id = user.id;
      res.redirect('/urls');
    } else {
      res.status(403).json({message: 'Bad Request password mismatch'});

    }

    
  } else {
    res.status(403).json({message: 'Bad Request email not found'});
  }
  


  //res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  //const username = req.body.username;

  req.session = null;
  //console.log("LOGOUT");

  res.redirect('/urls');
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = {
    id,
    email,
    password: hashedPassword
  };
  if (!(email && password)) { //check if both email and password are not blank
    console.log('empty!!!!');
    res.status(400).json({message: 'Bad Request no email/password provided'});
    
    console.log(res);
  } else if (checkEmail(email, users)) { //check if email exists
    console.log('users exists already');
    res.status(400).json({message: 'Bad Request email already exists'});

  } else { //create cookie and add users to database
    req.session.user_id = id;
    users[id] = newUser;
    res.redirect('/urls');
    console.log('Users: ', users);
  }
  
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});