var express = require('express');
var router = express.Router();
var pagination = require('../helper/pagination');

router.post('/users', function (req, res, next) {
    if (!session.is_manager(req)) {
        res.send({ msg: "Please login first!!", status: 0, redirect_url: "/user" });
        return;
    }
    let per_page = 25;
    pagination.perpage = per_page;
    var data = req.body;
    session.manager_data(req, (user_error, user_data) => {
        var table = "users";
        var page = 1;
        if (typeof req.query.page !== "undefined") {
            page = req.query.page;
        }
        var offset = (Math.abs(page) - 1) * per_page;
        if (offset < 0) {
            offset = 0;
        }
        var query = knex(table).where('manager_id', user_data[0].id);
        if (data.table_search.trim() != "") {
            query.where('email', 'ILIKE', '%' + data.table_search + '%')
        }
        var query_counnt = query;
        query_counnt.clone().count("*").then((total_rows) => {
            let paginate_ui = pagination.getAllPageLinks(Math.ceil(total_rows[0].count / per_page), Math.abs(page));
            var main_ht_data = "";
            query.select("*").offset(offset).limit(per_page).orderBy('id', 'desc').then((data_result) => {
                var serial_number = offset;
                for (var element of data_result) {
                    serial_number++;
                    var status = "";
                    if (element.cleared == 1) {
                        status = '<span class="label label-success">Cleared</span>';
                    } else if (element.cleared == 0) {
                        status = '<span class="label label-danger">Not Clear</span>';
                    }

                    main_ht_data += `
                        <tr>
                            <td>${serial_number}</td>
                            <td>${element.firstname}</td>
                            <td>${element.lastname}</td>
                            <td>${element.email}</td>
                            <td>${status}</td>
                            <td>
                                <a style="margin-left: 10px;" class="btn btn-danger" href="/manager/users/add?enc_id=${element.id}"><i class="fa fa-pencil"></i></a>
                                <a style="margin-left: 10px;" class="btn btn-warning" href="javascript:;" onclick="return auto_login_manager_user('${element.id}')"><i class="fa fa-sign-in"></i></a>
                            </td>
                        </tr>
                    `;
                }
                res.send({
                    total_count: Math.ceil(total_rows[0].count),
                    status: 1,
                    main_data: main_ht_data,
                    paginate_data: paginate_ui
                });
            });
        });
    });
});

router.post('/license_request', function (req, res, next) {
    if (!session.is_manager(req)) {
        res.send({ msg: "Please login first!!", status: 0, redirect_url: "/user" });
        return;
    }
    let per_page = 25;
    pagination.perpage = per_page;
    var data = req.body;
    session.manager_data(req, (user_error, user_data) => {
        var table = "licenses";
        var page = 1;
        if (typeof req.query.page !== "undefined") {
            page = req.query.page;
        }
        var offset = (Math.abs(page) - 1) * per_page;
        if (offset < 0) {
            offset = 0;
        }
        var query = knex(table).where('manager_id', user_data[0].id).where('status',0);
        var query_counnt = query;
        query_counnt.clone().count("*").then((total_rows) => {
            let paginate_ui = pagination.getAllPageLinks(Math.ceil(total_rows[0].count / per_page), Math.abs(page));
            var main_ht_data = "";
            query.select("*",function(){
                this.column('name').from('softwares').whereRaw(`softwares.id=${table}.software_id`).as('software_name')
            },function(){
                this.column('firstname').from('users').whereRaw(`users.id=${table}.user_id`).as('user_firstname')
            },function(){
                this.column('lastname').from('users').whereRaw(`users.id=${table}.user_id`).as('user_lastname')
            }).offset(offset).limit(per_page).orderBy('id', 'desc').then((data_result) => {
                var serial_number = offset;
                for (var element of data_result) {
                    serial_number++;

                    main_ht_data += `
                        <tr>
                            <td>${serial_number}</td>
                            <td>${element.user_firstname} ${element.user_lastname}</td>
                            <td>${element.software_name}</td>
                            <td>${element.license_key}</td>
                            <td>${element.duration}</td>
                            <td><span class="label label-warning">Pending</span></td>
                            <td>
                                <a style="margin-left: 10px;" class="btn btn-success" href="/manager/licenses/action?enc_id=${element.id}"><i class="fa fa-eercast"></i></a>
                            </td>
                        </tr>
                    `;
                }
                res.send({
                    total_count: Math.ceil(total_rows[0].count),
                    status: 1,
                    main_data: main_ht_data,
                    paginate_data: paginate_ui
                });
            });
        });
    });
});

router.post('/licenses', function (req, res, next) {
    if (!session.is_manager(req)) {
        res.send({ msg: "Please login first!!", status: 0, redirect_url: "/user" });
        return;
    }
    let per_page = 25;
    pagination.perpage = per_page;
    var data = req.body;
    session.manager_data(req, (user_error, user_data) => {
        var table = "licenses";
        var page = 1;
        if (typeof req.query.page !== "undefined") {
            page = req.query.page;
        }
        var offset = (Math.abs(page) - 1) * per_page;
        if (offset < 0) {
            offset = 0;
        }
        var query = knex(table).where('manager_id', user_data[0].id).whereIn('status',[1,2]);
        var query_counnt = query;
        query_counnt.clone().count("*").then((total_rows) => {
            let paginate_ui = pagination.getAllPageLinks(Math.ceil(total_rows[0].count / per_page), Math.abs(page));
            var main_ht_data = "";
            query.select("*",function(){
                this.column('name').from('softwares').whereRaw(`softwares.id=${table}.software_id`).as('software_name')
            },function(){
                this.column('firstname').from('users').whereRaw(`users.id=${table}.user_id`).as('user_firstname')
            },function(){
                this.column('lastname').from('users').whereRaw(`users.id=${table}.user_id`).as('user_lastname')
            }).offset(offset).limit(per_page).orderBy('id', 'desc').then((data_result) => {
                var serial_number = offset;
                for (var element of data_result) {
                    serial_number++;

                    main_ht_data += `
                        <tr>
                            <td>${serial_number}</td>
                            <td>${element.user_firstname} ${element.user_lastname}</td>
                            <td>${element.software_name}</td>
                            <td>${element.license_key}</td>
                            <td>${element.duration}</td>
                            <td>${element.expire_date}</td>
                            <td>${element.status == 1 ? '<span class="label label-success">Active</span>' : element.status == 2 ? '<span class="label label-danger">Inactive</span>' : ''}</td>
                            <td>
                                <a style="margin-left: 10px;" class="btn btn-success" href="/manager/licenses/update?enc_id=${element.id}"><i class="fa fa-pencil"></i></a>
                            </td>
                        </tr>
                    `;
                }
                res.send({
                    total_count: Math.ceil(total_rows[0].count),
                    status: 1,
                    main_data: main_ht_data,
                    paginate_data: paginate_ui
                });
            });
        });
    });
});

module.exports = router;