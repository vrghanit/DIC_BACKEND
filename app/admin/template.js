const client = require('../../config/connection');
var template = require('../../schema/template');
var fs = require('fs');
var formidable = require('formidable');
const config = require('../../config/default');
var multiparty = require('multiparty');
const { ObjectId } = require('mongodb');

var crypto = require('crypto');
const { color } = require('jimp');
var date = new Date();

const success = true;
const fail = false;

// exports.addTemplate = function (req, res) {
//     var form = new formidable.IncomingForm();
//     form.parse(req, function (err, fields, files) {
//         var fileName = randomAsciiString(20) + '.png'; // + files.serviceImage.type.split("/")[1];
//         var oldpath = filesImage.path;
//         var newpath = 'uploads/templates/' + fileName
//         fs.rename(oldpath, newpath, function (err) {
//             if (err) {
//                 res.json({
//                     "status": fail,
//                     'message': 'Select another template image',
//                     "data": {},
//                 });
//                 res.end();
//             } else {
//                 let insertData = new template({
//                     templateImage: fileName,
//                     color: fields.color
//                 })
//                 insertData.save(function (err, result) {
//                     if (err) {
//                         res.json({
//                             "status": fail,
//                             'message': 'Try again later.',
//                             "data": {},
//                         });
//                     } else {
//                         res.json({
//                             "status": success,
//                             'message': 'Template Uploaded sucessfully. ',
//                             "data": {},
//                         });
//                     }
//                 })
//             }
//         })
//     })
// }

exports.addTemplate = function (req, res) {
    var form = new multiparty.Form();
    let imageArray = []

    form.parse(req, function (err, fields, files) {
        var imgArray = files.imatges;
        for (var i = 0; i < imgArray.length; i++) {
            var newPath = 'uploads/multiples/';
            var singleImg = imgArray[i];
            newPath += singleImg.originalFilename;
            readAndWriteFile(singleImg, newPath);
            imageArray.push(newPath)
        }
        var data = [];
        imageArray.forEach((e, i) => {
            data.push({
                image: imageArray[i],
                color: fields.color[i],
                textColor: fields.textColor[i],
                layout: fields.layout,
                titleColor: fields.titleColor[i],
                iconColor: fields.iconColor[i],
                fieldsColor: fields.fieldsColor[i],
                headingColor: fields.headingColor[i]
            })
        })
        let insertData = new template({
            template: data,
        })
        insertData.save(function (err, result) {
            if (err) {
                res.json({
                    "status": fail,
                    'message': 'Try again later.',
                    "data": {},
                });
            } else {
                res.json({
                    "status": success,
                    'message': 'Template Uploaded sucessfully. ',
                    "data": result,
                });
            }
        })


    });
    function readAndWriteFile(singleImg, newPath) {
        fs.readFile(singleImg.path, function (err, data) {
            fs.writeFile(newPath, data, function (err) {
                if (err) { console.log('ERRRRRR!! :' + err); }
            })
        })
    }

}


exports.getTemplate = function (req, res) {
    template.find().exec(function (err, result) {
        if (err) {
            res.json({
                "status": fail,
                'message': 'Try again later.',
                "data": {},
            });
        } else {
            res.json({
                "status": success,
                'message': 'Available templates. ',
                "data": result,
            });
        }
    })
}

exports.deletTemplate = function (req, res) {
    const query = req.query.id
    template.deleteOne({ _id: query }).exec(function (err, result) {
        if (err) {
            res.json({
                "status": fail,
                'message': 'Try again later.',
                "data": {},
            });
        } else {
            res.json({
                "status": success,
                'message': 'Template deleted.',
                "data": {},
            });
        }
    })

}

exports.updateTemplate = function (req, res) {
    const query = req.query.id
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        if ((files.image) && (files.image.name != '')) {
            var fileName = randomAsciiString(20) + '.png'; // + files.serviceImage.type.split("/")[1];
            var oldpath = files.image.path;
            var newPath = 'uploads/templates/' + fileName
            // readAndWriteFile(singleImg, newPath);
            fs.rename(oldpath, newPath, function (err) {
                if (err) {
                    res.json({
                        "status": fail,
                        'message': 'Try again later.',
                        "data": {},
                    });
                } else {
                    template.findOne({ _id: query }).exec((err, resutu) => {
                        var index = resutu.template.findIndex(element => element.color === fields.color)
                        let json = resutu.template[index]
                        if (files.image) {
                            json.image = newPath
                        }
                        if (fields.color) {
                            json.color = fields.color
                        }
                        if (fields.textColor) {
                            json.textColor = fields.textColor
                        }
                        if (fields.layout) {
                            json.layout = fields.layout
                        }
                        if (fields.titleColor) {
                            json.titleColor = fields.titleColor
                        }
                        if (fields.iconColor) {
                            json.iconColor = fields.iconColor
                        }
                        if (fields.fieldsColor) {
                            json.fieldsColor = fields.fieldsColor
                        }
                        if (fields.headingColor) {
                            json.headingColor = fields.headingColor
                        }
                        resutu.template.splice(index, 1, json)

                        template.updateOne({ _id: query, "template.color": fields.color }, resutu).exec(function (err, result) {
                            if (err) {
                                res.json({
                                    "status": fail,
                                    'message': 'try later',
                                    "data": '',
                                });
                            } else {
                                res.json({
                                    "status": success,
                                    'message': 'Template Uploaded sucessfully. ',
                                    "data": result,
                                });
                            }
                        })
                    })


                }
            })
        } else {

            template.findOne({ _id: query }).exec((err, resutu) => {
                var index = resutu.template.findIndex(element => element.color === fields.color)
                let json = resutu.template[index]
                if (fields.color) {
                    json.color = fields.color
                }
                if (fields.textColor) {
                    json.textColor = fields.textColor
                }
                if (fields.layout) {
                    json.layout = fields.layout
                }
                if (fields.titleColor) {
                    json.titleColor = fields.titleColor
                }
                if (fields.iconColor) {
                    json.iconColor = fields.iconColor
                }
                if (fields.fieldsColor) {
                    json.fieldsColor = fields.fieldsColor
                }
                if (fields.headingColor) {
                    json.headingColor = fields.headingColor
                }
                resutu.template.splice(index, 1, json)

                template.updateOne({ _id: query, "template.color": fields.color }, resutu).exec(function (err, result) {
                    if (err) {
                        res.json({
                            "status": fail,
                            'message': 'try later',
                            "data": '',
                        });
                    } else {
                        res.json({
                            "status": success,
                            'message': 'Template Uploaded sucessfully. ',
                            "data": result,
                        });
                    }
                })
            })

        }
    })

}

exports.removeColor = function (req, res) {
    const query = req.query.id
    const postData = req.body
    template.findOne({ _id: query }).exec((err, result) => {
        if (err) {
            res.json({
                "status": fail,
                'message': 'Try again later.',
                "data": {},
            });
        } else {
            if (result) {
                var index = result.findIndex(element => element.color === postData.color)
                var removeIndex = result.map(function (item) { return item.id; }).indexOf(index);
                // remove object
                result.splice(removeIndex, 1);
                template.updateOne({ _id: query }, { template: result }).
                    exec(function (err, result) {
                        if (err) {
                            res.json({
                                "status": fail,
                                'message': 'Try again later.',
                                "data": {},
                            });
                        } else {
                            res.json({
                                "status": success,
                                'message': 'Template removed sucessfully. ',
                                "data": result,
                            });
                        }
                    })
            }
        }
    })

    // template.updateOne({ _id: query }, { $pull: { templates: { color: postData.color, textColor: postData.textColor } } }, { multi: true }
    // ).exec(function (err, result) {
    //     if (err) {
    //         res.json({
    //             "status": fail,
    //             'message': 'Try again later.',
    //             "data": {},
    //         });
    //     } else {
    //         res.json({
    //             "status": success,
    //             'message': 'Template removed sucessfully. ',
    //             "data": result,
    //         });
    //     }
    // })


}


exports.addColor = function (req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var fileName = randomAsciiString(20) + '.' + files.image.type.split('/')[1];
        var oldpath = files.image.path;
        var newpath = 'uploads/multiples/' + fileName
        fs.rename(oldpath, newpath, function (err) {
            if (err) {
                res.json({
                    "status": fail,
                    'message': 'Select another template image',
                    "data": {},
                });
                res.end();
            } else {
                let insertData = {
                    image: newpath,
                    color: fields.color,
                    textColor: fields.textColor,
                    layout: fields.layout,
                    titleColor: fields.titleColor,
                    iconColor: fields.iconColor,
                    fieldsColor: fields.fieldsColor,
                    headingColor: fields.headingColor,
                }
                template.updateOne({ _id: ObjectId(fields.id) }, { $push: { template: insertData } }).exec((err, result) => {
                    if (err) {
                        res.json({
                            "status": fail,
                            'message': 'try again later',
                        });
                    } else {
                        res.json({
                            "status": success,
                            'message': 'uploaded',
                            data: result
                        });
                    }
                })


            }
        })
    })
}
exports.addNewTemplate = function (req, res) {
    const query = req.query.id
    var form = new multiparty.Form();
    let imageArray = []
    form.parse(req, function (err, fields, files) {
        var imgArray = files.imatges;
        for (var i = 0; i < imgArray.length; i++) {
            var newPath = 'uploads/multiples/';
            var singleImg = imgArray[i];
            newPath += singleImg.originalFilename;
            readAndWriteFile(singleImg, newPath);
            imageArray.push(newPath)
        }
        var data = { image: '', color: '', textColor: '', layout: '', titleColor: '', iconColor: '', fieldsColor: '', headingColor: '' };
        imageArray.forEach((e, i) => {
            data.image = imageArray[i],
                data.color = fields.color[i],
                data.textColor = fields.textColor[i],
                data.layout = fields.layout,
                data.titleColor = fields.titleColor[i],
                data.iconColor = fields.iconColor[i],
                data.fieldsColor = fields.fieldsColor[i],
                data.headingColor = fields.headingColor[i]
        })

        template.updateOne({ _id: query }, {
            $push: {
                template:
                    data

            }
        }, function (err, result) {
            if (err) {
                res.json({
                    "status": fail,
                    'message': 'Try again later.',
                    "data": {},
                });
            } else {
                res.json({
                    "status": success,
                    'message': 'Template Uploaded sucessfully. ',
                    "data": result,
                });
            }
        })


    });
    function readAndWriteFile(singleImg, newPath) {
        fs.readFile(singleImg.path, function (err, data) {
            fs.writeFile(newPath, data, function (err) {
                if (err) { console.log('ERRRRRR!! :' + err); }
            })
        })
    }

}

exports.removeOneColor = function (req, res) {
    let postData = req.body
    template.findOne({ _id: postData.id, 'template.color': postData.color }).exec((err, result) => {
        if (err) {
            res.json({
                status: fail,
                message: 'try again later'
            })
        } else {
            if (result) {
                let newArray = []
                result.template.forEach(element => {
                    if (element.color != postData.color) {
                        newArray.push(element)
                        console.log(newArray.length === result.template.length - 1);
                        if (newArray.length === result.template.length - 1) {
                            template.updateOne({ _id: postData.id }, { template: newArray }).exec((err, results) => {
                                if (err) {
                                    res.json({
                                        status: fail,
                                        message: 'try again later'
                                    })
                                } else {
                                    res.json({
                                        status: success,
                                        data: results
                                    })
                                }
                            })
                        }
                    }
                });
            } else {
                res.json({
                    status: success,
                    message: 'No template found with this color.',
                    data: result
                })
            }

        }
    })
}


function arrayRemove(arr, value) {
    return arr.filter(function (ele) {
        return ele != value;
    });
}


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

