let express = require("express"),
  mongoose = require("mongoose"),
  multer = require("multer");

  router = express.Router();


// User model
let Newsletter = require("../models/Newsletter");
const upload = multer({ dest: 'uploads/' })

router.post("/add-newsletter", upload.single('file'), (req, res) => {
      var newsletter = new Newsletter({
    _id: new mongoose.Types.ObjectId(),
    email_address: req.body.email_address,
    date:new Date()})
       // console.log(req.body.email_address)

 if(req.body.email_address){
  Newsletter.find({email_address:req.body.email_address}).then((data) => {
    if(data.length>0){
res.status(201).json({
       message: "E-mail address already subscribed.",
          
    });
    }
    else {
newsletter
      .save()
      .then((result) => {
        res.status(201).json({
          message: "E-mail registered successfully!",
          userCreated: {
            _id: result._id,
            email_address: result.email_address,
            date: result.date,
          },
        });
      })
      .catch((err) => {
     //   console.log(err),
          res.status(200).json({
            message: "E-mail Not Registered",
            error: err,
          });
      })
    }
    
    
  })
   .catch((err) => {
        console.log(err),
          res.status(200).json({
            message: "Unable to add E-mail to the newsletter list.",
            error: err,
          });
      });  

    
  
  } else {
     res.status(200).json({
      message: "Please enter all the fields.",
      error: "E-mail is missing.",
    });
  }
});

router.get("/", (req, res, next) => {
  Newsletter.find().then((data) => {
    res.status(200).json({
      message: "Email list retrieved successfully!",
      users: data,
    });
  });
});

module.exports = router;
