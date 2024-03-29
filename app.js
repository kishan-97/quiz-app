const express=require('express');
const path=require('path');
const exphbs=require('express-handlebars');

const passport=require('passport');
const session=require('express-session');
const MongoStore=require('connect-mongo');

// Config

const dotenv=require('dotenv');
dotenv.config({path:"./config/config.env"});
const PORT=process.env.PORT || 5000;

//Database

const mongoose=require('mongoose');
const connectDB=require('./config/db');
connectDB();

const morgan = require('morgan');

//Routes

const index_route=require('./routes/index');
const login_route=require('./routes/login');
const quiz_register=require('./routes/quiz_init');
const dashboard_route=require('./routes/dashboard_route');
const register_route=require('./routes/registration');


const User=require('./models/user_schema');

const passport_initialize=require('./utils/passport');
passport_initialize(passport,email=>User.findOne({email:email})
,id=>User.findOne({id:id}));

const app=express();

app.use(express.static(path.join(__dirname,'public')));
app.engine('.hbs',exphbs({ defaultLayout:'main',extname:'.hbs'}));
app.set('view engine','.hbs');

app.use(express.json());
app.use(express.urlencoded({extended:false}));

if(process.env.NODE_ENV=="devlopment")
app.use(morgan('dev'));

const session_store=MongoStore.create({mongoUrl:process.env.MONGO_URL});

app.use(session({
    secret:"Top Secret",
    resave:false,
    saveUninitialized:false,
    store:session_store
}));


app.use(passport.initialize());
app.use(passport.session());

app.post('/auth/login',passport.authenticate('local',{
successRedirect:'/dashboard',
failureRedirect:'/'
}));

app.use(index_route);
app.use(register_route);
app.use(login_route);
app.use(quiz_register);
app.use(dashboard_route);

app.use((req,res,next)=>{
    console.log(req.session);
    next();
})

app.listen(PORT,()=>{
    console.log(`Server Is Running at PORT mode ${PORT}`);
})
