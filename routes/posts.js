var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('localhost/snokeblog');

router.get('/show/:id', (req, res, next)=>{
    var db = req.db;
    var posts = db.get('posts');

   /* posts.findById(req.params.id, {}, function(err, post){
        res.render('show', {
            "post": post
        });
    });
    */

    posts.find({_id: req.params.id}, {}, (err, post)=>{
        if(err) throw err;
        res.render('show', {
            "posts": post
        });
    });
});

router.post('/addcomment', (req, res, next)=>{
    var name        = req.body.name;
    var email       = req.body.email;
    var body        = req.body.body;
    var postId      = req.body.postid;
    var commentDate = new Date();

    
  //Form validation

    req.checkBody('name', 'Error: Name field required').notEmpty();
    req.checkBody('email', 'Error: Email field required').notEmpty();
    req.checkBody('email', 'Error: Email is not correct').isEmail();
    req.checkBody('body', 'Error: Body field is required').notEmpty();

    var errors = req.validationErrors();
    if(errors){
        var posts = db.get('posts');

        posts.find({_id: req.params.id}, {}, (err, post)=>{
            res.render('show', {
                "errors": errors,
                "post": post
            });
        });
    }else{
        var comment = {
            "name": name, 
            "email": email,
            "body": body,
            "commentdate": commentDate
        }
        //Submitting to Database
        var posts = db.get('posts');
        posts.update({
                    "_id": postId
                },
                {
                    $push: {
                       "comments": comment
                    }
                }, 
                (err, doc)=>{
                    if(err){
                        throw err;
                    }else{
                        req.flash('success', 'You have added a comment');
                        res.location('/posts/show/' + postId);
                        res.redirect('/posts/show/' + postId);
                    }
                }
        );
        console.log(posts.comments);
    }

});

router.get('/add', (req, res, next)=>{
    var categories = db.get('categories');

    categories.find({}, {}, (err, categories)=>{
        res.render('addpost', {
            "title": "Add Post",
            "categories": categories
        });
    });

    
});

router.post('/add', (req, res, next)=>{
    var title = req.body.title;
    var category = req.body.category;
    var body = req.body.body;
    var author = req.body.author;
    var date = new Date();

    //Check for the image field
  if(req.file){
    //Profile image info
        var mainImageOriginalName = req.file.originalname;
        var mainImageName         = req.file.filename;
        var mainImageMime         = req.file.mimetype;
        var mainImagePath         = req.file.path;
        var mainImageExt          = req.file.extension;
        var mainImageSize         = req.file.size;
  } else{
    //No image included during registration
    var mainImageName = 'noimage.jpg';
  }
  //Form validation

    req.checkBody('title', 'Error: Title field required').notEmpty();
    req.checkBody('category', 'Error: category field required').notEmpty();
    req.checkBody('body', 'Error: Body field is required').notEmpty();
    req.checkBody('author', 'Error: author field required').notEmpty();

    var errors = req.validationErrors();
    if(errors){
        res.render('addpost', {
            "errors" : errors,
            "title": title,
            "body": body,
        });
    }else{
        var posts = db.get('posts');

        //Submitting to Database
        console.log(mainImageName);
        posts.insert({
            "title": title,
            "category": category,
            "body": body,
            "author": author,
            "mainimage": mainImageName
        }, (err, data)=>{
            if(err){
                res.send('there was an error submitting to database');
            }else{
                req.flash('success', 'Post has been submitted successfully');
                res.location('/');
                res.redirect('/');
            }
            console.log(data)
        });
    }

});

module.exports = router; 