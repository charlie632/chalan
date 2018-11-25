const dbConnection = require("../../config/dbConnection");

module.exports = app => {
  var connection;
  console.log("CONNECTED");

  function handleDisconnect() {
    connection = dbConnection();

    connection.on("error", function(err) {
      console.log("db error", err);
      if (err.code === "PROTOCOL_CONNECTION_LOST") {
        handleDisconnect();
      } else {
        throw err;
      }
    });
  }

  handleDisconnect();

  app.get("/pruebaprod", (req, res) => {
    connection.query("SELECT * FROM products", (err, result) => {
      console.log("from db", result);
      res.render("pages/products", {
        products: result
      });
    });
  });

  app.get("/pruebaCAT", (req, res) => {
    connection.query("SELECT * FROM products", (err, result) => {
      res.send(result);
    });
  });

  app.post("/products", (req, res) => {
    const { name, price, description, category, status, url } = req.body;
    connection.query(
      "INSERT INTO products SET?",
      {
        name,
        price,
        description,
        category,
        status,
        url
      },
      (err, result) => {
        res.redirect("/pruebaprod");
      }
    );
  });
};
