var http = require('http');
var fs = require('fs');
var url = require('url');
var lineReader = require('line-reader');

var mainPage = fs.readFileSync('./src/mainPage.html');
var passwordGen = fs.readFileSync('./src/passwordGen.js');
var passwordCheck = fs.readFileSync('./src/passwordCheck.js');
var loaderCss = fs.readFileSync('./src/loader.css');

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
                tryCrashPassword(password, word).then(function (obj) {
                    response.writeHeader(200);
                    if (obj.time > 5 * 60) {
                        response.end('Пароль взламывается больше '
                            + ~~(obj.time / 60) + ' мин и ' + Math.ceil(obj.time - ~~(obj.time / 60) * 60) +
                            ' сек</br> Пароль взламывается за ' + obj.count + ' операций');
                    }
                    if (obj.time > 60) {
                        response.end('Пароль взламывается '
                            + ~~(obj.time / 60) + ' мин и ' + Math.ceil(obj.time - ~~(obj.time / 60) * 60) +
                            ' сек</br> Пароль взламывается за ' + obj.count + ' операций');
                    }
                    response.end('Пароль взламывается '
                        + Math.ceil(obj.time) +
                        ' сек </br> Пароль взламывается за ' + obj.count + ' операций');

                }, function (err) {
                    response.end(err);
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
        '/passwordCheck.js': passwordCheck,
        '/loader.css': loaderCss
    }[url];
}

function tryCrashPassword(password, word) {
    if (password === '') {
        return Promise.reject('Вы не ввели пароль');
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
    //return attackWithDictionary(password);
}

function attackWithDictionary(password) {
    return new Promise(function (resolve, reject) {
        var time = 0;
        var start = Date.now();
        var count = 0;
        lineReader.eachLine('./src/words/test.txt', function (line, last) {
            count++;
            time = Date.now() - start;
            if (last) {
                reject('Такого пароля нет в наших словарях');
                return false;
            }
            if (password !== line && time <= 30000) return true;
            time = (Date.now() - start) / 1000;
            resolve({time: time, count: count});
            return false;
        })
    })
}

function attackWithMask(password, word) {
    return new Promise(function (resolve, reject) {
        var time = 0;
        var count = 0;
        password = password.split(word);
        password = password.filter(function (value, index, arr) {
            return value !== '';
        });
        if (password.length === 0) {
            resolve({time: time, count: count});
        }
        var promises = [];
        for (var i = 0; i < password.length; i++) {
            promises.push(bruteforceForAll(password[i]));
        }
        var countTime = function (array) {
            array.forEach(function (item, i, arr) {
                time += item.time;
                count += item.count;
            });
            return {time: time, count: count};
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
        var count = 0;
        bruteForce('0123456789', function (val) {
            time = Date.now() - start;
            count++;
            return val === password || time > 300000;
        });
        time = (Date.now() - start) / 1000;
        resolve({time: time, count: count});
    })
}

function bruteforceForChar(password) {
    return new Promise(function (resolve, reject) {
        var time = 0;
        var start = Date.now();
        var count = 0;
        bruteForce('abcdefghijklmnopqrstuvwxyz', function (val) {
            time = Date.now() - start;
            count++;
            return val === password || (Date.now() - start) > 300000;
        });
        time = (Date.now() - start) / 1000;
        resolve({time: time, count: count});
    })
}

function bruteforceForAll(password) {
    return new Promise(function (resolve, reject) {
        var time = 0;
        var start = Date.now();
        var count = 0;
        bruteForce('abcdefghijklmnopqrstuvwxyz0123456789!\\"#@`$%^&*()_-=+*/\';:.,?|<>[]{}~', function (val) {
            time = Date.now() - start;
            count++;
            return val === password || (Date.now() - start) > 300000;
        });
        time = (Date.now() - start) / 1000;
        resolve({time: time, count: count});
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

