exports.getPosts = (req, res, next) => {
    res.status(200).json({
        posts: [
            {
                title: "Some title",
                content: "Some content"
            }
        ]
    });
}

exports.createPost = (req, res, next) => {
    const title = req.body.title;
    const content = req.body.content;

    res.status(201).json({
        message: 'Post created!',
        post: {
            id: new Date().toISOString,
            title: title,
            content: content
        }
    });
}