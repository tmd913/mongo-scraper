const cheerio = require("cheerio");
const axios = require("axios");
const db = require("../models");

module.exports = app => {
    const scrapeResults = (req, res) => {
        axios.get("https://fivethirtyeight.com/features/").then(response => {
            var $ = cheerio.load(response.data);
            $(".fte_features").each((i, element) => {
                let result = {};

                if ($(element).find(".article-title a").text() != "") {
                    result.title = $(element).find(".article-title a").text().trim();
                    result.category = $(element).find(".term").text().trim();
                    result.link = $(element).find(".article-title a").attr("href");

                    const createResultDB = (result) => {
                        db.Article.create(result)
                            .then(dbArticle => console.log(dbArticle))
                            .catch(err => res.json(err));
                    }

                    createResultDB(result);
                }
            });
        })
    }

    app.get("/scrape", (req, res) => {
        scrapeResults(req, res);
    });

    app.get("/articles", function (req, res) {
        // Grab every document in the Articles collection
        db.Article.find({})
            .then(function (dbArticle) {
                const hbsObj = {
                    articles: dbArticle
                };
                res.render("index", hbsObj);
            })
            .catch(function (err) {
                // If an error occurred, send it to the client
                res.json(err);
            });
    });

    app.get("/articles/:id", function (req, res) {
        // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
        db.Article.findOne({ _id: req.params.id })
            // ..and populate all of the notes associated with it
            .populate("notes")
            .then(function (dbArticle) {
                // If we were able to successfully find an Article with the given id, send it back to the client
                res.json(dbArticle);
            })
            .catch(function (err) {
                // If an error occurred, send it to the client
                res.json(err);
            });
    });

    // Route for saving/updating an Article's associated Note
    app.post("/articles/:id", function (req, res) {
        // Create a new note and pass the req.body to the entry
        db.Note.create(req.body)
            .then(function (dbNote) {
                // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
                // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
                // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
                return db.Article.findOneAndUpdate({ _id: req.params.id }, { notes: dbNote._id }, { new: true });
            })
            .then(function (dbArticle) {
                // If we were able to successfully update an Article, send it back to the client
                res.json(dbArticle);
            })
            .catch(function (err) {
                // If an error occurred, send it to the client
                res.json(err);
            });
    });
}