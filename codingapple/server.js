const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
const MongoClient = require("mongodb").MongoClient;

let db;
MongoClient.connect(
  "mongodb+srv://admin:Xx1023_0901@cluster0.ezfes.mongodb.net/?retryWrites=true&w=majority",
  (err, client) => {
    if (err) return console.log(err);
    db = client.db("todoapp");
    app.listen(8080, function () {
      console.log("listening on 8080");
    });
  }
);

app.get("/", (req, res) => {
  res.render("main");
});

app.get("/write", (req, res) => {
  res.render("write");
});

app.post("/add", (req, res) => {
  db.collection("counter").findOne({ name: "게시물갯수" }, (err, result) => {
    let totalPost = result.totalPost;

    db.collection("post").insertOne(
      { _id: totalPost + 1, title: req.body.title, date: req.body.date },
      (err, result) => {
        db.collection("counter").updateOne(
          { name: "게시물갯수" },
          { $inc: { totalPost: 1 } },
          (err, result) => {
            console.log(result);
          }
        );
      }
    );
  });
  res.redirect("/list");
});

app.get("/list", (req, res) => {
  db.collection("post")
    .find()
    .toArray((err, result) => {
      console.log("get post", result);
      res.render("list", { posts: result });
    });
});

app.delete("/delete", (req, res) => {
  db.collection("post").deleteOne(
    { _id: parseInt(req.body.id) },
    (err, result) => {
      res.status(200).send;
    }
  );
});
