const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');

//set up express
const app = express();
const port = 5000;

//mongodb configuration
mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost/idea', {
    useMongoClient:true
})
.then(()=> console.log('mongodb connected'))
.catch(err =>{
    console.log(err);
});

//require models
require('./models/Idea');
const Idea = mongoose.model('ideas');

//set the view engine
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

//middleware setup
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(session({
    secret: 'shawn',
    resave: true,
    saveUninitialized: true
}));

app.use(flash());

app.use((req, res, next) =>{
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

//routes
app.get('/', (req, res) =>{
    res.render('index');
});

app.get('/about', (req, res) =>{
    res.render('about');
});

app.get('/ideas/add', (req, res) =>{
    res.render('ideas/add');
});

app.get('/ideas/edit/:id', (req, res) =>{
    Idea.findOne({
        _id:req.params.id
    }).then(idea =>{
        res.render('ideas/edit', {
            idea: idea
        });
    });
});

app.put('/ideas/:id', (req, res) =>{
    Idea.findOne({
        _id: req.params.id
    })
    .then(idea =>{
        idea.title = req.body.title;
        idea.details = req.body.details;

        idea.save()
        .then(idea =>{
            req.flash('success_msg', 'edited successfully');
            res.redirect('/ideas');
        });
    });
});

app.delete('/ideas/:id', (req, res) =>{
    Idea.remove({_id: req.params.id})
        .then(() =>{
            req.flash('success_msg', 'Idea removed successfully');
            res.redirect('/ideas');
        });
});

app.get('/ideas', (req, res) =>{
    Idea.find({})
    .sort({date: 'desc'})
    .then(ideas =>{
        res.render('ideas/index', {
            ideas:ideas
        });
    });
});


app.post('/ideas', (req, res) =>{
    let errors = [];
    if(!req.body.title){
        errors.push({text:"title is required"});
    }
    if(!req.body.details){
        errors.push({text:"details is required"});
    }

    if(errors.length > 0){
        res.render('ideas/add', {
            errors: errors,
            title: req.body.title,
            details: req.body.details
        });
    }
    else{
        const newUser = {
            title:req.body.title,
            details: req.body.details,
        }
        new Idea(newUser)
            .save()
            .then(idea =>{
                req.flash('success_msg', 'new idea comes');
                res.redirect('/ideas');
            });
    }
});

app.listen(port);
