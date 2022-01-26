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
var com_dbSchema = new Schema({
    name: { type: String },
    ref: { type: String, 'default': shortid.generate,unique:true },
    is_delete: { type: Boolean, default: false },
}, schemaOptions);

var com_db = mongoose.model('com_db', com_dbSchema);
module.exports = com_db;
