const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

mongoose.connect(
  "mongodb+srv://PrathamKharade:Dadu123@8dscluster.afxgmhi.mongodb.net/SwasthaSetu?retryWrites=true&w=majority&appName=8DsCluster"
);

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
});

// Add passport-local-mongoose plugin
doctorSchema.plugin(passportLocalMongoose, {
  usernameField: "email",
});

module.exports = mongoose.model("Doctors", doctorSchema);
