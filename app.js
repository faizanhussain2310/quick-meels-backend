require("dotenv").config({ path: "./config.env" });

const mongoose = require("mongoose");
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const meelRoutes = require("./routes/meelItem");
const authRoutes = require("./routes/auth");

const app = express();

app.use(bodyParser.json()); // application/json

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use("/auth", authRoutes);
app.use("/feed", meelRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({
    message: message,
    data: data,
  });
});

// console.log(process.env);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.qjm8rhj.mongodb.net/react-meels`
  )
  .then((result) => {
    app.listen(8080);
  })
  .catch((err) => console.log(err));
