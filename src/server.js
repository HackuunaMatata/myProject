var http = require('http');
var fs = require('fs');
var url = require('url');
var lineReader = require('line-reader');

var mainPage = fs.readFileSync('./src/mainPage.html');
var passwordGen = fs.readFileSync('./src/passwordGen.js');
var passwordCheck = fs.readFileSync('./src/passwordCheck.js');
var loaderCss = fs.readFileSync('./src/loader.css');
var favicon = fs.readFileSync('./src/favicon.ico');

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
                body = JSON.parse(object); // get parameters
                var password = body.password.replace(/ /g, '').replace(/\n/g, '').toLowerCase(); // remove all gaps and enters from password
                var word = body.word.replace(/ /g, '').toLowerCase();  // remove all gaps from word
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
        '/loader.css': loaderCss,
        '/favicon.ico': favicon
    }[url];
}

function tryCrashPassword(password, word) { // decides how to crash the password
    if (password === '') {
        return Promise.reject('Вы не ввели пароль');
    }
    if (word !== '') {
        return attackWithMask(password, word);
    }
    if (isFinite(password)) {
        return bruteforceForInt(password);
        //return bruteforceForIntWithLength(password);
    }
    var chars = 0;
    for (var i = 0; i < password.length; i++) {
        if (('a' <= password[i]) && (password[i] <= 'z')) chars++;
    }
    if (chars === password.length) {
        return bruteforceForChar(password);
        //return attackWithDictionary(password);
    }
    return bruteforceForAll(password);
    //return attackWithDictionary(password);
}

function attackWithDictionary(password) { // use dictionary to crash the password
    return new Promise(function (resolve, reject) {
        var time = 0;
        var start = Date.now();
        var count = 0;
        lineReader.eachLine('./src/words/rockyou.txt', function (line, last) {
            count++;
            time = Date.now() - start;
            if (last) { // if it was last word in dictionary
                reject('Такого пароля нет в наших словарях');
                return false;
            }
            if (password !== line && time <= 30000) return true; // if line is not a password
            time = (Date.now() - start) / 1000;
            resolve({time: time, count: count}); // we find password
            return false;
        })
    })
}

function attackWithMask(password, word) { // use word to crash the password
    return new Promise(function (resolve, reject) {
        var time = 0;
        var count = 0;
        password = password.split(word); // make an array without words
        password = password.filter(function (value, index, arr) { // remove all empty elements from the array
            return value !== '';
        });
        if (password.length === 0) { // if word === password return the answer
            resolve({time: time, count: count});
        }
        var promises = [];
        for (var i = 0; i < password.length; i++) {
            promises.push(bruteforceForAll(password[i])); // use brute force for every element from array
        }
        var countTime = function (array) { // count summary time and operations
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

function bruteforceForInt(password) { // crash password contains only numbers
    return new Promise(function (resolve, reject) {
        var time = 0;
        var start = Date.now();
        var count = 0;
        bruteForce('0123456789', function (val) { // call brute force with small alphabet
            time = Date.now() - start;
            count++;
            return val === password || time > 300000;
        });
        time = (Date.now() - start) / 1000;
        resolve({time: time, count: count});
    })
}

function bruteforceForChar(password) { // crash password contains only small chars
    return new Promise(function (resolve, reject) {
        var time = 0;
        var start = Date.now();
        var count = 0;
        bruteForce('abcdefghijklmnopqrstuvwxyz', function (val) { // call brute force with small alphabet
            time = Date.now() - start;
            count++;
            return val === password || (Date.now() - start) > 300000;
        });
        time = (Date.now() - start) / 1000;
        resolve({time: time, count: count});
    })
}

function bruteforceForAll(password) { // crash password
    return new Promise(function (resolve, reject) {
        var time = 0;
        var start = Date.now();
        var count = 0;
        bruteForce('abcdefghijklmnopqrstuvwxyz0123456789!\\"#@`$%^&*()_-=+*/\';:.,?|<>[]{}~', function (val) { // call brute force with large alphabet
            time = Date.now() - start;
            count++;
            return val === password || (Date.now() - start) > 1000000;
        });
        time = (Date.now() - start) / 1000;
        resolve({time: time, count: count});
    })
}

var bruteForce = function (characters, callback) { // brute force
    var i, intToCharacterBasedString, result;
    characters = characters.split(""); // do the alphabet by an array
    characters = [""].concat(characters); // useless empty value to start this array on index = 1
    intToCharacterBasedString = function (num) { // annoying algorithm
        var charBasedString, modulo;
        charBasedString = "";
        while (num > 0) { // search of all possible combinations
            modulo = num % characters.length; // basic calculating
            charBasedString = characters[modulo] + charBasedString; // just push it before the old characters
            num = ((num - modulo) / characters.length); // new value of num, annoying calculation
        }
        return charBasedString;
    };
    i = 1;
    while (i > 0) {
        result = callback(intToCharacterBasedString(i));
        if (result) { // if callbacks returns true: we did our job!
            break;
        }
        i++;
    }
};

function bruteforceForIntWithLength(password) { // crash password contains only numbers and known length
    return new Promise(function (resolve, reject) {
        var length = password.length; // find the length of the password
        var time = 0;
        var count = 0;
        var arr = new Array(length); // create an array of necessary length
        for (var i = 0; i < length; i++) { // filling of the array with zero
            arr[i] = 0;
        }
        var string = arr.join('');
        var start = Date.now();
        while (string !== password) { // selection of a combination
            string++;
            count++;
            if (string % 5000000 === 0) {
                time = Date.now() - start;
            }
            if (time > 300000) {
                time /= 1000;
                resolve({time: time, count: count});
            }
            string = '' + string;
            if (string.length < length) {
                string = arr.slice(0, length - string.length).join('') + string;
            }
        }
        time = (Date.now() - start) / 1000;
        resolve({time: time, count: count});
    })
}

server.listen(1110);
console.info('Server started!');

