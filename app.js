const express = require("express");
const app = express();
const port = 8000;

app.set("view engine", "ejs");

app.use("/static", express.static("static"));

app.get("/", (req, res) => {
  let person = [
    { name: "최고은", gender: "여자" },
    { name: "홍길동", gender: "남자" },
  ];
  res.render("test", { per: person });
});

app.get("/test1", (req, res) => {
  let fruits = ["수박", "딸기", "참외", "복숭아"];
  res.render("test1", { fruit: fruits });
});

app.get("/test2", (req, res) => {
  res.render("test2");
});

app.get("/watermelon", (req, res) => {
  res.render("watermelon");
});

app.get("/purchase", (req, res) => {
  res.render("purchase");
});

app.listen(port, () => {
  console.log("server open: ", port);
});
