const validator = require("validator");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const cleanUpAndValidate = ({ name, email, username, password, phone }) => {
  return new Promise((resolve, reject) => {
    if (!email || !password || !name || !username || !phone) {
      reject("Missing credentials");
    }

    if (typeof email !== "string") {
      reject("Invalid Email");
    }
    if (typeof username !== "string") {
      reject("Invalid Username");
    }
    if (typeof password !== "string") {
      reject("Invalid password");
    }

    if (username.length <= 2 || username.length > 50)
      reject("Username length should be 3-50");

    if (password.length <= 2 || password.length > 25)
      reject("Password length should be 3-25");

    if (!validator.isEmail(email)) {
      reject("Invalid Email format");
    }

    resolve();
  });
};



const SECRET_KEY = "applications";

const generateJWTToken = (email) => {
  const JWT_TOKEN = jwt.sign({ email: email }, SECRET_KEY, {
    expiresIn: "10d",
  });
  return JWT_TOKEN;
};

const sendVerificationToken = (email, verificationToken) => {
  console.log(email, verificationToken);

  let mailer = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 8080,
    secure: true,
    service: "Gmail",
    auth: {
      user: "prashantmishraproject@gmail.com",
      pass: "ttcxwvudcdcwennv",
    },
  });

  let mailOptions = {
    from: "Library Management ",
    to: email,
    subject: "Email verification for Library Management application",
    html: `click the below link to verify your email<a href="http://localhost:8080/verify/${verificationToken}">Here</a>`,
  };

  mailer.sendMail(mailOptions, function (err, response) {
    if (err) throw err;
    else console.log("Mail has been sent successfully");
  });
};

module.exports = {
  cleanUpAndValidate,
  generateJWTToken,
  sendVerificationToken,
  SECRET_KEY,
};


// module.exports = { cleanUpAndValidate };
