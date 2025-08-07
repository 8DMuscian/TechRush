const mongoose = require("mongoose");
mongoose.connect(
  "mongodb+srv://PrathamKharade:Dadu123@8dscluster.afxgmhi.mongodb.net/SwasthaSetu?retryWrites=true&w=majority&appName=8DsCluster"
);

const slotSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
    unique: true,
  },
  slots: {
    type: [String],
    default: [],
  },
});

module.exports = mongoose.model("Slot", slotSchema);
