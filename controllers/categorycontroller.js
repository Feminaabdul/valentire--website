const Category = require('../models/category');


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
        const upperCat = category.toUpperCase();
        console.log(upperCat)
        const categorydata = await Category.findOne({categoryName:upperCat});
        if(categorydata){                                                                                               
            res.render('addCatagory',{message:"This category is already added"})
        }else{
            const category = new Category({
                categoryName:upperCat
            })
            const saveCat = await category.save();
            res.redirect("/admin/listCategory");
        }
    } catch (error) {
        console.log(error.message);
    }
}




const loadcatagory = async (req, res) => {
    try {
        res.render('addcatagory');
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
        res.render('catagory',{category:pro})
    } catch (error) {
        console.log(error.message);
    }
}
const Editcategory = async (req, res) => {
    try {
      
       
        let id=req.query.id
        const upperCat = id.toUpperCase();
        const categorydata = await Category.findOne({_id:upperCat});
        res.render('Editcategory',{category:categorydata,})

    } catch (error) {
        console.log(error.message);
    }
}

const postEdit = async (req,res) => {
    try {
      console.log(req.body);
        const id= req.query.id;
        console.log(id);
      
        const updated= await Category.findById(id);
        updated.categoryName=req.body.categoryName
        await updated.save()
        console.log(updated);
        res.redirect("/admin/listcategory");
        }
        catch (error) {
        console.log(error.message);
    }
}
module.exports = {
    postAddCategory,
    listCategory,
    loadcatagory,
    unlistcategory,
    listcategorybutton,
    Editcategory,
    postEdit
}