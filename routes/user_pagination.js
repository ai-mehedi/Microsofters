var express = require('express');
var router = express.Router();
var pagination = require('../helper/pagination');

router.post('/software_licenses', function (req, res, next) {
    if (!session.is_user(req)) {
        res.send({ msg: "Please login first!!", status: 0, redirect_url: "/user" });
        return;
    }
    let per_page = 25;
    pagination.perpage = per_page;
    var data = req.body;
    session.user_data(req, (user_error, user_data) => {
        var table = "licenses";
        var page = 1;
        if (typeof req.query.page !== "undefined") {
            page = req.query.page;
        }
        var offset = (Math.abs(page) - 1) * per_page;
        if (offset < 0) {
            offset = 0;
        }
        var query = knex(table).where('user_id', user_data[0].id);
        var query_counnt = query;
        query_counnt.clone().count("*").then((total_rows) => {
            let paginate_ui = pagination.getAllPageLinks(Math.ceil(total_rows[0].count / per_page), Math.abs(page));
            var main_ht_data = "";
            query.select("*",function(){
                this.column('name').from('softwares').whereRaw(`softwares.id=${table}.software_id`).as('software_name')
            }).offset(offset).limit(per_page).orderBy('id', 'desc').then((data_result) => {
                var serial_number = offset;
                for (var element of data_result) {
                    serial_number++;
                    main_ht_data += `
                        <tr>
                            <td>${serial_number}</td>
                            <td>${element.license_key}</td>
                            <td>${element.software_name}</td>
                            <td>${element.duration}</td>
                            <td>${element.expire_date}</td>
                            <td>${element.status == 1 ? '<span class="label label-success">Active</span>' : element.status == 0 ? '<span class="label label-warning">Pending</span>' : '<span class="label label-danger">Inactive</span>'}</td>
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

router.post('/softwares', function (req, res, next) {
    if (!session.is_user(req)) {
        res.send({ msg: "Please login first!!", status: 0, redirect_url: "/user" });
        return;
    }
    let per_page = 25;
    pagination.perpage = per_page;
    var data = req.body;
    session.user_data(req, (user_error, user_data) => {
        var table = "softwares";
        var page = 1;
        if (typeof req.query.page !== "undefined") {
            page = req.query.page;
        }
        var offset = (Math.abs(page) - 1) * per_page;
        if (offset < 0) {
            offset = 0;
        }
        var query = knex(table).where('status', 1);
        var query_counnt = query;
        query_counnt.clone().count("*").then((total_rows) => {
            let paginate_ui = pagination.getAllPageLinks(Math.ceil(total_rows[0].count / per_page), Math.abs(page));
            var main_ht_data = "";
            query.select("*").offset(offset).limit(per_page).orderBy('id', 'desc').then((data_result) => {
                var serial_number = offset;
                for (var element of data_result) {
                    serial_number++;
                    main_ht_data += `
                        <tr>
                            <td>${serial_number}</td>
                            <td>${element.name}</td>
                            <td>${element.purpose}</td>
                            <td>${element.version}</td>
                            <td><a href="/softwares/${element.filename}" download class="btn btn-success"><i class="fa fa-download"></i></a></td>
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

router.post('/data/snapchats', function (req, res, next) {
    if (!session.is_user(req)) {
        res.send({ msg: "Please login first!!", status: 0, redirect_url: "/user" });
        return;
    }
    let per_page = 25;
    pagination.perpage = per_page;
    var data = req.body;
    session.user_data(req, (user_error, user_data) => {
        var table = "snap_leads";
        var page = 1;
        if (typeof req.query.page !== "undefined") {
            page = req.query.page;
        }
        var offset = (Math.abs(page) - 1) * per_page;
        if (offset < 0) {
            offset = 0;
        }
        var query = knex(table).where('user_id', user_data[0].id);
        var query_counnt = query;
        query_counnt.clone().count("*").then((total_rows) => {
            let paginate_ui = pagination.getAllPageLinks(Math.ceil(total_rows[0].count / per_page), Math.abs(page));
            var main_ht_data = "";
            query.select("*").offset(offset).limit(per_page).orderBy('id', 'desc').then((data_result) => {
                var serial_number = offset;
                for (var element of data_result) {
                    serial_number++;
                    main_ht_data += `
                        <tr>
                            <td>${serial_number}</td>
                            <td>${element.phone_number}</td>
                            <td>${element.lead}</td>
                            <td>${element.created_at}</td>
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