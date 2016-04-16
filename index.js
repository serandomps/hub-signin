var dust = require('dust')();
var serand = require('serand');
var utils = require('hub-utils');

dust.loadSource(dust.compile(require('./template'), 'hub-signin'));

module.exports = function (sandbox, fn, options) {
    dust.render('hub-signin', {}, function (err, out) {
        if (err) {
            return;
        }
        sandbox.append(out);
        sandbox.on('click', '.hub-signin .signin', function (e) {
            var el = $('.hub-signin', sandbox);
            var username = $('.username', el).val();
            var password = $('.password', el).val();
            authenticate(username, password, options);
            return false;
        });
        fn(false, function () {
            $('.hub-signin', sandbox).remove();
        });
    });
};

var authenticate = function (username, password, options) {
    $.ajax({
        method: 'POST',
        url: '/apis/v/tokens',
        data: {
            client_id: options.clientId,
            grant_type: 'password',
            username: username,
            password: password
        },
        contentType: 'application/x-www-form-urlencoded',
        dataType: 'json',
        success: function (token) {
            var user = {
                tid: token.id,
                username: username,
                access: token.access_token,
                refresh: token.refresh_token,
                expires: token.expires_in
            };
            serand.emit('hub-token', 'info', user.tid, user.access, function (err, token) {
                if (err) {
                    serand.emit('user', 'login error');
                    return;
                }
                user.has = token.has;
                serand.emit('user', 'logged in', user, options);
            });
        },
        error: function () {
            serand.emit('user', 'login error');
        }
    });
};
