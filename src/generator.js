var result;
var pasLength;

$(document).ready(function() {
    $("input[name='char']").change(function() {
        $("[name='number']").prop('disabled', this.value != 'a1');
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

    inner();
}

function generateArray(length) {
    var string;
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

function withoutNumbers(string) {
    var newString = string.replace(/\d/g, '');
    if (newString.length < pasLength) {
        var count = pasLength - newString.length;
        newString += generateArray(count);
        newString = withoutNumbers(newString);
    }
    return newString;
}