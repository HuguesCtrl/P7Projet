const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userModel = require("../models/users.model");

//Fonction permettant l'inscription de l'utilisateur
module.exports.signUpUser = (req, res, next) => {
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const user = new userModel({
        email: req.body.email,
        password: hash,
      });
      user
        .save()
        .then(() => res.status(201).json({ message: "Utilisateur crée !" }))
        .catch((err) => res.status(400).json({ err }));
    })
    .catch((err) => res.status(500).json({ err }));
};

//Fonction permettant la connexion de l'utilisateur
module.exports.logInUser = (req, res, next) => {
  userModel
    .findOne({ email: req.body.email })
    .then((user) => {
      if (user === null) {
        res
          .status(401)
          .json({ message: "Paire identifiant/mot de passe incorrecte" });
      } else {
        bcrypt
          .compare(req.body.password, user.password)
          .then((valid) => {
            if (!valid) {
              res
                .status(401)
                .json({ message: "Paire identifiant/mot de passe incorrecte" });
            } else {
              res.status(200).json({
                userId: user._id,
                token: jwt.sign(
                  {
                    userId: user._id,
                  },
                  process.env.TOKEN,
                  { expiresIn: "24h" }
                ),
              });
            }
          })
          .catch((err) => {
            res.status(500).json({ err });
          });
      }
    })
    .catch((err) => res.status(500).json({ err }));
};
