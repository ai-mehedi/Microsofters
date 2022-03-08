var express = require('express');
const Knex = require('knex');
var router = express.Router();

router.get('/', function (req, res, next) {
    if (session.is_user(req)) {
        res.redirect('/user/dashboard');
        return;
    }
    res.render('user/login', {
        title: 'Login',
        query: req.query
    });
});

router.get('/logout', function (req, res, next) {
    session.logout_user(res);
    res.redirect("/user");
});

router.get('/dashboard', function (req, res, next) {
    if (!session.is_user(req)) {
        res.redirect("/user");
        return;
    }
    session.user_data(req, (user_error, user_data) => {
        knex('licenses').count('id').where('user_id', user_data[0].id).then((license_count) => {
            res.render('user/dashboard/dashboard', {
                title: 'User Dashboard',
                user_data: user_data[0],
                data_query: req.query,
                total_license:license_count[0].count,
                active_side_menu: req.url.split('?')[0].split('/')
            });
        });
    });
});

router.get('/profile', function (req, res, next) {
    if (!session.is_user(req)) {
        res.redirect("/user");
        return;
    }
    session.user_data(req, (user_error, user_data) => {
        res.render('user/dashboard/profile/profile', {
            title: 'Profile info',
            user_data: user_data[0],
            data_query: req.query,
            active_side_menu: req.url.split('?')[0].split('/')
        });
    });
});

router.get('/profile/update_profile', function (req, res, next) {
    if (!session.is_user(req)) {
        res.redirect("/user");
        return;
    }
    session.user_data(req, (user_error, user_data) => {
        res.render('user/dashboard/profile/update_profile', {
            title: 'Update Profile',
            user_data: user_data[0],
            data_query: req.query,
            active_side_menu: req.url.split('?')[0].split('/')
        });
    });
});

router.get('/profile/change_password', function (req, res, next) {
    if (!session.is_user(req)) {
        res.redirect("/user");
        return;
    }
    session.user_data(req, (user_error, user_data) => {
        res.render('user/dashboard/profile/change_password', {
            title: 'Change Password',
            user_data: user_data[0],
            data_query: req.query,
            active_side_menu: req.url.split('?')[0].split('/')
        });
    });
});

router.get('/software_license/request', function (req, res, next) {
    if (!session.is_user(req)) {
        res.redirect("/user");
        return;
    }
    session.user_data(req, (user_error, user_data) => {
        knex('softwares').select('*').where('status', 1).then((softwares) => {
            res.render('user/software_license/request', {
                title: 'Request License',
                user_data: user_data[0],
                data_query: req.query,
                softwares: softwares,
                active_side_menu: req.url.split('?')[0].split('/')
            });
        });
    });
});

router.get('/software_license/licenses', function (req, res, next) {
    if (!session.is_user(req)) {
        res.redirect("/user");
        return;
    }
    session.user_data(req, (user_error, user_data) => {
        knex('softwares').select('*').where('status', 1).then((softwares) => {
            res.render('user/software_license/licenses', {
                title: 'Software License',
                user_data: user_data[0],
                data_query: req.query,
                softwares: softwares,
                active_side_menu: req.url.split('?')[0].split('/')
            });
        });
    });
});

router.get('/softwares', function (req, res, next) {
    if (!session.is_user(req)) {
        res.redirect("/user");
        return;
    }
    session.user_data(req, (user_error, user_data) => {
        res.render('user/softwares/softwares', {
            title: 'Softwares',
            user_data: user_data[0],
            data_query: req.query,
            active_side_menu: req.url.split('?')[0].split('/')
        });
    });
});

router.get('/data/snapchat', function (req, res, next) {
    if (!session.is_user(req)) {
        res.redirect("/user");
        return;
    }
    session.user_data(req, (user_error, user_data) => {
        res.render('user/data/snapchat', {
            title: 'Snapchats',
            user_data: user_data[0],
            data_query: req.query,
            active_side_menu: req.url.split('?')[0].split('/')
        });
    });
});

module.exports = router;