var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var productSchema = new Schema({
  productName: { type: String, required: true, default:''},
  category: { type: String, default:'' },
  price: { type: String, default:'' },
  description:{type: String, required: true, default:''},
  status:{type: Boolean, required: true, default:true},
  createdAt: { type:Date},
  updatedAt: { type:Date}
});

// we need to create a model using it
mongoose.model('Product', productSchema);