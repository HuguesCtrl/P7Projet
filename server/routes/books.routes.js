const router = require("express").Router();
const booksControllers = require("../controllers/books.controllers");
const authentification = require("../middlewares/auth");
const multer = require("../middlewares/multer.config");
const { resizeImage } = require("../middlewares/sharp");

//Route pour ajouter un livre
router.post(
  "/",
  authentification,
  multer,
  resizeImage,
  booksControllers.addBook
);
//Route pour récupérer tous les livres
router.get("/", booksControllers.getAllBooks);
//Route pour récupérer les trois livres les mieux notés
router.get("/bestrating", booksControllers.bestBooks);
//Route pour récupérer un livre en fonction de son id
router.get("/:id", booksControllers.getOneBook);
//Route pour modifier un livre
router.put(
  "/:id",
  authentification,
  multer,
  resizeImage,
  booksControllers.updateBook
);
//Route pour supprimer un livre
router.delete("/:id", authentification, booksControllers.deleteBook);
//Route pour noter un livre
router.post("/:id/rating", authentification, booksControllers.rateBook);

module.exports = router;
