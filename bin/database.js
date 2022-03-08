var knex = require('./db_handler');
let today = new Date();
knex.schema.hasTable('admins').then(function (exists) {
    if (!exists) {
        knex.schema.createTable('admins', function (t) {
            t.increments('id').primary();
            t.string('firstname', 255);
            t.string('lastname', 255);
            t.string('email', 255);
            t.string('password', 555);
            t.integer('status').defaultTo(0);
            t.timestamp('created_at').defaultTo(knex.fn.now());
            t.timestamp('updated_at').defaultTo(knex.fn.now());
        }).then(() => {
            console.log("Database admins created with data");
            knex("admins").insert({
                firstname: 'Main',
                lastname: 'Admin',
                email: 'admin@sdsoft.xyz',
                password: '.sdsoft000',
                status: 1,
                created_at: today,
                updated_at: today
            }).then(() => {
                console.log("Admin Data has been inserted");
            });
        });
    }
});

knex.schema.hasTable('managers').then(function (exists) {
    if (!exists) {
        knex.schema.createTable('managers', function (t) {
            t.increments('id').primary();
            t.string('firstname', 255);
            t.string('lastname', 255);
            t.string('email', 255);
            t.string('password', 555);
            t.integer('status').defaultTo(0);
            t.timestamp('created_at').defaultTo(knex.fn.now());
            t.timestamp('updated_at').defaultTo(knex.fn.now());
        }).then(() => {
            console.log("Database managers created with data");
        });
    }
});

knex.schema.hasTable('users').then(function (exists) {
    if (!exists) {
        knex.schema.createTable('users', function (t) {
            t.increments('id').primary();
            t.integer('manager_id').defaultTo(0);
            t.string('firstname', 255);
            t.string('lastname', 255);
            t.string('email', 255);
            t.string('password', 555);
            t.integer('status').defaultTo(0);
            t.timestamp('created_at').defaultTo(knex.fn.now());
            t.timestamp('updated_at').defaultTo(knex.fn.now());
        }).then(() => {
            console.log("Database users created with data");
        });
    }
});

knex.schema.hasTable('softwares').then(function (exists) {
    if (!exists) {
        knex.schema.createTable('softwares', function (t) {
            t.increments('id').primary();
            t.string('name', 255);
            t.string('username', 255);
            t.string('purpose', 255);
            t.string('version', 255);
            t.integer('status').defaultTo(0);
            t.timestamp('created_at').defaultTo(knex.fn.now());
            t.timestamp('updated_at').defaultTo(knex.fn.now());
        }).then(() => {
            console.log("Database softwares created with data");
        });
    }
});

knex.schema.hasTable('licenses').then(function (exists) {
    if (!exists) {
        knex.schema.createTable('licenses', function (t) {
            t.increments('id').primary();
            t.integer('manager_id').defaultTo(0);
            t.integer('user_id').defaultTo(0);
            t.integer('software_id').defaultTo(0);
            t.timestamp('expire_date',).defaultTo(knex.fn.now());
            t.string('duration', 255);
            t.string('license_key', 255);
            t.string('filename', 255);
            t.integer('status').defaultTo(0);
            t.timestamp('created_at').defaultTo(knex.fn.now());
            t.timestamp('updated_at').defaultTo(knex.fn.now());
        }).then(() => {
            console.log("Database licenses created with data");
        });
    }
});

knex.schema.hasTable('snap_leads').then(function (exists) {
    if (!exists) {
        knex.schema.createTable('snap_leads', function (t) {
            t.increments('id').primary();
            t.integer('manager_id').defaultTo(0);
            t.integer('user_id').defaultTo(0);
            t.integer('software_id').defaultTo(0);
            t.string('license_key', 255);
            t.string('phone_number', 255);
            t.text('lead');
            t.timestamp('created_at').defaultTo(knex.fn.now());
        }).then(() => {
            console.log("Database snap_leads created with data");
        });
    }
});