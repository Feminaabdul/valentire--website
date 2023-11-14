const async = require('hbs/lib/async');
const User = require('../models/user')
const bcrypt = require("bcrypt")
const Order = require("../models/order")
const loaddashboard = async (req, res) => {
    try {
        res.render('dashboard')

    } catch (error) {
        console.log(error.message);
    }
}

const loadusers = async (req, res) => {
    try {
        const userdata = await User.find({ is_admin: 0 })
        res.render("users", { users: userdata })
    } catch (error) {
        console.log(error.message);

    }
}



const loadlogin = async (req,res)=>{
    try{
        if(req.session.admin_id){
            res.redirect('/admin/dashboard')
        }else{
            res.render('login');
        }
    }catch(error){  
        console.log(error.message);
    }
}

const postlogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const admindata = await User.findOne({ email: email, is_admin: 1 });
        if (admindata) {
            const passwordmatch = await bcrypt.compare(password, admindata.password)
            if (passwordmatch) {
                req.session.admin_id = admindata._id
                res.redirect('/admin/dashboard')
            } else {
                res.render("login", { message: 'incorrect password' })
            }
        } else {
            res.render("login", { message: 'incorrect email' })
        }
    } catch (error) {
        console.log(error.message);
    }
}

const blockuser = async (req,res) => {
    try {
        const id = req.query.id;
        const updatedata = await User.updateOne({_id:id},{$set:{block:true, status: true}});
        const users = await User.find({is_admin:0})
        res.render('users',{users:users})
    } catch (error) {
        console.log(error.message);
    }
}

const unblockuser = async (req,res) => {
    try {
        const id = req.query.id;
        const updatedata = await User.updateOne({_id:id},{$set:{block:false, status: false}});
        const users = await User.find({is_admin:0})
        res.render('users',{users:users})
    } catch (error) {
        console.log(error.message);
    }
}



const loadLogout = async (req,res)=>{
    try{
        if(req.session.admin_id){
            req.session.admin_id = false;
            res.redirect('/admin');
        }else{
            res.redirect('/admin');
        }
    }catch(error){
        console.log(error.message);
    }
}
const loadorder = async (req, res) => {
    try {
          await updateOrderStatus();
        const odd = await Order.find({ user: req.session.user_id })
            .populate([
                { path: 'user', model: 'User' },
                { path: 'Address', model: 'Address' },
                { path: 'products.productId', model: 'product' }
            ]);

        console.log("Orders: ", odd);
        res.render('order', { odd });
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
module.exports = {
    loaddashboard,
    loadusers,
    
    loadlogin,
    postlogin,
    blockuser,
    unblockuser,
    loadLogout,
    loadorder
}