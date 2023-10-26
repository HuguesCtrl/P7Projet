const bookModel = require("../models/books.model");
const fs = require("fs");

//Ajoute un livre dans la DB
exports.addBook = (req, res, next) => {
  const addBookOnList = JSON.parse(req.body.bookmodel);
  delete addBookOnList._id;
  delete addBookOnList._userId;
  const newBook = new bookModel({
    ...addBookOnList,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });

  newBook
    .save()
    .then(() => {
      res.status(201).json({ message: "Objet enregistré !" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

//Modifie un objet
exports.updateBook = (req, res, next) => {
  const updateBookOnList = req.file
    ? {
        ...JSON.parse(req.body.bookmodel),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  delete updateBookOnList._userId;
  bookModel
    .findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Non-autorisé" });
      } else {
        bookModel
          .updateOne(
            { _id: req.params.id },
            { ...updateBookOnList, _id: req.params.id }
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
exports.deleteBook = (req, res, next) => {
  bookModel
    .findOne({ _id: req.params._id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Non-autorisé" });
      } else {
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          bookModel
            .deleteOne({ _id: req.params.id })
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
exports.getOneBook = (req, res, next) => {
  bookModel
    .findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((err) => res.status(404).json({ err }));
};

//Récupérer les trois livres les mieux notés
module.exports.bestBooks = async (req, res) => {
  try {
    const searchBestBooksOnList = await bookModel
      .find()
      .sort({ averageRating: -1 })
      .limit(3);
    if (!searchBestBooksOnList.length) {
      return res.status(400).json({ message: "Aucun livre n'a de notes !" });
    } else {
      return res.status(200).json(searchBestBooksOnList);
    }
  } catch (err) {
    res.status(500).json({
      message:
        "Impossible de récupérer les trois livres les mieux notés " + err,
    });
  }
};

//Récupérer tous les objets de la DB
exports.getAllBooks = (req, res, next) => {
  bookModel
    .find()
    .then((books) => res.status(200).json(books))
    .catch((err) => res.status(400).json({ err }));
};

//Noter un livre
module.exports.rateBook = async (req, res) => {
  try {
    const userId = req.user.id;
    const rating = parseInt(req.body.grade);
    console.log(userId, rating);
    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "La note doit être entre 1 et 5" });
    } else {
      const bookRate = await bookModel.findByIdAndUpdate(
        req.params.id,
        {
          $push: { ratings: [{ userId, grade: rating }] },
        },
        { new: true }
      );

      if (!bookRate) {
        res.status(400).json({ message: "Ce livre n'existe pas !" });
      } else {
        const sumRatings = bookRate.ratings.reduce(
          (sum, rating) => sum + rating.grade,
          0
        );
        bookRate.averageRating = sumRatings / bookRate.ratings.length;
        res.status(200).json({ message: "Note enregistrée avec succès" });
      }
    }
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Impossible de noter un livre " + err });
  }
};
