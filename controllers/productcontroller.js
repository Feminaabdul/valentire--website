const Category = require('../models/category');
const productmodel = require('../models/productmodel');
const Product = require('../models/productmodel')
const Offer = require("../models/offermodel")
const Order = require("../models/order")
const Joi = require('joi');
const path = require('path')
const sharp = require('sharp');
const fs = require('fs');
const postAddProduct = async (req, res) => {
    try {

        const { productname, stockquantity, price, description, category, material, offer } = req.body;


        if (!req.files || req.files.length === 0) {
            const categorydata = await Category.find({});
            return res.render('addproduct', { category: categorydata, message: "Please upload at least one image for the product." });
        }
        let image = [];

        for (let i = 0; i < req.files.length; i++) {
            image[i] = req.files[i].filename;
        }
        const croppedImages = [];
        for (let i = 0; i < req.files.length; i++) {
            const imagePath = path.join(__dirname, '../public/Admins/productImages', image[i]);

            const cropOptions = {
                left: 0,
                top: 0,
                width: 900, // Specify the desired width
                height: 900, // Specify the desired height
            }; try {
                const buffer = await sharp(imagePath).extract(cropOptions).toBuffer();
                await sharp(buffer).toFile(imagePath);
                croppedImages.push(image[i]);
            } catch (err) {
                console.error('Error cropping image:', err);
                // Handle the error as needed, you might want to return an error response to the client
            }



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
        const newprice = Number(price)

        const product = new Product({

            productname: productname,
            stockquantity: stockquantity,
            price: newprice,

            description: description,
            category: category,
            image: croppedImages,
            material: material,

        })
        const saveProduct = await product.save();

        console.log(product)
        if (saveProduct) {
            res.redirect("/admin/listproduct");
        } else {

            const categorydata = await Category.find({});
            res.render('addproduct', { category: categorydata, message: "Something went wrong", })
        }


        //    }









    } catch (error) {
        console.log(error.message)
    }
}


const postEditProduct = async (req, res) => {
    try {
        // console.log("********")

        // console.log(req.body)
        // console.log("********")

        const id = req.params.id;
        // const deletedImages = JSON.parse(req.body.deletedImages);

        // const stringIndices = deletedImages.map(index => index.toString());
        // Product.updateOne(
        //     { _id: id }, // Replace 'your-product-id' with the actual ID of your product
        //     { $pull: { image: { $in: stringIndices } } },
        //     (err, result) => {
        //         if (err) {
        //             console.error(err);
        //             // Handle the error
        //         } else {
        //             console.log('Images deleted successfully');
        //             // Handle success, if needed
        //         }
        //     }
        // );

        // let image = []
        // for (let i = 0; i < req.files.length; i++) {
        //     image[i] = req.files[i].filename;
        // }


        const newprice = Number(req.body.price)
        const Data = await Product.findById(req.params.id);
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


        Data.description = req.body.description
        Data.material = req.body.material
        Data.offer = null;
        // }
        console.log("Data.image", Data.image);
        const saved = await Data.save()
        console.log("saved", saved);
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
        let id = req.params.id
        const productdata = await productmodel.findById(id)
        console.log(productdata)
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
const deleteImage = async (req, res, next) => {
    const { id } = req.params;
    const { image } = req.body;
    console.log("imagrw", image);
    try {
        await Product.findByIdAndUpdate(id, { $pull: { image: image } }, { new: true });

        fs.unlink(path.join(__dirname, '../public/Admins/productImages', image), (err) => {
            if (err) console.log(err);
        });

        res.redirect(`/admin/Editproduct/${id}`);
    } catch (error) {
        next(error);
    }
};

const addImage = async (req, res, next) => {
    const { id } = req.params;
    const images = req.files;

    console.log("req.images", images);

    let imagesWithPath;
    if (images && images.length) {
        imagesWithPath = await Promise.all(
            images.map(async (image) => {
                const imagePath = path.join(__dirname, '../public/Admins/productImages', image.filename);
                const imageInfo = await sharp(imagePath).metadata();
                console.log('Image Dimensions:', imageInfo.width, 'x', imageInfo.height);
                const aspectRatio = imageInfo.width / imageInfo.height;
                // Specify your crop options (e.g., width, height, position)
                const cropOptions = {
                    left: 0,
                    top: 0,
                    width: Math.min(1000, imageInfo.width),
                    height: Math.round(1000 / aspectRatio),
                };

                try {
                    // Example: Specify the output format (e.g., jpeg)
                    const buffer = await sharp(imagePath).extract(cropOptions).toFormat('jpeg').toBuffer();

                    await sharp(buffer).toFile(imagePath);
                    return image.filename;
                } catch (err) {
                    console.error('Error cropping image:', err);
                    // Handle the error as needed, you might want to return an error response to the client
                    return null;
                }
            })
        );
    }

    const validImages = imagesWithPath.filter((image) => image !== null);
    const imagesWith = validImages.join('\n');
    console.log("imagesWithPath", imagesWith);

    try {
        await Product.findByIdAndUpdate(id, { $push: { image: imagesWith } }, { new: true });
        res.redirect(`/admin/Editproduct/${id}`);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    postAddProduct,
    loadAddproduct,
    loadproduct,
    unlistproduct,
    listproduct,
    Editproduct,
    postEditProduct,
    deleteImage,
    addImage

}