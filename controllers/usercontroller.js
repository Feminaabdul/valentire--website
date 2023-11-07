const User = require("../models/user")
const bcrypt = require("bcrypt")
const nodemailer = require('nodemailer');
const UserOTPVerification = require('../models/otpmodel');
const products = require("../models/productmodel")
const catagories = require('../models/category');
const address = require('../models/addressmodel');
const async = require("hbs/lib/async");
const isLoggedIn = (req, res,user) => {
    if (req.session.user_id) {
        const user=req.session.user_id
        return true;
    }
    return false;
}

// console.log("yuio");
// console.log("yuio");

const loadHome = async (req, res) => {
    try {
        const product = await products.find({ status: true })
        const user = await User.findById(req.session.user_id)
        const catagory = await catagories.find({})
        res.render('home', { isLoggedIn: isLoggedIn(req, res), product: product, catagory: catagory,user:user })
    } catch (error) {
        console.log(error.message);
    }
}

const loadlogin = async (req, res) => {
    try {
        res.render('login', { isLoggedIn: isLoggedIn(req, res), message: '' })
    } catch (error) {
        console.log(error.message);
    }
}

const loadwish = async (req, res) => {
    try {
        res.render('wishlist', { isLoggedIn: isLoggedIn(req, res) })
    } catch (error) {
        console.log(error.message);
    }
}

const loadshop = async (req, res) => {
    try {
        const user = await User.findById(req.session.user_id)
     
        let product
        if (req.query.material) {
            product = await products.find({ status: true, material: req.query.material })
        } else {
            product = await products.find({ status: true })
        }

        let category
        if (req.query.category) {
         
            product = await products.find({ status: true, category: req.query.category })
        } else {
            category = await catagories.find({})
        }

        if (req.query.filtered) {
            let data = req.body
            console.log(data);
            let min
            let max
            let filterprice = parseInt(data.price)
            if (filterprice === 999) {
                min = 0
                max = 999
            } else if (filterprice === 1000000) {
                min = 1000000
                max = Number.POSITIVE_INFINITY
            } else {
                min = filterprice
                max = filterprice + 9999
            }

            const query = {
                status: true,
            };

            if (!isNaN(min) && !isNaN(max)) {
                query.price = { $gte: min, $lte: max }
            }

            if (data.search) {
                query.$or = [
                    { productname: { $regex: data.search, $options: 'i' } },
                    { description: { $regex: `\\b${data.search}\\b`, $options: 'i' } }
                ];
            }

            if (data.desc === 'true') {
                product = await products.find(query).sort({ price: 1 });
            } else if (data.desc === 'false') {
                product = await products.find(query).sort({ price: -1 });
            } else {
                product = await products.find(query);
            }
        }
        res.render('shop', { isLoggedIn: isLoggedIn(req, res), user, product: product, category: category })
    } catch (error) {
        console.log(error.message);
    }
}
const loadshopdetail = async (req, res) => {
    try {
        res.render('shopdetail', { isLoggedIn: isLoggedIn(req, res) })
    } catch (error) {
        console.log(error.message);
    }
}

const loadregister = async (req, res) => {
    try {
        res.render('register', { isLoggedIn: isLoggedIn(req, res), message: " " })
    } catch (error) {
        console.log(error.message);
    }
}


const sendOtp = async (name, email, userId, otp) => {
    try {
        const transport = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.USER,
                pass: process.env.PASS
            }
        })
        const mailOptions = {
            from: process.env.USER,
            to: email,
            subject: "For user verification",
            html: `<p>Hi ${name}, ${otp} this is your verification otp.</p>`
        }
        transport.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error + "Something went wrong" + email);
            } else {
                console.log("email has been send :- ", info.response, otp);
            }
        })
    } catch (error) {
        console.log(error.message);
    }
}

const postregister = async (req, res) => {
    try {
        const { name, email, mobile, password } = req.body;
        const userdata = await User.findOne({ email: email });
        if (userdata) {
            res.render('register', { isLoggedIn: isLoggedIn(req, res), message: "This email has been already registered." })
        } else {
            const spassword = await secure(password)
            const user = new User({
                name: name,
                email: email,
                mobile: mobile,
                password: spassword,
            })

            const savedata = await user.save();
            if (savedata) {
                const savedUserId = await User.findOne({ email: email });
                let otp = '';
                let digits = '0123456789';
                for (let i = 0; i < 4; i++) {
                    otp += digits[Math.floor(Math.random() * 10)]
                }
                sendOtp(name, email, savedUserId._id, otp);
                const otpdata = await UserOTPVerification.findOne({ userId: savedUserId._id });
                if (otpdata) {
                    await UserOTPVerification.deleteOne({ userId: savedUserId._id });
                    const newOtp = new UserOTPVerification({
                        userId: savedUserId._id,
                        otp: otp
                    });
                    await newOtp.save();
                } else {
                    const newOtp = new UserOTPVerification({
                        userId: savedUserId._id,
                        otp: otp
                    });
                    await newOtp.save();
                }
                res.render('otp', { isLoggedIn: isLoggedIn(req, res), email });
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}

const postotp = async (req, res) => {
    try {
        const otp = req.body.otp;
        const email = req.body.email;
        const userdata = await User.findOne({ email: email });
        const userOtp = await UserOTPVerification.findOne({ userId: userdata._id });

        if (!userOtp) {
            res.render("otp", { isLoggedIn: isLoggedIn(req, res), message: "OTP not found for this user", email: email });
            return;
        }

        const now = new Date();
        if (otp === userOtp.otp && now <= userOtp.expiresAt) {
            await User.updateOne({ email: email }, { $set: { is_verified: 1 } });
            res.redirect("/login");
        } else if (otp !== userOtp.otp) {
            res.render("otp", { isLoggedIn: isLoggedIn(req, res), message: "OTP is incorrect", email: email });
        } else {
            res.render("otp", { isLoggedIn: isLoggedIn(req, res), message: "OTP has expired", email: email });
        }
    } catch (error) {
        console.log(error.message);
    }
}

const secure = async (password) => {
    try {
        const passwordhash = await bcrypt.hash(password, 10)
        return passwordhash
    } catch (error) {
        console.log(error.message);
    }
}

const verifylogin = async (req, res) => {
    try {
        console.log("femina");
        const email = req.body.email
        const password = req.body.password
        const userData = await User.findOne({ email: email })

        if (userData) {
            const passwordmatch = await bcrypt.compare(password, userData.password)
            if (passwordmatch) {
                if (userData.is_verified === 0) {
                    res.render("login", { isLoggedIn: isLoggedIn(req, res), message: 'please verify your mail' })
                } else {
                    req.session.user_id = userData._id
                    res.redirect('/')
                }
            } else {
                res.render("login", { isLoggedIn: isLoggedIn(req, res), message: 'incorrect  password' })
            }
        } else {
            res.render("login", { isLoggedIn: isLoggedIn(req, res), message: 'incorrect email ' })
        }
    } catch (error) {

    }
}



const loadresend = async (req, res) => {
    try {

        const found = await User.findOne({ email: req.query.email });
        let otp = '';
        let digits = '0123456789';
        for (let i = 0; i < 4; i++) {
            otp += digits[Math.floor(Math.random() * 10)]
        }
        console.log("Generated OTP:", otp);
        const otpdata = await UserOTPVerification.findOne({ userId: found._id });
        // if(otpdata){
        await UserOTPVerification.deleteOne({ userId: found._id });
        const newOtp = new UserOTPVerification({
            userId: found._id,
            otp: otp
        });
        await newOtp.save();
        sendOtp(found.name, found.email, found._id, otp)
        res.render("otp", { isLoggedIn: isLoggedIn(req, res), email: found.email })
    } catch (error) {
        console.log(error.message);
    }
}



const loadlogout = async (req, res) => {
    try {
        if (req.session.user_id) {
            req.session.destroy()
            res.redirect('/login');
        } else {
            res.redirect('/');
        }
    } catch (error) {
        console.log(error.message);
    }
}



const loadcheckout = async (req, res) => {
    try {
        const Address = await address.findOne({ user: req.session.user_id, default: true })
        const currentUser = await User.findById(req.session.user_id)
        if (currentUser) {
            await currentUser.populate("cart.product")
            await catagories.find({})
            const cartproducts = currentUser.cart
            const total = currentUser.cart.reduce((total, item) => {
                return total + (item.product.price * item.quantity)
            }, 0)
            console.log(total);

            res.render('checkout', {
                isLoggedIn: isLoggedIn(req, res),
                currentUser,
                cartproducts,
                Address,
                total
            })
        }


    } catch (error) {
        console.log(error.message);
    }
}


const loadprofle = async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.user_id)
        const Address = await address.find({ user: req.session.user_id })


        res.render('profile', {
            isLoggedIn: isLoggedIn(req, res),
            currentUser,
            Address,
        })



    } catch (error) {
        console.log(error.message);
    }
}
const loadaddress = async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.user_id)
        const Address = await address.find({ user: req.session.user_id })


        res.render('AddAddress', {
            isLoggedIn: isLoggedIn(req, res),
            currentUser,
            Address,
        })



    } catch (error) {
        console.log(error.message);
    }
}
const postAddress = async (req, res) => {
    try {

        const Address = await address.find({ user: req.session.user_id })
        if (Address.length < 3) {
            const { state, building, area, city, pincode } = req.body
            console.log(req.body);
            const newAddress = new address({
                user: req.session.user_id,
                pincode,
                state,
                city,
                building,
                area,
                default: (Address.length === 0) ? true : false,
            })
            await newAddress.save();
            res.redirect("/profile");
        } else {
            res.render("AddAddress", {
                isLoggedIn: isLoggedIn(req, res),
                currentUser: await User(req, res),
                error: "Already added 3 addresses.",
                activePage: 'Profile',
                Address
            });
        }

    } catch (error) {
        console.log(error.message);
    }
}
const placeorder = async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.user_id)
        const Address = await address.find({ user: req.session.user_id })


        res.render('placeorder', {
            isLoggedIn: isLoggedIn(req, res),
            currentUser,
            Address,
        })



    } catch (error) {
        console.log(error.message);
    }
}
module.exports = {
    loadHome,
    loadlogin,
    loadwish,
    loadregister,
    postregister,
    postotp,
    verifylogin,
    loadshop,
    loadshopdetail,
    loadresend,
    loadlogout,
    loadcheckout
    , loadprofle,
    loadaddress,
    postAddress,
    placeorder
}