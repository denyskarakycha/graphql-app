const { validationResult } = require("express-validator");

const Post = require("../models/post.js");

exports.getPosts = (req, res, next) => {
  Post.find()
    .then(posts => {
        res.status(200).json({
            posts: posts
          });
    })
    .catch((err) => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });

  
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed!");
    error.statusCode = 422;
    throw error;
  }

  if (!req.file) {
    const error = new Error("No image?");
    error.statusCode = 422;
    throw error; 
  }


  const title = req.body.title;
  const content = req.body.content;
  const imageUrl = req.file.path.replace("\\" ,"/");
  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: {
      name: "Denys",
    },
  });

  post.save()
    .then((result) => {
      res.status(201).json({
        message: "Post created!",
        post: result,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post.");
        error.statusCode = 404;
        throw error;
      }

      res.status(200).json({
        post: post,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
