const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
const MongoClient = require("mongodb").MongoClient;
const methodOverride = require("method-override");
app.use(methodOverride("_method"));
require("dotenv").config();

let db;
MongoClient.connect(process.env.DB_URL, (err, client) => {
  if (err) return console.log(err);
  db = client.db("todoapp");
  app.listen(process.env.PORT, function () {
    console.log("listening on 8080");
  });
});

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

app.get("/search", (req, res) => {
  let searchCondition = [
    {
      $search: {
        index: "titleSearch",
        text: {
          query: req.query.value,
          path: "title", // 제목 날짜 둘다 찾고 싶으며 ['제목', '날짜']
        },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: { title: 1, _id: 1, date: 1, score: { $meta: "searchScore" } },
    },
  ];
  db.collection("post")
    .aggregate(searchCondition)
    .toArray((err, result) => {
      console.log(result);
      res.render("search", { posts: result });
    });
});

app.delete("/delete", (req, res) => {
  db.collection("post").deleteOne(
    { _id: parseInt(req.body.id) },
    (err, result) => {
      res.status(200).send("성공");
    }
  );
});

app.get("/detail/:id", (req, res) => {
  console.log(req.params.id);
  db.collection("post").findOne(
    { _id: parseInt(req.params.id) },
    (err, result) => {
      if (!result) res.send("찾는 게시물이 없습니다");
      else res.render("detail", { post: result });
    }
  );
});

app.get("/edit/:id", (req, res) => {
  db.collection("post").findOne(
    { _id: parseInt(req.params.id) },
    (err, result) => {
      console.log(result);
      res.render("edit", { data: result });
    }
  );
});

app.put("/edit", (req, res) => {
  db.collection("post").updateOne(
    { _id: parseInt(req.body.id) },
    { $set: { title: req.body.title, date: req.body.date } },
    (err, result) => {
      console.log("수정완료");
      res.redirect("/list");
    }
  );
});

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
const flash = require("express-flash");

app.use(
  session({ secret: "비밀코드", resave: true, saveUninitialized: false })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.get("/login", (req, res) => {
  res.render("login");
});

app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/fail",
    failureFlash: true,
  }),
  (req, res) => {
    console.log(req.body);
    res.redirect("/");
  }
);

app.get("/mypage", isLoggedin, (req, res) => {
  console.log("req.user", req.user);
  res.render("mypage", { user: req.user });
});

// 마이페이지 접속 전 실행할 미들웨어
function isLoggedin(req, res, next) {
  // 로그인 후 세션이 있으면 req.user 가 항상있음
  if (req.user) {
    next();
  } else {
    res.send("로그인해주세요");
  }
}

// 사용자의 아이디와 비번을 검증하는 부분
passport.use(
  new LocalStrategy(
    {
      usernameField: "id", // 사용자가 제출한 아이디가 어디 적혔는지 form의 name 속성
      passwordField: "pw", // 사용자가 제출한 비번이 어디 적혔는지 form의 name 속성
      session: true, // 세션을 만들건지
      passReqToCallback: false, // 아이디/비번 말고 다른 정보검사가 필요한지
    },
    function (enteredId, enteredPw, done) {
      db.collection("login").findOne({ id: enteredId }, function (err, result) {
        if (err) return done(err);

        if (!result)
          return done(null, false, { message: "존재하지않는 아이디입니다" });
        if (enteredPw == result.pw) {
          return done(null, result);
        } else {
          return done(null, false, { message: "비번 틀렸습니다" });
        }
      });
    }
  )
);

// 세션을 저장시키는 코드 (로그인 성공시 발동)
passport.serializeUser((user, done) => {
  done(null, user.id);
});
// 이 세션데이터를 가진 사람을 DB에서 찾아주세요 (마이페이지 접속시 발동)
passport.deserializeUser((id, done) => {
  // DB에서 위에느는 user.id로 유저를 찾은 뒤에 유저 정보를 넣어줌
  db.collection("login").findOne({ id: id }, function (err, result) {
    done(null, result);
  });
});
