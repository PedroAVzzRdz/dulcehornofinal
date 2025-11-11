const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');


mongoose.set('strictQuery', false)

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  drawableResId: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true },
  availableUnits: { type: Number, default: 50 }
}, { timestamps: true });

productSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject.createdAt;
    delete returnedObject.updatedAt;
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model('Product', productSchema);