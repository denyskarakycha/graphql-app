const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require("jsonwebtoken");

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
            password: hashedPassword
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
    }
}

