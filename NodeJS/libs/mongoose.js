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
const Schema = mongoose.Schema;
const Images = new Schema({
kind: {
    type: String,
    enum: ['thumbnail', 'detail'],
    required: true },
    url: { type: String, required: true }
});

const Article = new Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    description: { type: String, required: true },
    images: [Images],
    modified: { type: Date, default: Date.now }
});

Article.path('title').validate(function (v) {
 return v.length > 3 && v.length < 70;
});

const ArticleModel = mongoose.model('Article', Article);
module.exports.ArticleModel = ArticleModel;