const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const log = require('./libs/log')(module);
const app = express();
const config = require('./libs/config');
// const ArticleModel = require('./libs/mongoose').ArticleModel;
const HeroModel = require('./libs/mongoose').HeroModel;
const cors=require('cors');

app.use(cors());
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(morgan('dev')); 
app.use(bodyParser.json());
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(express.static(path.join(__dirname, "public")));

app.get('/api', function(req, res) {
    res.send('API is runing');
});

app.get('/api/heroes', function(req, res) { 
    return HeroModel.find(function (err, hero) {
        if (!err) {
            return res.send(hero);
        } else {
            res.statusCode = 500;
            log.error('Internal error (%d): %s', res.statusCode, err.message);
            return res.send({ error: 'Server error' });
        }
    });
});

app.post('/api/heroes', function(req, res) {   
    var hero = new HeroModel({
        id: getRandomId(),
        name: req.body.name
    });

    hero.save(function (err) {
        if (!err) {
            log.info("hero created");
            return res.send({ status: 'OK', hero: hero});
        } else {
            console.log(err);

            if(err.name == 'ValidationError') {
                res.statusCode = 400;
                res.send({ error: 'Validation error' });
            } else {
                res.statusCode = 500;
                res.send({ error: 'Server error' }); 
            }

            log.error('Internal error(%d): %s', res.statusCode, err.message);
        }
    }); 
});

app.get('/api/heroes/:id', function (req, res) {
    return HeroModel.findOne({id : req.params.id}, function (err, hero) {
        if (!hero) {
            res.statusCode = 404;
            return res.send({error: 'Not found'});
        }
        if (!err) {
            return res.send({id:hero.id,name:hero.name});
        } else {
            res.statusCode = 500;
            log.error('Internal error(%d): %s', res.statusCode, err.message);
            return res.send({error: 'Server error'});
        }
    });
});

app.put('/api/heroes/:id', function (req, res) { 
    return HeroModel.findOne({id : req.params.id}, function (err, hero) {
        if(!hero) {
            res.statusCode = 404;
            return res.send({ error: 'Not found' });
        }

        hero.name = req.body.name;

        return hero.save(function (err) {
            if (!err) {
                log.info("hero updated");
                return res.send({ status: 'OK', hero:hero });
            } else { 
                if(err.name == 'ValidationError') {
	                res.statusCode = 400;
	                res.send({ error: 'Validation error' });
                } else {
	                res.statusCode = 500;
	                res.send({ error: 'Server error' });
                }

                log.error('Internal error(%d): %s', res.statusCode, err.message);
            }
        });
    }); 
}); 

app.delete('/api/heroes/:id', function (req, res) { 
    return HeroModel.findOne({id : req.params.id}, function (err, hero) {
        if(!hero) {
            res.statusCode = 404;
            return res.send({ error: 'Not found' });
        }

        return hero.remove(function (err) {
            if (!err) {
                log.info("hero removed");
                return res.send({ status: 'OK' });
            } else {
                res.statusCode = 500;
                log.error('Internal error(%d): %s', res.statusCode, err.message);
                return res.send({ error: 'Server error' });
            }
        });
    }); 
});

app.use(function(req, res, next ) {
    res.status(404); 
    log.debug('Not found URL: %s', req.url); 
    res.send({ error: 'Not found' }); 
    return; 
});

app.use(function(err, req, res, next) {  
    res.status(err.status || 500); 
    log.error('Internal error(%d): %s', res.statusCode, err.message); 
    res.send({ error: err.message });   
    return; 
});

app.listen(config.get('port'), function() {
    log.info('Express server listening on port ' + config.get('port')); 
});

function getRandomId() {
    return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
}
