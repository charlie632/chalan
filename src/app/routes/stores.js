const dbConnection = require("../../config/dbConnection");

const x = require("./constants");

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
      }
    });
  }

  handleDisconnect();

  app.get("/", (req, res) => {
    connection.query("SELECT * FROM products", (err, result) => {
      console.log("from db", result);
      res.render("pages/home", {
        products: result
      });
    });
  });

  app.get("/tienda/:tienda", (req, res) => {
    const { tienda } = req.params;
    try {
      res.render("pages/tienda", {
        data: x.TIENDAS[tienda]
      });
    } catch (e) {}
  });

  app.get("/tienda/:tienda/:categoria", (req, res) => {
    const { tienda, categoria } = req.params;
    try {
      connection.query(
        `SELECT * FROM products where description="${categoria}" AND category="${tienda}"`,
        (err, result) => {
          console.log(result);
          res.render("pages/subcategoria", {
            data: x.TIENDAS[tienda],
            products: result,
            categoria,
            tienda: x.TRADUCTOR[tienda]
          });
        }
      );
    } catch (e) {}
  });
};
