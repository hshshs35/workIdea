const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');

//routes
const idea = require('./routes/idea');
const user = require('./routes/user');

//passport config
require('./config/passport')(passport);

const db = require('./config/database')

//set up express
const app = express();
const port = process.env.PORT || 5000;

//mongodb configuration
mongoose.Promise = global.Promise;

mongoose.connect(db.mongoURI, {
    useMongoClient:true
})
.then(()=> console.log('mongodb connected'))
.catch(err =>{
    console.log(err);
});

//set the view engine
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

//middleware setup
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(session({
    secret: 'shawn',
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use((req, res, next) =>{
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

//routes
app.get('/', (req, res) =>{
    res.render('index');
});

app.get('/about', (req, res) =>{
    res.render('about');
});

app.use('/ideas', idea);

app.use('/users', user)



app.listen(port);
