const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

mongoose.connect(
  "mongodb+srv://PrathamKharade:Dadu123@8dscluster.afxgmhi.mongodb.net/SwasthaSetu?retryWrites=true&w=majority&appName=8DsCluster"
);

const UserSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
    },

    bloodGrp: {
      type: String,
      required: true,
      enum: ["A+", "B+", "O+", "AB+", "A-", "B-", "O-", "AB-"],
    },

    dob: { type: String, required: true },
    insurance: { type: String, required: true },

    dp: {
      type: String,
      default: "",
    },
    Appt: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment",
      },
    ],
  },
  { timestamps: true }
);

UserSchema.plugin(passportLocalMongoose, {
  usernameField: "email",
});

module.exports = mongoose.model("Users", UserSchema);
