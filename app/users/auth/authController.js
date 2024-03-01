//const authModel = require("./authModel.js");
var users = require("../../../schema/users");
var groupChat = require("../../../schema/groupChat");
var User = require("../../../models/User");
var chatting = require("../../../schema/chatting");
var notification = require("../../../schema/notification");
var fs = require("fs");
var formidable = require("formidable");
const config = require("../../../config/default");
const nodemailer = require("nodemailer");
var ObjectId = require("mongoose").Types.ObjectId;
var FCM = require("fcm-node");
var serverKey =
    "AAAAmmTcHgc:APA91bHGpGhhfIgTCRCBWtsK7t8Sg_AwXdBYqrh-iLJuNtItXJXn3w5gnEJL8XoAzRIG2wnSwimfgNR2sn8DUer4Yfn00ukUAr1P7WFp6gion7hwyjMYyn214xH0yg9rnvxA9s9hiwKh"; //put your server key here
var fcm = new FCM(serverKey);

var admin = require("firebase-admin");
var serviceAccount = require("../../../config/buca-53b88-firebase-adminsdk-byka9-b0d6ee1fd1.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

var crypto = require("crypto");
var date = new Date();

const success = true;
const fail = false;

var transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: "buca.getintouch@gmail.com",
        pass: "Qwerty@21",
    },
});

exports.get_data = function (req, res) {
    var table = req.query.table;
    var mydata = require("../../../schema/" + table);
    var query = mydata.find({});
    query.exec(function (err, data) {
        res.send(data);
    });
};
exports.registration = function (req, res) {
    var postData = req.body;
    var authToken = "BUCA_" + randomAsciiString(50);
    //var postData = req.body;

    if (postData.socialId) {
        // check if social id exist than we register user as social login
        var social_login = users.findOne({
            socialId: postData.socialId,
            socialType: postData.socialType,
        });
        social_login.exec(function (err, social_login) {
            users.updateMany(
                {
                    $or: [
                        { deviceToken: postData.deviceToken },
                        { fireabaseToken: postData.fireabaseToken },
                    ],
                },
                { fireabaseToken: "" },
                function (err) { }
            );
            if (social_login) {
                // if user already register with this social id and type
                var updateData = {
                    deviceType: postData.deviceType,
                    deviceToken: postData.deviceToken,
                    fireabaseToken: postData.fireabaseToken,
                    locationLatLong: [postData.userLatitude, postData.userLongitude],
                    authToken: authToken,
                    updated_at: date,
                };

                users.updateOne(
                    { socialId: postData.socialId, socialType: postData.socialType },
                    updateData,
                    function (err) {
                        if (err) {
                            res.json({
                                status: fail,
                                message: "Try again later..!",
                                data: {},
                            });
                            res.end();
                        } else {
                            query = users.findOne(
                                {
                                    socialId: postData.socialId,
                                    socialType: postData.socialType,
                                },
                                {
                                    userName: 1,
                                    email: 1,
                                    deviceType: 1,
                                    deviceToken: 1,
                                    fireabaseToken: 1,
                                    locationLatLong: 1,
                                    authToken: 1,
                                }
                            );
                            query.exec(function (err, userDetail) {
                                // becouse we get data before update authtoken
                                res.json({
                                    status: success,
                                    message: "Login successfully.",
                                    data: userDetail,
                                });
                                res.end();
                            });
                        }
                    }
                );
            } else {
                // if user not register with this social id and type
                var insertData = new users({
                    name: postData.name ? postData.name : "",
                    email: postData.email ? postData.email : "",
                    password: "",
                    deviceType: postData.deviceType,
                    deviceToken: postData.deviceToken,
                    fireabaseToken: postData.fireabaseToken,
                    locationLatLong: [postData.userLatitude, postData.userLongitude],
                    authToken: authToken,
                    socialId: postData.socialId,
                    socialType: postData.socialType,
                    created_at: date,
                    updated_at: date,
                });
                insertData.save(function (error) {
                    if (error) {
                        res.json({
                            status: fail,
                            message: "Try again later.",
                            data: {},
                        });
                        res.end();
                    } else {
                        var query = users.findOne({
                            socialId: postData.socialId,
                            socialType: postData.socialType,
                        });
                        query.exec(function (err, users) {
                            res.json({
                                status: success,
                                message: "You have registered successfully.",
                                data: users,
                            });
                            res.end();
                        });
                    }
                });
            }
        });
    } else {
        var check_email = users.findOne({ email: postData.email });
        check_email.exec(function (err, check_email) {
            if (check_email) {
                res.json({
                    status: fail,
                    message: "Email must be unique.",
                    data: {},
                });
                res.end();
            } else {
                // users.updateMany({ $or: [{ deviceToken: postData.deviceToken }, { fireabaseToken: postData.fireabaseToken }] }, { fireabaseToken: "" }, function (err) { });
                var insertData = new users({
                    name: postData.name,
                    email: postData.email,
                    postal_code: postData.postalCode,
                    password: encrypt(postData.password),
                    phNumber: postData.phNumber,
                    deviceToken: postData.deviceToken,
                    countryCode: postData.countryCode,
                    authToken: authToken,
                    deviceType: postData.deviceType,
                    fireabaseToken: postData.fireabaseToken,
                    locationLatLong: [postData.userLatitude, postData.userLongitude],
                    socialId: "",
                    socialType: "",
                    created_at: date,
                    updated_at: date,
                });
                insertData.save(function (error) {
                    if (error) {
                        res.json({
                            status: fail,
                            message: "Try again later.",
                            data: {},
                        });
                        res.end();
                    } else {
                        var query = users.findOne({ email: postData.email });
                        query.exec(function (err, users) {
                            res.json({
                                status: success,
                                message: "User registered successfully.",
                                data: users,
                            });
                            res.end();
                        });
                    }
                });
            }
        });
    }
};
exports.registrationWeb = function (req, res) {
    var postData = req.body;
    var authToken = "BUCA_" + randomAsciiString(50);
    var code = randomAsciiString(5);
    //var postData = req.body;

    if (postData.socialId) {
        // check if social id exist than we register user as social login
        var social_login = users.findOne({
            socialId: postData.socialId,
            socialType: postData.socialType,
        });
        social_login.exec(function (err, social_login) {
            users.updateMany(
                {
                    $or: [
                        { deviceToken: postData.deviceToken },
                        { fireabaseToken: postData.fireabaseToken },
                    ],
                },
                { fireabaseToken: "" },
                function (err) { }
            );
            if (social_login) {
                // if user already register with this social id and type
                var updateData = {
                    deviceType: postData.deviceType,
                    deviceToken: postData.deviceToken,
                    fireabaseToken: postData.fireabaseToken,
                    locationLatLong: [postData.userLatitude, postData.userLongitude],
                    authToken: authToken,
                    updated_at: date,
                };

                users.updateOne(
                    { socialId: postData.socialId, socialType: postData.socialType },
                    updateData,
                    function (err) {
                        if (err) {
                            res.json({
                                status: fail,
                                message: "Try again later..!",
                                data: {},
                            });
                            res.end();
                        } else {
                            query = users.findOne(
                                {
                                    socialId: postData.socialId,
                                    socialType: postData.socialType,
                                },
                                {
                                    userName: 1,
                                    email: 1,
                                    deviceType: 1,
                                    deviceToken: 1,
                                    fireabaseToken: 1,
                                    locationLatLong: 1,
                                    authToken: 1,
                                }
                            );
                            query.exec(function (err, userDetail) {
                                // becouse we get data before update authtoken
                                res.json({
                                    status: success,
                                    message: "Login successfully.",
                                    data: userDetail,
                                });
                                res.end();
                            });
                        }
                    }
                );
            } else {
                // if user not register with this social id and type
                var insertData = new users({
                    code: code,
                    name: postData.name ? postData.name : "",
                    email: postData.email ? postData.email : "",
                    password: "",
                    profile_image: postData.profile_image,
                    logo: postData.logo,
                    deviceType: postData.deviceType,
                    deviceToken: postData.deviceToken,
                    fireabaseToken: postData.fireabaseToken,
                    locationLatLong: [postData.userLatitude, postData.userLongitude],
                    authToken: authToken,
                    socialId: postData.socialId,
                    socialType: postData.socialType,
                    age: postData.age,
                    industry: postData.industry,
                    company: postData.company,
                    position: postData.position,
                    address: postData.address,
                    created_at: date,
                    updated_at: date,
                });
                insertData.save(function (error) {
                    if (error) {
                        res.json({
                            status: fail,
                            message: "Try again later.",
                            data: {},
                        });
                        res.end();
                    } else {
                        var query = users.findOne({
                            socialId: postData.socialId,
                            socialType: postData.socialType,
                        });
                        query.exec(function (err, users) {
                            res.json({
                                status: success,
                                message: "You have registered successfully.",
                                data: users,
                            });
                            res.end();
                        });
                    }
                });
            }
        });
    } else {
        var check_email = users.findOne({ email: postData.email });
        check_email.exec(function (err, check_email) {
            if (check_email) {
                res.json({
                    status: fail,
                    message: "Email must be unique.",
                    data: {},
                });
                res.end();
            } else {
                // users.updateMany({ $or: [{ deviceToken: postData.deviceToken }, { fireabaseToken: postData.fireabaseToken }] }, { fireabaseToken: "" }, function (err) { });
                var insertData = new users({
                    code: code,
                    profile_image: postData.profile_image,
                    logo: postData.logo,
                    name: postData.name,
                    email: postData.email,
                    postal_code: postData.postalCode,
                    password: encrypt(postData.password),
                    phNumber: postData.phNumber,
                    deviceToken: postData.deviceToken,
                    countryCode: postData.countryCode,
                    authToken: authToken,
                    deviceType: postData.deviceType,
                    fireabaseToken: postData.fireabaseToken,
                    locationLatLong: [postData.userLatitude, postData.userLongitude],
                    socialId: "",
                    socialType: "",
                    age: postData.age,
                    industry: postData.industry,
                    company: postData.company,
                    position: postData.position,
                    address: postData.address,
                    created_at: date,
                    updated_at: date,
                });
                insertData.save(function (error) {
                    if (error) {
                        res.json({
                            status: fail,
                            message: "Try again later.",
                            data: {},
                        });
                        res.end();
                    } else {
                        var query = users.findOne({ email: postData.email });
                        query.exec(function (err, users) {
                            res.json({
                                status: success,
                                message: "User registered successfully.",
                                data: users,
                            });
                            res.end();
                        });
                    }
                });
            }
        });
    }
};
exports.getUserByCode = function (req, res) {
    let getData = req.query;
    users.findOne({ code: getData.code }).exec((err, result) => {
        if (err) {
            res.json({
                status: fail,
                message: "try again later",
            });
        } else {
            res.json({
                status: success,
                message: "found BUCA",
                data: result,
            });
        }
    });
};
exports.login = function (req, res) {
    var postData = req.body;
    var authToken = "BUCA_" + randomAsciiString(300) + "_" + new Date().getTime();

    var query = users.findOne({ email: postData.email }, { password: 1 });
    query.exec(function (err, userDetail) {
        if (err) {
            res.json({
                status: fail,
                message: "Try again later.",
                data: {},
            });
            res.end();
        } else {
            if (userDetail) {
                if (decrypt(userDetail.password) != postData.password) {
                    res.status(401).json({
                        status: fail,
                        message: "Invalid login credentials.",
                        data: {},
                    });
                    res.end();
                } else {
                    users.updateMany(
                        {
                            $or: [
                                // { deviceToken: postData.deviceToken },
                                { fireabaseToken: postData.fireabaseToken },
                            ],
                        }, {
                        deviceToken: '',
                        fireabaseToken: ''
                    },
                        function (err) {
                            var updateData = {
                                deviceType: postData.deviceType,
                                deviceToken: postData.deviceToken,
                                fireabaseToken: postData.fireabaseToken,
                                //locationLatLong: [postData.userLatitude,postData.userLongitude],
                                authToken: authToken,
                                updated_at: date,
                            };

                            users.updateOne(
                                { email: postData.email },
                                updateData,
                                function (err) {
                                    if (err) {
                                        res.json({
                                            status: fail,
                                            message: "Please allow location",
                                            data: {},
                                        });
                                        res.end();
                                    } else {
                                        query = users.findOne({ email: postData.email });
                                        query.exec(function (err, userDetail) {
                                            // we get data before update authtoken

                                            var userDetail = JSON.parse(JSON.stringify(userDetail));
                                            res.json({
                                                status: success,
                                                message: "User Logged in successfully.",
                                                data: userDetail,
                                            });
                                            res.end();
                                        });
                                    }
                                }
                            );
                        }
                    );
                }
            } else {
                res.status(401).json({
                    status: fail,
                    message: "Invalid login credentials.",
                    data: {},
                });
                res.end();
            }
        }
    });
};
exports.update_profile_image = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        if (files.profile_image && files.profile_image.name != "") {
            var fileName =
                randomAsciiString(20) + files.profile_image.type.split("/")[1];
            var oldpath = files.profile_image.path;
            var newpath = "uploads/users/" + fileName;
            fs.rename(oldpath, newpath, function (err) {
                if (err) {
                    res.json({
                        status: fail,
                        message: "Select another profile image",
                        data: {},
                    });
                    res.end();
                } else {
                    if (files.logo && files.logo.name != "") {
                        var fileNameLogo =
                            randomAsciiString(20) + files.logo.type.split("/")[1];
                        var oldpath = files.logo.path;
                        var newpath = "uploads/logos/" + fileNameLogo;
                        fs.rename(oldpath, newpath, function (err) {
                            if (err) {
                                res.json({
                                    status: fail,
                                    message: "Select another logo image",
                                    data: {},
                                });
                                res.end();
                            } else {
                                fields.profile_image = "uploads/users/" + fileName;
                                fields.logo = "uploads/logos/" + fileNameLogo;
                                req.body = fields;
                                next();
                            }
                        });
                    } else {
                        fields.profile_image = "uploads/users/" + fileName;
                        req.body = fields;
                        fields.logo = "";
                        next();
                    }
                }
            });
        } else if (files.logo && files.logo.name != "") {
            var fileName = randomAsciiString(20) + ".png"; // + files.serviceImage.type.split("/")[1];
            var oldpath = files.logo.path;
            var newpath = "uploads/logos/" + fileName;
            fs.rename(oldpath, newpath, function (err) {
                if (err) {
                    res.json({
                        status: fail,
                        message: "Select another logo image",
                        data: {},
                    });
                    res.end();
                } else {
                    fields.logo = "uploads/logos/" + fileName;
                    req.body = fields;
                    next();
                }
            });
        } else {
            fields.profile_image = "";
            fields.logo = "";
            req.body = fields;
            next();
        }
    });
};
exports.update_password = async function (req, res, next) {
    var postData = req.body;
    if (postData.oldPassword && postData.password) {
        var query = users.findOne({ _id: req.authData._id });
        query.exec(function (err, userDetail) {
            if (userDetail) {
                if (decrypt(userDetail.password) != postData.oldPassword) {
                    res.status(401).json({
                        status: fail,
                        message: "Old password not valid.",
                        data: {},
                    });
                    res.end();
                } else {
                    next();
                }
            }
        });
    } else {
        next();
    }
};
exports.profle_update = async function (req, res) {
    let postData = req.body;
    var query = users.findOne({ _id: req.authData._id });
    query.exec(function (err, result) {
        if (err) {
            res.json({
                status: fail,
                message: "Try again later.",
                data: {},
            });
            res.end();
        } else {
            var updateData = {};
            if (postData.profile_image) {
                updateData.profile_image = postData.profile_image;
            }
            if (postData.userLatitude && postData.userLongitude) {
                updateData.locationLatLong = [
                    postData.userLatitude,
                    postData.userLongitude,
                ];
            }
            if (postData.logo) {
                updateData.logo = postData.logo;
            }
            if (postData.gender) {
                updateData.gender = postData.gender;
            }
            if (postData.name) {
                updateData.name = postData.name;
            }
            if (postData.age) {
                updateData.age = postData.age;
            }
            if (postData.industry) {
                updateData.industry = postData.industry;
            }
            if (postData.company) {
                updateData.company = postData.company;
            }
            if (postData.position) {
                updateData.position = postData.position;
            }
            if (postData.address) {
                updateData.address = postData.address;
            }
            if (postData.companyCode) {
                updateData.company_code = postData.companyCode;
            }
            if (postData.cardStyle) {
                updateData.cardStyle = postData.cardStyle;
            }
            if (postData.fontColor) {
                updateData.fontColor = postData.fontColor;
            }
            if (postData.fontSize) {
                updateData.fontSize = postData.fontSize;
            }
            if (postData.fontWeight) {
                updateData.fontWeight = postData.fontWeight;
            }
            if (postData.fontFamily) {
                updateData.fontFamily = postData.fontFamily;
            }
            if (postData.textDecoration) {
                updateData.textDecoration = postData.textDecoration;
            }
            if (postData.linkedinUrl) {
                updateData.linkedinUrl = postData.linkedinUrl;
            }
            if (postData.instagramUrl) {
                updateData.instagramUrl = postData.instagramUrl;
            }
            if (postData.twitterUrl) {
                updateData.twitterUrl = postData.twitterUrl;
            }
            if (postData.facebookurl) {
                updateData.facebookurl = postData.facebookurl;
            }
            if (postData.alignment) {
                updateData.alignment = postData.alignment;
            }
            if (postData.uniqueSharingId) {
                updateData.uniqueSharingId = postData.uniqueSharingId;
            }
            if (postData.cardsShared) {
                updateData.cardsShared = postData.cardsShared;
            }
            if (postData.contactsList) {
                updateData.contactsList = postData.contactsList;
            }
            if (postData.messageList) {
                updateData.messageList = postData.messageList;
            }
            if (postData.awards) {
                updateData.awards = postData.awards;
            }
            if (postData.trees) {
                updateData.trees = postData.trees;
            }
            if (postData.sharing_progress) {
                updateData.sharing_progress = postData.sharingProgress;
            }
            if (postData.templateUrl) {
                updateData.template_url = postData.templateUrl;
            }
            if (postData.templateData) {
                updateData.templateData = JSON.parse(postData.templateData);
            }

            users.updateOne(
                { _id: req.authData._id },
                updateData,
                function (err, result) {
                    if (err) {
                        res.json({
                            status: fail,
                            message: "Try again later..!",
                            data: {},
                        });
                        res.end();
                    } else {
                        res.json({
                            status: success,
                            message: "Profile Updated successfully",
                            data: updateData,
                        });
                        res.end();
                    }
                }
            );
        }
    });
};
exports.startChat = async function (req, res) {
    let postData = req.body;
    chatting.findOne({}).exec(function (err, result) {
        if (err) {
        } else {
            if (result) {
                chatting.updateOne({
                    $or: [
                        { user1Id: req.authData._id },
                        { user1Id: postData._id },
                        { user2Id: postData._id },
                        { user2Id: req.authData._id },
                    ],
                });
            }
        }
    });
    let insertData = chatting({
        user1Id: postData.id,
        user2Id: req.authData._id,
        message: postData.message,
    });

    insertData.save(function (err, result1) {
        if (err) {
            res.json({
                status: fail,
                message: "Try again later",
            });
        } else {
            res.json({
                status: success,
                message: "First message sent",
                data: result1,
            });
        }
    });
};
exports.forgot_password = function (req, res) {
    var postData = req.body;
    var query = users.findOne(
        { email: postData.email, socialId: "" },
        { authToken: 1 }
    );
    query.exec(function (err, userDetail) {
        if (err) {
            res.json({
                status: fail,
                message: "Try again later.",
            });
            res.end();
        } else {
            if (userDetail) {
                var otp = randomString(6, "0123456789");
                const mailOptions = {
                    from: "devacc1305@gmail.com",
                    to: `${postData.email}`,
                    subject: "Reset Password",
                    html: `<h1>${otp}</h1> <p> Please use this OTP to reset your password on BUCA</p>`,
                };
                console.log("2");
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        // res.json({ message: "Check your mail" });
                        users.updateOne(
                            { email: postData.email, socialId: "" },
                            { forgot_password_otp: otp },
                            function (err, data) {
                                res.json({
                                    status: success,
                                    message: "Otp sent on your register email. ",
                                    otp: otp,
                                });
                                res.end();
                            }
                        );
                    }
                });
            } else {
                res.json({
                    status: fail,
                    message: "We can't find a user with that e-mail address.",
                });
                res.end();
            }
        }
    });
};
exports.forgot_password_mail = function (req, res) {
    //const sendmail = require('sendmail')();
    var postData = req.body;
    var query = users.findOne(
        { email: postData.email, socialId: "" },
        { authToken: 1 }
    );
    query.exec(function (err, userDetail) {
        if (err) {
            res.json({
                status: fail,
                message: "Try again later..!",
            });
            res.end();
        } else {
            if (userDetail) {
                var t = encrypt(randomAsciiString(10));
                var tkn = encrypt(userDetail.authToken);
                res.json({
                    status: success,
                    message: "Profile updated successfully.",
                    url: config.base_url + "reset_password?t=" + t + "&tkn=" + tkn,
                });
                res.end();
            } else {
                res.json({
                    status: success,
                    message: "Invalid email address.",
                });
                res.end();
            }
        }
    });
};
exports.check_auth = function (req, res, next) {
    if (req.headers.authorization) {
        var query = users.findOne({ authToken: req.headers.authorization });
        query.exec(function (err, users) {
            if (err) {
                res.status(400).json({
                    status: fail,
                    message: "Authorization failed.",
                    data: {},
                });
                res.end();
            } else {
                if (users) {
                    req.authData = users;
                    next();
                } else {
                    res.status(400).json({
                        status: fail,
                        message: "Authorization failed.",
                        data: {},
                    });
                    res.end();
                }
            }
        });
    } else {
        res.status(400).json({
            status: fail,
            message: "Authorization token required.",
            data: {},
        });
        res.end();
    }
};
exports.userDetails = function (req, res) {
    users.findOne({ _id: req.authData._id }).exec(function (err, result) {
        if (err) {
            res.json({
                status: fail,
                message: "Something went wrong.",
            });
        } else {
            res.json({
                status: success,
                message: "User Details.",
                data: result,
            });
        }
    });
};
exports.userSearch = function (req, res) {
    let postData = req.body;

    users
        .find({
            $or: [
                { email: new RegExp(postData.input) },
                { name: new RegExp(postData.input) },
            ],
        })
        .exec((err, result) => {
            if (err) {
                res.json({
                    status: fail,
                    message: "try again later",
                });
            } else {
                if (result) {
                    res.json({
                        status: success,
                        message: "Users found with Search params",
                        data: result,
                    });
                } else {
                    res.json({
                        status: fail,
                        message: "No users Found",
                        data: "",
                    });
                }
            }
        });
};
exports.acceptConnection = function (req, res, next) {
    let postData = req.query.id;
    let status = req.query.status;
    users.findOne({ _id: req.authData._id }).exec((err, result) => {
        if (err) {
            res.json({
                status: fail,
                message: " Something went wrong",
            });
        } else {
            if (result.shareRequest.length > 0) {
                users
                    .findOne({ _id: req.authData._id, "shareRequest.id": postData }, ["shareRequest"])
                    .exec((err, result1) => {
                        if (err) {
                            res.json({
                                status: fail,
                                message: "found",
                            });
                        } else {
                            let list = result1.shareRequest;
                            let user = [];
                            list.forEach((elem, i) => {
                                if (elem.id === postData) {
                                    elem.status = status;
                                }
                                if (i === list.length - 1) {
                                    users
                                        .updateOne(
                                            { _id: req.authData._id },
                                            { shareRequest: list }
                                        )
                                        .exec((err, result2) => {
                                            if (err) {
                                                res.json({
                                                    status: fail,
                                                    message: "try again later",
                                                });
                                            } else {
                                                users
                                                    .findOne({ _id: postData })
                                                    .exec((err, result3) => {
                                                        console.log(result3, 'result3');
                                                        if (err) {
                                                            res.json({
                                                                status: fail,
                                                                message: "something went wrong",
                                                            });
                                                        } else {
                                                            if (status === "ACCEPT") {
                                                                const registrationToken =
                                                                    result3.fireabaseToken;

                                                                var notifications = {
                                                                    title: "Buca request accepted",
                                                                    body: `${result.name} has accepted your request.`,
                                                                };
                                                                let message = {
                                                                    notification: notifications,
                                                                    registration_ids: [registrationToken],
                                                                };

                                                                fcm.send(message, function (err, response) {
                                                                    if (err) {
                                                                        next();
                                                                    } else {
                                                                        let today_date = new Date();
                                                                        let timestamp = today_date.getTime();
                                                                        let inserData = new notification({
                                                                            userId: result3._id,
                                                                            name: result.name,
                                                                            image: result.profile_image,
                                                                            message: " has accepted your request.",
                                                                            timestamp: timestamp,
                                                                            created_at: date,
                                                                            updated_at: date,
                                                                        });
                                                                        inserData.save((err, results) => {
                                                                            if (err) {
                                                                                console.log(err);
                                                                                res.json({
                                                                                    status: fail,
                                                                                    message: "try again later",
                                                                                });
                                                                            } else {
                                                                                next();
                                                                            }
                                                                        });
                                                                    }
                                                                });
                                                            } else {
                                                                res.json({
                                                                    status: true,
                                                                    message: "request declined",
                                                                });
                                                            }
                                                        }
                                                    });
                                            }
                                        });
                                }
                            });
                        }
                    });
            } else {
                res.json({
                    status: fail,
                    message: "No such request exist",
                });
            }
        }
    });
};
exports.countShare = function (req, res) {
    let postData = req.body;
    users.findOne({ _id: postData.id }).exec((err, result) => {
        if (err) {
            res.json({
                status: fail,
                message: "Something went wrong",
            });
        } else {
            users
                .updateOne({ _id: result._id }, { cardsShared: result.cardsShared + 1 })
                .exec((err, result1) => {
                    if (err) {
                        res.json({
                            status: fail,
                            message: "try again later",
                        });
                    } else {
                        res.json({
                            status: success,
                            message: "Buca Share counted",
                        });
                    }
                });
        }
    });
};
exports.sendNotic = (req, res) => {
    var notification = {
        title: "Hello 👋",
        body: "some notification 💪",
        color: "#5137f5",
    };
    let message = {
        notification: notification,
        registration_ids: [
            "dUwqZJ3eTKuiL29wY2Cqou:APA91bEcLd6vEezOVDwYfpubaH6mLC5aBJV13VEtUk65Pq68yj-qYiV-ZOJU1747WOuI-8h3tZaqYreY-yXFHIQhD-F0RfxB-jrQE8X2C4iXFfs4BnhHIVhSbjsRNZu8Cx7AIYYowqvF",
        ],
    };
    fcm.send(message, function (err, response) {
        if (err) {
            res.json({
                status: fail,
                message: " try again later",
                err: err,
            });
        } else {
            res.json({
                status: success,
                message: "notification sent sucessfully ",
            });
        }
    });
};
exports.makeConnection = function (req, res) {
    postData = req.query.id;
    users.findOne({ _id: postData }).exec(function (err, userData) {
        if (err) {
            res.json({
                status: fail,
                message: "try again later",
            });
        } else {
            if (userData) {
                let contact = userData.contactsList.includes(req.authData._id);
                if (!userData.contactsList.includes(req.authData._id)) {
                    users
                        .updateOne(
                            { _id: postData },
                            {
                                $push: { contactsList: req.authData._id },
                            }
                        )
                        .exec(function (err, result1) {
                            if (err) {
                                res.json({
                                    status: fail,
                                    message: "try again later",
                                });
                            } else {
                                users
                                    .updateOne(
                                        { _id: req.authData._id },
                                        {
                                            $push: { contactsList: postData },
                                        }
                                    )
                                    .exec(function (err, result2) {
                                        if (err) {
                                            res.json({
                                                status: fail,
                                                message: "Try again later",
                                            });
                                        } else {
                                            if (req.query.status) {
                                                res.json({
                                                    status: success,
                                                    message: "Contact added successfully.",
                                                    data: userData,
                                                });
                                            } else {
                                                users.findOne({ _id: req.authData._id }).exec((err, NotificationUser) => {
                                                    if (err) {
                                                        res.json({
                                                            status: fail,
                                                            message: "Try again later",
                                                        });
                                                    } else {
                                                        const registrationToken = userData.fireabaseToken;
                                                        var notifications = {
                                                            title: "Contact created .",
                                                            body: `${NotificationUser.name} has added you in BUCA contact.`,
                                                        };
                                                        let message = {
                                                            notification: notifications,
                                                            registration_ids: [registrationToken],
                                                        };
                                                        fcm.send(message, function (err, response) {
                                                            console.log(err, response);
                                                            if (err) {
                                                                res.json({
                                                                    status: fail,
                                                                    message: "try again later",
                                                                });
                                                            } else {
                                                                let today_date = new Date();
                                                                let timestamp = today_date.getTime();
                                                                let inserData = new notification({
                                                                    userId: postData,
                                                                    name: NotificationUser.name,
                                                                    image: NotificationUser.profile_image,
                                                                    message: "has added you in BUCA contact.",
                                                                    timestamp: timestamp,
                                                                    created_at: date,
                                                                    updated_at: date,
                                                                });
                                                                inserData.save((err, results) => {
                                                                    if (err) {
                                                                        res.json({
                                                                            status: fail,
                                                                            message: "try again later",
                                                                        });
                                                                    } else {
                                                                        res.json({
                                                                            status: success,
                                                                            message: "Cotact added",
                                                                        });
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }
                                                })
                                            }
                                        }
                                    });
                            }
                        });
                } else {
                    res.json({
                        status: fail,
                        message: "already in contact",
                    });
                }
            } else {
                res.json({
                    status: fail,
                    message: "No user found with this id.",
                    // data: userData
                });
            }
        }
    });
};
exports.bucaRequest = function (req, res) {
    let postData = req.body;
    users
        .findOne({
            _id: ObjectId(postData.requestId),
            shareRequest: { $elemMatch: { id: postData.requester, status: "HOLD" } },
        })
        .exec((err, result) => {
            if (err) {
                res.json({
                    status: fail,
                    message: "try again later",
                });
            } else {
                if (!result) {
                    users
                        .updateOne(
                            { _id: postData.requestId },
                            {
                                $push: {
                                    shareRequest: [
                                        {
                                            id: postData.requester,
                                            status: "HOLD",
                                            date: new Date(),
                                        },
                                    ],
                                },
                            }
                        )
                        .exec((err, result1) => {
                            if (err) {
                                res.json({
                                    status: fail,
                                    message: "try again later",
                                });
                            } else {
                                users
                                    .findOne({ _id: postData.requester })
                                    .exec((err, result2) => {
                                        if (err) {
                                            res.json({
                                                status: fail,
                                                message: "try again later",
                                            });
                                        } else {
                                            users
                                                .findOne({ _id: ObjectId(postData.requestId) })
                                                .exec((err, user) => {
                                                    if (err) {
                                                        res.json({
                                                            status: fail,
                                                            message: " try again later.",
                                                        });
                                                    } else {
                                                        if (user.fireabaseToken) {
                                                            const registrationToken = user.fireabaseToken;

                                                            var notifications = {
                                                                title: "BUCA request",
                                                                body: `${result2.name} wants to connect with you on BUCA`,
                                                            };
                                                            let data = {
                                                                image: result2.profile_image,
                                                            };
                                                            const message = {
                                                                notification: notifications,
                                                                to: registrationToken,
                                                                data: data,
                                                            };

                                                            fcm.send(message, function (err, response) {
                                                                if (err) {
                                                                    res.json({
                                                                        status: success,
                                                                        message: "Request send successfully",
                                                                        data: user,
                                                                    });
                                                                } else {
                                                                    let today_date = new Date();
                                                                    let timestamp = today_date.getTime();
                                                                    let insertData = new notification({
                                                                        userId: user._id,
                                                                        name: result2.name,
                                                                        image: result2.profile_image,
                                                                        requesterId: postData.requester,
                                                                        message:
                                                                            "wants to connect with you on BUCA",
                                                                        timestamp: timestamp,
                                                                        created_at: timestamp,
                                                                        updated_at: timestamp,
                                                                    });
                                                                    insertData.save((err, result) => {
                                                                        if (err) {
                                                                            res.json({
                                                                                status: fail,
                                                                                message: "try again later",
                                                                            });
                                                                        } else {
                                                                            res.json({
                                                                                status: success,
                                                                                message: "Request send successfully",
                                                                                data: result,
                                                                            });
                                                                        }
                                                                    });
                                                                }
                                                            });
                                                        } else {
                                                            res.json({
                                                                status: success,
                                                                message: "Request send successfully",
                                                                data: result,
                                                            });
                                                        }
                                                    }
                                                });
                                        }
                                    });
                            }
                        });
                } else {
                    res.json({
                        status: fail,
                        message: "Already sent the request",
                        data: result,
                    });
                }
            }
        });
};
exports.getAllRequest = function (req, res) {
    let postaData = req.body;
    users
        .findOne({ _id: req.authData._id }, ["shareRequest"])
        .exec((err, result) => {
            if (err) {
                res.json({
                    status: fail,
                    message: "try again later",
                });
            } else {
                if (result.shareRequest.length > 0) {
                    let reqsests = result.shareRequest;
                    let data = [];
                    let user = [];
                    let newarray = reqsests.filter((item) => item.status === "HOLD");
                    if (newarray.length > 0) {
                        reqsests.forEach((elem) => {
                            if (elem.status === "HOLD") {
                                data.push(elem);
                                users.findOne({ _id: elem.id }).exec((err, result) => {
                                    if (err) {
                                        res,
                                            json({
                                                status: fail,
                                            });
                                    } else {
                                        user.push(result);
                                        if (data.length === user.length) {
                                            res.json({
                                                status: success,
                                                message: "Found requests",
                                                data: user,
                                            });
                                        }
                                    }
                                });
                            }
                        });
                    } else {
                        res.json({
                            status: fail,
                            message: "No request found",
                        });
                    }
                } else {
                    res.json({
                        status: fail,
                        message: "No request found",
                    });
                }
            }
        });
};
exports.getContacts = function (req, res) {
    users
        .findOne({ _id: req.authData._id }, ["contactsList"])
        .exec(function (err, result) {
            if (err) {
                res.json({
                    status: fail,
                    message: "try again later",
                });
            } else {
                if (result.contactsList.length > 0) {
                    let userData = [];
                    let list = result.contactsList;
                    list.forEach((elem) => {
                        users.findOne({ _id: elem }).exec((err, results) => {
                            if (err) {
                                res.json({
                                    status: fail,
                                    message: "try again later",
                                });
                            } else {
                                userData.push(results);
                                if (list.length === userData.length) {
                                    res.json({
                                        status: success,
                                        data: userData,
                                    });
                                }
                            }
                        });
                    });
                } else {
                    res.json({
                        status: fail,
                        message: "No contact found",
                    });
                }
            }
        });
};
exports.resetPassword = function (req, res) {
    let postData = req.body;
    users
        .findOne({ forgot_password_otp: postData.otp })
        .exec(function (err, result) {
            if (err) {
                res.json({
                    status: fail,
                    message: "Something went wrong.",
                });
            } else {
                if (result) {
                    users.updateOne(
                        { _id: result._id },
                        { password: encrypt(postData.password), forgot_password_otp: "" },
                        function (err, result1) {
                            if (err) {
                                res.json({
                                    status: fail,
                                    message: "Something went wrong.",
                                });
                            } else {
                                res.json({
                                    status: success,
                                    message: "Password updated successfully.",
                                    result: result1,
                                });
                            }
                        }
                    );
                } else {
                    res.json({
                        status: fail,
                        message: "Something went wrong.",
                    });
                }
            }
        });
};

exports.updateNotifications = function (req, res) {
    let postData = req.query;
    notification
        .updateOne({ _id: postData.id }, { status: "SEEN" })
        .exec((err, result) => {
            if (err) {
                res.json({
                    status: fail,
                    message: "try again later",
                });
            } else {
                res.json({
                    status: success,
                    message: "status updated.",
                    data: result,
                });
            }
        });
};
exports.callNotification = function (req, res) {
    let postData = req.query;
    users.findOne({ _id: postData.id }).exec((err, result) => {
        if (err) {
            res.json({
                status: fail,
                message: "try again later",
            });
        } else {
            const registrationToken = result.fireabaseToken;
            var notifications = {
                title: "BUCA",
                body: `${req.authData.name} is calling you on BUCA`,
            };
            let data = {
                userImage: req.authData.profile_image,
                type: "CALL",
                usersId: req.authData._id,
                name: req.authData.name,
                callType: postData.callType,
            };
            const message = {
                notification: notifications,
                to: registrationToken,
                data: data,
            };
            fcm.send(message, function (err, response) {
                if (err) {
                    res.json({
                        status: fail,
                        message: "token not found",
                    });
                } else {
                    let today_date = new Date();
                    let timestamp = today_date.getTime();
                    let insertData = new notification({
                        userId: result._id,
                        timestamp: timestamp,
                        requesterId: postData.requester,
                        message: "called you.",
                        name: req.authData.name,
                        image: req.authData.profile_image,
                        callType: postData.callType,
                        created_at: date,
                        updated_at: date,
                    });
                    insertData.save((err, result) => {
                        if (err) {
                            res.json({
                                status: fail,
                                message: "try again later",
                            });
                        } else {
                            console.log("Successfully sent message:", response);
                            res.json({
                                status: success,
                                message: "notification send successfully",
                                data: result,
                            });
                        }
                    });
                    console.log("Successfully sent with response: ", response);
                }
            });
        }
    });
};
exports.changePassword = function (req, res) {
    let postData = req.body;
    users.findOne({ _id: req.authData._id }).exec((err, result) => {
        if (err) {
            res.json({
                status: fail,
                message: "try again later ",
            });
        } else {
            if (result) {
                if (decrypt(result.password) != postData.oldPassword) {
                    res.status(401).json({
                        status: fail,
                        message: "Old password not valid.",
                        data: {},
                    });
                    res.end();
                } else {
                    users
                        .updateOne(
                            { _id: req.authData._id },
                            { password: encrypt(postData.newPassword) }
                        )
                        .exec((err, result) => {
                            if (err) {
                                res.json({
                                    status: fail,
                                    message: "try again later ",
                                });
                            } else {
                                res.json({
                                    status: success,
                                    message: "password updated sucessfully",
                                });
                            }
                        });
                }
            } else {
                res.json({
                    status: success,
                    message: "No user found",
                });
            }
        }
    });
};
exports.checkEmail = function (req, res) {
    let postData = req.body;
    users.findOne({ email: postData.email }).exec((err, result) => {
        if (err) {
            res.json({
                status: fail,
                message: "try again later",
            });
        } else {
            if (result) {
                res.json({
                    status: fail,
                    message: "user already exist with email",
                });
            } else {
                res.json({
                    status: success,
                    message: "New email for register",
                });
            }
        }
    });
};
exports.groupCall = function (req, res) {
    let postData = req.body;

    groupChat.aggregate(
        [
            {
                $match: {
                    _id: ObjectId(postData.groupId),
                },
            },
            {
                $lookup: {
                    from: "users",
                    let: {
                        user_id: "$users.userId",
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $in: ["$_id", "$$user_id"] },
                                        { $ne: ["$_id", req.authData._id] },
                                    ],
                                },
                            },
                        },
                        {
                            $project: {
                                _id: 0,
                                fireabaseToken: 1,
                            },
                        },
                    ],
                    as: "firebase_token_array",
                },
            },
            {
                $project: {
                    _id: 0,
                    groupName: 1,
                    firebase_token_array: 1,
                },
            },
        ],
        function (err, result) {
            if (result.length) {
                var firebase_token_arr = [];
                if (result[0].firebase_token_array) {
                    if (result[0].firebase_token_array.length) {
                        result[0].firebase_token_array.forEach(function (e, i) {
                            firebase_token_arr.push(e.fireabaseToken);
                        });
                    }
                }

                if (firebase_token_arr.length) {
                    const notifications = {
                        title: "BUCA",
                        body: `${req.authData.name} is calling in group ${result[0].groupName}`,
                    };
                    const data = {
                        userImage: req.authData.profile_image,
                        type: "GROUP CALL",
                        usersId: postData.groupId,
                        name: result[0].groupName,
                        callType: postData.callType,
                    };
                    const message = {
                        notification: notifications,
                        registration_ids: firebase_token_arr,
                        data: data,
                    };
                    fcm.send(message, function (err, response) {
                        if (err) {
                            res.json({
                                status: fail,
                                message: " try again later",
                                err: err,
                            });
                        } else {
                            res.json({
                                status: success,
                                message: "notification sent sucessfully ",
                            });
                        }
                    });
                } else {
                    res.json({
                        status: success,
                        message: "notification sent sucessfully ",
                    });
                }
            }
        }
    );

};
exports.groupMessage = function (req, res) {
    let postData = req.body;
    groupChat.aggregate(
        [
            {
                $match: {
                    _id: ObjectId(postData.groupId),
                },
            },
            {
                $lookup: {
                    from: "users",
                    let: {
                        user_id: "$users.userId",
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $in: ["$_id", "$$user_id"] },
                                        { $ne: ["$_id", req.authData._id] },
                                    ],
                                },
                            },
                        },
                        {
                            $project: {
                                _id: 0,
                                fireabaseToken: 1,
                            },
                        },
                    ],
                    as: "firebase_token_array",
                },
            },
            {
                $project: {
                    _id: 0,
                    groupName: 1,
                    firebase_token_array: 1,
                },
            },
        ],
        function (err, result) {

            if (result.length) {
                var firebase_token_arr = [];
                if (result[0].firebase_token_array) {
                    if (result[0].firebase_token_array.length) {
                        result[0].firebase_token_array.forEach(function (e, i) {
                            firebase_token_arr.push(e.fireabaseToken);
                        });
                    }
                }

                if (firebase_token_arr.length) {

                    const notifications = {
                        title: "BUCA",
                        body: `${req.authData.name} messaged in group ${result[0].groupName}`,
                    };
                    const data = {
                        userImage: req.authData.profile_image,
                        usersId: postData.groupId,
                        name: result[0].groupName,
                    };
                    const message = {
                        notification: notifications,
                        registration_ids: firebase_token_arr,
                        data: data,
                    };
                    fcm.send(message, function (err, response) {
                        if (err) {
                            console.log(err, 'err');
                            res.json({
                                status: fail,
                                message: " try again later",
                                err: err,
                            });
                        } else {
                            res.json({
                                status: success,
                                message: "notification sent sucessfully ",
                            });
                        }
                    });
                } else {
                    res.json({
                        status: success,
                        message: "notification sent sucessfully ",
                    });
                }
            }
        }
    );
};
exports.getNotifications = function (req, res) {
    notification
        .find({ userId: req.authData._id })
        .sort({ created_at: -1 })
        .exec((err, result) => {
            if (err) {
                res.json({
                    status: fail,
                    message: "try again later",
                });
            } else {
                res.json({
                    status: success,
                    message: "found notifications ",
                    data: result,
                });
            }
        });
};
exports.getUser = function (req, res) {
    let getData = req.query;
    users.findOne({ _id: getData.id }).exec((err, result) => {
        if (err) {
            res.json({
                status: fail,
                message: "try again later",
            });
        } else {
            res.json({
                status: success,
                message: "user found",
                data: result,
            });
        }
    });
};
exports.templateUpdate = function (req, res) {
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
                        { email: fields.email },
                        { template: JSON.stringify(templateObj), code: code }
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
                                        status: success,
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
};
exports.getTEmplateByCode = function (req, res) {
    if (req.query.code) {
        User.findOne({ code: req.query.code }, ['template']).exec((err, result) => {
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
    } else {
        res.json({
            status: false,
            message: 'No code found.',
        })
    }
};
exports.sendNotification = function (req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        console.log('here ', err, fields, files)
        if (files.template && files.template.name != "") {
            var fileName = randomAsciiString(20) + files.template.type.split("/")[1];
            var oldpath = files.template.path;
            var newpath = "uploads/notificationImage/" + fileName;
            fs.rename(oldpath, newpath, function (err) {

                let notifications = {
                    title: fields.title,
                    body: fields.notificationBody,
                };
                let data = {
                    image: newpath
                };
                users.find({
                    $and: [{
                        "fireabaseToken": {
                            "$ne": null
                        }
                    }]
                }, {
                    fireabaseToken: 1
                }, function (err, result) {
                    if (result.length > 0) {
                        var i = 0;
                        var tokenArr = [];
                        result.forEach(function (e, index) {
                            i++;
                            tokenArr.push(e.fireabaseToken)
                            if ((i == 100) || ((index + 1) == result.length)) {
                                var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
                                    registration_ids: tokenArr,
                                    notification: notifications,
                                    data: data,
                                };
                                fcm.send(message, function (err, response) {
                                    if (err) {
                                        console.log((index + 1) + '==' + result.length)
                                        if ((index + 1) == result.length) {
                                            res.json({
                                                status: success,
                                                message: 'sent successfully'

                                            })
                                        }
                                        console.log("Something has gone wrong!", err);
                                    } else {
                                        console.log((index + 1) + '==' + result.length)
                                        if ((index + 1) == result.length) {
                                            res.json({
                                                status: success,
                                                message: 'sent successfully'

                                            })
                                        }
                                        console.log("Successfully sent with response: ", tokenArr.length);
                                    }
                                });
                                i = 0;
                                tokenArr = [];
                            }
                        })

                    }
                })
            })
        }
    })

};
exports.sendMessageNotification = function (req, res) {
    let postData = req.body
    users.findOne({ _id: postData.id }).exec((err, result) => {
        if (err) {
            res.json({
                status: false,
                message: "Something went wrong.",
            });
        } else {
            const notifications = {
                title: "BUCA",
                body: `${req.authData.name} messaged you on BUCA`,
            };
            const data = {
                message: postData.message,
            };
            const message = {
                notification: notifications,
                to: result.fireabaseToken,
                data: data,
            };
            fcm.send(message, function (err, response) {
                if (err) {
                    console.log(err);
                    res.json({
                        status: fail,
                        message: " try again later",
                        err: err,
                    });
                } else {
                    res.json({
                        status: success,
                        message: "notification sent sucessfully ",
                    });
                }
            });
        }
    })
};
exports.dissconnect_call = function (req, res) {
    let getData = req.query;
    users.findOne({ _id: ObjectId(getData.id) }).exec((err, result) => {
        if (err) {
            res.json({
                status: false,
                message: 'try again later'
            })
        } else {
            if (result) {
                if (result.fireabaseToken) {
                    const notifications = {
                        title: "call dissconnected",
                        body: `${req.authData.name} has dissconnected the call.`,
                    };
                    const data = {
                        dissconnected: success,
                    };
                    const message = {
                        notification: notifications,
                        registration_ids: firebase_token_arr,
                        data: data,
                    };
                    fcm.send(message, (err, response) => {
                        if (err) {
                            res.json({
                                status: success,
                                message: 'No user found with this Token'
                            })
                        } else {
                            res.json({
                                status: success,
                                message: 'call disconnected successfully.'
                            })
                        }
                    })
                }
                

            } else {
                res.json({
                    status: success,
                    message: 'No user found with this Id'
                })
            }
        }
    })

};

function encrypt(text) {
    var cipher = crypto.createCipher("aes-256-cbc", "zws_aish");
    var crypted = cipher.update(text, "utf8", "hex");
    crypted += cipher.final("hex");
    return crypted;
}

function decrypt(text) {
    var decipher = crypto.createDecipher("aes-256-cbc", "zws_aish");
    var dec = decipher.update(text, "hex", "utf8");
    dec += decipher.final("utf8");
    return dec;
}

function randomAsciiString(length) {
    return randomString(
        length,
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    );
}

function randomString(length, chars) {
    if (!chars) {
        throw new Error("Argument 'chars' is undefined");
    }

    var charsLength = chars.length;
    if (charsLength > 256) {
        throw new Error(
            "Argument 'chars' should not have more than 256 characters" +
            ", otherwise unpredictability will be broken"
        );
    }

    var randomBytes = crypto.randomBytes(length);
    var result = new Array(length);
    var cursor = 0;

    for (var i = 0; i < length; i++) {
        cursor += randomBytes[i];
        result[i] = chars[cursor % charsLength];
    }
    return result.join("");
}
