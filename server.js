const express = require("express");
const exphbs = require("express-handlebars");
const mongoose = require("mongoose");
const cheerio = require("cheerio");
const axios = require("axios");
const logger = require("morgan");
const db = require("./models");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.engine("handlebars", exphbs({defaultLayout: "main"}));
app.set("view engine", "handlebars");

app.use(express.static("public"));

// mongoose.connect("mongodb://localhost/fiveThirtyEightScraper", { useNewUrlParser: true });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/fiveThirtyEightScraper";

mongoose.connect(MONGODB_URI);


require("./controllers/scraperController.js")(app);

app.listen(PORT, () => console.log(`App running on port ${PORT}`));

