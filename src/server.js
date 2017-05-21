var http = require('http');
var fs = require('fs');
var url = require('url');
var lineReader = require('readline');

var mainPage = fs.readFileSync('./src/mainPage.html');
var passwordGen = fs.readFileSync('./src/passwordGen.js');
var passwordCheck = fs.readFileSync('./src/passwordCheck.js');

var server = http.createServer(function (request, response) {

    var reqUrl = url.parse(request.url);

    switch (reqUrl.pathname) {
        case '/checking':

            console.log('Ura!!');
            var body = null;
            var object = '';
            request.on('data', function (data) {
                object += data;
            }).on('end', function () {
                body = JSON.parse(object);
                var password = body.password.replace(/ /g, '').toLowerCase();
                var word = body.word.replace(/ /g, '').toLowerCase();
                tryCrashPassword(password, word).then(function (res) {
                    response.writeHeader(200);
                    if (res > 5*60) {
                        response.end('Пароль взламывается больше ' + res / 60 + 'мин');
                    }
                    if (res > 60) {
                        response.end('Пароль взламывается ' + res / 60 + 'мин');
                    }
                    response.end('Пароль взламывается ' + res + 'сек');

                });
            });
            break;
        default:
            response.writeHeader(200);
            response.end(fromURLtoFile(reqUrl.pathname));
    }
});

function fromURLtoFile(url) {
    return {
        '/': mainPage,
        '/passwordGen.js': passwordGen,
        '/passwordCheck.js': passwordCheck
    }[url];
}

function tryCrashPassword(password, word) {
    if (password === '') {
        return Promise.resolve('Вы не ввели пароль');
    }
    if (isFinite(password)) {
        return bruteforce(password);
    }
    if (word === '') {
        return attackWithDictionary(password);
    }
    return attackWithMask(password, word);
}

function attackWithDictionary(password) {
    return new Promise(function (resolve, reject) {
        lineReader = lineReader.createInterface({
            input: fs.createReadStream('./src/words/9mil.txt')
        });
        lineReader.on('line', function (line) {
            console.log('Line from file:', line);
        });
        lineReader.on('close', function () {
            console.log('EEEEEENNNNNNDDDDDDD');
            resolve('uiiiii');
        });
    })

}

function attackWithMask(password, word) {
    return new Promise(function (resolve, reject) {
        resolve('Mask');
    })
}

function bruteforce(password) {
    return new Promise(function (resolve, reject) {
        var length = password.length;
        var time = 0;
        var arr = new Array(length);
        for (var i = 0; i < length; i++) {
            arr[i] = 0;
        }
        var string = arr.join('');
        var start = Date.now();
        while (string !== password) {
            string++;
            string = '' + string;
            if (string.length < length) {
                string = arr.slice(0, length - string.length).join('') + string;
            }
            time = Date.now() - start;
            if (time > 300000 ) resolve(time / 10000);
        }
        time /= 1000;
        console.log('eeeeeee');
        resolve(time);
    })
}

server.listen(1110);
console.info('Server started!');

