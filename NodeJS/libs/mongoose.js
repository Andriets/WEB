const mongoose = require('mongoose');
const log = require('./log')(module);
const config = require('./config');

mongoose.connect(config.get('mongoose:uri')); 
const db = mongoose.connection;

db.on('error', function (err) {
    log.error('connection error:', err.message);
});

db.once('open', function callback () {
    log.info("Connected to DB!");
});
var Schema = mongoose.Schema; // Schemas
var Images = new Schema({
kind: {
    type: String,
    enum: ['thumbnail', 'detail'],
    required: true },
    url: { type: String, required: true }
});

var Article = new Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    description: { type: String, required: true },
    images: [Images],
    modified: { type: Date, default: Date.now }
}); // validation

Article.path('title').validate(function (v) {
 return v.length > 3 && v.length < 70;
});

var ArticleModel = mongoose.model('Article', Article);
module.exports.ArticleModel = ArticleModel;