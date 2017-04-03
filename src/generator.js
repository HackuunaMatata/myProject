var result;
var pasLength;

$(document).ready(function () {
    $("input[name='char']").change(function () {
        $("[name='number']").prop('disabled', this.value != 'a1');
        $("[name='bigChar']").prop('disabled', this.value != 'a1');
    });
});

function passwordGen() {
    pasLength = $("[name='length']").val();

    var string = generateArray(pasLength);

    if (!$("[name='number']").prop('disabled') && $("[name='number']:eq(1)").prop('checked')) {
        string = withoutNumbers(string);
    }

    result = string.substring(0, pasLength);

    myWord();

    if (!$("[name='bigChar']").prop('disabled') && $("[name='bigChar']:eq(0)").prop('checked')) {
        result = addBigChars(result);
    }

    inner();
}

function generateArray(length) {
    var string;
    var passwordArray = new Uint32Array(Math.ceil(length / 10) * 2);
    window.crypto.getRandomValues(passwordArray);

    var flag = $("[name='char']:eq(0)").prop('checked');
    string = passwordArray.reduce((res, srt) => res += flag ? srt.toString(36) : srt, '');

    return string;
}

function inner() {
    $("[name='password']").html(result);
}

function myWord() {
    var word = $("[name='word']:eq(0)").val();
    if (word.length >= result.length) return;
    if (word === "") return;
    var position;
    do {
        position = Math.round(Math.random() * 10);
    }
    while ((position + word.length) > result.length);

    var str = result.substr(position, word.length);
    result = result.replace(str, word);
}

function addBigChars(string) {
    var word = $("[name='word']:eq(0)").val();
    var index = [];
    if (word !== "") {
        var regexp = new RegExp(`${word}`, "ig");
        var coincidence;
        while(coincidence = regexp.exec(string)) {
            index.push(coincidence.index);
        }
        string = string.split(word);
        var newString = "";
        for (var i = 0; i < string.length; i++) {
            newString += string[i];
        }
        string = newString;
    }
    for (var i = 0; i <= Math.round(Math.random() * (string.length - 1)); i++) {
        var j = Math.round(Math.random()*(string.length-1));
        if (!isNaN(string[j])) {
            i--;
            continue;
        }
        var bigChar = string[j].toUpperCase();
        string = string.replace(string[j], bigChar);
    }
    if(word !== "") {
        for(var i = 0; i<index.length; i++) {
            string = string.substring(0, index[i]) + word + string.substring(index[i]);
        }
    }
    return string;
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