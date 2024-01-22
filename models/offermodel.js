const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    startingDate: {
      type: Date,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    status: {
      type:Boolean ,
      default:true
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
  
  },
  {
    timestamps: true,
  }
);    
const Offer = mongoose.model("offer", offerSchema);

module.exports = Offer;