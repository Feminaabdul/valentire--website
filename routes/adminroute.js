const express = require('express');
const adminroute = express();
const cron = require('node-cron')
const adminauth = require('../middleware/adminauth');
const admincontroller = require('../controllers/admincontroller');
const productcontroller = require('../controllers/productcontroller');
const categorycontroller = require('../controllers/categorycontroller');
const offer=require("../controllers/Offercontroller")

const { upload } = require('../Config/multer');

adminroute.set('view engine', 'ejs');
adminroute.set('views', './views/admin')

adminroute.use(express.static('public/Admins'))

adminroute.get("/dashboard", adminauth.isadminLogin, admincontroller.loaddashboard)
adminroute.get("/users", adminauth.isadminLogin, admincontroller.loadusers)
adminroute.get("/order", adminauth.isadminLogin,admincontroller.loadorder)
adminroute.get("/addCatagory", adminauth.isadminLogin, categorycontroller.loadcatagory)
adminroute.get("/listCategory", adminauth.isadminLogin, categorycontroller.listCategory)
adminroute.get("/product", adminauth.isadminLogin, productcontroller.loadproduct)
adminroute.get("/offer", adminauth.isadminLogin, offer.loadoffer)
adminroute.get("/addoffer", adminauth.isadminLogin, offer.addoffer)
adminroute.get("/addproduct", adminauth.isadminLogin, productcontroller.loadAddproduct)
adminroute.get("/", adminauth.isadminLogout, admincontroller.loadlogin);
adminroute.get("/blockuser", adminauth.isadminLogin, admincontroller.blockuser)
adminroute.get("/unblockuser", adminauth.isadminLogin, admincontroller.unblockuser)

adminroute.get("/listproduct", adminauth.isadminLogin, productcontroller.listproduct)
adminroute.get("/unlistproduct", adminauth.isadminLogin, productcontroller.unlistproduct)

adminroute.get("/unlistoffer", adminauth.isadminLogin, offer.unlistoffer)
adminroute.get("/listbro", adminauth.isadminLogin, offer.listbro)



adminroute.get("/unlistcategory", adminauth.isadminLogin, categorycontroller.unlistcategory)
adminroute.get("/listcategorybutton", adminauth.isadminLogin, categorycontroller.listcategorybutton)

adminroute.get("/Editproduct", adminauth.isadminLogin, productcontroller.Editproduct)
adminroute.get("/editoffer", adminauth.isadminLogin, offer.editoffer)
adminroute.get("/Editcategory", adminauth.isadminLogin, categorycontroller.Editcategory)

adminroute.get('/logout', adminauth.isadminLogin, admincontroller.loadLogout);

// adminroute.get("*",function(req,res){
//     res.redirect('/admin')
// })

adminroute.post("/", admincontroller.postlogin);
adminroute.post("/addCatagory", categorycontroller.postAddCategory)
adminroute.post("/addoffer", offer.postAddOffer)


adminroute.post("/addproduct", upload.array("image", 10), productcontroller.postAddProduct)
adminroute.post("/Editcategory", categorycontroller.postEdit)



adminroute.post("/Editproduct", upload.array("image", 10), productcontroller.postEditProduct)
adminroute.post("/editoffer",offer.posteditoffer)

//TRIGGER CHECK THE OFFER EXPIRY AND DELETE IT AT evey 12am and 12 pm
cron.schedule('0 */12 * * *', () => {
    try { console.log("yjth");
        OfferChecknandDelete();
    } catch (error) {
        console.error('Cron Job Error:', error);
    }
});
module.exports = adminroute