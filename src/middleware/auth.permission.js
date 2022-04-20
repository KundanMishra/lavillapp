const ADMIN_PERMISSION = require('../configs/env').permissionLevels.ADMIN;
const SUPER_ADMIN_PERMISSION = require('../configs/env').permissionLevels.SUPER_ADMIN;

exports.minimumPermissionLevelRequired = (required_permission_level) => {
    return (req, res, next) => {
        let user_permission_level = parseInt(req.jwt.permissionLevel);
        let userId = req.jwt.userId;
        if (user_permission_level >= required_permission_level) { 
            return next();
        } else { 
            return res.status(403).send({ "message": "Sorry you didn't have enough permission to do this..." });
        }
    };
};

exports.onlySameUserOrAdminCanDoThisAction = (req, res, next) => {
    console.log("params",req.params)
    if(req.body.guestUser){
        return next();
    }
    let user_permission_level = parseInt(req.jwt.permissionLevel);
    let userId = req.jwt.userId;
    // console.log("token user id",userId)
    if (req.params && req.params.userId && userId === Number(req.params.userId)) {
        return next();
    } else if(req.body && req.body.userId && userId === Number(req.body.userId)) {
        // console.log("inside body")
        return next();
    }
    else {
        if ((user_permission_level == ADMIN_PERMISSION )|| (user_permission_level == SUPER_ADMIN_PERMISSION)) {
            return next();
        } else {
            console.log('onlySameUserOrAdminCanDoThisAction');
            return res.status(403).send({ "message": "Sorry you didn't have enough permission to do this..." });
        }
    }

};

exports.onlySuperAdminCanDoThisAction = (req, res, next) => { 
    let user_permission_level = parseInt(req.jwt.permissionLevel); 
    if (user_permission_level & SUPER_ADMIN_PERMISSION) {
        return next();
    } else {
        console.log('onlySuperAdminCanDoThisAction');
        return res.status(403).send({ "message": "Sorry you didn't have enough permission to do this..." });
    }
};
