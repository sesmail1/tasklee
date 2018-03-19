// Dependencies
var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongojs = require('mongojs');
var db = mongojs('loginapp', ['users']);
var uniqid = require('uniqid');

//// GET taskLee main page
router.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        var id = req.user._id;
        var object = req.user.toObject();
        var tasks_db = (object._tasks);
        res.render('index', {
            data: tasks_db
        });
    } else {
        res.render('login');
    }
});

//// POST tasks
router.post('/', (req, res) => {
    if (req.isAuthenticated()) {
        var id = req.user._id;
        console.log(req.body.task);
        console.log(req.body.description);
        db.users.update({
            _id: id
        }, {
            $push: {
                _tasks: {
                    $each: [{
                        task: req.body.task,
                        description: req.body.description,
                        taskID: uniqid()
                    }]
                }
            }
        });
        res.redirect('/');
    } else {
        res.render('login');
    }
});

//// UPDATE tasks
router.post('/update', (req, res) => {
    if (req.isAuthenticated()) {

        db.users.update({
            _id: req.user._id
        }, {
            $pull: {
                '_tasks': {
                    taskID: req.body.taskID
                },
            }
        });

        var updateData = (req.body);
        db.users.update({
            _id: req.user._id
        }, {
            $push: {
                _tasks: {
                    task: updateData.task,
                    description: updateData.description,
                    taskID: updateData.taskID
                }
            }
        }, () => {
            res.redirect('/');
        });

    } else {
        res.render('login');
    }
});

//// DELETE tasks
router.post('/delete', (req, res) => {
    if (req.isAuthenticated()) {
        var taskToDelete = req.body;
        console.log(taskToDelete);
        db.users.update({
            _id: req.user._id
        }, {
            $pull: {
                '_tasks': {
                    taskID: req.body.id
                },
            }
        }, () => {
            res.redirect('/');
        });
    } else {
        res.render('login');
    }
});


module.exports = router;