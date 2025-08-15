const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URI);

const HospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{10}$/, "Please enter a valid 10-digit phone number"],
    },
    doctors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctors",
      },
    ],
    dp: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hospital", HospitalSchema);
