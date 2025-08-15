const express = require("express");
const router = express.Router();
const passport = require("passport");

const Admin = require("../models/Admin");
const Doctor = require("../models/Doctors");
const User = require("../models/Users");
const Appointment = require("../models/Appointment");

// Require your Admin model and create manually

Admin.register(
  new Admin({ name: "Admin", email: "admin@swasthasetu.com" }),
  "admin-only"
);

// Middleware to protect admin-only routes
function isAdminLoggedIn(req, res, next) {
  if (
    req.isAuthenticated() &&
    req.user &&
    req.user.constructor.modelName === "Admin"
  ) {
    return next();
  }
  res.redirect("/admin/login");
}

// Login page
router.get("/login", (req, res) => {
  res.render("adminLogin");
});

// Login handler
router.post(
  "/login",
  passport.authenticate("admin-local", {
    successRedirect: "/admin/dashboard",
    failureRedirect: "/admin/login",
  })
);

// Dashboard
router.get("/dashboard", isAdminLoggedIn, async (req, res) => {
  try {
    const doctors = await Doctor.find();
    const patients = await User.find();
    const appointments = await Appointment.find().populate("doctor user");

    res.render("adminDash", {
      admin: req.user,
      stats: {
        doctors: doctors.length,
        patients: patients.length,
        appointments: appointments.length,
      },
      doctors,
      patients,
      appointments,
    });
  } catch (err) {
    console.error("Admin dashboard error:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Logout
router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/admin/login");
  });
});

module.exports = router;
