const cron = require('node-cron')
const User = require("../models/user")
const products = require("../models/productmodel")
const catagories = require('../models/category');

const Offer = require("../models/offermodel")

const loadoffer = async (req, res) => {
    try {
        const offerdata = await Offer.find({});

        res.render('offer', { offer: offerdata });
    } catch (error) {
        console.log(error.message);
    }
}
const addoffer = async (req, res) => {
    try {

        res.render('addoffer',);
    } catch (error) {
        console.log(error.message);
    }
}

const postAddOffer = async (req, res) => {
    try {

        const { offername, discount, startingDate, expiryDate, status } = req.body;
        const offer = new Offer({
            offername: name,
            discount: discount,
            startingDate: startingDate,
            expiryDate: expiryDate,
            status: status,

        })

        const saveoffer = await offer.save();
        if (saveoffer) {
            res.redirect("/admin/offer");
        } else {

            res.render('addoffer',)
        }
    } catch (error) {
        console.log(error.message)
    }
}
const editoffer = async (req, res) => {
    try {

        let id = req.query.id
        const offerdata = await Offer.findById(id)
        if (offerdata) {
            res.render('editoffer', { offer: offerdata })
        }

    } catch (error) {
        console.log(error.message);
    }
}
const posteditoffer = async (req, res) => {
    try {
        console.log(req.body);
        const id = req.query.id;

        const Data = await Offer.findById(req.query.id);

        Data.name = req.body.offername
        Data.discount = req.body.discount
        Data.startingDate = req.body.startingDate
        Data.expiryDate = req.body.expiryDate
        Data.status = req.body.status



        const saved = await Data.save()
        console.log("saved", saved);

        res.redirect('/admin/offer');


    } catch (error) {
        console.log(error.message)
    }
}


const unlistoffer = async (req, res) => {
    try {
        console.log("Something in unlist")
        const id = req.query.id;
        await Offer.updateOne({ _id: id }, { $set: { status: false } });
        const pro = await Offer.find({})
        res.render('offer', { offer: pro })
    } catch (error) {
        console.log(error.message);
    }
}
const listbro = async (req, res) => {
    try {
        const id = req.query.id;
        await Offer.updateOne({ _id: id }, { $set: { status: true } });
        const pro = await Offer.find({})
        res.render('offer', { offer: pro })
    } catch (error) {
        console.log(error.message);
    }
}


const OfferChecknandDelete = async (req, res) => {
   try {
    const currentDate = new Date();

    const findExpiredOffers = await Offer.find({ is_deleted: false, expiryDate: { $lte: currentDate } });
    if (findExpiredOffers.length > 0) {
        for (const offer of findExpiredOffers) {
            offer.is_deleted = true;
            const offerId = offer._id;
            await products.updateMany({ offer: offerId }, {
                $unset: { offer: 1 },
                $set: { price: 0 }
            })
            await offer.save();
          
        }
       
    }

   } catch (error) {
    console.error("Error in OfferCheckAndDeleteOffer:", error);
    res.status(500).json({ error: "Internal server error" });
   }

}












module.exports = {
    loadoffer,
    addoffer,
    postAddOffer,
    editoffer,
    posteditoffer,
    unlistoffer,
    listbro,
    OfferChecknandDelete
}