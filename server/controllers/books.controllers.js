const Thing = require("../models/Thing");
const fs = require("fs");

//Créer un objet dans la DB
exports.createThing = (req, res, next) => {
  const thingObject = JSON.parse(req.body.thing);
  delete thingObject._id;
  delete thingObject._userId;
  const thing = new Thing({
    ...thingObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });

  thing
    .save()
    .then(() => {
      res.status(201).json({ message: "Objet enregistré !" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

//Modifie un objet
exports.modifyThing = (req, res, next) => {
  const thingObject = req.file
    ? {
        ...JSON.parse(req.body.thing),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  delete thingObject._userId;
  Thing.findOne({ _id: req.params.id })
    .then((thing) => {
      if (thing.userId != req.auth.userId) {
        res.status(401).json({ message: "Non-autorisé" });
      } else {
        Thing.updateOne(
          { _id: req.params.id },
          { ...thingObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Objet modifié !" }))
          .catch((err) => res.status(401).json({ err }));
      }
    })
    .catch((err) => {
      res.status(400).json({ err });
    });
};

//Supprime un objet
exports.deleteThing = (req, res, next) => {
  Thing.findOne({ _id: req.params._id })
    .then((thing) => {
      if (thing.userId != req.auth.userId) {
        res.status(401).json({ message: "Non-autorisé" });
      } else {
        const filename = thing.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Thing.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Objet supprimé !" });
            })
            .catch((err) => res.status(401).json({ err }));
        });
      }
    })
    .catch((err) => {
      res.status(500).json({ err });
    });
};

//Récupérer un objet dans la DB
exports.getOneThing = (req, res, next) => {
  Thing.findOne({ _id: req.params.id })
    .then((thing) => res.status(200).json(thing))
    .catch((err) => res.status(404).json({ err }));
};

//Récupérer tous les objets de la DB
exports.getAllThings = (req, res, next) => {
  Thing.find()
    .then((things) => res.status(200).json(things))
    .catch((err) => res.status(400).json({ err }));
};
