const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/SwasthaSetu");

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,

    trim: true,
  },

  phone: {
    type: String,
    required: true,

    trim: true,
  },

  qualification: {
    type: String,
    required: true,

    trim: true,
  },

  email: {
    type: String,
    required: true,

    trim: true,
  },

  speciality: {
    type: String,
    required: true,

    trim: true,
  },

  experience: {
    type: String,
    required: true,

    trim: true,
  },

  workingHours: {
    type: String,
    required: true,

    trim: true,
  },

  clinic: {
    type: String,
    required: true,

    trim: true,
  },

  profilePicture: {
    type: String,
    required: false,
  },
  slots: [
    {
      type: String,
      required: false,
    },
  ],
});

module.exports = mongoose.model("Doctors", doctorSchema);
