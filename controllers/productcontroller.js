const Category = require('../models/category');
const productmodel = require('../models/productmodel');
const Product = require('../models/productmodel')
const Offer = require("../models/offermodel")
const Joi = require('joi');
const postAddProduct = async (req, res) => {
    try {
        
        const { productname, stockquantity, price, description, category, material, offer } = req.body;
       

        if (!req.files || req.files.length === 0) {
            const categorydata = await Category.find({});
            return res.render('addproduct', { category: categorydata, message: "Please upload at least one image for the product." });
        }
        let image = []
        for (let i = 0; i < req.files.length; i++) {
            image[i] = req.files[i].filename;
        }

 // Check if the price is greater than 1 and not 0 or a negative number
 if (price <= 1) {
    const categorydata = await Category.find({});
    return res.render('addproduct', { category: categorydata, message: "Please enter a  valid price " });
}


    //    if(offer){
    //     const offers = await Offer.findById(offer)
    //     const newprice=Number(price)
    //     const calculator = newprice * (1 - offers.discount / 100);
    

       

    //     const product = new Product({
    //         mrp: newprice,
    //         productname: productname,
    //         stockquantity: stockquantity,
    //         price: calculator,

    //         description: description,
    //         category: category,
    //         image: image,
    //         material: material,
    //         offer: offer
    //     })
    //     const save1Product = await product.save();
        
    //     if (save1Product) {
    //         res.redirect("/admin/listproduct");
    //     } else {
    //         if(!image){
    //             const categorydata = await Category.find({});
    //             res.render('addproduct', { category: categorydata, message: "image not inserted" })
    //         }
    //         const categorydata = await Category.find({});
    //         res.render('addproduct', { category: categorydata, message: "Something went wrong" })
    //     }
    //    }else{
        const newprice=Number(price)
        
        const product = new Product({
          
            productname: productname,
            stockquantity: stockquantity,
            price: newprice,

            description: description,
            category: category,
            image: image,
            material: material,
          
        })
        const saveProduct = await product.save();
      
        console.log(product)
        if (saveProduct) {
            res.redirect("/admin/listproduct");
        } else {
           
            const categorydata = await Category.find({});
            res.render('addproduct', { category: categorydata, message: "Something went wrong" })
        }


    //    }



       
      
   



    } catch (error) {
        console.log(error.message)
    }
}


const postEditProduct = async (req, res) => {
    try {

        const id = req.query.id;
        if (!req.files || req.files.length === 0) {
            throw new Error("Please upload at least one image for the product.");
        }
        let image = []
        for (let i = 0; i < req.files.length; i++) {
            image[i] = req.files[i].filename;
        }

        const newprice = Number(req.body.price)
        const Data = await Product.findById(req.query.id);
        const offer = req.body.offer

        const schema = Joi.object({
            productName: Joi.string().min(3).required(),
            price: Joi.number().min(1).required(),
            category: Joi.string().min(3).required(),
            stockquantity: Joi.number().min(1).required(),
            description: Joi.string().min(3).required(),
            material: Joi.string().min(3).required(),
           
        });

     

       
const validationResult = schema.validate({
            productName: req.body.productName,
            price: newprice,
            category: req.body.category,
            stockquantity: req.body.stockquantity,
            description: req.body.description,
            material: req.body.material,
           
        },);


        if (validationResult.error) {
            throw new Error(validationResult.error.details[0].message);
        }

        // if (offer) {
        //     const offers = await Offer.findById(offer)
        //     const newprice = Number(req.body.price)

        //     const calculator = newprice * (1 - offers.discount / 100);

        //     Data.productname = req.body.productName
        //     Data.mrp = newprice
        //     Data.price = calculator

        //     Data.category = req.body.category
        //     Data.stockquantity = req.body.stockquantity

        //     Data.image = image
        //     Data.description = req.body.description
        //     Data.material = req.body.material
        //     Data.offer = offer

        // } else {
            Data.productname = req.body.productName

            Data.price = newprice

            Data.category = req.body.category
            Data.stockquantity = req.body.stockquantity

            Data.image = image
            Data.description = req.body.description
            Data.material = req.body.material
            Data.offer = null;
        // }

        const saved = await Data.save()

        res.redirect('/admin/product');

    } catch (error) {
        console.log(error.message)
        res.status(400).send(error.message);
    }
}

const loadAddproduct = async (req, res) => {
    try {
        const categorydata = await Category.find({});
        const offerdata = await Offer.find({});
        res.render('addproduct', { category: categorydata, offers: offerdata })

    } catch (error) {
        console.log(error.message);
    }
}

const Editproduct = async (req, res) => {
    try {
        const offerdata = await Offer.find({});
        const categorydata = await Category.find({});
        let id = req.query.id
        const productdata = await productmodel.findById(id)
        if (productdata) {
            res.render('Editproduct', { category: categorydata, product: productdata, offer: offerdata })
        }

    } catch (error) {
        console.log(error.message);
    }
}

const loadproduct = async (req, res) => {
    try {
        const productdata = await Product.find({}).populate("offer");



        res.render('product', { product: productdata });
    } catch (error) {
        console.log(error.message);
    }
}

const unlistproduct = async (req, res) => {
    try {
        const id = req.query.id;
        const updatepro = await Product.updateOne({ _id: id }, { $set: { status: false } });
        const pro = await Product.find({})
        res.render('product', { product: pro })
    } catch (error) {
        console.log(error.message);
    }
}
const listproduct = async (req, res) => {
    try {
        const id = req.query.id;
        const updatepro = await Product.updateOne({ _id: id }, { $set: { status: true } });
        const pro = await Product.find({})
        res.render('product', { product: pro })
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    postAddProduct,
    loadAddproduct,
    loadproduct,
    unlistproduct,
    listproduct,
    Editproduct,
    postEditProduct

}