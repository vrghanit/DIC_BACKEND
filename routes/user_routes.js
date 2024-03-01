let express = require("express"),
    multer = require("multer"),
    mongoose = require("mongoose"),
    router = express.Router();
const { uuid } = require("uuidv4");
var crypto = require('crypto');
const nodemailer = require("nodemailer");
var formidable = require('formidable');
var fs = require('fs');

var transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: "buca.getintouch@gmail.com",
        pass: "Qwerty@21",
    },
});


// const dbConfig = require('../database/db')
const DIR = "./public/";
const TEMPLATE_DIR = "./templates/"
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DIR);
    },
    filename: (req, file, cb) => {
        const fileName = file.originalname.toLowerCase().split(" ").join("-");
        cb(null, uuid() + "-" + fileName);
    },
});
const template_storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, TEMPLATE_DIR);
    },
    filename: (req, file, cb) => {
        const fileName = file.originalname.toLowerCase().split(" ").join("-");
        cb(null, uuid() + "-" + fileName);
    },
});
var upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype == "image/png" ||
            file.mimetype == "image/jpg" ||
            file.mimetype == "image/jpeg"
        ) {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
        }
    },
});
var template_upload = multer({
    storage: template_storage,
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype == "image/png" ||
            file.mimetype == "image/jpg" ||
            file.mimetype == "image/jpeg"
        ) {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
        }
    },
});
// User model
let User = require("../models/User");
use = new User({

    paid: true
});


router.get("/get_all", (req, response) => {
    var table = req.query.table;
    var mydata = require('../models/' + table);
    var query = mydata.find({});
    query.exec(function (err, data) {
        response.send(data)
    })

})

router.post("/template-upload", (req, res) => {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        if (files.template && files.template.name != "") {
            var fileName = randomAsciiString(20) + files.template.type.split("/")[1];
            var oldpath = files.template.path;
            var newpath = "uploads/multiples/" + fileName;
            fs.rename(oldpath, newpath, function (err) {
                if (err) {
                    console.log(err);
                    res.json({
                        status: false,
                        message: "Select another template image",
                    });
                } else {
                    let code = randomAsciiString(5);
                    let templateObj = {
                        color: fields.color,
                        textColor: fields.textColor,
                        layout: fields.layout,
                        titleColor: fields.titleColor,
                        iconColor: fields.iconColor,
                        fieldsColor: fields.fieldsColor,
                        headingColor: fields.headingColor,
                        image: "http://yourbuca.com/api/" + newpath,
                    };
                    User.updateOne(
                        { _id: fields.id },
                        { template: JSON.stringify(templateObj), code: code, status: "completed" }
                    ).exec((err, result) => {
                        if (err) {
                            res.json({
                                status: false,
                                message: "Something went wrong.",
                            });
                        } else {
                            const mailOptions = {
                                from: "devacc1305@gmail.com",
                                to: `${fields.email}`,
                                subject: "Your code",
                                html: `<h1> ${code}</h1> <p>You can use this code to create new BUCA at your application end. </p>`,
                            };
                            transporter.sendMail(mailOptions, function (error, info) {
                                if (error) {
                                    console.log(error);
                                } else {
                                    // res.json({ message: "Check your mail" });
                                    res.json({
                                        status: true,
                                        message: "Template updated successfully!",
                                    });
                                    res.end();
                                }
                            });
                        }
                    });
                }
            });
        } else {
            res.status(200).json({
                message: "Please enter all the fields.",
            });
        }
    });
})

router.get('/get-template-by-code', (req, res) => {
    if (req.query.code) {
        User.findOne({ code: req.query.code }).exec((err, result) => {
            if (err) {
                res.json({
                    status: false,
                    message: 'try again later'
                })
            } else {
                if (result) {
                    res.json({
                        status: true,
                        message: 'Data with your code',
                        data: result
                    })
                } else {
                    res.json({
                        status: true,
                        message: 'No data found with code'
                    })
                }
            }
        })
    }
})

router.post("/user-profile-update", upload.array("logo", 2), (req, response, next) => {
    if (req.body.id) {
        console.log(req.body.id, 'req.body.email_address')
        var myquery = { _id: req.body.id };
        var newvalues = { $set: { paid: true } };
        User.updateOne(myquery, newvalues, function (err, result) {
            if (err) {
                response.status(200).json({
                    message: "Field Not Updated!",
                    data: err,
                });
            }
            else {
                const mailOptions = {
                    from: "devacc1305@gmail.com",
                    to: `${req.body.email_address}`,
                    subject: "Varification mail",
                    html: `<h1>Your request is accepted.</h1><p>Hello ${req.body.email_address} your request for the new buca design is accepted you will receive the BUCA within 24 hours from now. </p>`,
                };
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        // res.json({ message: "Check your mail" });
                        response.status(200).json({
                            message: "Field updated successfully!",
                            data: result,
                        });
                        res.end();
                    }
                });

            }
        })


    }
    else {
        response.status(200).json({
            message: "Please enter all the fields.",
            error: "E-mail is missing.",
        });
    }
})
router.post("/user-profile", upload.array("logo", 2), (req, res, next) => {
    const url = req.protocol + "://" + req.get("host");
    var user;
    if (
        req.body.name &&
        req.body.email &&
        req.body.org_name &&
        req.body.message
    ) {
        user = new User({
            _id: new mongoose.Types.ObjectId(),
            name: req.body.name,
            email: req.body.email,
            org_name: req.body.org_name,
            message: req.body.message,
            logo: "https://yourbuca.com/api/public/" + req.files[0].filename,
            businessCard: "https://yourbuca.com/api/public/" + req.files[1].filename,
            date: new Date(),
            status: "accepted",
            paid: false,
            template: ""
        });
    }
    else if (req.body.name &&
        req.body.email &&
        req.body.org_name) {
        user = new User({
            _id: new mongoose.Types.ObjectId(),
            name: req.body.name,
            email: req.body.email,
            org_name: req.body.org_name,
            message: "",
            logo: "https://yourbuca.com/api/public/" + req.files[0].filename,
            businessCard: "https://yourbuca.com/api/public/" + req.files[1].filename,
            date: new Date(),
            status: "accepted",
            paid: false,
            template: ""
        });
    }


    if (
        req.body.name &&
        req.body.email &&
        req.body.org_name
    ) {

        user
            .save()
            .then((result) => {
                console.log(result, 'resultresult')
                res.status(201).json({
                    message: "User registered successfully!",
                    userCreated: {
                        _id: result._id,
                        logo: result.logo,
                        businessCard: result.businessCard,
                        name: result.name,
                        email: result.email,
                        org_name: result.org_name,
                        message: result.message,
                        date: result.date,
                        status: result.status,
                        paid: result.paid,
                        template: result.template
                    },
                });
            })
            .catch((err) => {
                console.log(err),
                    res.status(200).json({
                        message: "User Not Registered",
                        error: err,
                    });
            });
    } else {
        res.status(200).json({
            message: "Please enter all the fields.",
            error: "Some Fields are missing.",
        });
    }
});

router.get("/", (req, res, next) => {
    User.find({ paid: true }).then((data) => {
        res.status(200).json({
            message: "User list retrieved successfully!",
            users: data,
        });
    })
        .catch((err) => {
            // console.log(err),
            res.status(200).json({
                message: "Unable to retrieve user's list.",
                error: err,
            });
        });
});
router.get("/failed-payment", (req, res, next) => {
    User.find({ paid: false }).then((data) => {
        res.status(200).json({
            message: "User list retrieved successfully!",
            users: data,
        });
    })
        .catch((err) => {
            // console.log(err),
            res.status(200).json({
                message: "Unable to retrieve user's list",
                error: err,
            });
        });
});
router.get("/pending-designs", (req, res, next) => {
    User.find({ paid: true, status: "accepted" }).then((data) => {
        res.status(200).json({
            message: "User list retrieved successfully!",
            users: data,
        });
    })
        .catch((err) => {
            // console.log(err),
            res.status(200).json({
                message: "Unable to retrieve user's list",
                error: err,
            });
        });
});


function randomAsciiString(length) {
    return randomString(length, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
}

function randomString(length, chars) {
    if (!chars) {
        throw new Error('Argument \'chars\' is undefined');
    }

    var charsLength = chars.length;
    if (charsLength > 256) {
        throw new Error('Argument \'chars\' should not have more than 256 characters'
            +
            ', otherwise unpredictability will be broken');
    }

    var randomBytes = crypto.randomBytes(length);
    var result = new Array(length);
    var cursor = 0;

    for (var i = 0; i < length; i++) {
        cursor += randomBytes[i];
        result[i] = chars[cursor % charsLength];
    }
    return result.join('');
}

module.exports = router;
