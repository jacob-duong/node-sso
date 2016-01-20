'use strict';

/*
 * initialize module
 */
var cookiee = require('cookie-encryption'); // use require('cookie-encryption') instead
var app = require('express')();
var bodyParser = require('body-parser');
var cookie = require('cookie-parser');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

/*
* The character encodings currently supported by Node.js include:
* 'ascii' - for 7-bit ASCII data only. This encoding method is very fast and will strip the high bit if set.
* 'utf8' - Multibyte encoded Unicode characters. Many web pages and other document formats use UTF-8.
* 'utf16le' - 2 or 4 bytes, little-endian encoded Unicode characters. Surrogate pairs (U+10000 to U+10FFFF) are supported.
* 'ucs2' - Alias of 'utf16le'.
* 'base64' - Base64 string encoding.
* 'binary' - A way of encoding the buffer into a one-byte (latin-1) encoded string. The string 'latin-1' is not supported. Instead, pass 'binary' to use 'latin-1' encoding.
* 'hex' - Encode each byte as two hexadecimal characters.
*/

const secret = 'password to encrypt cookies';
var userCookie = cookiee(secret, {
  cookie: 'userCookie', //Name of cookie
  cipher: 'arc4', //Type of cipher, grab list from getCiphers
  encoding: 'base64', //Type of output encoding by nodejs
  domain: '.demo.localhost', //Domain of cookie
  httpOnly: true //Flag for http only cookie (default "false")
});

app.use(cookie('_sso')); // using only for parsing header cookie

//Home page
app.get('/', function(req, res) {
    var isAuth = userCookie.read(req);
    if(isAuth){
        var html = '<div style="text-align: center; padding-top: 100px;"><h1>User authenticated</h1>'

        + '<p>Domain: ' + req.headers.host + '</p>'
        + 'User model:'
        + '<p>' + userCookie.read(req) + '</p>'
        + '<p><a href="/logout">Logout</a></p>'
        + '</div>';
        res.send(html);
    }
    else{
        // have not login
        res.sendfile('./login.html');
    }
});

//Login page
app.post('/login', function(req, res) {
    //Get data submitted
    var username = req.body.username,
        password = req.body.password,
        rememberMe = req.body.rememberMe;

    //TODO: Call API to authentication

    //init mock data model or response from API to authentication
    var data = {
        access_token: 'yKIWXHFrtHqR27grmWR3qOOW17HykVZlZMa3wJ3a',
        expires_in: 3600,
        username: username,
        password: password,
        rememberMe: rememberMe
    };

    //write data to selected cookie (userCookie)
    userCookie.write(req, JSON.stringify(data));

    //redirect to read cookie page
    res.status(200).redirect('/');
});

app.get('/logout', function(req, res) {
    //clear data cache
    userCookie.write(req, '');

    //redirect to read cookie page
    res.status(200).redirect('/');
});

app.listen(3000);

console.log('starting "SSO implementation - Start" on port 3000');