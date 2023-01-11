const Visitor = require("../model/Visitor");

exports.visitor = async (req, res) => {
  var result = await Visitor.get_visitor();

  console.log(result);
  res.render("visitor", { data: result });
};

exports.post_visitor = (req, res) => {
  Visitor.post_visitor(req.body, function (result) {
    var data = {
      id: result,
      name: req.body.name,
      comment: req.body.comment,
    };
    res.send(data);
  });
};

exports.delete_visitor = (req, res) => {
  Visitor.delete_visitor(req.body.id, function () {
    res.send("삭제 완료");
  });
};

exports.get_visitor = (req, res) => {
  Visitor.get_visitor_by_id(req.body.id, function (result) {
    if (result.length > 0) res.send(result[0]);
    else res.send("뭔가 잘못됐어요");
  });
};

exports.update_visitor = (req, res) => {
  Visitor.update_visitor(req.body, function () {
    res.send(req.body);
  });
};
