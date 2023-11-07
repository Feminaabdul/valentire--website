const mongoose =require("mongoose") 

const adminSchema = mongoose.Schema({
    username: {
        required: true,
        type: String,
        unique: true,
        maxLength: 25,
    },
    password: {
        required: true,
        type: String,
        minLength: 6,
    },
});

const Admin = mongoose.model("Admin", adminSchema);

module.exports= Admin;
