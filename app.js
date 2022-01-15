const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const passport = require("passport");
const cookieSession = require("cookie-session");
const User = require("./server/models/user");
const Trans = require("./server/models/transcription");

require("dotenv/config");
require("./passport-setup");

const path = require("path");
const mongoose = require("mongoose");

app.use(cors());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// For an actual app you should configure this with an experation time, better keys, proxy and secure
app.use(
  cookieSession({
    name: "tuto-session",
    keys: ["key1", "key2"],
  })
);

// Auth middleware that checks if the user is logged in
const isLoggedIn = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.status(401).sendFile("views/login.html", { root: __dirname });
    // res.redirect("/google");
  }
};

// Initializes passport and passport sessions
app.use(passport.initialize());
app.use(passport.session());

// Example protected and unprotected routes
app.get("/", (req, res) =>
  res.sendFile("views/index.html", { root: __dirname })
);

app.get("/failed", (req, res) => res.send("You Failed to log in!"));

// In this route you can see that if the user is logged in u can acess his info in: req.user
app.get("/profile", isLoggedIn, (req, res) => {
  //   res.send(`Welcome mr ${req.user.id}!`);
  res.sendFile("views/profile.html", { root: __dirname });
});

app.get("/profileData", isLoggedIn, (req, res) => {
  const id = req.user.id;
  User.findOne({ gid: id }, function (err, obj) {
    res.status(200).send(obj);
  });
});

app.get("/conversions", isLoggedIn, (req, res) => {
  const id = req.user.id;
  Trans.find()
    .then((doc) => {
      doc = doc.filter((data) => data.gid == id);
      res.status(200).send(doc);
    })
    .catch((err) => {
      console.log(err.message || "Something went wrong");
    });
});

function generateUUID() {
  // Public Domain/MIT
  var d = new Date().getTime(); //Timestamp
  var d2 =
    (typeof performance !== "undefined" &&
      performance.now &&
      performance.now() * 1000) ||
    0; //Time in microseconds since page-load or 0 if unsupported
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = Math.random() * 16; //random number between 0 and 16
    if (d > 0) {
      //Use timestamp until depleted
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      //Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

app.post("/save", isLoggedIn, (req, res) => {
  const id = req.user.id;

  const transcribed = new Trans({
    tid: generateUUID(),
    convertedFrom: req.body.convertedFrom,
    convertedText: req.body.convertedText,
    gid: id,
  });

  transcribed
    .save(transcribed)
    .then((data) => {
      User.findOne({ gid: id }, function (err, obj) {
        const val = obj.transcriptions;

        User.findOneAndUpdate({ gid: id }, { transcriptions: val + 1 }).then(
          (data) => {
            res.sendStatus(200);
          }
        );
      });
    })
    .catch((err) => {
      console.log(err.message || "Something went wrong");
    });
});

// Auth Routes
app.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/failed" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/");
  }
);

app.get("/logout", (req, res) => {
  req.session = null;
  req.logout();
  res.redirect("/");
});

//DATABASE CONNECTION
mongoose.connect(process.env.DB_URL, { useNewUrlParser: true });
const con = mongoose.connection;
con.on("open", () => {
  console.log("Connected");
});

//LOADING ASSETS
app.use("/css", express.static(path.resolve(__dirname, "/assets/css")));
app.use("/js", express.static(path.resolve(__dirname, "assets/js")));
app.use("/static", express.static(path.resolve(__dirname, "assets/static")));
app.use("/views", express.static(path.resolve(__dirname, "views/")));
app.use("/img", express.static(path.resolve(__dirname, "img/")));

app.use("/manifest.json", express.static(path.resolve(__dirname, "manifest.json")));
app.use(
  "/views/static",
  express.static(path.resolve(__dirname, "assets/static"))
);

app.listen(process.env.PORT || 3000, () =>
  console.log(`Listening on port ${3000}!`)
);
