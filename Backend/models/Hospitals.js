const mongoose = require("mongoose");
mongoose.connect(
  "mongodb+srv://PrathamKharade:Dadu123@8dscluster.afxgmhi.mongodb.net/SwasthaSetu?retryWrites=true&w=majority&appName=8DsCluster"
);

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
