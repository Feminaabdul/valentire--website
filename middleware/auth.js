const User = require("../models/user")

const isLogin = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            next()
        } else {
            res.redirect("/")
        }
    } catch (error) {
        console.log(error.message);

    }
}

const isLogout = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            return res.redirect("/")
        }
        next()
    } catch (error) {
        console.log(error.message);
    }
}
 const checkToBlock = async (req, res, next) => {
    const currentUser = await User.findById(req.session.user_id);
    if (currentUser && currentUser.block === true) {
        req.session.user_id = null;
    }
    next();
};
module.exports = {
    isLogin,
    isLogout,
    checkToBlock
}