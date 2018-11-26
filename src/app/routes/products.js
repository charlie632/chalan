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
        // throw err;
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

  app.get("/checktables", (req, res) => {
    connection.query("show tables", (err, result) => res.send(result));
  });

  app.get("/checkuser", (req, res) => {
    connection.query("select * from client", (err, result) => res.send(result));
  });

  app.get("/checkwishlist", (req, res) => {
    connection.query("describe wl_product", (_, result) => res.send(result));
  });

  app.get("/allwl", (req, res) => {
    connection.query("select * from wl_product", (_, result) => res.send(result));
  });

  app.get("/deleteallusers", (req, res) => {
    connection.query("DELETE from client", (err, result) =>
      connection.query("ALTER TABLE client AUTO_INCREMENT = 1", (e, r) => res.send(r))
    );
  });
  app.get("/deleteallwl", (req, res) => {
    connection.query("DELETE from wl_product", (err, result) =>
      connection.query(
        "alter table wl_product modify id_wishlist int(11) AUTO_INCREMENT PRIMARY KEY",
        err => res.send(err)
      )
    );
  });
  app.get("/getproducts", (req, res) => {
    connection.query("DELETE from wl_product", (err, result) =>
      connection.query(
        "alter table wl_product modify id_wishlist int(11) AUTO_INCREMENT PRIMARY KEY",
        err => res.send(err)
      )
    );
  });
};
