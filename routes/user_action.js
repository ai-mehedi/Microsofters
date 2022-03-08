var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var fs = require('fs');
const knex = require('../bin/db_handler');

router.post('/login', function (req, res, next) {
    if (session.is_user(req)) {
        res.send({ msg: "You are already loggedin", status: 0, redirect_url: "/user/dashboard" });
        return;
    }
    var data = req.body;
    if (data.email_address.trim() == "") {
        res.send({ msg: "Email Address is required", status: 0, redirect_url: "" });
    } else if (data.password.trim() == "") {
        res.send({ msg: "Password is required", status: 0, redirect_url: "" });
    } else {
        knex.from('users').select("*").where('email', '=', data.email_address).then((result) => {
            if (result.length == 0) {
                res.send({ msg: "Email Not Found..!", status: 0, redirect_url: "" });
            } else {
                if (result[0].password == data.password) {
                    if (result[0].status == 0) {
                        res.send({ msg: "This account is not active yet.", status: 0, redirect_url: "" });
                    } else {
                        session.set_user_session(result[0].id, res);
                        res.send({ msg: "Login Success..!", status: 1, redirect_url: "/user/dashboard" });
                    }
                } else {
                    res.send({ msg: "Password is Wrong!!", status: 0, redirect_url: "" });
                }
            }
        });
    }
});


router.post('/update_profile', function (req, res, next) {
    if (!session.is_user(req)) {
        res.send({ msg: "Please login first!!", status: 0, redirect_url: "/user" });
        return;
    }
    var data = req.body;
    if (data.firstname.trim() == "") {
        res.send({ msg: "Firstname is required", status: 0, redirect_url: "" });
    } else if (data.lastname.trim() == "") {
        res.send({ msg: "Lastname is required", status: 0, redirect_url: "" });
    } else {
        session.user_data(req, (user_error, user_data) => {
            knex("users").where("uuid", user_data[0].uuid).update({
                firstname: data.firstname,
                lastname: data.lastname
            }).then(function (count) {
                res.send({ msg: "Profile Updated successfully..!", status: 1, redirect_url: "/user/profile" });
            }).catch((err) => {
                res.send({ msg: "Some error occurs!!", status: 1, redirect_url: DIR + "" });
            });
        });
    }
});

router.post('/change_password', function (req, res, next) {
    if (!session.is_user(req)) {
        res.send({ msg: "Please login first!!", status: 0, redirect_url: "/user" });
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
        session.user_data(req, (user_error, user_data) => {
            if (user_data[0].password == data.current_password) {
                if (data.new_password == data.confirm_password) {
                    knex("users").where("uuid", user_data[0].uuid).update({
                        password: data.confirm_password
                    }).then(function (count) {
                        res.send({ msg: "Password changed successfully..!", status: 1, redirect_url: "/user/profile" });
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

router.post('/request_license',async function (req, res, next) {
    if (!session.is_user(req)) {
        res.send({ msg: "Please login first!!", status: 0, redirect_url: "/user" });
        return;
    }
    var data = req.body;
    session.user_data(req,async (user_error, user_data) => {
        let check_software = await knex('softwares').select('id').where('id', data.software).where('status', 1);
        if (check_software.length === 0) {
            res.send({ msg: "Software not found", status: 0, redirect_url: "" });
            return;
        }
        if (isNaN(data.duration)) {
            res.send({ msg: "Invalid Duration", status: 0, redirect_url: "" });
            return;
        }
        let check_license = await knex('licenses').select('id').where('software_id', data.software).where('license_key', data.license_key).where('user_id', user_data[0].id);
        if (check_license.length > 0) {
            res.send({ msg: "License is already exist.", status: 0, redirect_url: "" });
            return;
        }
        let expire_date = new Date();
        let prepare_data = {
            manager_id: user_data[0].manager_id,
            user_id: user_data[0].id,
            software_id: data.software,
            expire_date: expire_date,
            duration: data.duration,
            license_key: data.license_key,
            status: 0
        }
        knex('licenses').insert(prepare_data).then(() => {
            res.send({ msg: "License Request has been sent.", status: 1, redirect_url: "/software_license/licenses" });
        });
    });
});

router.post('/download_data',async function (req, res, next) {
    if (!session.is_user(req)) {
        res.send({ msg: "Please login first!!", status: 0, redirect_url: "/user" });
        return;
    }
    const data = req.body;
    let query = knex('snap_leads').select('*');
    if(data.from_date.trim() != "" && data.to_date.trim() != ""){
        query.whereBetween('created_at', [data.from_date, data.to_date]);
    }
    if(data.phone_number.trim() != ""){
        query.where('phone_number',data.phone_number);
    }

    if(data.license_key.trim() != ""){
        query.where('license_key',data.license_key);
    }
    query.then((data_result) => {
        res.setHeader('Content-disposition', 'attachment; filename=snapchat_data.csv');
        res.setHeader('Content-type', 'text/plain');
        let snap_leads = "Snapchat,Phone,Collect Date \r\n";
        for(var lead of data_result){
            snap_leads += `"${lead.lead}","${lead.phone_number}","${lead.created_at}"\n`;
        }
        res.end(snap_leads);
    });
});

router.post('/remove_snaps',async function (req, res, next) {
    if (!session.is_user(req)) {
        res.send({ msg: "Please login first!!", status: 0, redirect_url: "/user" });
        return;
    }
    const data = req.body;
    let query = knex('snap_leads').select('*');
    if(data.from_date.trim() != "" && data.to_date.trim() != ""){
        query.whereBetween('created_at', [data.from_date, data.to_date]);
    }
    if(data.phone_number.trim() != ""){
        query.where('phone_number',data.phone_number);
    }

    if(data.license_key.trim() != ""){
        query.where('license_key',data.license_key);
    }
    query.then(() => {
        res.send({ msg: "Data has been removed.", status: 1, redirect_url: "" });
    });
});
module.exports = router;