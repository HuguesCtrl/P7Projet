const mongoose = require("mongoose");

//Permet de créer un schéma pour notre base de données MongoDB
const bookSchema = mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  genre: {
    type: String,
    required: true,
  },
  ratings: [
    {
      userId: String,
      grade: Number,
    },
  ],
  averageRating: {
    type: Number,
  },
});

//Méthode model transforme le schéma en modèle utilisable
module.exports = mongoose.model("book", bookSchema);
