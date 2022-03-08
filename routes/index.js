var express = require('express');
const Knex = require('knex');
const knex = require('../bin/db_handler');
var router = express.Router();
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Sdsoft',
    is_user: session.is_user(req)
  });
});
router.get('/signup', function (req, res, next) {
  if (session.is_user(req)) {
    res.redirect('/user');
    return;
  }
  knex('managers').select('*').where('status', 1).then((managers) => {
    res.render('signup', {
      title: 'Signup - Sdsoft',
      managers: managers
    });
  });
});

router.post('/signup_submit', async function (req, res, next) {
  if (session.is_user(req)) {
    res.send({ msg: "You are already logged in.", status: 0, redirect_url: "/user" });
    return;
  }
  var data = req.body;
  let main_updata = {
    firstname: data.firstname,
    lastname: data.lastname,
    email: data.email,
    status: 0,
    manager_id: data.manager,
    password: data.password
  };
  let check_manager = await knex('managers').select('id').where('id', data.manager);
  if (check_manager.length === 0) {
    res.send({ msg: "Manager not found", status: 0, redirect_url: "/" });
    return;
  }

  let check_user = await knex('users').select('email').where('email', data.email);
  if (check_user.length > 0) {
    res.send({ msg: "Email is already exist.", status: 0, redirect_url: "" });
    return;
  }
  knex('users').insert(main_updata).then(() => {
    res.send({ msg: "Signup Success.", status: 1, redirect_url: "/user" });
    return;
  }).catch((e) => {
    res.send({ msg: "Some error occured.", status: 0, redirect_url: "" });
    return;
  })
});

router.post('/check_license', async function (req, res, next) {
  var data = req.body;
  knex('licenses').select('*').where('license_key', data.license_key).where('status', 1).whereExists(knex('softwares').select('id').where('username', data.name).where('version', data.version)).then((software_license) => {
    if (software_license.length > 0) {
      if (new Date().getTime() < new Date(software_license[0].expire_date).getTime()) {
        res.status(200).send("200.success");
      } else {
        res.status(401).send("401.unauthrized");
      }
    } else {
      res.status(401).send("401.unauthrized");
    }
  });
});

router.post('/submit_snap_username', async function (req, res, next) {
  var data = req.body;
  knex('licenses').select('*').where('license_key', data.license_key).where('status', 1).whereExists(knex('softwares').select('id').where('username', data.name).where('version', data.version)).then(async (software_license) => {
    if (software_license.length > 0) {
      let data_lead = data.data;
      if (data_lead.length > 20) {
        data_lead = data_lead.substring(0, 20);
      }
      let check_lead = await knex('snap_leads').select('id')
        .where('lead', data_lead)
        .where('manager_id', software_license[0].manager_id)
        .where('user_id', software_license[0].user_id)
        .where('software_id', software_license[0].software_id)
        .where('license_key', software_license[0].license_key);

      if (check_lead.length === 0) {
        knex('snap_leads').insert({
          manager_id: software_license[0].manager_id,
          user_id: software_license[0].user_id,
          software_id: software_license[0].software_id,
          license_key: software_license[0].license_key,
          phone_number: data.phone_number,
          lead: data_lead
        }).then(() => {
          res.status(201).send('');
        })
      } else {
        res.status(201).send('');
      }
    }
  });
});
module.exports = router;
