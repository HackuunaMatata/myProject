var http = require('http');
var fs = require('fs');
var url = require('url');

var mainPage = fs.readFileSync('./src/mainPage.html');
var passwordGen = fs.readFileSync('./src/passwordGen.js');
var passwordCheck = fs.readFileSync('./src/passwordCheck.js');

var server = http.createServer(function(request, response) {

    var reqUrl = url.parse(request.url);
    console.log(reqUrl);

    switch (reqUrl.pathname) {
        case '/checking':
            console.log('Ura!!');
            response.writeHeader(200);
            response.end('checking');
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
        '/passwordCheck.js' : passwordCheck
    }[url];
}

server.listen(1110);
console.info('Server started!');