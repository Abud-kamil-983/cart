var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var userSchema = new Schema({
  userName: { type: String, required: true, default:''},
  firstName: { type: String, default:'' },
  lastName: { type: String, default:'' },
  email:{type: String, required: true, default:''},
  password:{type: String, required: true, default:''},
  mobile:{type: String, required: true, default:''},
  createdAt: { type:Date},
  updatedAt: { type:Date}
});

// we need to create a model using it
mongoose.model('User', userSchema);