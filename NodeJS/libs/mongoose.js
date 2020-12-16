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

const Hero = new Schema({
    id: { type: Number, required: true },
    name: { type: String, required: true }
});

const HeroModel = mongoose.model('Hero', Hero);

module.exports.HeroModel = HeroModel;