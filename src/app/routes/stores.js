const dbConnection = require("../../config/dbConnection");

const x = require("./constants");

const sendgrid = require("sendgrid");
const SENDGRID_API_KEY = "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";

const client = sendgrid(SENDGRID_API_KEY);

module.exports = app => {
  var connection;
  console.log("CONNECTED");

  function handleDisconnect() {
    connection = dbConnection();

    connection.on("error", function(err) {
      console.log("DB disconnected, trying to reconnect...");
      if (err.code === "PROTOCOL_CONNECTION_LOST") {
        handleDisconnect();
      } else {
      }
    });
  }

  handleDisconnect();

  app.get("/ubicacion", (req, res) => {
    res.render("pages/ubicacion");
  });

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

  app.post("/saveuser", (req, res) => {
    let { email, displayName } = req.body;
    connection.query(`select * from client where email="${email}"`, (err, result) => {
      if (err || result.length === 0) {
        connection.query(
          `insert into client (name, email) values ( "${displayName}", "${email}")`,
          (err_, result_) => {
            if (err_) {
              res.send(err_);
            }

            let { insertId } = result_;
            connection.query(
              `insert into wish_list (id_client, date, total) values ("${insertId}", "${new Date()
                .toISOString()
                .slice(0, 19)
                .replace("T", " ")}", 0)`,
              (ee, rr) => {
                if (ee) res.send(ee);
                res.send({ userID: insertId });
              }
            );
          }
        );
      } else {
        res.send({ id_client: result[0].id_client, email: result[0].email });
      }
    });
  });

  app.post("/add2wishlist", (req, res) => {
    let { id_wishlist, id_product } = req.body;
    connection.query(
      `insert into wl_product ( id_product, qty, subtotal) values ("${id_product}", "${id_wishlist}", 0)`,
      (err, r) => {
        if (err) res.send(err);
        res.send(r);
      }
    );
  });

  app.get("/getuserwl", (req, res) => {
    let { id_client } = req.query;
    connection.query(
      `
      select id_wishlist from wish_list where id_client="${id_client}"
    `,
      (err, r) => {
        if (err) res.send(err);
        res.send(r[0]);
      }
    );
  });

  app.get("/mywishlist", (req, res) => {
    let id_wishlist = req.query.id_wishlist;
    connection.query(`select * from wl_product where qty="${id_wishlist}"`, (err, r) => {
      if (err) console.log(err);
      let products = [];
      let promises = [];
      r.forEach(element => {
        let id_product = element.id_product;
        let p = new Promise((resolve, reject) => {
          connection.query(`select * from products where id_products="${id_product}"`, (err, r) => {
            if (err) reject(false);
            resolve(r[0]);
          });
        });
        promises.push(p);
      });

      Promise.all(promises).then(s => {
        s.forEach(product => {
          products.push(product);
        });
        res.render("pages/mywishlist", {
          products
        });
      });
    });
  });

  app.get("/deletefromwl", (req, res) => {
    let id_wishlist = req.query.id_wishlist;
    let id_product = req.query.id_product;
    connection.query(
      `DELETE from wl_product where qty="${id_wishlist}" AND id_product="${id_product}"`,
      (err, r) => {
        if (err) {
          res.send("ERROR");
        }
        res.send("BORRADO");
      }
    );
  });

  app.get("/sendEmail", (req, res) => {
    let id_wishlist = req.query.id_wishlist;
    let email = req.query.email;
    connection.query(`select * from wl_product where qty="${id_wishlist}"`, (err, r) => {
      if (err) console.log(err);
      let products = [];
      let promises = [];
      r.forEach(element => {
        let id_product = element.id_product;
        let p = new Promise((resolve, reject) => {
          connection.query(`select * from products where id_products="${id_product}"`, (err, r) => {
            if (err) reject(false);
            resolve(r[0]);
          });
        });
        promises.push(p);
      });

      Promise.all(promises).then(s => {
        s.forEach(product => {
          products.push(product);
        });
        const request = client.emptyRequest({
          method: "POST",
          path: "/v3/mail/send",
          body: parseBody(email, products)
        });
        client
          .API(request)
          .then(k => res.send("OK"))
          .catch(eeee => console.log(eeee));
      });
    });
  });
};

const parseBody = (email, products) => {
  var helper = sendgrid.mail;
  var fromEmail = new helper.Email("pontealgo@gmail.com");
  var toEmail = new helper.Email(email);
  var subject = "Resumen de tu wishlist";
  var content = new helper.Content("text/html", makeBody(products));
  var mail = new helper.Mail(fromEmail, subject, toEmail, content);
  return mail.toJSON();
};

const makeBody = products => {
  let html = "";
  let total = 0;
  products.forEach(e => {
    html =
      html +
      `
    <div>
    <p>${e.name}</p> <p> ${e.price} </p>
    </div>
  `;
    total = total + e.price;
  });

  html = html + "<p> total= " + total.toString() + "</p>";
  return html;
};
