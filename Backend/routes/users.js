const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const Hospitals = require("../models/Hospitals");
const User = require("../models/Users");

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
};

router.get("/dashboard", isLoggedIn, async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate({
      path: "Appt",
      populate: {
        path: "doctor",
        populate: {
          path: "clinic", // ✅ nested populate
          model: "Hospital",
        },
      },
    });

    const today = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(today.getDate() + 7);

    const now = new Date();

    const parseDateTime = (dateStr, timeStr) => {
      return new Date(`${dateStr} ${timeStr}`);
    };

    const upcomingAppointments = user.Appt.filter((appt) => {
      const apptDateTime = parseDateTime(appt.date, appt.time);
      return apptDateTime > now && apptDateTime <= sevenDaysLater;
    });

    let appointments = await Appointment.find({ patient: userId }).populate(
      "doctor"
    );

    // Auto-update status
    for (let appt of appointments) {
      const apptDateTime = parseDateTime(appt.date, appt.time);

      if (apptDateTime < now && appt.status !== "completed") {
        appt.status = "completed";
        await appt.save();
      }
    }

    res.render("patientDash1", {
      user,
      appointments: user.Appt, // all appointments for "Appointment History"
      upcomingAppointments, // only upcoming 7 days
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/book", isLoggedIn, async (req, res) => {
  const hospitals = await Hospitals.find();
  res.render("hospitalList", { hospitals });
});

router.get("/book/:id", isLoggedIn, async (req, res) => {
  try {
    const hospitalDoc = await Hospitals.findById(req.params.id).populate(
      "doctors"
    );

    if (!hospitalDoc) {
      return res.status(404).send("Hospital not found");
    }

    res.render("docList", { hospitalDoc });
  } catch (err) {
    console.error("Error fetching hospital doctors:", err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
