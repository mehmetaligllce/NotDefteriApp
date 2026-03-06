import express from 'express';
import exphbs from 'express-handlebars'
import auth from './routes/auth.js'
import mongoose from 'mongoose'
import session from 'express-session'
import flash from 'connect-flash'
import MongoStore from 'connect-mongo'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config(
    { quiet: true }
)


const app = express();
app.engine('handlebars', exphbs.engine())

try {
    mongoose.connect(process.env.MONGODB_URI);

}
catch (err) {
    console.log(err);
}
app.set('view engine', 'handlebars')
app.set('views', './views')

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    },
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI
    })
}))
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }))
app.use(flash())
app.use(auth)




app.listen(3000);

