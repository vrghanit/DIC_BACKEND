const validator = require('./validate');

const registration = (req, res, next) => {
    var validationRule = {};
    if(req.body.socialId){
        validationRule = {
            "socialId": "required",
            "socialType": "required",
            "deviceType": "required",
        }
    }else{
        validationRule = {
            "name": "required",
            "email": "required|email",
            "password": "required|min:6",
            // "deviceType": "required",
            // "deviceToken": "required",
           // "fireabaseToken": "required",
        }
    }
    call_validator(req, res, next, validationRule);
}

const login = (req, res, next) => {
    const validationRule = {
        "email": "required|email",
        "password": "required|min:6",
        // "deviceType": "required",
        // "deviceToken": "required",
        // "fireabaseToken": "required",

    }
    call_validator(req, res, next, validationRule);
}


function call_validator(req, res, next, validationRule) {
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.status(412).send({
                success: false,
                message: 'Validation failed',
                data: err
            });
        } else {
            next();
        }
    });
}



module.exports = { 
  registration,
  login,

}
