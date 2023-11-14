const User = require("../models/user")
const bcrypt = require("bcrypt")
const nodemailer = require('nodemailer');
const mongoose = require('mongoose')
const randomstring = require("randomstring")
const UserOTPVerification = require('../models/otpmodel');
const products = require("../models/productmodel")
const catagories = require('../models/category');
const address = require('../models/addressmodel');
const Order = require("../models/order")
const isLoggedIn = (req, res, user) => {
    if (req.session.user_id) {
        const user = req.session.user_id
        return true;
    }
    return false;
}


const loadHome = async (req, res) => {
    try {
        const product = await products.find({ status: true })
        const user = await User.findById(req.session.user_id)
        const catagory = await catagories.find({})
        res.render('home', { isLoggedIn: isLoggedIn(req, res), product: product, catagory: catagory, user: user })
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

            if (data.search||"") {
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
        const user = await User.findById(req.session.user_id)
        const product = await products.findById(req.params.id)
     
        res.render('shopdetail', { isLoggedIn: isLoggedIn(req, res), user, product })
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

const sendreset = async (name, email, token) => {
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
            subject: "for reset password",
            html: `<p>Hi ${name},please click here to <a href="http://localhost:3000/reset-password?token=${token}">Reset </a> your password.</p>'
        `
        }
        transport.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error + "Something went wrong" + email);
            } else {
                console.log("email has been send :- ", info.response);
            }
        })
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

        const Address1 = await address.find({ user: req.session.user_id, default: false })

        const currentUser = await User.findById(req.session.user_id)
        const user = req.session.user_id
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
                Address1,
                total,
                user
            })
        }


    } catch (error) {
        console.log(error.message);
    }
}


const loadprofle = async (req, res) => {
    try {

        const user = req.session.user_id
        const currentUser = await User.findById(req.session.user_id)
        const Address = await address.find({ user: req.session.user_id }).populate("user");


        res.render('profile', {
            isLoggedIn: isLoggedIn(req, res),
            currentUser,
            Address,
            user
        })



    } catch (error) {
        console.log(error.message);
    }
}
const postprofile = async (req, res) => {
    const user = req.session.user_id
    const currentUser = await User.findById(user)
    await address.find({ user })
    const { name, email, phone } = req.body;
    currentUser.name = name;
    currentUser.email = email;
    currentUser.phone = phone;
    await currentUser.save()
    res.redirect("/profile");
}

const loadaddress = async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.user_id)
        const Address = await address.find({ user: req.session.user_id })
        const user = req.session.user_id

        res.render('AddAddress', {
            isLoggedIn: isLoggedIn(req, res),
            currentUser,
            Address,
            user
        })



    } catch (error) {
        console.log(error.message);
    }
}
const postAddress = async (req, res) => {
    try {
        const Address = await address.find({ user: req.session.user_id })
        if (Address.length < 3) {
            const { name, state, building, area, city, pincode } = req.body;
            const newAddress = new address({
                user: req.session.user_id,
                name,
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
const updateOrderStatus = async (req, res, next) => {
    try {
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        // Update orders from Processing to Shipped after two days
        await Order.updateMany(
            {
                status: 'Processing',
                date: { $lte: twoDaysAgo },
            },
            { $set: { status: 'Shipped' } }
        );
    } catch (error) {
        next(error);
    }
};
const lodplaceorder = async (req, res) => {
    try {
        await updateOrderStatus();
        const currentUser = await User.findById(req.session.user_id).populate("cart.product")
        const Delivery = await address.findOne({ user: req.session.user_id, default: true })
        const addorder = await Order.find({ user: req.session.user_id })
            .populate([
                { path: 'user', model: 'User' },
                { path: 'Address', model: 'Address' },
                { path: 'products.productId', model: 'product' }
            ]);
console.log("sdfgstfhd",addorder);
       
        const user = req.session.user_id
       
        res.render('placeorder', {
            isLoggedIn: isLoggedIn(req, res),
            currentUser,
            Delivery,
            user,
            addorder
        })
    } catch (error) {
        console.log(error.message);
    }
}

const placeorder = async (req, res) => {
    try {
        const paymentMethod = req.body.paymentMethod
        const user = req.session.user_id
        const currentUser = await User.findById(req.session.user_id).populate("cart.product")
        const Delivery = await address.findOne({ user: req.session.user_id, default: true })

        const grandTotal = currentUser.cart.reduce((total, element) => {
            return total + (element.quantity * element.product.price);
        }, 0);

        const orderedProducts = currentUser.cart.map((item) => {

            return {
                productId: item.product._id,
                quantity: item.quantity,
                productPrice: item.product.price

            }
        });

        const newpro = new Order({
            user: user,
            paymentMethod: paymentMethod,
            Address: Delivery,
            products: orderedProducts,
            totalAmount: grandTotal + 10,
           

        })

        await newpro.save();


        // // stock update
        currentUser.cart.forEach(async (item) => {
            const foundProduct = await products.findById(item.product._id);
            foundProduct.stockquantity -= item.stockquantity;
            await foundProduct.save();

           
        });

        res.redirect('/placeorder')
    } catch (error) {
        console.log(error.message);
    }
}

//forgetpassword//
const loadpassword = async (req, res) => {
    try {
        const user = req.session.user_id
        res.render('forget', { isLoggedIn: isLoggedIn(req, res), message: '', user })
    } catch (error) {
        console.log(error.message);
    }
}
const forgetverify = async (req, res) => {

    try {
        const email = req.body.email
        const userData = await User.findOne({ email: email })
        console.log(userData);
        if (userData) {

            if (userData.is_verified === 0) {
                res.render('reset', { message: "please verify your mail." })
            } else {
                const randomString = randomstring.generate()
                const updatedData = await User.updateOne({ email: email }, { $set: { token: randomString } })
                
                sendreset(userData.name, userData.email, randomString)
                res.render('forget', { message: "check mail to reset password" })
            }
        } else {
            res.render('forget', { message: "user email is incorrect" })
        }
    } catch (error) {
        console.log(error.message);
    }
}


const lodreset = async (req, res) => {
    try {
        const user = req.session.user_id
        const token = req.query.token

        const userData = await User.findOne({ token })

        const tokenOg = userData.token

        if (token == tokenOg) {
            res.render("reset", { user_id: userData._id })
        } else {
            res.render("404", { message: "token is invalid" })
        }
    } catch (error) {
        console.log(error.message);
    }
}
const postreset = async (req, res) => {
    try {
        const password = req.body.password
        const user_id = req.body.user_id
        const secure_password = await secure(password)
        const updatedData = await User.findByIdAndUpdate({ _id: user_id }, { $set: { password: secure_password, token: "" } })
        res.redirect("/login")
    } catch (error) {
        console.log(error.message);
    }
}
const loadwish = async (req, res) => {
  
    try {
        const user = req.session.user_id
        const wis=await User.findById(req.session.user_id).populate("wishlist.product")
        console.log("axSAX",wis);
    
        res.render('wishlist', { isLoggedIn: isLoggedIn(req, res) ,wis,user})
    } catch (error) {
        console.log(error.message);
    }
}
const loadpost = async (req, res) => {
    try {
        const user = req.session.user_id
    if (req.query.product) {
        const currentProduct = await products.findById(req.query.product);
        const currentUser = await User.findById(req.session.user_id);
         // Check if the product is already in the wishlist
         const existingItemIndex = currentUser.wishlist.findIndex(item => item.product.toString() === req.query.product);
            
         if (existingItemIndex !== -1) {
             // Product is already in the wishlist, remove it
            //  currentUser.wishlist.splice(existingItemIndex, 1);
         } else {
             // Product is not in the wishlist, add it
             let newItem = {
                 product: req.query.product,
                 total: currentProduct.price
             };
             currentUser.wishlist.push(newItem);
         }

         await currentUser.save();
         res.redirect('wishlist');
     }
 } catch (error) {
    console.log(error.message);
}
}


const removewish = async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.user_id);
        const existingItemIndex = currentUser.wishlist.findIndex(item => item.product.toString() === req.query.product);
   
      
       
        currentUser.wishlist.splice(existingItemIndex, 1);
        await currentUser.save();

        res.redirect("/wishlist");
    } catch (error) {
        console.log(error.message);
    }
};

const cartpost = async (req, res) => {
    try {
        const productId = req.body.productId;
        if (productId) {
            const currentUser = await User.findById(req.session.user_id);

            // Check if the product is already in the cart
            const isProductInCart = currentUser.cart.some(item => item.product.toString() === productId);

            if (!isProductInCart) {
                const currentProduct = await products.findById(productId);
                let newCartItem = {
                    product: productId,
                    total: currentProduct.price
                };
                currentUser.cart.push(newCartItem);
                await currentUser.save();
            }

            res.redirect('cart');
        }
    } catch (error) {
        console.log(error.message);
    }
};



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
    placeorder,
    postprofile,
    loadpassword,
    forgetverify,
    lodreset,
    lodplaceorder
    , postreset,
    loadpost,
    removewish,
    cartpost
}