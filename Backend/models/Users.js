const mongoose =  require('mongoose');
mongoose.connect('mongodb://localhost:27017/SwasthaSetu');
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  fullname: {
    type: String,
    required: true,
    trim: true,
  },
  dp: {
    type: String, // URL of profile picture
    default: '',  // Optional: set default to empty
  },
  Appt: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
  }],
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
});


module.exports = mongoose.model('Users', UserSchema);