class session {
    cookie_options = {
        maxAge: 1000 * 60 * 1000,
        httpOnly: true,
        signed: true
    };
    admin_session = "uyrtsdfsdyig65fgfu7xcryt";
    user_session = "uyrtsdfsdghdfgdyig65xfdu7ryt";
    manager_session = "uyrtsdfsdghdfgdyig6bncvb5fdu7ryt";
    //---------------- Admin Session--------------------\\
    set_admin_session(user_id, res) {
        var user_cookie = this.admin_session;
        var cookies_data = helper.random_string(10) + "|:|" + helper.base_encode(JSON.stringify({ main_user: user_id }));
        res.cookie(user_cookie, cookies_data, this.cookie_options);
    }
    is_admin(req) {
        if (typeof req.signedCookies[this.admin_session] === "undefined") {
            return false;
        } else {
            return true;
        }
    }
    admin_data(req, callback) {
        let session_user_id = JSON.parse(helper.base_decode(req.signedCookies[this.admin_session].trim().split('|:|')[1])).main_user;
        knex.from('admins').select("*").where('id', session_user_id)
            .then((rows) => {
                return callback(null, rows);
            }).catch((err) => {
            return callback(err, null);
        });
    }
    logout_admin(res) {
        res.clearCookie(this.admin_session);
    }
    //---------------- Admin Session--------------------\\

    //---------------- User Session--------------------\\
    set_user_session(user_id, res) {
        var user_cookie = this.user_session;
        var cookies_data = helper.random_string(10) + "|:|" + helper.base_encode(JSON.stringify({ main_user: user_id }));
        res.cookie(user_cookie, cookies_data, this.cookie_options);
    }
    is_user(req) {
        if (typeof req.signedCookies[this.user_session] === "undefined") {
            return false;
        } else {
            return true;
        }
    }
    user_data(req, callback) {
        let session_user_id = JSON.parse(helper.base_decode(req.signedCookies[this.user_session].trim().split('|:|')[1])).main_user;
        knex.from('users').select("*").where('id', session_user_id)
            .then((rows) => {
                return callback(null, rows);
            }).catch((err) => {
            return callback(err, null);
        });
    }
    logout_user(res) {
        res.clearCookie(this.user_session);
    }
    //---------------- User Session--------------------\\

    //---------------- Manager Session--------------------\\
    set_manager_session(user_id, res) {
        var user_cookie = this.manager_session;
        var cookies_data = helper.random_string(10) + "|:|" + helper.base_encode(JSON.stringify({ main_user: user_id }));
        res.cookie(user_cookie, cookies_data, this.cookie_options);
    }
    is_manager(req) {
        if (typeof req.signedCookies[this.manager_session] === "undefined") {
            return false;
        } else {
            return true;
        }
    }
    manager_data(req, callback) {
        let session_user_id = JSON.parse(helper.base_decode(req.signedCookies[this.manager_session].trim().split('|:|')[1])).main_user;
        knex.from('managers').select("*").where('id', session_user_id)
            .then((rows) => {
                return callback(null, rows);
            }).catch((err) => {
            return callback(err, null);
        });
    }
    logout_manager(res) {
        res.clearCookie(this.manager_session);
    }
    //---------------- Manager Session--------------------\\
}
module.exports = new session();