const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

mongoose.connect(process.env.MONGODB_URI);

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  qualification: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, unique: true },
  speciality: { type: String, required: true, trim: true },
  experience: { type: String, required: true, trim: true },
  workingHours: { type: String, required: true, trim: true },
  clinic: { type: String, required: true, trim: true },
  profilePicture: { type: String },
  slots: [String],
  unavailableSlots: [
    {
      date: String, // e.g., "Sun Aug 10 2025"
      times: [String], // e.g., ["10:00 AM", "10:30 AM"]
    },
  ],
});

// Add passport-local-mongoose plugin
doctorSchema.plugin(passportLocalMongoose, {
  usernameField: "email",
});

module.exports = mongoose.model("Doctors", doctorSchema);
