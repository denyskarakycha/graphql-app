const { validationResult } = require("express-validator");
const fileHelper = require('../util/file');

const Post = require("../models/post.js");
const User = require("../models/user.js");

exports.getPosts = (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  let totalItems;
  Post.find()
    .countDocuments()
    .then(count => {
      totalItems = count;
      return Post.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then(posts => {
        res.status(200).json({
            posts: posts,
            totalItems: totalItems
          });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    })
   
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
  let creator;
  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: req.userId,
  });

  post.save()
    .then((result) => {
      return User.findById(req.userId);
    })
    .then(user => {
      creator = user;
      user.posts.push(post);
      return user.save();
    })
    .then(result => {
      res.status(201).json({
        message: "Post created!",
        post: post,
        creator: {_id: creator._id, name: creator.name}
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

exports.updatePost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed!");
    error.statusCode = 422;
    throw error;
  }

  const postId = req.params.postId;
  const updateTitle = req.body.title;
  const updateContent = req.body.content;
  let updateImageUrl = req.body.image;
  if (req.file) {
    updateImageUrl = req.file.path.replace('\\', '/');
  }

  if (!updateImageUrl) {
    const error = new Error("No file picked.");
    error.statusCode = 404;
    throw error;
  }
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error("Could not find post.");
        error.statusCode = 404;
        throw error;
      }
      if (post.creator.toString() !== req.userId) {
        const error = new Error("No authorized.");
        error.statusCode = 403;
        throw error;
      }
      if(updateImageUrl !== post.imageUrl) {
        fileHelper.deleteFile(post.imageUrl);
      }

      post.title = updateTitle;
      post.content = updateContent;
      post.imageUrl = updateImageUrl;

      return post.save();
    })
    .then(result => {
      res.status(200).json({
        message: 'Post Updated!',
        post: result
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
}

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error("Could not find post.");
        error.statusCode = 404;
        throw error;
      }
      if (post.creator.toString() !== req.userId) {
        const error = new Error("No authorized.");
        error.statusCode = 403;
        throw error;
      }

      fileHelper.deleteFile(post.imageUrl);
      return Post.findByIdAndRemove(postId);
    })
    .then(result => {
      return User.findById(req.userId);
    })
    .then(user => {
      user.posts.pull(postId);
      return user.save();
      
    })
    .then(result => {
      res.status(200).json({message: "Delete Post."});
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
}

exports.getStatus = (req, res, next) => {
  const userId = req.userId;

  User.findById(userId)
    .then(user => {
      res.status(200).json({status: user.status});
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    })
}

exports.updateStatus = (req, res, next) => {
  const userId = req.userId;
  const updateStatus = req.body.status;

  User.findById(userId)
    .then(user => {
      user.status = updateStatus;
      return user.save();
    })
    .then(result => {
      res.status(200).json({message: 'Status Updated'});
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    })
}

