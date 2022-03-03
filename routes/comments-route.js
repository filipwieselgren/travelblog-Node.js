const express = require("express");
const utils = require("../utils.js");
const CommentsModel = require("../models/CommentsModel.js");
const jwt = require("jsonwebtoken");
const router = express.Router();

//Om man inte är inloggad

const forceAuthorize = (req, res, next) => {
  const { username, password } = req.body;
  const { token } = req.cookies;

  if (
    (token && jwt.verify(token, process.env.JWTSECRET)) ||
    (username && password)
  ) {
    next();
  } else {
    res.redirect("/");
  }
};
//!Om man inte är inloggad

router.get('/', forceAuthorize, async (req,res) => {
    const comments = await CommentsModel.find().lean()
    const username = res.locals.username
    console.log(res.locals.username);
    
    res.render('comments/comments-list', {comments, username})
})
// ANVÄND DENNA FÖR ATT SKICKA IN TESTKOMMENTARER I DATABASEN
router.get("/seed-data", forceAuthorize, async (req, res) => {
  const newComment = new CommentsModel({
    postId: "34534534535",
    description: "wAAAAAAAAAAAAAAAAAAAAA",
    time: Date.now(),
  });

  await newComment.save();

  res.redirect("/comments");
});
// router.use('/', (req,res) => {
//     res.status(404).render('not-found')
//   })
// ANVÄND DENNA FÖR ATT SKICKA IN TESTKOMMENTARER I DATABASEN

router.get('/:id', forceAuthorize, async (req,res) => {
    const comment = await CommentsModel.findById(req.params.id).lean()
    const result = await utils.checkIfLiked(res.locals.username, req.params.id, CommentsModel)
    const validAuthor = await utils.checkAuthorUsername(res.locals.username, comment.author)
    if(validAuthor === true) {
        if (result == true) {
            console.log('TRUE');
            res.render('comments/comment-single', {comment, result, validAuthor})
        }
        else {
            console.log('FALSE');
            res.render('comments/comment-single', {comment, validAuthor})
        }
    }
    else {
        if (result == true) {
            console.log('TRUE');
            res.render('comments/comment-single', {comment, result})
        }
        else {
            console.log('FALSE');
            res.render('comments/comment-single', {comment})
        }
    }
})

router.get('/:id/like', async (req,res) => {
    const comment = await CommentsModel.findById(req.params.id).lean()
    await CommentsModel.updateOne({_id: req.params.id}, { $push: {likes: res.locals.username}})
    res.redirect(`/comments/${req.params.id}`)
})

router.get('/:id/unlike', async (req,res) => {
    const comment = await CommentsModel.findById(req.params.id).lean()
    console.log(comment.author);
    const result = await utils.checkAuthorUsername(res.locals.username, comment.author)
    if(result === true) {
        for (let i = 0; i < comment.likes.length; i++) {
            if(comment.likes[i] === res.locals.username) {
                await CommentsModel.updateOne({_id: req.params.id}, { $pull: {likes: res.locals.username}})
                res.redirect(`/comments/${req.params.id}`)
            }
        }
    }
    else {
        res.sendStatus(403)
    }
})

module.exports = router
