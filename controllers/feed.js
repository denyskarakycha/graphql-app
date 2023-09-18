const { validationResult } = require('express-validator');

const Post = require('../models/post.js');

exports.getPosts = (req, res, next) => {
    res.status(200).json({
        posts: [
            {
                _id: '1',
                title: "My Backend devolopment",
                content: "I am v ahui of course",
                imageUrl: "images/kot1.jpg",
                creator: {
                    name: 'Denys'
                },
                createdAt: new Date()
            }
        ]
    });
}

exports.createPost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({message: 'Validation failed!', errors: errors.array()});   
    }

    const title = req.body.title;
    const content = req.body.content;
    const post = new Post({
        title: title,
        content: content,
        imageUrl: 'images/kot1.jpg',
        creator: {
            name: 'Denys',
        }
    });

    post.save()
        .then(result => {
            res.status(201).json({
                message: 'Post created!',
                post: result
            });
        })
        .catch(err => console.log(err))
    
}