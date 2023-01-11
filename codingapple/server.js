const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
const MongoClient = require("mongodb").MongoClient;
const methodOverride = require("method-override");
app.use(methodOverride("_method"));
app.set("view engine", "ejs");

require("dotenv").config();

// static 파일을 보관하기위해 public폴더를 쓸거다
app.use("/public", express.static("public"));

let db;
MongoClient.connect(process.env.DB_URL, (err, client) => {
  // 연결되면 할 일
  if (err) return console.log(err);
  // todoapp 이라는 db에 접근 하겠음
  db = client.db("todoapp");

  // db에 성공적으로 접속 시 실행
  app.listen(process.env.PORT, () => {
    console.log("listening on 8080");
  });
});

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/write", (req, res) => {
  res.render("write");
});

// 어떤 사람이 /add 경로로 POST 요청을 하면 ?? 해주세요~
app.post("/add", (req, res) => {
  res.send("전송완료");
  db.collection("counter").findOne(
    { name: "게시물갯수" },
    function (err, result) {
      let totalPost = result.totalPost;

      db.collection("post").insertOne(
        { _id: totalPost + 1, title: req.body.title, date: req.body.date },
        (err, result) => {
          console.log("저장완료");
          // counter라는 collection에 있는 totalPost 라는 항목도 1 증가 시켜야함
          db.collection("counter").updateOne(
            { name: "게시물갯수" },
            { $inc: { totalPost: 1 } },
            function (err, result) {
              console.log("수정완료");
            }
          );
        }
      );
    }
  );
});

// /list로 GET 요청으로 접속하면
app.get("/list", (req, res) => {
  // db에 저장된 post 라는 collection안의 데이터를 꺼내주세요
  db.collection("post")
    .find()
    .toArray(function (err, result) {
      console.log(result);
      res.render("list", { posts: result });
    });
});

app.delete("/delete", (req, res) => {
  req.body._id = parseInt(req.body._id);
  console.log(req.body);
  db.collection("post").deleteOne(req.body, (err, result) => {
    console.log("삭제완료");
    res.status(200);
  });
  res.send("삭제완료");
});

app.get("/detail/:id", (req, res) => {
  // url에 있는 번호에 해당하는 _id를 가진 데이터를 찾아와서 detail페이지에 보내주기
  db.collection("post").findOne(
    { _id: parseInt(req.params.id) },
    (err, result) => {
      if (err) {
        res.send("해당 게시물을 찾을 수 없습니다");
      } else {
        res.render("detail", { data: result });
      }
    }
  );
});

app.get("/edit/:id", (req, res) => {
  db.collection("post").findOne(
    { _id: parseInt(req.params.id) },
    function (err, result) {
      if (result == null) res.send("찾는 게시물이 없습니다");
      else res.render("edit", { post: result });
    }
  );
});

app.put("/edit", (req, res) => {
  db.collection("post").updateOne(
    { _id: parseInt(req.body.id) },
    { $set: { title: req.body.title, date: req.body.date } },
    function (err, result) {
      console.log("수정완료");
      res.redirect("/list");
    }
  );
});

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");

app.use(
  session({ secret: "비밀코드", resave: true, saveUninitialized: false })
);
app.use(passport.initialize());
app.use(passport.session());

app.get("/login", (req, res) => {
  res.render("login");
});
// 1. 로그인 POST 요청이 들어오면
app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/fail",
  }),
  (req, res) => {
    res.redirect("/");
  }
);
app.get("/fail", (req, res) => {
  res.send("로그인에 실패하였습니다");
});

app.get("/mypage", isLoggedin, (req, res) => {
  console.log("req.user", req.user); // deserialize 에서 넘겨준 req.user
  res.render("mypage", { user: req.user });
});

function isLoggedin(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.send("로그인해주세요");
  }
}
// 2. 아이디, 비번 인증해주는 세부 코드
passport.use(
  new LocalStrategy(
    {
      usernameField: "id", // 사용자가 제출한 아이디가 어디 적혔는지 (form 에 입력한 name 속성)
      passwordField: "pw", // 사용자가 제출한 비번이 어디 적혔는지 (form 에 입력한 name 속성)
      session: true, // 세션을 만들건지
      passReqToCallback: false, // 아이디/비번 말고 다른 정보검사가 필요한지
    },
    function (enteredId, enteredPw, done) {
      db.collection("login").findOne({ id: enteredId }, function (err, result) {
        if (err) return done(err);

        // DB에 아이디가 없으면
        if (!result)
          return done(null, false, { message: "존재하지않는 아이디요" });
        // DB에 아이디가 있으면
        if (enteredPw == result.pw) {
          return done(null, result);
        } else {
          return done(null, false, { message: "비번틀렸어요" });
        }
      });
    }
  )
);

// 로그인 성공 -> 세션정보를 만듦 -> 마이페이지 방문시 세션검사

// 3. id를 이용해서 세션을 저장시키는 코드(로그인 성공시 발동)
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

// 4. mypage 접속 시(세션찾기), 이 세션데이터를 가진 사람을 DB에서 찾아주세요 / 세션아이디를 바탕으로 이 유저의 정보를 DB에서 찾아주세요 찾아서 req.user에 넣어줌
passport.deserializeUser(function (id, done) {
  db.collection("login").findOne({ id: id }, function (err, result) {
    done(null, result);
  });
});

app.get("/join", (req, res) => {
  res.render("join");
});

app.post("/join", (req, res) => {
  console.log(req.body.id, req.body.pw);
  db.collection("login").insertOne(
    { id: req.body.id, pw: req.body.pw },
    function (err, result) {
      console.log(result);
    }
  );
  res.redirect("/login");
});
