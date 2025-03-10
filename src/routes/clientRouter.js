const { Router } = require("express");
const { catchError } = require("../utils/catchError");

const routers = Router();

routers.get("/", (req, res) => {
  res.send("Hello, Router!");
});

module.exports = routers;
