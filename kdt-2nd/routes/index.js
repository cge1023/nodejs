// 라우터 지정
var express = require("express");
var controller = require("../controller/Cmain");
const router = express.Router();

router.get("/", controller.main);
router.post("/login", controller.login);
router.post("/login2", controller.login2);

var controllerV = require("../controller/CVisitor");
router.get("/visitor", controllerV.visitor);
router.post("/visitor/post", controllerV.post_visitor);
router.post("/visitor/delete", controllerV.delete_visitor);
router.post("/visitor/get", controllerV.get_visitor);
router.post("/visitor/update", controllerV.update_visitor);

var controllerS = require("../controller/CSignup");
router.get("/signup", controllerS.signup);
router.post("/signup/post", controllerS.post_signup);
router.post("signup/get", controllerS.get_signup);
module.exports = router;
