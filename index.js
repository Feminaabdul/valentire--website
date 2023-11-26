require('dotenv').config();
var cors = require('cors')
const express = require('express');
const app = express();
const db=require("./Config/db")
const razorpay = require('razorpay');

const methodOverride = require('method-override');

const cookieParser = require('cookie-parser');
const session = require('express-session');
var morgan = require('morgan')

app.use(cors())
app.use(express.static('public'));
app.use(methodOverride('_method'));
app.use(express.urlencoded({extends:true}))
app.use(express.json());
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: 60000 * 60 * 24 * 7
    }
}));



const userroute = require('./routes/userroute')
const adminroute = require('./routes/adminroute')
app.use('/',userroute)
app.use('/admin',adminroute)

app.listen(3000,()=>{
    console.log("Server started running in port 3000");
})