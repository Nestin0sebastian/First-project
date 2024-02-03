const createError = require("http-errors");
const express = require("express");
const  path = require("path");
const cookieParser = require("cookie-parser");
const  logger = require("morgan");
const  mongoose = require("mongoose");
const session=require('express-session')

const  adminRouter = require("./routes/admin");
const  usersRouter = require("./routes/users");
const { error } = require("console");
require("dotenv").config();
var app = express();

mongoose.connect(process.env.DB_MONGO);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));

db.once("open", () => {
  console.log("MongoDB connection successful!");
});
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());    
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
  secret: 'yourSecretKeyHere', // Secret used to sign the session ID cookie
  resave: false, // Don't save the session if it wasn't modified
  saveUninitialized: true, // Save new sessions
  cookie: {
      secure: false, // Set to true if your app is served over HTTPS
      maxAge: 1000 * 60 * 60 * 24, // Session expiration duration in milliseconds (here, 1 day)
  }
}));



app.use("/admin", adminRouter);
app.use("/", usersRouter);

// catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   next(createError(404));
// });

// mongoose.set("strictQuery", true);





// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  // res.status(err.status || 500);                                      
  // res.render("error");
  console.log(err);
});

module.exports = app;
