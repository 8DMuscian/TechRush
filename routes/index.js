var express = require('express');
var router = express.Router();
const userModel = require('../models/Doctors');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
})

const upload = multer({ storage: storage });

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/clinic/doctors/appointment',function(req,res,next){
  res.render('appt')
})

router.get('/register',function(req,res,next){
  res.render('register')
})

router.post('/register', upload.single('profilePicture'), async function(req, res, next) {
  const { name, phone, email, speciality, qualification, experience, workingHours, clinic } = req.body;
  

  let userdata = new userModel({
  name,
  phone,
  email,
  speciality,
  qualification,
  experience,
  workingHours,
  clinic,
  profilePicture: req.file ? `/uploads/${req.file.filename}` : null
});

await userdata.save()
  .then(() => res.send("Success"))
  .catch((err) => {
    console.error(err);
    res.status(500).send("Failed");
  });

})
module.exports = router;
