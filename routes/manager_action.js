var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var fs = require('fs');

router.post('/login', function (req, res, next) {
    if (session.is_manager(req)) {
        res.send({ msg: "You are already loggedin", status: 0, redirect_url: "/manager/dashboard" });
        return;
    }
    var data = req.body;
    if (data.email_address.trim() == "") {
        res.send({ msg: "Email Address is required", status: 0, redirect_url: "" });
    } else if (data.password.trim() == "") {
        res.send({ msg: "Password is required", status: 0, redirect_url: "" });
    } else {
        knex('managers').select("*").where('email', data.email_address).then((result) => {
            if (result.length == 0) {
                res.send({ msg: "Email Not Found..!", status: 0, redirect_url: "" });
            } else {
                if (result[0].password == data.password) {
                    if (result[0].status == 0) {
                        res.send({ msg: "This account is not active yet.", status: 0, redirect_url: "" });
                    } else {
                        session.set_manager_session(result[0].id, res);
                        res.send({ msg: "Login Success..!", status: 1, redirect_url: "/manager/dashboard" });
                    }
                } else {
                    res.send({ msg: "Password is Wrong!!", status: 0, redirect_url: "" });
                }
            }
        });
    }
});

router.post('/update_profile', function (req, res, next) {
    if (!session.is_manager(req)) {
        res.send({ msg: "Please login first!!", status: 0, redirect_url: "/manager" });
        return;
    }
    var data = req.body;
    if (data.firstname.trim() == "") {
        res.send({ msg: "Firstname is required", status: 0, redirect_url: "" });
    } else if (data.lastname.trim() == "") {
        res.send({ msg: "Lastname is required", status: 0, redirect_url: "" });
    } else {
        session.manager_data(req, (user_error, user_data) => {
            knex("managers").where("id", user_data[0].id).update({
                firstname: data.firstname,
                lastname: data.lastname
            }).then(function (count) {
                res.send({ msg: "Profile Updated successfully..!", status: 1, redirect_url: "/manager/profile" });
            }).catch((err) => {
                res.send({ msg: "Some error occurs!!", status: 1, redirect_url: DIR + "" });
            });
        });
    }
});

router.post('/change_password', function (req, res, next) {
    if (!session.is_manager(req)) {
        res.send({ msg: "Please login first!!", status: 0, redirect_url: "/manager" });
        return;
    }
    var data = req.body;
    if (data.current_password.trim() == "") {
        res.send({ msg: "Current password is required", status: 0, redirect_url: "" });
    } else if (data.new_password.trim() == "") {
        res.send({ msg: "New password is required", status: 0, redirect_url: "" });
    } else if (data.confirm_password.trim() == "") {
        res.send({ msg: "Confirm password is required", status: 0, redirect_url: "" });
    } else {
        session.manager_data(req, (user_error, user_data) => {
            if (user_data[0].password == data.current_password) {
                if (data.new_password == data.confirm_password) {
                    knex("managers").where("id", user_data[0].id).update({
                        password: data.confirm_password
                    }).then(function () {
                        res.send({ msg: "Password changed successfully..!", status: 1, redirect_url: "/manager/profile" });
                    }).catch((err) => {
                        res.send({ msg: "Some error occurs!!", status: 1, redirect_url: DIR + "" });
                    });
                } else {
                    res.send({ msg: "Confirm Password does not match!!", status: 0, redirect_url: "" });
                }
            } else {
                res.send({ msg: "Current Password is wrong!!", status: 0, redirect_url: "" });
            }
        });
    }
});

router.post('/add_user', function (req, res, next) {
    if (!session.is_manager(req)) {
        res.send({ msg: "Please login first!!", status: 0, redirect_url: "/manager" });
        return;
    }
    session.manager_data(req, (user_error, user_data) => {
        var data = req.body;
        let main_updata = {
            firstname: data.firstname,
            lastname: data.lastname,
            email: data.email,
            status: data.status,
            password: data.password
        };
        if (typeof data.enc_id === 'undefined') {
            main_updata.manager_id = user_data[0].id;
            knex('users').insert(main_updata).then(() => {
                res.send({ msg: "User Added successfully..!", status: 1, redirect_url: "/manager/users" });
            }).catch((err) => {
                console.log(err)
                res.send({ msg: "Some error occur!!", status: 0, redirect_url: "" });
            });
        } else {
            knex('users').select("*").where('id', data.enc_id).where('manager_id', user_data[0].id).then((result) => {
                if (result.length > 0) {
                    if (data.password.trim() == "") {
                        delete main_updata.password;
                    }
                    knex('users').update(main_updata).where('id', result[0].id).then(() => {
                        res.send({ msg: "User Updated successfully..!", status: 1, redirect_url: "/manager/users" });
                    }).catch(() => {
                        res.send({ msg: "Some error occur!!", status: 0, redirect_url: "" });
                    });
                } else {
                    res.send({ msg: "Server not found", status: 0, redirect_url: "" });
                }
            });
        }
    });
});

router.post('/action_license', function (req, res, next) {
    if (!session.is_manager(req)) {
        res.send({ msg: "Please login first!!", status: 0, redirect_url: "/manager" });
        return;
    }
    const data = req.body;
    session.manager_data(req, (user_error, user_data) => {
        knex('licenses').select("*").where('id', data.enc_id).where('manager_id', user_data[0].id).where('status', '0').then(async (result) => {
            if (result.length === 0) {
                res.send({ msg: "License not found.", status: 0, redirect_url: "" });
                return;
            }
            if (isNaN(data.duration)) {
                res.send({ msg: "Invalid Duration.", status: 0, redirect_url: "" });
                return;
            }
            if (data.request_status == '1') {
                let expire_date = new Date();
                expire_date.setHours(expire_date.getHours() + Number(data.duration));
                let prepare_u_data = {
                    expire_date: expire_date,
                    duration: data.duration,
                    status: 1
                }
                knex('licenses').update(prepare_u_data).where('id', data.enc_id).where('manager_id', user_data[0].id).where('status', '0').then(() => {
                    res.send({ msg: "License has been Activated Successfully.", status: 1, redirect_url: "/manager/licenses/requests" });
                })
            } else if (data.request_status == '0') {
                knex('licenses').where('id', data.enc_id).where('manager_id', user_data[0].id).where('status', '0').del().then(() => {
                    res.send({ msg: "License has been Declined.", status: 1, redirect_url: "/manager/licenses/requests" });
                    return;
                });
            } else {
                res.send({ msg: "Some error occured.", status: 0, redirect_url: "" });
                return;
            }
        });
    });
});

router.post('/update_license', function (req, res, next) {
    if (!session.is_manager(req)) {
        res.send({ msg: "Please login first!!", status: 0, redirect_url: "/manager" });
        return;
    }
    const data = req.body;
    session.manager_data(req, (user_error, user_data) => {
        knex('licenses').select("*").where('id', data.enc_id).where('manager_id', user_data[0].id).whereIn('status', [1, 2]).then(async (result) => {
            if (result.length === 0) {
                res.send({ msg: "License not found.", status: 0, redirect_url: "" });
                return;
            }
            let prepare_u_data = {
                license_key: data.license_key,
                status: data.status
            }
            knex('licenses').update(prepare_u_data).where('id', data.enc_id).where('manager_id', user_data[0].id).whereIn('status', [1, 2]).then(() => {
                res.send({ msg: "License has been updated", status: 1, redirect_url: "/manager/licenses" });
            });
        });
    });
});

router.post('/auto_login_users', function (req, res, next) {
    if (!session.is_manager(req)) {
        res.send({ msg: "Please login first!!", status: 0, redirect_url: "/manager" });
        return;
    }
    const data = req.body;
    knex('users').select('*').where('id',data.enc_id).then((user_data) => {
        if(user_data.length > 0){
            session.set_user_session(user_data[0].id,res);
            res.send({ msg: "Login success.", status: 1, redirect_url: "" });
        }else{
            res.send({ msg: "Some error occured.", status: 0, redirect_url: "" });
        }
    });
});

module.exports = router;