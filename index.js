// Imports--
const express = require("express");

const clc = require("cli-color");
const { Model } = require("mongoose");

const mongoose = require("mongoose");

const bcrypt = require("bcrypt");

const validator = require("validator");

const session = require("express-session");

const mongoDbSession = require("connect-mongodb-session")(session);

const jwt = require("jsonwebtoken");

// File imports--
const {
  cleanUpAndValidate,
  generateJWTToken,
  sendVerificationToken,
  SECRET_KEY,
} = require("./utils/AuthUtils");

const userSchema = require("./userSchema");

const bookSchema = require("./models/LibraryModel");

const { isAuth } = require("./middleWares/AuthMiddleWare");

// const TodoModel = require("./models/LibraryModel");

const { rateLimiting } = require("./middleWares/RateLimiting");

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
    secret: "Library Management application ",
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
      emailAuthenticated: false,
    });

    const verificationToken = generateJWTToken(email);
    console.log(verificationToken);

    try {
      const userDb = await user.save();
      sendVerificationToken(email, verificationToken);
      console.log(userDb);

      return res.send({
        status: 200,
        message: "Please verify your email before login",
      });
    } catch (error) {
      console.log(error);
      return res.send({
        status: 401,
        message: "Data Base error",
        error: error,
      });
    }
  } catch (error) {
    return res.send({
      status: 401,
      error: error,
    });
  }
});

app.get("/verify/:token", async (req, res) => {
  console.log(req.params);
  const token = req.params.token;

  jwt.verify(token, SECRET_KEY, async (err, decodedData) => {
    if (err) throw err;
    console.log(decodedData);

    try {
      const userDb = await userSchema.findOneAndUpdate(
        { email: decodedData.email },
        { emailAuthenticated: true }
      );

      console.log(userDb);
      return res.status(200).redirect("/login");
    } catch (error) {
      return res.send({
        status: 400,
        message: "Invalid Authentication Link",
        error: error,
      });
    }
  });
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
    console.log(userDb);
    if (!userDb.emailAuthenticated) {
      return res.send({
        status: 400,
        message: "Please verify your email before login",
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
app.post("/create-item", isAuth, async (req, res) => {
  console.log(req.session.user.username, "server has got an req");

  const { title, author, price, category } = req.body.book;

  console.log(req.body, "ssssssssssss");
  //intialize todo schema and store it in Db

  // res.send("saved book: " + bookDB);
  try {
    const Book = new bookSchema({
      tile: title,
      author: author,
      price: price,
      category: category,
      username: req.session.user.username,
    });

    const bookDB = await Book.save();

    console.log(bookDB, " data saved");
    return res.send({
      status: 201,
      message: "book added successfully",
      data: bookDB,
    });
  } catch (error) {
    console.log(error, "Error saving");
    return res.send({
      status: 500,
      message: "Database error",
      error: error,
    });
  }
});

app.get("/read-item", async (req, res) => {
  // console.log(req.session.user.username, "read item");
  const user_name = req.session.user.username;
  try {
    const book = await bookSchema.find({ username: user_name });

    // console.log(book, "sssssssssss")

    if (book.length === 0)
      return res.send({
        status: 200,
        message: "Todo is empty, Please create some.",
      });

    return res.send({
      status: 200,
      message: "Read Success",
      data: book,
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "Database error",
      error: error,
    });
  }
});

app.post("/edit-item", isAuth, async (req, res) => {
  console.log(req.body);

  const { id, field, newData } = req.body;

  //data validation
  if (!id || !newData) {
    return res.send({
      status: 400,
      message: "Missing credentials",
    });
  }
  if (typeof newData !== "string") {
    return res.send({
      status: 400,
      message: "Invalid Todo format",
    });
  }

  // if (newData.length > 100) {
  //   return res.send({
  //     status: 400,
  //     message: "Todo is too long, should be less than 100 char.",
  //   });
  // }

  try {
    const todoDb = await bookSchema.findOneAndUpdate(
      { _id: id },
      { [field]: newData }
    );
    console.log(todoDb, "findOn============");
    let temp = { ...todoDb, [field]: newData };
    return res.send({
      status: 200,
      message: "Todo updated Successfully",
      data: temp,
    });
  } catch (error) {
    console.log(error, "dddddd");
    return res.send({
      status: 500,
      message: "Database error",
      error: error,
    });
  }
});

app.post("/delete-item", isAuth, async (req, res) => {
  console.log(req.body, "delete api hit");

  const id = req.body.id;

  //data validation
  if (!id) {
    return res.send({
      status: 400,
      message: "Missing credentials",
    });
  }

  try {
    const todoDb = await bookSchema.findOneAndDelete({ _id: id });
    console.log(todoDb);

    return res.send({
      status: 200,
      message: "Todo deleted Successfully",
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
