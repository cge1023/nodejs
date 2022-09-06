// 해당 라우터로 진입 했을 때 어떤 행동을 할 것인지?
const Test = require("../model/Test");
const User = require("../model/User");

exports.main = (req, res) => {
  //   var hi = Test.hello();
  res.render("login");
};

exports.login = (req, res) => {
  var info = Test.login();
  if (req.body.id == info.id && req.body.password == info.pw) {
    res.send("로그인 성공");
  } else {
    res.send("로그인 실패");
  }
};

exports.login2 = (req, res) => {
  var users = User.user();
  var info = [];
  console.log(users);
  var all_info = users.split("\n");
  console.log("all_info : ", all_info);
  for (let i = 0; i < all_info.length; i++) {
    info.push(all_info[i].split("//"));
  }
  console.log("info : ", info);
  for (let j = 0; j < info.length; j++) {
    if (req.body.id == info[j][0] && req.body.password == Number(info[j][1])) {
      return res.send(`${info[j][2]}님 환영합니다`);
    } else {
      return res.send("로그인 실패입니다");
    }
  }
};
