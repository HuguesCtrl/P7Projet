const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const app = express();
const booksRoutes = require("./routes/books.routes");
const userRoutes = require("./routes/users.routes");

//Import de la variable d'environnement
require("dotenv").config();
//Liaison à la DB
require("./config/database");

//Paramétrer les headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

//Interprêter le JSON
app.use(express.json());

//Import des routes
app.use("/api/stuff", booksRoutes);
app.use("/api/auth", userRoutes);
app.use("/images", express.static(path.join(__dirname, "images")));

module.exports = app;
