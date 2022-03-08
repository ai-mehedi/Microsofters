var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    if (session.is_admin(req)) {
        res.redirect('/admin/dashboard');
        return;
    }
    res.render('admin/login', {
        title: 'Login',
        query: req.query
    });
});

router.get('/logout', function (req, res, next) {
    session.logout_admin(res);
    res.redirect("/admin");
});

router.get('/dashboard', function (req, res, next) {
    if (!session.is_admin(req)) {
        res.redirect("/admin");
        return;
    }
    session.admin_data(req, (user_error, user_data) => {
        knex('managers').count('id').then((manager_count) => {
            knex('softwares').count('id').then((software_count) => {
                res.render('admin/dashboard/dashboard', {
                    title: 'Admin Dashboard',
                    user_data: user_data[0],
                    data_query: req.query,
                    total_manager: manager_count[0].count,
                    total_software:software_count[0].count,
                    active_side_menu: req.url.split('?')[0].split('/')
                });
            });
        });
    });
});

router.get('/profile', function (req, res, next) {
    if (!session.is_admin(req)) {
        res.redirect("/admin");
        return;
    }
    session.admin_data(req, (user_error, user_data) => {
        res.render('admin/dashboard/profile/profile', {
            title: 'Profile info',
            user_data: user_data[0],
            data_query: req.query,
            active_side_menu: req.url.split('?')[0].split('/')
        });
    });
});

router.get('/profile/update_profile', function (req, res, next) {
    if (!session.is_admin(req)) {
        res.redirect("/admin");
        return;
    }
    session.admin_data(req, (user_error, user_data) => {
        res.render('admin/dashboard/profile/update_profile', {
            title: 'Update Profile',
            user_data: user_data[0],
            data_query: req.query,
            active_side_menu: req.url.split('?')[0].split('/')
        });
    });
});

router.get('/profile/change_password', function (req, res, next) {
    if (!session.is_admin(req)) {
        res.redirect("/admin");
        return;
    }
    session.admin_data(req, (user_error, user_data) => {
        res.render('admin/dashboard/profile/change_password', {
            title: 'Change Password',
            user_data: user_data[0],
            data_query: req.query,
            active_side_menu: req.url.split('?')[0].split('/')
        });
    });
});

router.get('/managers', function (req, res, next) {
    if (!session.is_admin(req)) {
        res.redirect("/admin");
        return;
    }
    session.admin_data(req, (user_error, user_data) => {
        res.render('admin/managers/managers', {
            title: 'Managers',
            user_data: user_data[0],
            data_query: req.query,
            active_side_menu: req.url.split('?')[0].split('/')
        });
    });
});

router.get('/managers/add', function (req, res, next) {
    if (!session.is_admin(req)) {
        res.redirect('/admin');
        return;
    }
    var is_enc;
    let main_title;
    let main_enc_id;
    if (typeof req.query.enc_id === "undefined") {
        main_title = "Add Manager";
        main_enc_id = 0;
        is_enc = false;
    } else {
        is_enc = true;
        main_title = "Update Manager";
        main_enc_id = req.query.enc_id;
    }
    knex('managers').select("*").where('id', main_enc_id).then((result) => {
        if (typeof req.query.enc_id !== "undefined") {
            if (result.length === 0) {
                res.redirect("/admin/managers");
                return;
            }
        }
        session.admin_data(req, (user_error, user_data) => {
            res.render('admin/managers/add', {
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

router.get('/softwares', function (req, res, next) {
    if (!session.is_admin(req)) {
        res.redirect("/admin");
        return;
    }
    session.admin_data(req, (user_error, user_data) => {
        res.render('admin/softwares/softwares', {
            title: 'Softwares',
            user_data: user_data[0],
            data_query: req.query,
            active_side_menu: req.url.split('?')[0].split('/')
        });
    });
});

router.get('/softwares/add', function (req, res, next) {
    if (!session.is_admin(req)) {
        res.redirect('/admin');
        return;
    }
    var is_enc;
    let main_title;
    let main_enc_id;
    if (typeof req.query.enc_id === "undefined") {
        main_title = "Add Software";
        main_enc_id = 0;
        is_enc = false;
    } else {
        is_enc = true;
        main_title = "Update Software";
        main_enc_id = req.query.enc_id;
    }
    knex('softwares').select("*").where('id', main_enc_id).then((result) => {
        if (typeof req.query.enc_id !== "undefined") {
            if (result.length === 0) {
                res.redirect("/admin/softwares");
                return;
            }
        }
        session.admin_data(req, (user_error, user_data) => {
            res.render('admin/softwares/add', {
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

module.exports = router;