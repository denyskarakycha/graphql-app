const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require("jsonwebtoken");
const fileHelper = require('../util/file');

const User = require('../models/user');
const Post = require('../models/post')

const isAuth = require("../middleware/is-auth");

module.exports = {
    createUser: async function ({ userInput }, req) {
        const errors = [];
        if (!validator.isEmail(userInput.email)) {
            errors.push({message: 'E-Mail is invalid.'});
        }
        if (validator.isEmpty(userInput.password) || !validator.isLength(userInput.password, {min: 5})) {
            errors.push({message: 'Password too short.'});
        }
        if (errors.length > 0) {
            console.log('3');
            const error = new Error('Invalid input');
            throw error;
        }
        const existingUser = await User.findOne({email: userInput.email});
        if (existingUser) {
            const error = new Error('User existing already!');
            error.data = errors;
            error.code = 422;
            throw error;
        }

        const hashedPassword = await bcrypt.hash(userInput.password, 12);
        const user = new User({
            email: userInput.email,
            name: userInput.name,
            password: hashedPassword,
            status: 'I am new'
        });
        const createdUser = await user.save();
        return {...createdUser._doc, _id: createdUser._id.toString()}
    },
    login: async function({email, password}) {
        const user = await User.findOne({email: email});
        if (!user) {
            const error = new Error("User not found");
            error.code = 401;
            throw error;
        }
        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            const error = new Error("Password invalid");
            error.code = 401;
            throw error;
        }

        const token = jwt.sign(
            {
              email: user.email,
              userId: user._id.toString(),
            },
            "secret",
            { expiresIn: "1h" }
          );
        return {token: token, userId: user._id.toString()};
    },
    createPost: async function({postInput}, req) {
        if (!req.isAuth) {
            const error = new Error('Not authenticated');
            error.code = 401;
            throw error
        }
        const errors = [];
        if (validator.isEmpty(postInput.title) || !validator.isLength(postInput.title, {min: 5})) {
            errors.push({message: "Title is invalid."});
        }
        if (validator.isEmpty(postInput.content) || !validator.isLength(postInput.content, {min: 5})) {
            errors.push({message: "Content is invalid."});
        }
        if (errors.length > 0) {
            const error = new Error('Invalid input');
            throw error;
        }
        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error('User not found');
            error.code = 401;
            throw error;
        }
        console.log(postInput.imageUrl);
        const post = new Post({
            title: postInput.title,
            content: postInput.content,
            imageUrl: postInput.imageUrl,
            creator: user
        });
        const result = await post.save();
        user.posts.push(result);
        await user.save();
        return {
            ...result._doc, 
            _id: result._id.toString(),
            createdAt: result.createdAt.toISOString(),
            updatedAtAt: result.updatedAt.toISOString(), 
            };
    },
    posts: async function({page}, req) {
        if (!req.isAuth) {
            const error = new Error('Not authenticated');
            error.code = 401;
            throw error
        }
        const currentPage = page || 1;
        const perPage = 2;
        const totalPosts = await Post.find().countDocuments();  
        const posts = await Post.find()
            .populate("creator")
            .sort({createdAt: -1})
            .skip((currentPage - 1) * perPage)
            .limit(perPage);
      //  console.log(posts);
        return {
            posts: posts.map(item => {
                return {
                    ...item._doc,
                    _id: item._id.toString(),
                    createdAt: item.createdAt.toISOString(),
                    updatedAt: item.updatedAt.toISOString(),
                };
            }), 
            totalPosts: totalPosts
        }
    },
    post: async function({ postId }, req) {
        if (!req.isAuth) {
            const error = new Error('Not authenticated');
            error.code = 401;
            throw error
        }
        const post = await Post.findById(postId).populate('creator');
       //console.log(post);

        if (!post) {
          const error = new Error("Could not find post.");
          error.statusCode = 404;
          throw error;
        }
        return {
            ...post._doc,
            _id: post._id.toString(),
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString(),
        }
    },
    updatePost: async function({postId, postInput}, req) {
        if (!req.isAuth) {
            console.log('1');
            const error = new Error('Not authenticated');
            error.code = 401;
            throw error
        }

        const post = await Post.findById(postId).populate('creator');
        if (!post) {
            const error = new Error("Could not find post.");
            error.statusCode = 404;
            throw error;
        }
        if (post.creator._id.toString() !== req.userId.toString()) {
            console.log('1');
            const error = new Error("No authorized.");
            error.statusCode = 403;
            throw error;
        }
        const errors = [];
        if (validator.isEmpty(postInput.title) || !validator.isLength(postInput.title, {min: 5})) {
            errors.push({message: "Title is invalid."});
        }
        if (validator.isEmpty(postInput.content) || !validator.isLength(postInput.content, {min: 5})) {
            errors.push({message: "Content is invalid."});
        }
        if (errors.length > 0) {
            const error = new Error('Invalid input');
            throw error;
        }
        post.title = postInput.title;
        post.content = postInput.content;
        if (postInput.imageUrl !== 'undefined') {
             post.imageUrl = postInput.imageUrl;
        }

        const updatedPost = await post.save();
        return {
            ...updatedPost._doc,
            _id: post._id.toString(),
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString(),
        }
    },
    deletePost: async function({postId}, req) {
        if (!req.isAuth) {
            const error = new Error('Not authenticated');
            error.code = 401;
            throw error
        }
        const post = await Post.findById(postId);
        if (!post) {
            const error = new Error("Could not find post.");
            error.statusCode = 404;
            throw error;
        }
        if (post.creator.toString() !== req.userId.toString()) {
            const error = new Error("No authorized.");
            error.statusCode = 403;
            throw error;
        }
        await Post.findByIdAndRemove(postId);

        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error('User not found');
            error.code = 401;
            throw error;
        }
        fileHelper.deleteFile(post.imageUrl);
        user.posts.pull(postId);
        await user.save();
        return true;
    },
    status: async function(args, req) {
        if (!req.isAuth) {
            const error = new Error('Not authenticated');
            error.code = 401;
            throw error
        }
        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error("User not found");
            error.code = 401;
            throw error;
        }
        return {
            ...user._doc,
            _id: user._id.toString()
        }
    },
    updateStatus: async function({status}, req) {
        if (!req.isAuth) {
            const error = new Error('Not authenticated');
            error.code = 401;
            throw error
        }
        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error("User not found");
            error.code = 401;
            throw error;
        }
        user.status = status;
        await user.save();
        return true;
    }
}

