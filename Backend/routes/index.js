var express = require("express");
var router = express.Router();
const Doctor = require("../models/Doctors");

const multer = require("multer");
const path = require("path");
const passport = require("passport");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index");
});

router.get("/patientReg", function (req, res) {
  res.render("patientReg");
});

const User = require("../models/Users");

router.post(
  "/patientReg",
  upload.single("profilePicture"),
  async (req, res) => {
    const {
      name,
      email,
      phone,
      bloodGrp,
      dob,
      insurance,
      password,
      confirmPassword,
    } = req.body;

    if (password !== confirmPassword) return res.send("Passwords do not match");

    const user = new User({
      fullname: name,
      email: email,
      phone: phone,
      username: email, // required by plugin
      bloodGrp: bloodGrp,
      dob: dob,
      insurance,
      dp: req.file ? `/uploads/${req.file.filename}` : "",
    });

    // Check during patient registration
    const doctorExists = await Doctor.findOne({ email });
    if (doctorExists) {
      return res.send("This email is already registered as a doctor.");
    }

    User.register(user, password, function (err, user) {
      if (err) {
        console.error(err);
        return res.send("Registration failed: " + err.message);
      }
      res.redirect("/login");
    });
  }
);

router.post("/login", async (req, res, next) => {
  const { email, password, userType } = req.body;

  if (userType === "doctor") {
    const doctor = await Doctor.findOne({ email });
    if (!doctor) return res.send("No doctor account with this email.");

    passport.authenticate("doctor-local", (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.redirect("/login");

      req.logIn(user, (err) => {
        if (err) return next(err);
        return res.redirect("/doctor/dashboard");
      });
    })(req, res, next);
  } else {
    const user = await User.findOne({ email });
    if (!user) return res.send("No patient account with this email.");

    passport.authenticate("user-local", (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.redirect("/login");

      req.logIn(user, (err) => {
        if (err) return next(err);
        return res.redirect("/users/book");
      });
    })(req, res, next);
  }
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

router.get("/dashboard", isLoggedIn, (req, res) => {
  res.send("Welcome, " + req.user.fullname);
});

router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);
    res.redirect("/login");
  });
});

// GET Login Page
router.get("/login", function (req, res) {
  res.render("login");
});

router.get("/clinic/doctors/appointment", function (req, res, next) {
  res.render("appt");
});

module.exports = router;
