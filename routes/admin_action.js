var express = require('express');
const knex = require('../bin/db_handler');
var router = express.Router();

router.post('/login', function (req, res, next) {
    if (session.is_admin(req)) {
        res.send({ msg: "You are already loggedin", status: 0, redirect_url: "/admin/dashboard" });
        return;
    }
    var data = req.body;
    if (data.email_address.trim() == "") {
        res.send({ msg: "Email Address is required", status: 0, redirect_url: "" });
    } else if (data.password.trim() == "") {
        res.send({ msg: "Password is required", status: 0, redirect_url: "" });
    } else {
        knex.from('admins').select("*").where('email', '=', data.email_address)
            .then((result) => {
                if (result.length == 0) {
                    res.send({ msg: "Email Not Found..!", status: 0, redirect_url: "" });
                } else {
                    if (result[0].password == data.password) {
                        if (result[0].status == 0) {
                            res.send({ msg: "This account is not active yet.", status: 0, redirect_url: "" });
                        } else {
                            session.set_admin_session(result[0].id, res);
                            res.send({ msg: "Login Success..!", status: 1, redirect_url: "/admin/dashboard" });
                        }
                    } else {
                        res.send({ msg: "Password is Wrong!!", status: 0, redirect_url: "" });
                    }
                }
            })
            .catch((err) => {
                console.log((err));
                res.send({ msg: "Some error occur..!", status: 0, redirect_url: "" });
            });
    }
});

router.post('/update_profile', function (req, res, next) {
    if (!session.is_admin(req)) {
        res.send({ msg: "Please login first!!", status: 0, redirect_url: "/admin" });
        return;
    }
    var data = req.body;
    if (data.firstname.trim() == "") {
        res.send({ msg: "Firstname is required", status: 0, redirect_url: "" });
    } else if (data.lastname.trim() == "") {
        res.send({ msg: "Lastname is required", status: 0, redirect_url: "" });
    } else {
        session.admin_data(req, (user_error, user_data) => {
            knex("admins").where("id", user_data[0].id)
                .update({
                    firstname: data.firstname,
                    lastname: data.lastname
                }).then(function (count) {
                    res.send({ msg: "Profile Updated successfully..!", status: 1, redirect_url: "/admin/profile" });
                }).catch((err) => {
                    res.send({ msg: "Some error occurs!!", status: 1, redirect_url: DIR + "" });
                });
        });
    }
});

router.post('/change_password', function (req, res, next) {
    if (!session.is_admin(req)) {
        res.send({ msg: "Please login first!!", status: 0, redirect_url: "/admin" });
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
        session.admin_data(req, (user_error, user_data) => {
            if (user_data[0].password == data.current_password) {
                if (data.new_password == data.confirm_password) {
                    knex("admins").where("id", user_data[0].id)
                        .update({
                            password: data.confirm_password
                        }).then(function (count) {
                            res.send({ msg: "Password changed successfully..!", status: 1, redirect_url: "/admin/profile" });
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

router.post('/add_manager', async function (req, res, next) {
    if (!session.is_admin(req)) {
        res.send({ msg: "Please login first!!", status: 0, redirect_url: "/admin" });
        return;
    }
    try {
        var data = req.body;
        var today = new Date();
        let prepare_data = {
            firstname: data.firstname,
            lastname: data.lastname,
            email: data.email,
            password: data.password,
            status: data.status
        };
        let check_email = await knex("managers").select("*").where('email', data.email).limit(1);
        if (typeof data.enc_id === 'undefined') {
            prepare_data.created_at = today;
            prepare_data.updated_at = today;
            if (check_email.length > 0) {
                res.send({ msg: "Email is already exist..!", status: 0, redirect_url: "" });
                return;
            }
            await knex("managers").insert(prepare_data);
            res.send({ msg: "Manager added Successfully..!", status: 1, redirect_url: "/admin/managers" });
        } else {
            prepare_data.updated_at = today;
            let check_user = await knex("managers").select("*").where('id', data.enc_id).limit(1);
            if (check_user.length === 0) {
                res.send({ msg: "Manager not found", status: 0, redirect_url: "" });
                return;
            }
            if ((check_user[0].email != data.email) && (check_email.length > 0)) {
                res.send({ msg: "Email is already exist..!", status: 0, redirect_url: "" });
                return;
            }
            if (data.password.trim() == "") {
                delete prepare_data.password;
            }
            await knex("managers").update(prepare_data).where('id', check_user[0].id);
            res.send({ msg: "Manager Updated Successfully..!", status: 1, redirect_url: "/admin/managers" });
        }
    } catch (e) {
        res.send({ msg: "Some error occured", status: 0, redirect_url: "" });
    }
});

router.post('/add_softwares', function (req, res, next) {
    if (!session.is_admin(req)) {
        res.send({ msg: "Please login first!!", status: 0, redirect_url: "/user" });
        return;
    }
    session.admin_data(req, (user_error, user_data) => {
        var data = req.body;
        var today = new Date();
        let prepare_data = {
            name: data.name,
            username: data.username,
            purpose: data.purpose,
            version: data.version,
            filename:data.filename,
            status: data.status
        };
        if (typeof data.enc_id === 'undefined') {
            prepare_data.created_at = today;
            prepare_data.updated_at = today;
            knex("softwares").select("*").where('username', data.username).limit(1).then((result) => {
                if (result.length === 1) {
                    res.send({ msg: "Software is already exist..!", status: 0, redirect_url: "" });
                } else {
                    knex("softwares").insert(prepare_data).then(() => {
                        res.send({ msg: "Software added Successfully..!", status: 1, redirect_url: "/admin/softwares" });
                    });
                }
            });
        } else {
            prepare_data.updated_at = today;
            knex("softwares").select("*").where('id', data.enc_id).then(async (result) => {
                if (result.length === 0) {
                    res.send({ msg: "Software is not found", status: 0, redirect_url: "" });
                } else {
                    if (data.username != result[0].username) {
                        let check_software = await knex('softwares').select('id').where('username', data.username);
                        if (check_software.length > 0) {
                            res.send({ msg: "This username is already exist.", status: 0, redirect_url: "" });
                            return;
                        }
                    }
                    knex("softwares").update(prepare_data).where('id', data.enc_id).then(() => {
                        res.send({ msg: "Software Updated Successfully..!", status: 1, redirect_url: "/admin/softwares" });
                    });
                }
            });
        }
    });
});

router.post('/delete_server', function (req, res, next) {
    if (!session.is_admin(req)) {
        res.send({ msg: "Please login first!!", status: 0, redirect_url: "/admin" });
        return;
    }
    var data = req.body;
    knex.from('servers').select("*").where('uuid', data.enc_id).then((result) => {
        if (result.length === 0) {
            res.send({ msg: "Server does not exist.", status: 0, redirect_url: "" });
        } else {
            knex('servers').where('uuid', data.enc_id).del().then(() => {
                res.send({ msg: "Server has been deleted", status: 0, redirect_url: "" });
            });
        }
    }).catch(() => {
        res.send({ msg: "Some error occur!!", status: 0, redirect_url: "" });
    })
});

router.post('/remove_all_log_data', function (req, res, next) {
    if (!session.is_admin(req)) {
        res.send({ msg: "Please login first!!", status: 0, redirect_url: "/admin" });
        return;
    }
    knex('logs').del().then(() => {
        res.send({ msg: "Logs has been deleted", status: 1, redirect_url: "" });
    }).catch(() => {
        res.send({ msg: "Some error occur!!", status: 0, redirect_url: "" });
    });
});

router.post('/auto_login_users', function (req, res, next) {
    if (!session.is_admin(req)) {
        res.send({ msg: "Please login first!!", status: 0, redirect_url: "/admin" });
        return;
    }
    var data = req.body;
    knex.from('users').select("*").where('uuid', data.enc_id).then((result) => {
        if (result.length === 0) {
            res.send({ msg: "User does not exist.", status: 0, redirect_url: "" });
        } else {
            session.set_user_session(result[0].uuid, res);
            res.send({ msg: "User has been logged in", status: 1, redirect_url: "" });
        }
    }).catch(() => {
        res.send({ msg: "Some error occur!!", status: 0, redirect_url: "" });
    })
});


router.post('/auto_login_users', function (req, res, next) {
    if (!session.is_manager(req)) {
        res.send({ msg: "Please login first!!", status: 0, redirect_url: "/manager" });
        return;
    }
    const data = req.body;
    knex('managers').select('*').where('id',data.enc_id).then((user_data) => {
        if(user_data.length > 0){
            session.set_manager_session(user_data[0].id,res);
            res.send({ msg: "Login success.", status: 1, redirect_url: "" });
        }else{
            res.send({ msg: "Some error occured.", status: 0, redirect_url: "" });
        }
    });
});


module.exports = router;