const express = require("express");
const multer = require("multer");
const path = require("path");
const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, done) {
      done(null, "uploads/");
    },
    filename(req, file, done) {
      const ext = path.extname(file.originalname);
      done(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});
const app = express();
const port = 8000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.set("view engine", "ejs");
app.use("/static", express.static("static"));

app.get("/", (req, res) => {
  res.render("fileUpload");
});

app.get("/get", (req, res) => {
  console.log(req.query); //입력된 값 출력
  res.render("aaaa", {
    name: req.query.name, //서버에서 받아온 변수 전달
  });
  // res.send("get 요청"); //문자열 전송
});

app.post("/post", (req, res) => {
  console.log(req.body);
  res.render("aaaa", {
    name: req.body.name,
    gender: req.body.gender,
    birthYear: req.body.birthYear,
  });
});

app.post("/get/ajax", (req, res) => {
  console.log(req.body);
  var data = {
    name: req.body.name,
    gender: req.body.gender,
  };
  res.send(data);
});

app.get("/get/axios", (req, res) => {
  console.log(req.query);
  var data = {
    name: req.query.name,
    gender: req.query.gender,
  };
  res.send(data);
});

app.post("/post/axios", (req, res) => {
  console.log(req.body);
  var data = {
    id: "cge1023",
    pw: "1023",
  };
  if (req.body.id == data.id && req.body.password == data.pw) {
    res.send("로그인 성공");
  } else {
    res.send("로그인 실패");
  }
});

app.post("/upload", upload.single("userfile"), (req, res) => {
  console.log(req.body);
  console.log(req.file);
  res.send("업로드 성공");
});

//post 요청이 /post라는 주소로 들어왔을 때 안의 함수를 실행
app.listen(port, () => {
  console.log("server open: ", port);
});
