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
                var password = body.password.replace(/ /g, '').replace(/\n/g, '').toLowerCase();
                var word = body.word.replace(/ /g, '').toLowerCase();
                tryCrashPassword(password, word).then(function (res) {
                    response.writeHeader(200);
                    if (res > 5 * 60) {
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
    if (word !== '') {
        return attackWithMask(password, word);
    }
    if (isFinite(password)) {
        return bruteforceForInt(password);
    }
    var chars = 0;
    for (var i = 0; i < password.length; i++) {
        if (('a' <= password[i]) && (password[i] <= 'z')) chars++;
    }
    if (chars === password.length) {
        return bruteforceForChar(password);
    }
    return bruteforceForAll(password);
    /*if (word === '') {
     return attackWithDictionary(password);
     }*/
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
        var time = 0;
        password = password.split(word);
        password = password.filter(function (value, index, arr) {
            return value !== '';
        });
        if (password.length === 0) {
            resolve(time);
        }
        var promises = [];
        for (var i = 0; i < password.length; i++) {
            promises.push(bruteforceForAll(password[i]));
        }
        var countTime = function (array) {
            array.forEach(function (item, i, arr) {
                time += item;
            });
            return time;
        };
        Promise.all(promises).then(function (res) {
            resolve(countTime(res));
        })
    })
}

function bruteforceForInt(password) {
    return new Promise(function (resolve, reject) {
        var time = 0;
        var start = Date.now();
        bruteForce('0123456789', function (val) {
            time = Date.now() - start;
            return val === password || time > 300000;
        });
        time = (Date.now() - start) / 1000;
        resolve(time);
    })
}

function bruteforceForChar(password) {
    return new Promise(function (resolve, reject) {
        var time = 0;
        var start = Date.now();
        bruteForce('abcdefghijklmnopqrstuvwxyz', function (val) {
            time = Date.now() - start;
            return val === password || (Date.now() - start) > 300000;
        });
        time = (Date.now() - start) / 1000;
        resolve(time);
    })
}

function bruteforceForAll(password) {
    return new Promise(function (resolve, reject) {
        var time = 0;
        var start = Date.now();
        bruteForce('abcdefghijklmnopqrstuvwxyz0123456789!\\"#@`$%^&*()_-=+*/\';:.,?|<>[]{}~', function (val) {
            time = Date.now() - start;
            return val === password || (Date.now() - start) > 300000;
        });
        time = (Date.now() - start) / 1000;
        resolve(time);
    })
}

var bruteForce = function (characters, callback) {
    var i, intToCharacterBasedString, result;
    characters = characters.split("");
    characters = [""].concat(characters); // Useless empty value to start this array on index = 1
    intToCharacterBasedString = function (num) { // Annoying algorithm..
        var charBasedString, modulo;
        charBasedString = "";
        while (num > 0) {
            modulo = num % characters.length; // Basic calculating
            charBasedString = characters[modulo] + charBasedString; // Just push it before the old characters
            num = ((num - modulo) / characters.length); // New value of num, annoying calculation
        }
        return charBasedString;
    };
    i = 1;
    while (i > 0) {
        result = callback(intToCharacterBasedString(i));
        if (result) { // If callbacks returns true: we did our job!
            break;
        }
        i++;
    }
};

server.listen(1110);
console.info('Server started!');

