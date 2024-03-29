const async = require('hbs/lib/async');
const User = require('../models/user')
const bcrypt = require("bcrypt")
const Order = require("../models/order")
const fs = require('fs');
const ejs = require("ejs");
const pdf = require("html-pdf");
const path = require("path");

const csv = require('csv-parser');
const PDFDocument = require('pdfkit')
const loaddashboard = async (req, res) => {
    try {
        const odd = await Order.find({})
            .populate([
                { path: 'user', model: 'User' },
                { path: 'Address', model: 'Address' },
                { path: 'products.productId', model: 'product' }
            ])

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



const loadlogin = async (req, res) => {
    try {
        if (req.session.admin_id) {
            res.redirect('/admin/dashboard')
        } else {
            res.render('login');
        }
    } catch (error) {
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

const blockuser = async (req, res) => {
    try {
        const id = req.query.id;
        const updatedata = await User.updateOne({ _id: id }, { $set: { block: true, status: true } });
        const users = await User.find({ is_admin: 0 })
        res.render('users', { users: users })
    } catch (error) {
        console.log(error.message);
    }
}

const unblockuser = async (req, res) => {
    try {
        const id = req.query.id;
        const updatedata = await User.updateOne({ _id: id }, { $set: { block: false, status: false } });
        const users = await User.find({ is_admin: 0 })
        res.render('users', { users: users })
    } catch (error) {
        console.log(error.message);
    }
}



const loadLogout = async (req, res) => {
    try {
        if (req.session.admin_id) {
            req.session.admin_id = false;
            res.redirect('/admin');
        } else {
            res.redirect('/admin');
        }
    } catch (error) {
        console.log(error.message);
    }
}

const getSalesReport = async (req, res, next) => {
    try {
        const page = parseInt(req.params.page) || 1;
        const pageSize = 3;
        const skip = (page - 1) * pageSize;
        const totalOrders = await Order.countDocuments();
        const totalPages = Math.ceil(totalOrders / pageSize);
        let startOfMonth;
        let endOfMonth;
        if (req.query.filtered) {
            startOfMonth = new Date(req.body.from);
            endOfMonth = new Date(req.body.upto);
            endOfMonth.setHours(23, 59, 59, 999);
        } else {
            const today = new Date();
            startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        }


        const filteredOrders = await Order.find({}).sort({ createdAt: -1 })

            .populate([
                { path: 'user', model: 'User' },
                { path: 'Address', model: 'Address' },
                { path: 'products.productId', model: 'product' }
            ]).skip(skip)
            .limit(pageSize);



        res.render('sales', {
            salesReport: filteredOrders,
            activePage: 'SalesReport',
            addDays: function (date, days) {
                var result = new Date(date);
                result.setDate(result.getDate() + days);
                return result;
            },
            currentPage: page || 1,
            totalPages: totalPages || 1,

        })

    } catch (error) {
        next(error);
    }
};
// const downloadSalesReport =async(req, res, next) => {
//     try {
//          const salesReportString = req.query.salesReport || '';
//         console.log("Sales Report String:", req.query.salesReport);



//         // Attempt to parse the string
//         const salesReport =   JSON.parse(salesReportString);

//         console.log("Parsed Sales Report:", salesReport);

//         // Create a new PDF document
//         salesReport.forEach((report) => {
//             const doc = new PDFDocument();

//             // Set the PDF response headers
//             res.setHeader('Content-Type', 'application/pdf');
//             res.setHeader('Content-Disposition', `attachment; filename=sales-report-${report.user.email}.pdf`);

//             // Pipe the PDF document to the response
//             doc.pipe(res);

//             // Add content to the PDF
//             doc.fontSize(16).text('Sales Report', { align: 'center' });
//             doc.moveDown();
//             doc.fontSize(12);

//             // Iterate over the salesReport data and add it to the PDF
//             doc.text(`User: ${report.user.name}`);
//             doc.text(`Email: ${report.user.email}`);
//             doc.text(`Phone: ${report.user.mobile}`);
//             doc.moveDown();

//             // Iterate over the products for each report
//             report.products.forEach((product) => {
//                 doc.text(`Product Name: ${product.productId.productname}`);
//                 doc.text(`Price: ${product.price}`);
//                 doc.text(`Quantity: ${product.quantity}`);
//                 doc.moveDown();
//             });

//             // Add total statistics
//             doc.text(`Total orders done: ${salesReport.length}`);
//             doc.text(`Total products sold: ${req.query.productsCount}`);
//             doc.text(`Total Revenue: ₹${req.query.revenue}`);
//             doc.moveDown();

//             // Finalize and end the PDF document
//             doc.end();
//         });
//     } catch (error) {
//         console.error("Error parsing salesReport JSON:", error);
//         console.error("Error position:", error.at); 
//         next(error);
//     }
// };
// const loadsales = async (req, res) => {
//     try {
//         const userdata = await User.find({ is_admin: 0 })
//         const page = parseInt(req.params.page) || 1;
//         const pageSize = 3;
//         const skip = (page - 1) * pageSize;
//         const totalOrders = await Order.countDocuments();
//         const totalPages = Math.ceil(totalOrders / pageSize);
//         const odd = await Order.find({ })
//         .sort({ createdAt: -1 })
//             .populate([
//                 { path: 'user', model: 'User' },
//                 { path: 'Address', model: 'Address' },
//                 { path: 'products.productId', model: 'product' }
//             ])
//             .skip(skip)
//             .limit(pageSize);


//         res.render('sales', { odd , users:userdata,
//             currentPage: page || 1,
//             totalPages: totalPages || 1,});
//     } catch (error) {
//         console.log(error.message);
//         res.status(500).send('Internal Server Error');
//     }
// }
const loadorder = async (req, res) => {
    try {
        const page = parseInt(req.params.page) || 1;
        const pageSize = 3;
        const skip = (page - 1) * pageSize;
        const totalOrders = await Order.countDocuments();
        const totalPages = Math.ceil(totalOrders / pageSize);
        const odd = await Order.find({})
            .sort({ createdAt: -1 })
            .populate([
                { path: 'user', model: 'User' },
                { path: 'Address', model: 'Address' },
                { path: 'products.productId', model: 'product' }
            ])
            .skip(skip)
            .limit(pageSize);


        res.render('order', {
            odd,
            currentPage: page || 1,
            totalPages: totalPages || 1,
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
}

const update = async (req, res) => {
    const { orderId } = req.params;
    const { newStatus } = req.body;
    try {
        const order = await Order.findOneAndUpdate(
            { _id: orderId },
            { status: newStatus },
            { new: true }
        );

        if (!order) {
            // res.redirect(`/order/${req.params.page}`);
            return res.redirect(`/admin/order/1`);
        }
        return res.redirect(`/admin/order/1`);

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
const exportUsersPdf = async (req, res) => {
    try {
        const salesOrders = await Order.find({}).sort({ createdAt: -1 }).populate([
            { path: 'user', model: 'User' },
            { path: 'Address', model: 'Address' },
            { path: 'products.productId', model: 'product' }
        ])
        const data = {
            salesReport: salesOrders
        }
        const filePathName = path.resolve(__dirname, '../views/admin/htmltopdf.ejs');
        const htmlString = fs.readFileSync(filePathName).toString();
        let option = {
            format: 'A3'
        }
        const ejsData = ejs.render(htmlString, data)
        pdf.create(ejsData, option).toFile('users.pdf', (err, response) => {
            if (err) console.log(err);
            const filePath=path.resolve(__dirname,'../users.pdf')
            fs.readFile(filePath,(err,file)=>{
                if (err){
                    console.log(err)
                    return res.status(500).send('no dowlnoad')
                }
                res.setHeader('Content-Type','application/pdf')
                res.setHeader('Content-Disposition','attachment;filename="users.pdf"');
                res.send(file)
            })
           console.log('file generated');

        });

    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loaddashboard,
    loadusers,
    loadlogin,
    postlogin,
    blockuser,
    unblockuser,
    loadLogout,
    loadorder,
    update
    , getSalesReport,
    exportUsersPdf
}