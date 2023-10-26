const router = require("express").Router();
const usersControllers = require("../controllers/users.controllers");

//Route permettant de s'inscrire
router.post("/signup", usersControllers.signUpUser);
//Route permettant de se connecter
router.post("/login", usersControllers.logInUser);

module.exports = router;
