const mongoose = require("mongoose");
mongoose.connect("");

const ApptSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },

  dateSlot: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },

  timeSlot: [
    {
      type: String,
      default: "0",
    },
  ],
});

module.exports = mongoose.model("Appointment", ApptSchema);
