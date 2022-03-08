var express = require('express');
var router = express.Router();
var pagination = require('../helper/pagination');

router.post('/managers', function (req, res, next) {
    if (!session.is_admin(req)) {
        res.send({ msg: "Please login first!!", status: 0, redirect_url: "/admin" });
        return;
    }
    let per_page = 10;
    pagination.perpage = per_page;
    var data = req.body;
    session.admin_data(req, (user_error, user_data) => {
        var table = "managers";
        var page = 1;
        if (typeof req.query.page !== "undefined") {
            page = req.query.page;
        }
        var offset = (Math.abs(page) - 1) * per_page;
        if (offset < 0) {
            offset = 0;
        }
        var query = knex(table);
        if (data.table_search.trim() != "") {
            query.where('email', 'ILIKE', '%' + data.table_search + '%')
        }
        var query_counnt = query;
        query_counnt.clone().count("*").then((total_rows) => {
            let paginate_ui = pagination.getAllPageLinks(Math.ceil(total_rows[0].count / per_page), Math.abs(page));
            var main_ht_data = "";
            query.select("*").offset(offset).limit(per_page).then((data_result) => {
                var serial_number = offset;
                for (var element of data_result) {
                    serial_number++;
                    var status;
                    if (element.status == "1") {
                        status = '<span class="label label-success">Active</span>';
                    } else if (element.status == "0") {
                        status = '<span class="label label-warning">Inactive</span>';
                    }
                    main_ht_data += '<tr> ' +
                        '<td>' + serial_number + '</td> ' +
                        '<td>' + element.firstname + '</td> ' +
                        '<td>' + element.lastname + '</td> ' +
                        '<td>' + element.email + '</td> ' +
                        '<td>' + status + '</td>' +
                        '<td>' +
                            '<a style="margin-left: 10px;" class="btn btn-danger" href="/admin/managers/add?enc_id=' + element.id + '"><i class="fa fa-pencil"></i></a>' +
                            '<a style="margin-left: 10px;" class="btn btn-warning" href="javascript:;" onclick="return auto_login_admin_manager(\'' + element.id + '\')"><i class="fa fa-sign-in"></i></a>' +
                        '</td>'
                    '</tr>';
                }
                res.send({
                    status: 1,
                    main_data: main_ht_data,
                    paginate_data: paginate_ui
                });
            });
        });
    });
});

router.post('/softwares', function (req, res, next) {
    if (!session.is_admin(req)) {
        res.send({ msg: "Please login first!!", status: 0, redirect_url: "/admin" });
        return;
    }
    let per_page = 10;
    pagination.perpage = per_page;
    var data = req.body;
    var table = "softwares";
    var page = 1;
    if (typeof req.query.page !== "undefined") {
        page = req.query.page;
    }
    var offset = (Math.abs(page) - 1) * per_page;
    if (offset < 0) {
        offset = 0;
    }
    var query = knex(table);
    if (data.table_search.trim() != "") {
        query.where('name', 'ILIKE', '%' + data.table_search + '%')
    }
    var query_counnt = query;
    query_counnt.clone().count("*").then((total_rows) => {
        let paginate_ui = pagination.getAllPageLinks(Math.ceil(total_rows[0].count / per_page), Math.abs(page));
        var main_ht_data = "";
        query.select("*").offset(offset).limit(per_page).then((data_result) => {
            var serial_number = offset;
            for (var element of data_result) {
                serial_number++;
                var status;
                if (element.status == "1") {
                    status = '<span class="label label-success">Active</span>';
                } else if (element.status == "0") {
                    status = '<span class="label label-warning">Inactive</span>';
                }

                main_ht_data += '<tr> ' +
                    '<td>' + serial_number + '</td> ' +
                    '<td>' + element.name + '</td> ' +
                    '<td>' + element.username + '</td> ' +
                    '<td>' + element.purpose + '</td> ' +
                    '<td>' + element.version + '</td> ' +
                    '<td>' + status + '</td>' +
                    '<td>' +
                        '<a class="btn btn-danger" href="/admin/softwares/add?enc_id=' + element.id + '"><i class="fa fa-pencil"></i></a>' +
                    '</td>'
                '</tr>';
            }
            res.send({
                status: 1,
                main_data: main_ht_data,
                paginate_data: paginate_ui
            });
        });
    });
});

module.exports = router;