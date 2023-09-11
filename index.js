import 'dotenv/config';
import express from "express";
import pgp from "pg-promise";
import exphbs from "express-handlebars";
import bodyParser from "body-parser";
import flash from "flash-express";
import query from './services/restaurant.js';

const app = express()

app.use(express.static('public'));
app.use(flash());

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const handlebarSetup = exphbs.engine({
    partialsDir: "./views/partials",
    viewPath: './views',
    layoutsDir: './views/layouts'
});

app.engine('handlebars', handlebarSetup);
app.set('view engine', 'handlebars');

const DATABASE_URL = '';

const connectionString = process.env.DATABASE_URL || DATABASE_URL;
const db = pgp()(connectionString);

// const restaurant = restaurant(db);

// db.connect()
// .then(obj => console.log("testing"))
// .catch(err => console.log("sometthhhing"))
//testing to see if the database is connected 

///Routes
app.get("/", (req, res) => {

    res.render('index', { tables : [{}, {}, {booked : true}, {}, {}, {}]})
});

app.get("/bookings", (req, res) => {
    res.render('bookings', { tables : [{}, {}, {}, {}, {}, {}]})
});


var portNumber = process.env.PORT || 3000;

//start everything up
app.listen(portNumber, function () {
    console.log('🚀  server listening on:', portNumber);
});