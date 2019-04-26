const express = require('express');
const router  = express.Router();
const User = require("../models/User");
const Meme = require("../models/Meme");

/* GET home page */
router.get('/', (req, res, next) => {
  res.render('index');
});

/* GET mainfeed page */
router.get("/mainfeed", (req, res, next) => {
  Meme.find()
  .populate("_owner")
  .populate("_comments._commentOwner")
  .then( memes => {
    res.render("mainfeed", { 
      memes: memes,
    });
  })
})


/* GET profilePage page */
router.get("/profilePage", (req, res, next) => {
  Promise.all([
    Meme.find({_owner: req.user._id}),
    Meme.find({_favorites: req.user._id})
  ])
    .then(([memes, favoriteMemes]) => {  
      res.render("profilePage", { 
        memes: memes,
        favoriteMemes: favoriteMemes,
        user: req.user,
      });
    })
})

router.get("/user/:userId", (req,res,next) => {
  Promise.all([
    User.findById(req.params.userId),
    Meme.find({_owner: req.params.userId})
  ])
  .then(([user, memes]) => {
    res.render("user",{
      user: user,
      memes
    })
  });
})

// Like Route
router.get("/like/:memeId", (req, res, next) => {
  // TODO: only 1 like per user
  Meme.findById(req.params.memeId, { _likes: 1 })
    .then(meme => {
      for (let i = 0; i < meme._likes.length; i++) {
        if(meme._likes[i].equals(req.user._id)) {
          res.redirect("/mainfeed")
          return
        }
      }
      meme._likes.push(req.user._id)
      meme.save()
        .then(() => {
          res.redirect("/mainfeed")
        })
    })
})

// Favourite Route
router.get("/favourite/:memeId", (req,res,next) => {
  // TODO: only 1 favourite per user
  Meme.findById(req.params.memeId, {_favorites: 1})
    .then(favourite => {
      for (let i = 0; i < favourite._favorites.length; i++) {
        if(favourite._favorites[i].equals(req.user._id)) {
          res.redirect("/mainfeed")
        }
      }
      favourite._favorites.push(req.user._id);
      favourite.save()
        .then(() => {
          res.redirect("/mainfeed")
        })
    })
})

// Comment Route
router.post("/comment/:memeId", (req,res,next) => {
  let newComment = {
    text: req.body.comment, 
    _commentOwner: req.user._id
  };
  Meme.findById(req.params.memeId, {_comments: 1})
    .then(meme => {
      meme._comments.push(newComment)
      meme.save()
        .then(() => {
          res.redirect("/mainfeed")
        })
    })
})

module.exports = router;