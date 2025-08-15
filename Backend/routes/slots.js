const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const Users = require("../models/Users");
const Doctors = require("../models/Doctors");
const Hospitals = require("../models/Hospitals");

//  Auth middleware
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};

//  Render dynamic appointment page with doctor info
router.get("/book-appointment/:doctorId", isLoggedIn, async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    const userId = req.user._id;

    const hospital = await Hospitals.findOne({ doctors: doctorId }).populate(
      "doctors"
    );
    const doctor = hospital.doctors.find(
      (doc) => doc._id.toString() === doctorId
    );

    if (!doctor) return res.status(404).send("Doctor not found");

    res.render("appt", {
      clinic: hospital,
      doctorId,
      userId,
      doctor,
    });
  } catch (err) {
    console.error("Appointment page error:", err);
    res.status(500).send("Internal Server Error");
  }
});

//  Book a new appointment (slot)
router.post("/book-slot", isLoggedIn, async (req, res) => {
  const { date, time, doctorId } = req.body;
  const userId = req.user._id;

  try {
    const doctor = await Doctors.findById(doctorId);
    const unavailableEntry = doctor.unavailableSlots.find(
      (u) => u.date === date
    );
    if (unavailableEntry && unavailableEntry.times.includes(time)) {
      return res.status(400).json({ error: "This slot is unavailable." });
    }

    const existing = await Appointment.findOne({
      doctor: doctorId,
      date,
      time,
    });
    if (existing) {
      return res.status(400).json({ error: "This slot is already booked." });
    }

    const newAppt = new Appointment({
      doctor: doctorId,
      user: userId,
      date,
      time,
    });
    await newAppt.save();

    await Users.findByIdAndUpdate(userId, { $push: { Appt: newAppt._id } });
    await Doctors.findByIdAndUpdate(doctorId, {
      $push: { slots: newAppt._id.toString() },
    });

    res
      .status(200)
      .json({ message: "Appointment booked", appointment: newAppt });
  } catch (error) {
    console.error("Booking failed:", error);
    res.status(500).json({ error: "Failed to book appointment" });
  }
});

//  Get all booked slots for a given doctor and date
router.get("/booked-slots", isLoggedIn, async (req, res) => {
  const { date, doctorId } = req.query;

  try {
    const appointments = await Appointment.find({ doctor: doctorId, date });
    const bookedTimes = appointments.map((appt) => appt.time);
    // Get doctor's unavailable slots for the date
    const doctor = await Doctors.findById(doctorId);
    let unavailable = [];
    if (doctor && doctor.unavailableSlots) {
      const entry = doctor.unavailableSlots.find((u) => u.date === date);
      if (entry) unavailable = entry.times;
    }

    // Return both
    res.json({ booked: bookedTimes, unavailable });
  } catch (error) {
    console.error("Fetch slots error:", error);
    res.status(500).json({ error: "Failed to fetch booked slots" });
  }
});

router.post("/delete-appointment/:id", isLoggedIn, async (req, res) => {
  const apptId = req.params.id;
  const userId = req.user._id;

  try {
    // Remove appointment from Appointment collection
    await Appointment.findByIdAndDelete(apptId);

    // Also remove the appointment reference from the user's Appt array
    await Users.findByIdAndUpdate(userId, {
      $pull: { Appt: apptId },
    });

    res.redirect("/users/dashboard"); // Or wherever the user should go after deletion
  } catch (err) {
    console.error("Error deleting appointment:", err);
    res.status(500).send("Failed to delete appointment.");
  }
});

//  MARK APPOINTMENT AS COMPLETED
router.put("/appointments/:id/complete", isLoggedIn, async (req, res) => {
  try {
    const apptId = req.params.id;

    await Appointment.findByIdAndUpdate(apptId, { status: "completed" });

    res.status(200).json({ message: "Appointment marked as completed" });
  } catch (err) {
    console.error("Complete Error:", err);
    res.status(500).json({ error: "Failed to mark completed" });
  }
});

//  CANCEL APPOINTMENT
router.put("/appointments/:id/cancel", isLoggedIn, async (req, res) => {
  try {
    const apptId = req.params.id;
    const { reason } = req.body;

    await Appointment.findByIdAndUpdate(apptId, {
      status: "cancelled",
      cancellationReason: reason,
    });

    res.status(200).json({ message: "Appointment cancelled" });
  } catch (err) {
    console.error("Cancel Error:", err);
    res.status(500).json({ error: "Failed to cancel appointment" });
  }
});

//  RESCHEDULE APPOINTMENT
router.put("/appointments/:id/reschedule", isLoggedIn, async (req, res) => {
  try {
    const apptId = req.params.id;
    const { newDate, newTime, reason } = req.body;

    const updatedAppt = await Appointment.findByIdAndUpdate(
      apptId,
      {
        date: newDate,
        time: newTime,
        status: "pending",
        rescheduleReason: reason,
      },
      { new: true }
    );

    res
      .status(200)
      .json({ message: "Appointment rescheduled", appointment: updatedAppt });
  } catch (err) {
    console.error("Reschedule Error:", err);
    res.status(500).json({ error: "Failed to reschedule appointment" });
  }
});

module.exports = router;
