const express = require('express');
const userroute = express();

const auth = require("../middleware/auth")

const usercontroller = require('../controllers/usercontroller');
const cartcontroller = require("../controllers/cartcontroller")
userroute.set('view engine', 'ejs');
userroute.set('views', './views/user')

userroute.use(express.static('public/Users'))

userroute.get('/', usercontroller.loadHome)
userroute.get('/login', auth.isLogout, usercontroller.loadlogin)
userroute.get('/wishlist', auth.isLogin, usercontroller.loadwish)
userroute.route('/shop', auth.isLogin)
    .get(usercontroller.loadshop) // Handle GET requests to /shop
    .post(usercontroller.loadshop); // Handle POST requests to /shop

userroute.get('/shopdetail', usercontroller.loadshopdetail)
userroute.get('/cart', auth.isLogin, cartcontroller.loadcart)
userroute.post('/update-cart/:id', auth.isLogin, cartcontroller.updateCart)
userroute.get('/remove-from-cart/:id', auth.isLogin, cartcontroller.removeProduct)
userroute.get('/register', auth.isLogout, usercontroller.loadregister)
userroute.get('/resend', usercontroller.loadresend)
userroute.get('/logout', usercontroller.loadlogout)
userroute.get('/addcart', auth.isLogin, cartcontroller.loadcartpost)
userroute.get('/checkout',auth.isLogin, usercontroller.loadcheckout)
userroute.get('/profile',auth.isLogin, usercontroller.loadprofle)
userroute.get('/AddAddress',auth.isLogin, usercontroller.loadaddress)
userroute.post('/AddAddress',auth.isLogin, usercontroller.postAddress)
userroute.post('/placeorder',auth.isLogin, usercontroller.placeorder)

userroute.post('/register', usercontroller.postregister);
userroute.post('/otp', usercontroller.postotp);
userroute.post('/login', auth.isLogout, usercontroller.verifylogin);

module.exports = userroute;