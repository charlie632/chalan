"use strict";
var http = require("http");
const app = require("./config/server");
const express = require("express");
var reload = require("reload");
require("./app/routes/products")(app);
require("./app/routes/stores")(app);

app.use(express.static("./src/public"));

reload(app);
//starting the server
app.listen(app.get("port"), () => {
  console.log("server running on port ", app.get("port"));
});
