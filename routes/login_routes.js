let express = require("express"),
  mongoose = require("mongoose"),
  multer = require("multer");

  router = express.Router();


// User model
let Login = require("../models/Login.js");
const upload = multer({ dest: 'uploads/' })
router.post("/add-user", upload.single('file'), (req, res) => {
    
      //  console.log(req.body.email_address)

 if(req.body.email_address&&req.body.name&&req.body.password&&req.body.role){
    var login = new Login({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    email: req.body.email_address,
    password: req.body.password,
    role: req.body.role
      })

      login
      .save()
      .then((result) => {
        res.status(201).json({
          message: "User registered successfully!",
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
            message: "User Not Registered",
            error: err,
          });
      })
  
  } else {
     res.status(200).json({
      message: "Please enter all the fields.",
    });
  }
});
router.post("/delete-user", upload.array("logo", 2), (req, response, next) => {
  if(req.body.email_address){
  var myquery = { email: req.body.email_address };
  Login.deleteOne(myquery, function(err, res) {
    if (err) {
        response.status(200).json({
      message: "Field Not Updated!",
      data: err,
    });
    }
    else{
        response.status(200).json({
      message: "Field updated successfully!",
      data: res,
    });
    }
  })
  

  }
  else {
     response.status(200).json({
      message: "Please enter all the fields.",
    });
  }
}) 
router.get("/", (req, res, next) => {
  Login.find().then((data) => {
    res.status(200).json({
      message: "User list retrieved successfully!",
      users: data,
    });
  })
    .catch((err) => {
     //   console.log(err),
          res.status(200).json({
            message: "OOPS! Some error occured.",
            error: err,
          });
      })
});
router.post("/login-user",upload.single('file'), (req, res, next) => {
  Login.find({email:req.body.email_address}).then((data) => {
    res.status(200).json({
      message: "User retrieved successfully!",
      users: data,
    });
  })
  .catch((err) => {
     //   console.log(err),
          res.status(200).json({
            message: "OOPS! Some error occured.",
            error: err,
          });
      })
  
  
});

module.exports = router;
