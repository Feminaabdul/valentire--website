const Category = require('../models/category');
const Offer = require("../models/offermodel")
const Product = require('../models/productmodel')
const listCategory = async(req,res) => {
    try {
        const categorydata = await Category.find({});
        res.render('catagory',{category:categorydata});
    } catch (error) {
        console.log(error.message)
    }
}

const postAddCategory = async (req,res) => {
    try {
        const category = req.body.category;
        const offer = req.body.offer;
        const upperCat = category.toUpperCase();
       
        const categorydata = await Category.findOne({categoryName:upperCat});

        if (offer) {
            const selectedOffer = await Offer.findById(offer);
            if(categorydata){                                                                                               
                res.render('addCatagory',{message:"This category is already added"})
            }else{
                const category = new Category({
                    categoryName:upperCat,
                    offer: selectedOffer
                })
                const saveCat = await category.save();
                console.log("saveCat",saveCat);
                res.redirect("/admin/listCategory");
                
            }
        }else{
            if(categorydata){                                                                                               
                res.render('addCatagory',{message:"This category is already added"})
            }else{
                const category = new Category({
                    categoryName:upperCat
                })
                const saveCat = await category.save();
                res.redirect("/admin/listCategory");
            }
        }

       
    } catch (error) {
        console.log(error.message);
    }
}




const loadcatagory = async (req, res) => {
    try {  const offerdata = await Offer.find({});
    console.log("addcatagory=offerdata",offerdata);
        res.render('addcatagory',{offers: offerdata});
    } catch (error) {
        console.log(error.message);
    }
}

const unlistcategory = async (req,res) => {
    try {
        console.log("Something in unlist")
        const id = req.query.id;
        const updatepro = await Category.updateOne({_id:id},{$set:{status:false}});
        const pro = await Category.find({})
        res.render('catagory',{category:pro})
    } catch (error) {
        console.log(error.message);
    }
}
const listcategorybutton = async (req,res) => {
    try {
        console.log("Something in list")
        const id = req.query.id;
        const updatepro = await Category.updateOne({_id:id},{$set:{status:true}});
        const pro = await Category.find({})
        const offerdata = await Offer.find({});
        res.render('catagory',{category:pro,offers: offerdata})
    } catch (error) {
        console.log(error.message);
    }
}
const Editcategory = async (req, res) => {
    try {
      
       
        let id=req.query.id
        const upperCat = id.toUpperCase();
        const categorydata = await Category.findOne({_id:upperCat});
        const offerdata = await Offer.find({});
        res.render('Editcategory',{category:categorydata,offers: offerdata,messages: req.flash()})

    } catch (error) {
        console.log(error.message);
    }
}

const postEdit = async (req, res) => {
 try {
    console.log(req.body);
    const id = req.query.id;
    console.log(id);
    const upperCat = id.toUpperCase();
    const categorydata = await Category.findOne({_id:upperCat});
    // Check if a category with the same name already exists
    const existingCategory = await Category.findOne({ categoryName: req.body.categoryName });

    if (existingCategory && existingCategory._id.toString() !== id) {
      // If a category with the same name exists and it's not the current category, throw an error
      req.flash('error', 'Category  exists.');
      return res.render('Editcategory',{category:categorydata,messages: req.flash()});
    }

    // Update the category
    const updated = await Category.findByIdAndUpdate(id, { $set: { categoryName: req.body.categoryName } });

    console.log(updated);
    await updated.save();
    res.redirect("/admin/listcategory");
 } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Server error." });
 }
};
module.exports = {
    postAddCategory,
    listCategory,
    loadcatagory,
    unlistcategory,
    listcategorybutton,
    Editcategory,
    postEdit
}