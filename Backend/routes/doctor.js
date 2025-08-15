const express = require("express");
const router = express.Router();
const passport = require("passport");
const Doctor = require("../models/Doctors");
const multer = require("multer");
const path = require("path");
const User = require("../models/Users");
const Hospitals = require("../models/Hospitals");
const Appointment = require("../models/Appointment");

// Multer config
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

router.get("/register", async (req, res) => {
  try {
    const hospitals = await Hospitals.find();
    res.render("register", { hospitals });
  } catch (err) {
    console.error("Failed to fetch hospitals:", err);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/register", upload.single("profilePicture"), async (req, res) => {
  const {
    name,
    email,
    phone,
    qualification,
    speciality,
    experience,
    clinic, // hospital ID from dropdown
    workingHours,
    password,
    confirmPassword,
  } = req.body;

  if (password !== confirmPassword) {
    return res.send(" Passwords do not match");
  }

  try {
    // 🔍 Check if email already exists in Users (patients)
    const patientEmailExists = await User.findOne({ email });
    if (patientEmailExists) {
      return res.send(" Email is already registered as a patient.");
    }

    //  Check if email already exists in Doctors
    const doctorEmailExists = await Doctor.findOne({ email });
    if (doctorEmailExists) {
      return res.send(" Email is already registered as a doctor.");
    }

    //  Create new doctor
    const newDoctor = new Doctor({
      name,
      email,
      phone,
      qualification,
      speciality,
      experience,
      clinic, // this is hospital._id
      workingHours,
      username: email,
      profilePicture: req.file ? `/uploads/${req.file.filename}` : "",
    });

    Doctor.register(newDoctor, password, async (err, doctor) => {
      if (err) {
        console.error(" Doctor registration failed:", err);
        return res.send("Doctor registration failed: " + err.message);
      }

      try {
        //  Add doctor to selected hospital
        try {
          const hospital = await Hospitals.findById(clinic);

          if (!hospital) {
            console.warn(" No hospital found with ID:", clinic);
          } else {
            // Prevent duplicate doctor entry
            if (!hospital.doctors.includes(doctor._id)) {
              hospital.doctors.push(doctor._id);
              await hospital.save();
              console.log(" Doctor added to hospital:", hospital.name);
            } else {
              console.log("ℹ Doctor already exists in hospital.");
            }
          }
        } catch (hospitalErr) {
          console.error(" Error while adding doctor to hospital:", hospitalErr);
        }
      } catch (hospitalErr) {
        console.error(" Failed to add doctor to hospital:", hospitalErr);
      }

      res.redirect("/login");
    });
  } catch (err) {
    console.error(" Error during registration:", err);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/login", (req, res, next) => {
  passport.authenticate("doctor-local", {
    successRedirect: "/doctor/dashboard",
    failureRedirect: "/login",
  })(req, res, next);
});

// doctor.js
router.get("/dashboard", isDoctorLoggedIn, async (req, res) => {
  try {
    const doctorId = req.user._id;
    const date = new Date(); // or any date object
    const formatted = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const appointments = await Appointment.find({ doctor: doctorId })
      .populate("user")
      .sort({ date: 1, time: 1 });

    const stats = {
      total: appointments.length,
      completed: appointments.filter((a) => a.status === "completed").length,
      pending: appointments.filter((a) => a.status === "pending").length,
      cancelled: appointments.filter((a) => a.status === "cancelled").length,
    };

    res.render("docDash", {
      doctor: req.user,
      appointments,
      stats,
      date: formatted,
    });
  } catch (err) {
    console.error("Dashboard fetch error:", err);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/set-unavailable-slots", isDoctorLoggedIn, async (req, res) => {
  const { date, times } = req.body;
  const doctorId = req.user._id; // logged-in doctor

  try {
    const doctor = await Doctor.findById(doctorId);

    let entry = doctor.unavailableSlots.find((u) => u.date === date);
    if (entry) {
      entry.times = times;
    } else {
      doctor.unavailableSlots.push({ date, times });
    }

    await doctor.save();
    res.json({ message: "Unavailable slots updated" });
  } catch (error) {
    console.error("Set unavailable slots error:", error);
    res.status(500).json({ error: "Failed to update unavailable slots" });
  }
});

function isDoctorLoggedIn(req, res, next) {
  if (req.isAuthenticated() && req.user.speciality) return next();
  res.redirect("/login");
}

module.exports = router;
