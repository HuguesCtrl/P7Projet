const bookModel = require("../models/books.model");
const fs = require("fs");

//Ajoute un livre dans la DB
exports.addBook = async (req, res, next) => {
  const addBookOnList = JSON.parse(req.body.book);
  delete addBookOnList._id;
  delete addBookOnList._userId;
  const newBook = new bookModel({
    ...addBookOnList,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/resized_${
      req.file.filename
    }`,
  });
  newBook
    .save()
    .then(() => {
      res.status(201).json({ message: "Livre enregistré !" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

// Modifie un livre dans la DB
exports.updateBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/resized_${
          req.file.filename
        }`,
      }
    : { ...req.body };
  delete bookObject._userId;
  bookModel
    .findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(403).json({ message: "403: unauthorized request" });
      } else {
        const filename = book.imageUrl.split("/images/")[1];
        req.file &&
          fs.unlink(`images/resized_${filename}`, (err) => {
            if (err) console.log(err);
          });
        bookModel
          .updateOne(
            { _id: req.params.id },
            { ...bookObject, _id: req.params.id }
          )
          .then(() => res.status(200).json({ message: "Objet modifié !" }))
          .catch((error) => res.status(400).json({ error }));
      }
    })
    .catch((error) => {
      res.status(404).json({ error });
    });
};

//Supprime un livre de la DB
exports.deleteBook = (req, res, next) => {
  bookModel
    .findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        res.status(500).json({ message: "Ce livre n'existe pas !!!" });
      }
      bookModel
        .deleteOne({ _id: req.params.id })
        .then(() => {
          res.status(200).json({ message: "Live supprimé !" });
          const filename = book.imageUrl.split("/images/")[1];
          if (fs.existsSync(`images/${filename}`)) {
            fs.unlink(`images/${filename}`, (error) => {
              if (error) {
                throw new Error(error);
              }
            });
          } else {
            res.status(500).json({ message: "Aucune image à supprimer !" });
          }
        })
        .catch((error) => {
          throw new Error(error);
        });
    })
    .catch((error) => {
      throw new Error(error);
    });
};

//Récupérer un livre dans la DB
exports.getOneBook = (req, res, next) => {
  bookModel
    .findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((err) => res.status(404).json({ err }));
};

//Récupérer les trois livres les mieux notés
exports.bestBooks = (req, res, next) => {
  bookModel
    .find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(404).json({ error }));
};

//Récupérer tous les livre de la DB
exports.getAllBooks = (req, res, next) => {
  bookModel
    .find()
    .then((books) => res.status(200).json(books))
    .catch((err) => res.status(400).json({ err }));
};

// Noter un livre
exports.rateBook = (req, res, next) => {
  bookModel
    .findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        res.status(500).json({ message: "Ce livre n'existe pas !!!" });
      }
      if (
        book.ratings
          .map((object) => {
            return object.userId;
          })
          .includes(req.body.userId)
      ) {
        res.status(500).json({ message: "Livre déjà noté !!!" });
      } else {
        bookModel
          .findOneAndUpdate(
            { _id: req.params.id },
            {
              $push: {
                ratings: {
                  userId: req.body.userId,
                  grade: req.body.rating,
                },
              },
            },
            {
              new: true,
              useFindAndModify: true,
            }
          )
          .then((book) => {
            const sum = book.ratings.reduce((accu, curr) => {
              return accu + curr.grade;
            }, 0);
            const average = Math.ceil(sum / book.ratings.length);
            bookModel
              .findOneAndUpdate(
                { _id: req.params.id },
                { $set: { averageRating: average } },
                {
                  new: true,
                  useFindAndModify: true,
                }
              )
              .then((book) => {
                res.status(200).json(book);
              })
              .catch((error) => {
                throw new Error(error);
              });
            console.log("Moyenne mise à jour");
          })
          .catch((error) => {
            throw new Error(error);
          });
      }
    })
    .catch((error) => {
      throw new Error(error);
    });
};
