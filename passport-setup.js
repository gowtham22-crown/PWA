const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./server/models/user");
require("dotenv/config");

passport.serializeUser(function (user, done) {
  /*
    From the user take just the id (to minimize the cookie size) and just pass the id of the user
    to the done callback
    PS: You dont have to do it like this its just usually done like this
    */
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  /*
    Instead of user this function usually recives the id 
    then you use the id to select the user from the db and pass the user obj to the done callback
    PS: You can later access this data in any routes in: req.user
    */
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CI,
      clientSecret: process.env.GOOGLE_CS,
      callbackURL: "https://crowntranscriptor.herokuapp.com/google/callback",
    },
    async function (accessToken, refreshToken, profile, done) {
      /*
     use the profile info (mainly profile id) to check if the user is registerd in ur db
     If yes select the user and pass him to the done callback
     If not create the user and then select him and pass to callback
    */

      const user1 = new User({
        name: profile._json.name,
        gid: profile._json.sub,
        picture: profile._json.picture,
        email: profile._json.email,
        transcriptions: 0,
      });

      await User.find()
        .then((user) => {
          user.gid == profile._json.sub
            ? (profile = user)
            : user1
                .save(user1)
                .then((data) => {})
                .catch((err) => {
                  console.log(err.message || "Something went wrong");
                });
        })
        .catch((err) => {
          console.log(err.message || "Something went wrong");
        });

      return done(null, profile);
    }
  )
);
