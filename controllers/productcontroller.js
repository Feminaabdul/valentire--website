const Category = require('../models/category');
const productmodel = require('../models/productmodel');
const Product = require('../models/productmodel')
const Offer = require("../models/offermodel")
const Order = require("../models/order")
const Joi = require('joi');
const path = require('path')
const sharp = require('sharp');
const fs = require('fs');
const categoryModel = require('../models/category');
// const postAddProduct = async (req, res) => {
//     try {

//         const { productname, stockquantity, price, description, category, material, offer } = req.body;


//         if (!req.files || req.files.length === 0) {
//             const categorydata = await Category.find({});
//             return res.render('addproduct', { category: categorydata, message: "Please upload at least one image for the product." });
//         }
//         let image = [];

//         for (let i = 0; i < req.files.length; i++) {
//             image[i] = req.files[i].filename;
//         }
//         const croppedImages = [];
//         for (let i = 0; i < req.files.length; i++) {
//             const imagePath = path.join(__dirname, '../public/Admins/productImages', image[i]);

//             const cropOptions = {
//                 left: 0,
//                 top: 0,
//                 width: 1000, // Specify the desired width
//                 height: 1000, // Specify the desired height
//             }; try {
//                 const buffer = await sharp(imagePath).extract(cropOptions).toBuffer();
//                 await sharp(buffer).toFile(imagePath);
//                 croppedImages.push(image[i]);
//             } catch (err) {
//                 console.error('Error cropping image:', err);
//                 // Handle the error as needed, you might want to return an error response to the client
//             }



//         }

//         // Check if the price is greater than 1 and not 0 or a negative number
//         if (price <= 1) {
//             const categorydata = await Category.find({});
//             return res.render('addproduct', { category: categorydata, message: "Please enter a  valid price " });
//         }


//         //    if(offer){
//         //     const offers = await Offer.findById(offer)
//         //     const newprice=Number(price)
//         //     const calculator = newprice * (1 - offers.discount / 100);




//         //     const product = new Product({
//         //         mrp: newprice,
//         //         productname: productname,
//         //         stockquantity: stockquantity,
//         //         price: calculator,

//         //         description: description,
//         //         category: category,
//         //         image: image,
//         //         material: material,
//         //         offer: offer
//         //     })
//         //     const save1Product = await product.save();

//         //     if (save1Product) {
//         //         res.redirect("/admin/listproduct");
//         //     } else {
//         //         if(!image){
//         //             const categorydata = await Category.find({});
//         //             res.render('addproduct', { category: categorydata, message: "image not inserted" })
//         //         }
//         //         const categorydata = await Category.find({});
//         //         res.render('addproduct', { category: categorydata, message: "Something went wrong" })
//         //     }
//         //    }else{
//         const newprice = Number(price)

//         const product = new Product({

//             productname: productname,
//             stockquantity: stockquantity,
//             price: newprice,

//             description: description,
//             category: category,
//             image: croppedImages,
//             material: material,

//         })
//         const saveProduct = await product.save();

//         console.log(product)
//         if (saveProduct) {
//             res.redirect("/admin/listproduct");
//         } else {

//             const categorydata = await Category.find({});
//             res.render('addproduct', { category: categorydata, message: "Something went wrong", })
//         }


//         //    }









//     } catch (error) {
//         console.log(error.message)
//     }
// }

const postAddProduct = async (req, res) => {
    try {
        const { productname, stockquantity, price, description, category, material, offer } = req.body;
        console.log("req.body",req.body);

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
                width: 1000,
                height: 1000,
            };

            try {
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
            return res.render('addproduct', { category: categorydata, message: "Please enter a valid price." });
        }

        if (offer) {
            const selectedOffer = await Offer.findById(offer);


            if (!selectedOffer) {
                const categorydata = await Category.find({});
                return res.render('addproduct', { category: categorydata, message: "Selected offer not found." });
            }

            const newprice = Number(price);
            const discountedPrice = newprice * (1 - selectedOffer.discount / 100);
           

            const product = new Product({
                mrp: newprice,
                productname: productname,
                stockquantity: stockquantity,
                price: discountedPrice,
                description: description,
                category: category,
                image: croppedImages,
                material: material,
                offer: offer
            });

            const saveProduct = await product.save();
console.log("saveProduct",saveProduct);
            if (saveProduct) {
                res.redirect("/admin/listproduct");
                console.log("saveProdrtttyuct",saveProduct);
            } else {
                const categorydata = await Category.find({});
                res.render('addproduct', { category: categorydata, message: "Something went wrong." });
            }
        } else {
            // If no offer is selected, proceed without discount
            const newprice = Number(price);

            const product = new Product({
                productname: productname,
                stockquantity: stockquantity,
                price: newprice,
                description: description,
                category: category,
                image: croppedImages,
                material: material,
            });

            const saveProduct = await product.save();
            console.log("saveProduct",saveProduct);
            if (saveProduct) {
                res.redirect("/admin/listproduct");
                console.log("saveProduct",saveProduct);
            } else {
                const categorydata = await Category.find({});
                res.render('addproduct', { category: categorydata, message: "Something went wrong." });
            }
        }
    } catch (error) {
        console.log(error.message);
        // Handle the error as needed, you might want to return an error response to the client
    }
};

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


        const price = req.body.price
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
           
        if (offer) {
            const selectedOffer = await Offer.findById(offer);
            if (!selectedOffer) {
                const categorydata = await Category.find({});
                return res.render('addproduct', { category: categorydata, message: "Selected offer not found." });
            }
            const newprice = Number(price);
            const discountedPrice = newprice * (1 - selectedOffer.discount / 100);
           
            Data.productname = req.body.productName

            Data.price = discountedPrice

            Data.category = req.body.category
            Data.stockquantity = req.body.stockquantity
            Data.mrp = newprice


            Data.description = req.body.description
            Data.material = req.body.material
            Data.offer = offer;
            // }
            
            const saved = await Data.save()
            const validationResult = schema.validate({
                productName: req.body.productName,
                price: discountedPrice,
                category: req.body.category,
                stockquantity: req.body.stockquantity,
                description: req.body.description,
                material: req.body.material,
    
            },);
    
    
            if (validationResult.error) {
                throw new Error(validationResult.error.details[0].message);
            }
            
            res.redirect('/admin/product');
        }else{
            const newprice = Number(price); 
            Data.productname = req.body.productName

            Data.price = newprice
    
            Data.category = req.body.category
            Data.stockquantity = req.body.stockquantity
    
    
            Data.description = req.body.description
            Data.material = req.body.material
            Data.offer = null;
           
            const saved = await Data.save()
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
         
            res.redirect('/admin/product');
        }
      
       
        // }
      

    } catch (error) {
        console.log(error.message)
        res.status(400).send(error.message);
    }
}

const loadAddproduct = async (req, res) => {
    try {  
         const productdata = await Product.aggregate([
        {
          $lookup: {
            from: 'categories', // Assuming your category model is named 'category'
            localField: 'category',
            foreignField: '_id',
            as: 'categoryInfo',
          },
        },
        {
          $unwind: '$categoryInfo',
        },
        {
          $lookup: {
            from: 'offers', // Assuming your offer model is named 'offer'
            localField: 'categoryInfo.offer',
            foreignField: '_id',
            as: 'categoryInfo.offerInfo',
          },
        },
        {
          $unwind: { path: '$categoryInfo.offerInfo', preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: 'offers', // Assuming your offer model is named 'offer'
            localField: 'offer',
            foreignField: '_id',
            as: 'productOfferInfo',
          },
        },
        {
          $unwind: { path: '$productOfferInfo', preserveNullAndEmptyArrays: true },
        },
        {
          $project: {
            _id: 1,
            productname: 1,
            stockquantity: 1,
            price: 1,
            mrp: 1,
            category: {
              _id: '$categoryInfo._id',
              categoryName: '$categoryInfo.categoryName',
              status: '$categoryInfo.status',
              offer: {
                _id: '$categoryInfo.offerInfo._id',
                name: '$categoryInfo.offerInfo.name',
                discount: '$categoryInfo.offerInfo.discount',
                startingDate: '$categoryInfo.offerInfo.startingDate',
                expiryDate: '$categoryInfo.offerInfo.expiryDate',
                status: '$categoryInfo.offerInfo.status',
                is_deleted: '$categoryInfo.offerInfo.is_deleted',
              },
            },
            description: 1,
            image: 1,
            status: 1,
            material: 1,
            productOffer: {
              _id: '$productOfferInfo._id',
              name: '$productOfferInfo.name',
              discount: '$productOfferInfo.discount',
              startingDate: '$productOfferInfo.startingDate',
              expiryDate: '$productOfferInfo.expiryDate',
              status: '$productOfferInfo.status',
              is_deleted: '$productOfferInfo.is_deleted',
            },
            createdAt: 1,
            updatedAt: 1,
          },
        },
      ]);
        const categorydata = await Category.find({});
        const offerdata = await Offer.find({});
        res.render('addproduct', { category: categorydata,product:productdata, offers: offerdata })

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
        
        if (productdata) {
            res.render('Editproduct', { category: categorydata, product: productdata, offers: offerdata })
        }

    } catch (error) {
        console.log(error.message);
    }
}

const loadproduct = async (req, res) => {
    try {
    //     const productdata = await Product.aggregate([
    //         {
    //           $lookup: {
    //             from: 'categories', // Assuming your category model is named 'category'
    //             localField: 'category',
    //             foreignField: '_id',
    //             as: 'categoryInfo',
    //           },
    //         },
    //         {
    //           $unwind: '$categoryInfo',
    //         },
    //         {
    //           $lookup: {
    //             from: 'offers', // Assuming your offer model is named 'offer'
    //             localField: 'categoryInfo.offer',
    //             foreignField: '_id',
    //             as: 'categoryInfo.offerInfo',
    //           },
              
    //         },
    //         {
    //           $unwind: { path: '$categoryInfo.offerInfo', preserveNullAndEmptyArrays: true },
    //         },
    //         {
    //           $project: {
    //             _id: 1,
    //             productname: 1,
    //             stockquantity: 1,
    //             price: 1,
    //             mrp: 1,
    //             category: {
    //               _id: '$categoryInfo._id',
    //               categoryName: '$categoryInfo.categoryName',
    //               status: '$categoryInfo.status',
    //               offer: {
    //                 _id: '$categoryInfo.offerInfo._id',
    //                 name: '$categoryInfo.offerInfo.name',
    //                 discount: '$categoryInfo.offerInfo.discount',
    //                 startingDate: '$categoryInfo.offerInfo.startingDate',
    //                 expiryDate: '$categoryInfo.offerInfo.expiryDate',
    //                 status: '$categoryInfo.offerInfo.status',
    //                 is_deleted: '$categoryInfo.offerInfo.is_deleted',
    //               },
    //             },
    //             description: 1,
    //             image: 1,
    //             status: 1,
    //             material: 1,
    //             offer: 1,
    //             createdAt: 1,
    //             updatedAt: 1,
    //           },
    //         },
    //       ]);
    //    console.log("productdata",productdata);
      
    const productdata = await Product.aggregate([
        {
          $lookup: {
            from: 'categories', // Assuming your category model is named 'category'
            localField: 'category',
            foreignField: '_id',
            as: 'categoryInfo',
          },
        },
        {
          $unwind: '$categoryInfo',
        },
        {
          $lookup: {
            from: 'offers', // Assuming your offer model is named 'offer'
            localField: 'categoryInfo.offer',
            foreignField: '_id',
            as: 'categoryInfo.offerInfo',
          },
        },
        {
          $unwind: { path: '$categoryInfo.offerInfo', preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: 'offers', // Assuming your offer model is named 'offer'
            localField: 'offer',
            foreignField: '_id',
            as: 'productOfferInfo',
          },
        },
        {
          $unwind: { path: '$productOfferInfo', preserveNullAndEmptyArrays: true },
        },
        {
          $project: {
            _id: 1,
            productname: 1,
            stockquantity: 1,
            price: 1,
            mrp: 1,
            category: {
              _id: '$categoryInfo._id',
              categoryName: '$categoryInfo.categoryName',
              status: '$categoryInfo.status',
              offer: {
                _id: '$categoryInfo.offerInfo._id',
                name: '$categoryInfo.offerInfo.name',
                discount: '$categoryInfo.offerInfo.discount',
                startingDate: '$categoryInfo.offerInfo.startingDate',
                expiryDate: '$categoryInfo.offerInfo.expiryDate',
                status: '$categoryInfo.offerInfo.status',
                is_deleted: '$categoryInfo.offerInfo.is_deleted',
              },
            },
            description: 1,
            image: 1,
            status: 1,
            material: 1,
            productOffer: {
              _id: '$productOfferInfo._id',
              name: '$productOfferInfo.name',
              discount: '$productOfferInfo.discount',
              startingDate: '$productOfferInfo.startingDate',
              expiryDate: '$productOfferInfo.expiryDate',
              status: '$productOfferInfo.status',
              is_deleted: '$productOfferInfo.is_deleted',
            },
            createdAt: 1,
            updatedAt: 1,
          },
        },
      ]);
      
      console.log(productdata);
       
       
        productdata.forEach(product => {
            if (product.category.offer && product.category.offer.status === true) {
                const discount = product.category.offer.discount;
                console.log("sdfdfds",product.category.offer);
                console.log("frtgtr",product.category?.offer);
                console.log("errrrdcarw",product.category?.offer?.discount);
                console.log('Offer discount for category:', discount);
            }
        });


        res.render('product', { product: productdata ,});
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