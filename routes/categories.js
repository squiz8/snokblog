var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('localhost/snokeblog');

/* Categories Page. */
router.get('/add', function(req, res, next) {
  res.render('addCategory', {
      "title": "Add Category"
  });
});

router.get('/show/:category', (req, res, next)=>{
    var db = req.db;
    var post = db.get('posts');
    var category = req.params.category;
    post.find({category: category}, {}, (err, posts)=>{
        res.render('index', {
            "title": category,
            "posts": posts
        });
    });
});

router.post('/add', (req, res, next)=>{
    var title = req.body.title;

  //Form validation
    req.checkBody('title', 'Error: Title field required').notEmpty();
   
    var err = req.validationErrors();
    if(err){
        res.render('addCategory', {
            "title": title,
        });
    }else{
        var categories = db.get('categories');

        //Submitting to Database
        categories.insert({
            "title": title
        }, (err, data)=>{
            if(err){
                res.send('there was an error submitting to database');
            }else{
                req.flash('success', 'Category has been submitted successfully');
                res.location('/');
                res.redirect('/');
            }
        });
    }

});

  

module.exports = router;