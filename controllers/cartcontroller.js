const User = require("../models/user")
const bcrypt = require("bcrypt")
const nodemailer = require('nodemailer');
const UserOTPVerification = require('../models/otpmodel');
const products = require("../models/productmodel")
const catagories = require('../models/category');
const async = require("hbs/lib/async");
const { default: mongoose } = require("mongoose");
const isLoggedIn = (req, res) => {
    if (req.session.user_id) {
        return true;
    }
    return false;
}

const loadcart = async (req, res) => {
    try {
        const cus = await User.findById(req.session.user_id).populate("cart.product")

        const total = cus.cart.reduce((total, item) => {
            total + item.total
        }, 0)
        res.render('cart', { isLoggedIn: isLoggedIn(req, res), cus, total })
    } catch (error) {
        console.log(error.message);
    }
}

const loadcartpost = async (req, res) => {
    try {
        if (req.query.product) {
            const currentProduct = await products.findById(req.query.product);
            const currentUser = await User.findById(req.session.user_id);
            let newCartItem = {
                product: req.query.product,
                total: currentProduct.price
            }
            currentUser.cart.push(newCartItem);
            await currentUser.save();
            res.redirect('shop')
        }
    } catch (error) {
        console.log(error.message);
    }
};

const updateCart = async (req, res, next) => {
    try {
        console.log(req.body+"this is my body");
        const currentUser = await User.findById(req.session.user_id);
        console.log(currentUser);
        const cartItem = currentUser.cart.find(item => item.product.equals(new mongoose.Types.ObjectId(req.params.id)));
        if (cartItem) {
            const product = await products.findById({_id: cartItem.product});
            if (req.body.type === "increment") {
                if ((cartItem.quantity + 1) > product.stockquantity) {
                    // to fix
                    return res.status(400).json({ message: "Insufficient stock." });
                } else {
                    cartItem.quantity++;
                }
            } else {
                if (cartItem.quantity !== 1) {
                    cartItem.quantity--;
                }
            }
            let insufficientStock = false;
            if (product.stockquantity < cartItem.quantity) {
                insufficientStock = true
            }
            await currentUser.populate('cart.product');
            const grandTotal = currentUser.cart.reduce((total, element) => {
                return total + (element.quantity * element.product.price);
            }, 0);
            await currentUser.save();
            return res.status(200).json({
                message: "Success",
                quantity: cartItem.quantity,
                totalPrice: product.price * cartItem.quantity,
                grandTotal,
                insufficientStock,
            });
        } else {
            return res.status(404).json({ message: "Product not found in the user's cart." });
        }
    } catch (error) {
        next(error)
    }
};

const removeProduct = async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.user_id);
        const cartItemIndex = currentUser.cart.findIndex(item => item.product.toString() === req.params.id);
        currentUser.cart.splice(cartItemIndex, 1);
        await currentUser.save();

        res.redirect("/cart");
    } catch (error) {
        console.log(error.message);
    }
};


module.exports = {
    loadcartpost,
    loadcart,
    updateCart,
    removeProduct
};