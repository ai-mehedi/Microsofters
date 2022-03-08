var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    if (session.is_manager(req)) {
        res.redirect('/manager/dashboard');
        return;
    }
    res.render('manager/login', {
        title: 'Login',
        query: req.query
    });
});

router.get('/logout', function (req, res, next) {
    session.logout_manager(res);
    res.redirect("/manager");
});

router.get('/dashboard', function (req, res, next) {
    if (!session.is_manager(req)) {
        res.redirect("/manager");
        return;
    }
    session.manager_data(req, (user_error, user_data) => {
        knex('users').count('id').where('manager_id',user_data[0].id).then((user_count) => {
            res.render('manager/dashboard/dashboard', {
                title: 'Manager Dashboard',
                user_data: user_data[0],
                data_query: req.query,
                total_users:user_count[0].count,
                active_side_menu: req.url.split('?')[0].split('/')
            });
        });
    });
});

router.get('/profile', function (req, res, next) {
    if (!session.is_manager(req)) {
        res.redirect("/manager");
        return;
    }
    session.manager_data(req, (user_error, user_data) => {
        res.render('manager/dashboard/profile/profile', {
            title: 'Profile info',
            user_data: user_data[0],
            data_query: req.query,
            active_side_menu: req.url.split('?')[0].split('/')
        });
    });
});

router.get('/profile/update_profile', function (req, res, next) {
    if (!session.is_manager(req)) {
        res.redirect("/manager");
        return;
    }
    session.manager_data(req, (user_error, user_data) => {
        res.render('manager/dashboard/profile/update_profile', {
            title: 'Update Profile',
            user_data: user_data[0],
            data_query: req.query,
            active_side_menu: req.url.split('?')[0].split('/')
        });
    });
});

router.get('/profile/change_password', function (req, res, next) {
    if (!session.is_manager(req)) {
        res.redirect("/manager");
        return;
    }
    session.manager_data(req, (user_error, user_data) => {
        res.render('manager/dashboard/profile/change_password', {
            title: 'Change Password',
            user_data: user_data[0],
            data_query: req.query,
            active_side_menu: req.url.split('?')[0].split('/')
        });
    });
});

router.get('/users', function (req, res, next) {
    if (!session.is_manager(req)) {
        res.redirect('/manager');
        return;
    }
    session.manager_data(req, (user_error, user_data) => {
        res.render('manager/users/users', {
            data_query: req.query,
            user_data: user_data[0],
            active_side_menu: req.url.split('?')[0].split('/'),
            title: 'Users'
        });
    });
});

router.get('/users/add', function (req, res, next) {
    if (!session.is_manager(req)) {
        res.redirect('/manager');
        return;
    }
    var is_enc;
    let main_title;
    let main_enc_id;
    if (typeof req.query.enc_id === "undefined") {
        main_title = "Add User";
        main_enc_id = 0;
        is_enc = false;
    } else {
        is_enc = true;
        main_title = "Update User";
        main_enc_id = req.query.enc_id;
    }
    session.manager_data(req, (user_error, user_data) => {
        knex('users').select("*").where('id', main_enc_id).where('manager_id', user_data[0].id).then((result) => {
            if (typeof req.query.enc_id !== "undefined") {
                if (result.length === 0) {
                    res.redirect("/manager/users");
                    return;
                }
            }
            res.render('manager/users/add', {
                is_enc: is_enc,
                user_data: user_data[0],
                enc_data: result[0],
                data_query: req.query,
                title: main_title,
                active_side_menu: req.url.split('?')[0].split('/')
            });
        });
    });
});

router.get('/licenses/requests', function (req, res, next) {
    if (!session.is_manager(req)) {
        res.redirect('/manager');
        return;
    }
    session.manager_data(req, (user_error, user_data) => {
        res.render('manager/licenses/requests', {
            data_query: req.query,
            user_data: user_data[0],
            active_side_menu: req.url.split('?')[0].split('/'),
            title: 'License Requests'
        });
    });
});

router.get('/licenses/action', function (req, res, next) {
    if (!session.is_manager(req)) {
        res.redirect('/manager');
        return;
    }
    if (typeof req.query.enc_id === "undefined") {
        res.redirect('/manager/licenses/requests');
        return;
    }
    session.manager_data(req, (user_error, user_data) => {
        knex('licenses').select("*").where('id', req.query.enc_id).where('manager_id', user_data[0].id).where('status', '0').then(async(result) => {
            if (result.length === 0) {
                res.redirect("/manager/licenses/requests");
                return;
            }
            let license_user = await knex('users').select('*').where('id',result[0].user_id);
            res.render('manager/licenses/action', {
                license_user:license_user[0],
                user_data: user_data[0],
                enc_data: result[0],
                data_query: req.query,
                title: "Action License",
                active_side_menu: req.url.split('?')[0].split('/')
            });
        });
    });
});

router.get('/licenses', function (req, res, next) {
    if (!session.is_manager(req)) {
        res.redirect('/manager');
        return;
    }
    session.manager_data(req, (user_error, user_data) => {
        res.render('manager/licenses/licenses', {
            data_query: req.query,
            user_data: user_data[0],
            active_side_menu: req.url.split('?')[0].split('/'),
            title: 'License\'s'
        });
    });
});

router.get('/licenses/update', function (req, res, next) {
    if (!session.is_manager(req)) {
        res.redirect('/manager');
        return;
    }
    if (typeof req.query.enc_id === "undefined") {
        res.redirect('/manager/licenses/requests');
        return;
    }
    session.manager_data(req, (user_error, user_data) => {
        knex('licenses').select("*").where('id', req.query.enc_id).where('manager_id', user_data[0].id).whereIn('status', [1,2]).then(async(result) => {
            if (result.length === 0) {
                res.redirect("/manager/licenses/requests");
                return;
            }
            let license_user = await knex('users').select('*').where('id',result[0].user_id);
            res.render('manager/licenses/update', {
                license_user:license_user[0],
                user_data: user_data[0],
                enc_data: result[0],
                data_query: req.query,
                title: "Update License",
                active_side_menu: req.url.split('?')[0].split('/')
            });
        });
    });
});

module.exports = router;