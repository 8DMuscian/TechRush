var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const session = require("express-session");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var slotRoutes = require("./routes/slots");
var doctorRoutes = require("./routes/doctor");
const passport = require("passport");
const User = require("./models/Users");
const Doctor = require("./models/Doctors");

// Local strategies for both user and doctor
passport.use("user-local", User.createStrategy());
passport.use("doctor-local", Doctor.createStrategy());

// ✅ Custom serialize & deserialize
passport.serializeUser((user, done) => {
  done(null, {
    id: user.id,
    role: user.speciality ? "doctor" : "user", // detect role based on field
  });
});

passport.deserializeUser(async (obj, done) => {
  try {
    const Model = obj.role === "doctor" ? Doctor : User;
    const user = await Model.findById(obj.id); // ✅ await instead of callback
    done(null, user);
  } catch (err) {
    done(err);
  }
});

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/api", slotRoutes);
app.use("/doctor", doctorRoutes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
