const Signup = require("../model/Signup");

exports.signup = (req, res) => {
  Signup.get_signup(function (result) {
    console.log(result);
    res.render("signup", { data: result });
  });
};

exports.post_signup = (req, res) => {
  Signup.post_signup(req.body, function (result) {
    var data = {
      id: result,
      name: req.body.name,
      password: req.body.password,
    };
    res.send(data);
  });
};

exports.get_signup = (req, res) => {
  Signup.get_signup_by_id(req.body.id, function (result) {
    if (result.length > 0) res.send(result[0]);
    else res.send("뭔가 잘못됐어요");
  });
};
