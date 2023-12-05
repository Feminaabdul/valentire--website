const mongoose =require("mongoose") 
const addressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    name: {
        type: String,
      
    },
    pincode: {
        type: Number,
   
        validate: {
            validator: function (v) {
              return /^\d{6}$/.test(v); // Ensure PIN code is 6 digits
            },
            message: props => `${props.value} is not a valid PIN code!`
        }
    },
    state: {
        type: String,
       
    },
    city: {
        type: String,
        
    },
    building: {
        type: String,
      
    },
    area: {
        type: String,
        
    },
    default: {
        type: Boolean,
        default: true,
    },
    
});

const Address = mongoose.model('Address', addressSchema);

module.exports= Address;