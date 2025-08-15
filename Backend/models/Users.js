const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

mongoose.connect(process.env.MONGODB_URI);

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
