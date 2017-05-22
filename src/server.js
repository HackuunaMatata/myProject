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
        resolve('Mask');
    })
}

/*function bruteforceForInt(password) {
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
            if (string % 5000000 === 0) {
                time = Date.now() - start;
            }
            if (time > 300000) {
                resolve(time / 10000);
            }
            string = '' + string;
            if (string.length < length) {
                string = arr.slice(0, length - string.length).join('') + string;
            }
        }
        time = (Date.now() - start) / 1000;
        console.log('eeeeeee');
        resolve(time);
    })
}*/

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
    /*if(typeof characters === 'string') {*/
     characters = characters.split("");
     /*}
     characters.sort(); // Sort all characters
     characters = characters.filter(function(value, index, arr){ //удаляем повторы
     if(index < 1) {
     return true;
     } else {
     return value !== arr[index-1];
     }
     });*/
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

