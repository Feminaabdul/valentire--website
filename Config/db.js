const mongoose = require('mongoose')
mongoose.connect("mongodb://127.0.0.1:27017/valentire").then(()=>{
    console.log("Database connected successfully");
}).catch((err)=>{
    console.log(err);
});
module.exports = mongoose.connection;