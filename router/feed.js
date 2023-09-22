const express = require('express');
const { body } = require('express-validator');

const feedController = require('../controllers/feed.js');
const isAuth = require('../middleware/is-auth.js');

const router = express.Router();
// GET /feed/posts
router.get('/posts', isAuth, feedController.getPosts);

// POST /feed/post
router.post('/post', isAuth, [
    body('title').trim().isLength({min: 5}),
    body('content').trim().isLength({min: 5})
], feedController.createPost);

router.get('/post/:postId', feedController.getPost);

// PUT
router.put('/post/:postId', isAuth, [
    body('title').trim().isLength({min: 5}),
    body('content').trim().isLength({min: 5})
], feedController.updatePost);

// DELETE
router.delete('/post/:postId', isAuth, feedController.deletePost)

router.get('/status', isAuth, feedController.getStatus);

router.put('/status', isAuth, feedController.updateStatus);

module.exports = router;