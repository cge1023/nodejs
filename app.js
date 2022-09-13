const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const multer = require("multer");
const path = require("path");
const { parentPort } = require("worker_threads");
const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, done) {
      done(null, "uploads/");
    },
    filename(req, file, done) {
      const id = req.body.id;
      const ext = path.extname(file.originalname);
      done(null, path.basename(file.originalname, ext) + id + ext);
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
app.use("/uploads", express.static("uploads"));
app.use(cookieParser());
app.use(
  session({
    secret: "1234", //암호화할 때 쓰일 문자열
    resave: false,
    saveUninitialized: true,
    // secure: true,
    cookie: {
      maxAge: 60000,
      httpOnly: true,
    },
  })
);

app.get("/", (req, res) => {
  console.log(req.cookies.key3);
  res.render("sessionLogin");
});

app.post("/setCookie", (req, res) => {
  res.cookie("key3", "value3", {
    maxAge: 100000,
    httpOnly: true,
  });
  res.send(true);
});

var info = { id: "cge1023", pw: "1023" };

app.post("/sessionLogin", (req, res) => {
  console.log(req.session);
  if (req.body.id == info.id && req.body.password == info.pw) {
    req.session.user = info.id;
    res.send(true);
  } else {
    res.send("로그인 실패");
    console.log("로그인 실패");
  }
});

app.get("/profile", (req, res) => {
  if (req.session.user) {
    res.render("profile", { user: req.session.user });
  } else {
    res.redirect("/sessionLogin");
  }
});

app.get("/sessionLogout", (req, res) => {
  req.session.destroy(function () {
    res.send(true);
  });
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
  console.log(req.body.id);
  console.log(req.file);
  res.send(`<img src="/uploads/${req.file.filename}">`);
});

//post 요청이 /post라는 주소로 들어왔을 때 안의 함수를 실행
app.listen(port, () => {
  console.log("server open: ", port);
});
