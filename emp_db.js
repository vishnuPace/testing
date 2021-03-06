var mongoose = require('mongoose');
const shortid = require('shortid');

var Schema = mongoose.Schema;
var schemaOptions = {
    toObject: {
        virtuals: true
    }
    , toJSON: {
        virtuals: true
    },
    timestamps: true
};
//create emp_db schema 
var emp_dbSchema = new Schema({
    name: { type: String },
    email: { type: String },
    phone_number: { type: String },
    role: { type: String, default: "employee" },
    is_delete: { type: Boolean, default: false },
    company_id: { type: mongoose.Schema.Types.ObjectId },
    manager_id: { type: mongoose.Schema.Types.ObjectId },
    ref: { type: String, 'default': shortid.generate, unique: true },
}, schemaOptions);

var emp_db = mongoose.model('emp_db', emp_dbSchema);
module.exports = emp_db;
