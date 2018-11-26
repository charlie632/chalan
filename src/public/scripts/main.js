$("#login").show();
$("#logout").hide();
$("#wishlist").hide();
$(".add-wishlist").hide();

let id_wishlist;
let id_client;
let userEmail;

$(document).ready(() => {
  console.log("sww");
  loginListener();
  handleAuth();
  addToWishList();
  deleteFromWishList();
  linkToWishList();
});

function handleAuth() {
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      $("#login").hide();
      $("#logout").show();
      $("#wishlist").show();
      $(".add-wishlist").show();

      registerUser(user);
    } else {
      $("#login").show();
      $("#logout").hide();
      $("#wishlist").hide();
      $(".add-wishlist").hide();
    }
  });
}

function registerUser(user) {
  const { displayName, email, uid } = user;
  console.log(displayName, email, uid);

  const object = {
    displayName,
    email
  };

  fetch("/saveuser", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(object)
  })
    .then(r => r.json())
    .then(o => {
      console.log(o);
      userEmail = o.email;
      id_client = o.id_client;

      fetch("/getuserwl?id_client=" + id_client)
        .then(rr => rr.json())
        .then(oo => {
          id_wishlist = oo.id_wishlist;

          console.log("id_wishlist", id_wishlist);
        });
    })
    .catch(e => console.log(e));
}

function loginListener() {
  console.log("loginListener");
  $("#login").click(() => {
    console.log("kk");
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase
      .auth()
      .signInWithPopup(provider)
      .then(function(result) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = result.credential.accessToken;
        // The signed-in user info.
        var user = result.user;

        // ...
      })
      .catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
      });
  });

  $("#logout").click(() => {
    firebase.auth().signOut();
  });
}

function addToWishList() {
  $(".add-wishlist").click(function(e) {
    e.preventDefault();
    let id = $(this).attr("id");
    let id_product = id.split("-")[1];
    debugger;

    fetch("/add2wishlist", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ id_wishlist, id_product })
    })
      .then(r => r.json())
      .then(o => {
        console.log(o);
        alert("Producto añadido a tu wishlist");
      })
      .catch(e => console.log(e));
  });
}

function deleteFromWishList() {
  $(".delete-wishlist").click(function(e) {
    e.preventDefault();
    let id = $(this).attr("id");
    let id_product = id.split("-")[1];
    debugger;

    fetch("/deletefromwl?id_product=" + id_product + "&id_wishlist=" + id_wishlist)
      .then(r => r.text())
      .then(o => {
        alert(o);
        window.location.reload();
      })
      .catch(e => console.log(e));
  });
}

function linkToWishList() {
  $("#wishlist").click(() => {
    window.location.href = "/mywishlist?id_wishlist=" + id_wishlist;
  });
}

function mandaMail(e) {
  fetch("/sendEmail?id_wishlist=" + id_wishlist + "&email=" + userEmail).then(kk =>
    alert("email enviado")
  );
}
