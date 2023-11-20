const express = require('express');
const userroute = express();

const auth = require("../middleware/auth")

const usercontroller = require('../controllers/usercontroller');
const cartcontroller = require("../controllers/cartcontroller")
userroute.set('view engine', 'ejs');
userroute.set('views', './views/user')

userroute.use(express.static('public/Users'))

userroute.get('/',auth.checkToBlock, usercontroller.loadHome)
userroute.get('/login', auth.isLogout, usercontroller.loadlogin)
userroute.get('/wishlist',auth.checkToBlock, auth.isLogin, usercontroller.loadwish)
userroute.route('/shop',auth.checkToBlock, auth.isLogin)
    .get(usercontroller.loadshop) // Handle GET requests to /shop
    .post(usercontroller.loadshop); // Handle POST requests to /shop

userroute.get('/shopdetail/:id',auth.checkToBlock, usercontroller.loadshopdetail)
userroute.get('/forget-password', usercontroller.loadpassword)
userroute.post('/forget-password', usercontroller.forgetverify)
userroute.get('/reset-password', usercontroller.lodreset)
userroute.post('/reset-password', usercontroller.postreset)

userroute.get('/cart',auth.checkToBlock, auth.isLogin, cartcontroller.loadcart)
userroute.get('/wishlist', auth.checkToBlock,auth.isLogin, usercontroller.loadwish)
userroute.post('/update-cart/:id',auth.checkToBlock, auth.isLogin, cartcontroller.updateCart)
userroute.get('/remove-from-cart/:id',auth.checkToBlock, auth.isLogin, cartcontroller.removeProduct)
userroute.get('/remove-from-wish/:id',auth.checkToBlock, auth.isLogin, usercontroller.removewish)
userroute.get('/register', auth.isLogout, usercontroller.loadregister)
userroute.get('/resend', usercontroller.loadresend)
userroute.get('/logout', usercontroller.loadlogout)
userroute.get('/addcart',auth.checkToBlock, auth.isLogin, cartcontroller.loadcartpost)
userroute.post('/add-cart',auth.checkToBlock, auth.isLogin, usercontroller.cartpost)

userroute.get('/add-to-wishlist', auth.checkToBlock,auth.isLogin, usercontroller.loadpost)
userroute.get('/checkout',auth.checkToBlock,auth.isLogin, usercontroller.loadcheckout)
userroute.get('/profile',auth.checkToBlock,auth.isLogin, usercontroller.loadprofle)
userroute.post('/profile-update',auth.checkToBlock,auth.isLogin ,usercontroller.postprofile)
userroute.get('/AddAddress',auth.checkToBlock,auth.isLogin, usercontroller.loadaddress)

userroute.post('/AddAddress',auth.checkToBlock,auth.isLogin, usercontroller.postAddress)

userroute.get('/ordersuccess', auth.checkToBlock, auth.isLogin, usercontroller.orderSuccess);

userroute.get('/placeorder',auth.checkToBlock,auth.isLogin, usercontroller.lodplaceorder)
userroute.post('/placeorder',auth.checkToBlock,auth.isLogin, usercontroller.placeorder)

userroute.post("/save-rzporder", auth.checkToBlock,auth.isLogin,usercontroller.saveRzpOrder);



userroute.post('/register', usercontroller.postregister);
userroute.post('/otp', usercontroller.postotp);
userroute.post('/login', auth.isLogout, usercontroller.verifylogin);

module.exports = userroute;