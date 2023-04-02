// const express = require('express')
// const path= require('path')
// const app = express()
// const PORT = process.env.PORT || 3000

// app.set('view engine', 'ejs')

// app.set('views', path.join(__dirname, 'views'));
// app.use(express.static(__dirname + '/public'));

// app.get('/', (req, res) => {
//   res.render('index')
// })

// app.get('/about', (req, res) => {
//   res.render('about')
// })



// app.listen(PORT, () => {
//   console.log(`Example app listening on port ${PORT}`)
// })

// Imports--
const express = require("express");

const clc = require("cli-color");
const { Model } = require("mongoose");

const mongoose = require("mongoose");

const bcrypt = require("bcrypt");

const validator = require("validator");

const session = require("express-session");

const mongoDbSession = require("connect-mongodb-session")(session);

// File imports--
const { cleanUpAndValidate } = require("./utils/AuthUtils");

const userSchema = require("./userSchema");

const { isAuth } = require("./middleWares/AuthMiddleWare");

const TodoModel = require("./models/libraryModel");

const { rateLimiting } = require("./middleWares/rateLimiting.js");

// Variables--

const app = express();

const PORT = process.env.PORT || 8080; // after deploying the port which is freely available will be automatically assigned!!

const MONGODB_URI = `mongodb+srv://prashantmishramark43:007@cluster0.uke9aoj.mongodb.net/Library-Management`;
// ejs(view engine) // it will search the files inside the view
// folder  then it  will render You don't have to import anything

app.set("view engine", "ejs");

app.use(express.static("public"));

// db connection
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log(clc.green.bold.underline("MongoDb connected"));
  })
  .catch((err) => {
    console.log(clc.red.bold(err));
  });

// middleware's
//remember we have to use middleware because by default the data is url-encoded format so we need to type cast into the json formate
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

const store = new mongoDbSession({
  uri: MONGODB_URI,
  collection: "sessions",
});

app.use(
  session({
    secret: "This is Todo app, we dont love coding",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

// Routes(Note- urls are not case  sensitive they will be converted to smaller case)--
app.get("/", (req, res) => {
  return res.send("Welcome to  Library Management Platform");
});

app.get("/registration", (req, res) => {
  return res.render("Signup");
});

app.get("/login", (req, res) => {
  return res.render("login");
});

// app.get("/dashboard", (req, res) => {
//   return res.render("dashboard");
// });

// app.get("/profile", (req, res) => {
//   return res.render("profile");
// });

// end point for signup and login page to post the data to the server!!
//remember we have to use middleware because by default the data is url-encoded format so we need to type cast into the json formate
//

//MVC
// Model- functions which interact with database
// utility functions- functions which does not interact with db
app.post("/registration", async (req, res) => {
  console.log(req.body, "-----");
  const { name, email, password, username, phone } = req.body;

  try {
    await cleanUpAndValidate({ name, email, password, username, phone });
    // console.log(data, "data after hitting api");
    //check if the user exits

    const userExistEmail = await userSchema.findOne({ email });

    console.log(userExistEmail);
    if (userExistEmail) {
      return res.send({
        status: 400,
        message: "Email Already exits",
      });
    }

    const userExistUsername = await userSchema.findOne({ username });

    if (userExistUsername) {
      return res.send({
        status: 400,
        message: "Username Already exits",
      });
    }

    //hash the password using bcypt
    let saltRound = 10;
    const hashPassword = await bcrypt.hash(password, saltRound);

    const user = new userSchema({
      name: name,
      email: email,
      password: hashPassword,
      username: username,
      phone: phone,
    });

    try {
      const userDb = await user.save();
      console.log(userDb, "userDb saved");
      return res.send({
        status: 201,
        message: "User register successfully",
        data: userDb,
      });
    } catch (error) {
      return res.send({
        status: 500,
        message: "Database error",
        error: error,
      });
    }
  } catch (error) {
    console.log(error);
    return res.send({
      status: 400,
      message: "Data Invalid",
      error: error,
    });
  }
});

//data validations

app.post("/login", async (req, res) => {
  //validate the data
  console.log(req.body);
  const { loginId, password } = req.body;

  if (!loginId || !password) {
    return res.send({
      status: 400,
      message: "missing credentials",
    });
  }

  if (typeof loginId !== "string" || typeof password !== "string") {
    return res.send({
      status: 400,
      message: "Invalid data format",
    });
  }

  //identify the loginId and search in database

  try {
    let userDb;
    if (validator.isEmail(loginId)) {
      userDb = await userSchema.findOne({ email: loginId });
    } else {
      userDb = await userSchema.findOne({ username: loginId });
    }

    if (!userDb) {
      return res.send({
        status: 400,
        message: "User not found, Please register first",
      });
    }

    //password compare bcrypt.compare
    const isMatch = await bcrypt.compare(password, userDb.password);

    if (!isMatch) {
      return res.send({
        status: 400,
        message: "Password Does not match",
      });
    }

    //Add session base auth sys
    console.log(req.session);
    req.session.isAuth = true;
    req.session.user = {
      username: userDb.username,
      email: userDb.email,
      userId: userDb._id,
    };

    return res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
    return res.send({
      status: 500,
      message: "Database error",
      error: error,
    });
  }
});

app.get("/dashboard", isAuth, async (req, res) => {
  return res.render("dashboard");
});

app.get("/profile", isAuth, async (req, res) => {
  return res.render("profile");
});

//logout api's
app.post("/logout", isAuth, (req, res) => {
  console.log(req.session);
  req.session.destroy((err) => {
    if (err) throw err;

    return res.redirect("/login");
  });
});

app.post("/logout_from_all_devices", isAuth, async (req, res) => {
  const username = req.session.user.username;

  //create a session schema
  const Schema = mongoose.Schema;
  const sessionSchema = new Schema({ _id: String }, { strict: false });
  const sessionModel = mongoose.model("session", sessionSchema);

  try {
    const deletionCount = await sessionModel.deleteMany({
      "session.user.username": username,
    });
    console.log(deletionCount);
    return res.send({
      status: 200,
      message: "Logout from all devices successfully",
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "Logout Failed",
      error: error,
    });
  }
});

//post books
app.post("/create-item", isAuth, rateLimiting, async (req, res) => {
  const todoText = req.body.bookData;
  console.log(todoText,"create-item has been hit" );

  //data validation
  if (!todoText) {
    return res.send({
      status: 400,
      message: "Todo is Empty",
    });
  }

  if (typeof todoText !== "string") {
    return res.send({
      status: 400,
      message: "Invalid Todo format",
    });
  }

  if (todoText.length > 100) {
    return res.send({
      status: 400,
      message: "Todo is too long, should be less than 100 char.",
    });
  }

  //intialize todo schema and store it in Db
  const todo = new TodoModel({
    todo: todoText,
    username: req.session.user.username,
  });

  try {
    const todoDb = await todo.save();

    // console.log(todo);
    return res.send({
      status: 201,
      message: "Todo created successfully",
      data: todoDb,
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "Database error",
      error: error,
    });
  }
});

app.listen(PORT, () => {
  console.log(
    clc.underline.italic.magentaBright(`Hello, world! Port No- ${PORT}`)
  );
  console.log(clc.underline.italic.redBright(`http://localhost:${PORT}`));
});

//EGS
// step1 create server and connect to mongodb database!.
// Step2 SignUP( 1.data validation/cleanup, 2.first check  user exits or not
// if not then create a user in db,)
// Step3 Email verification ...
// Step4 login
// after login redirect to dashboard!.

// command-
// initialize node JS- npm init -y
// install express and nodemon-  npm i express nodemon mongoose

// using package for CLI Colors--  https://www.npmjs.com/package/cli-color

//To start the server - npm run dev
