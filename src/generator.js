var result;
var pasLength;

function passwordGen() {
    pasLength = document.getElementsByName("length")[0].value;

    var string = generateArray(pasLength);

    if (document.getElementsByName("number")[1].checked) {
        string = withoutNumbers(string);
    }

    result = string.substring(0, pasLength);

    myWord();

    inner(pasLength);

    setTimeout(copyToBuffer, 100);
}

function generateArray(length) {
    var string = "";
    var passwordArray = new Uint32Array(Math.ceil(length / 10) * 2);
    window.crypto.getRandomValues(passwordArray);

    // if (document.getElementsByName("char")[0].checked) {
    //     for (var i = 0; i < passwordArray.length; i++) {
    //         string += passwordArray[i].toString(36);
    //     }
    // } else {
    //     for (var i = 0; i < passwordArray.length; i++) {
    //         string += passwordArray[i];
    //     }
    // }

    var flag = document.getElementsByName("char")[0].checked;
    string = passwordArray.reduce((res, srt) => res += flag ? srt.toString(36) : srt, '');

    return string;
}

function copyToBuffer() {
    window.prompt("Чтобы скопировать текст в буфер обмена, нажмите Ctrl+C и Enter", result)
}

function inner(pasLength) {
    if (pasLength <= 100) {
        document.getElementById('out').innerHTML = "Пароль: " + result;
    }
    else {
        document.getElementById('out').innerHTML = "Длина Вашего пароля больше 100 символов.";
    }
    document.getElementById('message').innerHTML = "Вы можете скопировать пароль";
}

function myWord() {
    var word = document.getElementsByName("word")[0].value;
    if (word.length >= result.length) return;
    if (word === "") return;
    var position;
    do {
        position = Math.round(Math.random() * 10);
    }
    while ((position + word.length) > result.length);

    var str = result.substr(position, word.length);
    var newResult = result.replace(str, word);
    result = newResult;
}

function withoutNumbers(string) {
    var newString = string.replace(/\d/g, '');
    if (newString.length < pasLength) {
        var count = pasLength - newString.length;
        newString += generateArray(count);
        newString = withoutNumbers(newString);
    }
    return newString;
}