const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const {ensureAuthenticated} = require('../helpers/auth');

require('../models/Idea');
const Idea = mongoose.model('ideas');


router.get('/add', ensureAuthenticated, (req, res) =>{
    res.render('ideas/add');
});

router.get('/edit/:id', ensureAuthenticated, (req, res) =>{
    Idea.findOne({
        _id:req.params.id
    }).then(idea =>{
        res.render('ideas/edit', {
            idea: idea
        });
    });
});

router.put('/:id', (req, res) =>{
    Idea.findOne({
        _id: req.params.id
    })
    .then(idea =>{
        idea.title = req.body.title;
        idea.details = req.body.details;
        idea.save()
        .then(idea =>{
            req.flash('success_msg', 'edited successfully');
            res.redirect('/ideas');
        });
    });
});

router.delete('/:id', (req, res) =>{
    Idea.remove({_id: req.params.id})
        .then(() =>{
            req.flash('success_msg', 'Idea removed successfully');
            res.redirect('/ideas');
        });
});

router.get('/', ensureAuthenticated, (req, res) =>{
    Idea.find({})
    .sort({date: 'desc'})
    .then(ideas =>{
        res.render('ideas/index', {
            ideas:ideas
        });
    });
});


router.post('/', ensureAuthenticated, (req, res) =>{
    let errors = [];
    if(!req.body.title){
        errors.push({text:"title is required"});
    }
    if(!req.body.details){
        errors.push({text:"details is required"});
    }

    if(errors.length > 0){
        res.render('ideas/add', {
            errors: errors,
            title: req.body.title,
            details: req.body.details
        });
    }
    else{
        const newUser = {
            title:req.body.title,
            details: req.body.details,
            user: req.user.id
        }
        new Idea(newUser)
            .save()
            .then(idea =>{
                req.flash('success_msg', 'new idea comes');
                res.redirect('/ideas');
            });
    }
});

module.exports = router;
