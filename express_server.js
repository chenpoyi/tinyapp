const express = require("express");
const { getUserByEmail, generateRandomString } = require('./helpers.js');
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
}));

app.set("view engine", "ejs");

//

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


app.get("/", (req, res) => { //landing page --> redirect to /urls if logged in, /login if not
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
  
});

app.get("/urls.json", (req, res) => { //returns all urls in json string
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => { //indexes all urls and its shortened url
  const id = req.session.user_id;
  const user = users[id];
  const urls = urlsForUser(id);


  const templateVars = {
    user,
    urls
  };
  if (!id) {
    //res.status(400).json({message: 'You must be logged in.'});
    templateVars['code'] = 400;
    templateVars['message'] = 'You must be logged in.';
    res.render("error", templateVars);
  } else {
    res.render("urls_index", templateVars);
  }

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
  const id = req.session.user_id;
  const user = users[id];
  if (!id) {
    const templateVars = {
      user
    };
    templateVars['code'] = 400;
    templateVars['message'] = 'You must be logged in.';
    res.render("error", templateVars);

  } else if (!urlsForUser(id)[req.params.shortURL]) {
    const templateVars = {
      user
    };
    templateVars['code'] = 400;
    templateVars['message'] = 'You do not have permission for this page.';
    res.render("error", templateVars);

  } else if (!urlDatabase[req.params.shortURL]) {
    const templateVars = {
      user
    };
    templateVars['code'] = 400;
    templateVars['message'] = 'The shortURL does not exist.';
    res.render("error", templateVars);

  } else {
    const templateVars = {
      user,
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL };
    res.render("urls_show", templateVars);
  }

  
});

app.get("/u/:shortURL", (req, res) => {
  const url = urlDatabase[req.params.shortURL];
  const id = req.session.user_id;
  const user = users[id];
  if (!url) {
    const templateVars = {
      user
    };
    templateVars['code'] = 400;
    templateVars['message'] = 'The shortURL does not exist.';
    res.render("error", templateVars);
  } else {
    res.redirect(url.longURL);
  }
  
});

app.get("/register", (req, res) => { //GET url
  const id = req.session.user_id;
  const user = users[id];

  const templateVars = {
    user
  };
  if (id) {
    res.redirect('/urls');
  } else {
    res.render("register", templateVars);
  }
  
});

app.get("/login", (req, res) => {
  const id = req.session.user_id;
  const user = users[id];

  const templateVars = {
    user
  };
  if (id) {
    res.redirect('/urls');
  } else {
    res.render("login", templateVars);
  }
 
});



app.post("/urls", (req, res) => {
  

  const id = req.session.user_id;
 
  const user = users[id];

  
  if (user) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {};
    urlDatabase[shortURL]['longURL'] = req.body.longURL;
    urlDatabase[shortURL].userID = req.session.user_id;
    res.statusCode = 200;
  
    res.redirect(`/urls/${shortURL}`);
  } else {
    const templateVars = {
      user
    };
    templateVars['code'] = 400;
    templateVars['message'] = 'You must be logged in.';
    res.render("error", templateVars);
  }
});

app.post("/urls/:shortURL", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = req.params.shortURL;
  const id = req.session.user_id;
  const user = users[id];
  if (!id) {
    
    const templateVars = {
      user
      
      // ... any other vars
    };
    
    templateVars['code'] = 400;
    templateVars['message'] = 'You must be logged in.';
    res.render("error", templateVars);
  } else if ((urlDatabase[shortURL].userID === req.session.user_id)) {
  
    const newURLObj = {
      longURL,
      userID: req.session.user_id
    };
    urlDatabase[shortURL] = newURLObj;
    res.redirect(`/urls`);
  } else {
    
    const templateVars = {
      user
    };
    templateVars['code'] = 400;
    templateVars['message'] = 'You do not have permission for this page.';
    res.render("error", templateVars);
  }
  
 
  
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const id = req.session.user_id;
  const user = users[id];
  if (!id) {

    const templateVars = {
      user
      
      // ... any other vars
    };
    
    templateVars['code'] = 400;
    templateVars['message'] = 'You must be logged in.';
    res.render("error", templateVars);
  } else if ((urlDatabase[shortURL].userID === req.session.user_id)) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  
  } else {
    const templateVars = {
      user
    };
    templateVars['code'] = 400;
    templateVars['message'] = 'You do not have permission for this page.';
    res.render("error", templateVars);
  }
  
});

/*NEED TO CHANGE LOGIN COOKIES */

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);
  
  
  if (user) {
    const checkPassword = bcrypt.compareSync(password, user.password);
    if (checkPassword) {
      req.session.user_id = user.id;
      res.redirect('/urls');
    } else {
      
      const templateVars = {
        user : undefined
      };
      templateVars['code'] = 403;
      templateVars['message'] = 'Bad Request password mismatch';
      res.render("error", templateVars);
    }

    
  } else {
   
    const templateVars = {
      user : undefined
    };
    templateVars['code'] = 403;
    templateVars['message'] = 'Bad Request email not found';
    res.render("error", templateVars);
  }
  


  //res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  //const username = req.body.username;

  req.session = null;

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
  
    const templateVars = {
      user : undefined
    };
    templateVars['code'] = 400;
    templateVars['message'] = 'Bad Request no email/password provided';
    res.render("error", templateVars);
  
  
  } else if (getUserByEmail(email, users)) { //check if email exists
    
    const templateVars = {
      user : undefined
    };
    templateVars['code'] = 400;
    templateVars['message'] = 'Bad Request email already exists';
    res.render("error", templateVars);
  } else { //create cookie and add users to database
    req.session.user_id = id;
    users[id] = newUser;
    res.redirect('/urls');
  }
  
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});