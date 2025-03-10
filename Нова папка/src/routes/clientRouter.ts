const { Router: Router1 } = require("express");
const { catchError: catchError1 } = require("../utils/catchError");

const routers = Router1();

routers.get("/", (req, res) => {
  res.send("Hello, Router!");
});

module.exports = routers;
