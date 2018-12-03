const cheerio = require("cheerio");
const axios = require("axios");
const db = require("../models");

module.exports = app => {
    // const scrapeResults = (req, res) => {
    //     axios.get("https://fivethirtyeight.com/features/").then(response => {
    //         let $ = cheerio.load(response.data);
    //         $(".fte_features").each((i, element) => {
    //             let result = {};

    //             if ($(element).find(".article-title a").text() != "") {
    //                 result.title = $(element).find(".article-title a").text().trim();
    //                 result.category = $(element).find(".term").text().trim();
    //                 result.link = $(element).find(".article-title a").attr("href");

    //                 axios.get(result.link).then(response => {
    //                     let $ = cheerio.load(response.data);
    //                     let preview = $($(".single-post-content p")[0]).text();
    //                     let previewTrim = `${preview.split(" ").slice(0, 20).join(" ")}...`;
    //                     result.preview = previewTrim;

    //                     const createResultDB = (result) => {
    //                         db.Article.findOneAndUpdate({ title: result.title }, result, { upsert: true })
    //                             .then(function () {
    //                                 db.Article.find({})
    //                                     .populate("notes")
    //                                     .then(function (dbArticle) {
    //                                         const hbsObj = {
    //                                             articles: dbArticle
    //                                         };
    //                                         // console.log(hbsObj.articles);
    //                                         return hbsObj;
    //                                     })
    //                                     .catch(function (err) {
    //                                         res.json(err);
    //                                     });
    //                             })
    //                             .catch(err => res.json(err));
    //                     }

    //                     createResultDB(result);
    //                 });
    //             }
    //         });
    //     })
    // }

    app.get("/scrape", (req, res) => {
        axios.get("https://fivethirtyeight.com/features/").then(response => {
            let $ = cheerio.load(response.data);
            $(".fte_features").each((i, element) => {
                let result = {};

                if ($(element).find(".article-title a").text() != "") {
                    result.title = $(element).find(".article-title a").text().trim();
                    result.category = $(element).find(".term").text().trim();
                    result.link = $(element).find(".article-title a").attr("href");

                    axios.get(result.link).then(response => {
                        let $ = cheerio.load(response.data);
                        let preview = $($(".single-post-content p")[0]).text();
                        let previewTrim = `${preview.split(" ").slice(0, 20).join(" ")}...`;
                        result.preview = previewTrim;

                        const createResultDB = (result) => {
                            db.Article.findOneAndUpdate({ title: result.title }, result, { upsert: true })
                                .then(function () {
                                    db.Article.find({})
                                        .populate("notes")
                                        .then(function (dbArticle) {
                                            res.redirect("/");
                                        })
                                        .catch(function (err) {
                                            res.json(err);
                                        });
                                });
                                // .catch(err => res.json(err));
                        }

                        createResultDB(result);
                    });
                }
            });
        })
    });

    app.get("/", function (req, res) {
        db.Article.find({})
            .populate("notes")
            .then(function (dbArticle) {
                const hbsObj = {
                    articles: dbArticle
                };
                // console.log(hbsObj.articles);
                res.render("index", hbsObj);
            })
            .catch(function (err) {
                res.json(err);
            });
    });

    app.post("/articles/:id", function (req, res) {
        db.Note.create(req.body)
            .then(function (dbNote) {
                return db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: { notes: dbNote._id } }, { new: true });
            })
            .then(function (dbArticle) {
                res.redirect("/");
            })
            .catch(function (err) {
                res.json(err);
            });
    });

    app.post("/delete/:id", function (req, res) {
        db.Note.findByIdAndDelete({ _id: req.params.id })
            .then(function (dbNote) {
                res.redirect("/");
            })
            .catch(function (err) {
                res.json(err);
            });
    });
}