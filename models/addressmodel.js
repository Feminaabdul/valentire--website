const mongoose =require("mongoose") 
const addressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    pincode: {
        type: Number,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    building: {
        type: String,
        required: true,
    },
    area: {
        type: String,
        required: true,
    },
    default: {
        type: Boolean,
        default: false,
    },
    
});

const Address = mongoose.model('Address', addressSchema);

module.exports= Address;