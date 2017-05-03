var length;
var specSymbols = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '_', '+', '=', ';', ':', ',', '.', '/', '?', '\\', '|', '`', '~', '[', ']', '{', '}'];

function passwordGen() {
    length = document.getElementsByName('length')[0].value; // get the password's length
    var password = generateBasePassword(length); // generate the base password
    if (!document.getElementsByName('numbers')[0].checked && document.getElementsByName('chars')[0].checked) { // if element 'numbers' is not check
        password = withoutNumbers(password, length); // generate the password without numbers
    }
    password = withUserWord(password); // generate the password with user's word
    if (document.getElementsByName('bigChars')[0].checked && document.getElementsByName('chars')[0].checked) {
        password = withBigChars(password); // generate the password with big chars
    }
    if (document.getElementsByName('specials')[0].checked) {
        password = withSpecials(password); // generate the password with specific symbols
    }
    document.getElementsByName('password')[0].innerHTML = password; // write the password in textarea
}

function disabledAnother(check) { // make elements 'numbers' and 'bigChars' disabled
    if (check.checked) { // if 'chars' is checked make elements visible
        document.getElementsByName('numbers')[0].removeAttribute('disabled');
        document.getElementsByName('bigChars')[0].removeAttribute('disabled');
    } else { // else make elements disable
        document.getElementsByName('numbers')[0].setAttribute('disabled', true);
        document.getElementsByName('bigChars')[0].setAttribute('disabled', true);
    }
}

function generateBasePassword(length) { // generate the password with only numbers or with chars and numbers
    var string;
    var passwordArray = new Uint32Array(Math.ceil(length / 10) * 2); // generate the array
    window.crypto.getRandomValues(passwordArray); // fill the array with numbers

    var flag = document.getElementsByName('chars')[0].checked; // check select the element with the name='chars'
    // if flag is true generate the password with chars and numbers, else with only numbers
    string = passwordArray.reduce((res, srt) => res += flag ? srt.toString(36) : srt, '');
    return string.substring(0, length);
}

function withoutNumbers(password) { // generate the password without numbers
    var newString = password.replace(/\d/g, ''); // delete all digits from the password
    if (newString.length < length) { // is password's length is too small
        var count = length - newString.length; // count the missing length
        newString += generateBasePassword(count); // generate the missing part of password
        newString = withoutNumbers(newString); // do all again
    }
    return newString;
}

function withBigChars(password) { // generate the password with big chars
    var word = document.getElementsByName('word')[0].value; // get the user's word
    var index = -1; // index of the first position
    var newString = password;
    if (word.length !== 0) { // if we have the user's word
        index = password.search(word); // find the first word
        newString.replace(word); // and delete it from the string
    }
    var count = 0;
    for (var i = 0; i < newString.length; i++) { // count number of chars in the string
        if (('a' <= newString[i]) && (newString[i] <= 'z')) count++;
    }
    if (count === 0) return password; // if we do not have chars in the string return password
    var bigChar;
    var j;
    for (var i = 0; i <= Math.round(Math.random() * (newString.length - 1)); i++) { // make random chars to uppercase
        j = Math.round(Math.random() * (newString.length - 1));
        if (!(('a' <= newString[j]) && (newString[j] <= 'z'))) { // if the symbol is not a char continue the circle
            i--;
            continue;
        }
        bigChar = newString[j].toUpperCase(); // make the char to uppercase
        newString = newString.replace(newString[j], bigChar); // replace char in lowercase with char in uppercase
    }
    // return the user's word in the password
    if (index !== -1) newString = newString.substr(0, index) + word + newString.substring(index + word.length);
    return newString;
}

function withSpecials(password) { // generate the password with special symbols
    var word = document.getElementsByName('word')[0].value; // get the user's word
    var index = -1; // index of the first position
    var newString = password;
    if (word.length !== 0) { // if we have the user's word
        index = password.search(word); // find the first word
        newString.replace(word); // and delete it from the string
    }
    var count = 0;
    for (var i = 0; i < newString.length; i++) { // count number of small chars in the string
        if (('a' <= newString[i]) && (newString[i] <= 'z') || isFinite(newString[i])) count++;
    }
    var sChar;
    var symbol;
    for (var i = 0; i <= Math.round(Math.random() * (newString.length - 1)); i++) { // replace random small chars with special symbols
        sChar = Math.round(Math.random() * (newString.length - 1)); // count index of the small char
        symbol = Math.round(Math.random() * (specSymbols.length - 1)); // count index of the special symbol
        if (('A' <= newString[sChar]) && (newString[sChar] <= 'Z')) { // if the symbol is a big char continue the circle
            i--;
            continue;
        }
        newString = newString.replace(newString[sChar], specSymbols[symbol]); // replace small char with special symbol
    }
    // return the user's word in the password
    if (index !== -1) newString = newString.substr(0, index) + word + newString.substring(index + word.length);
    return newString;
}

function withUserWord(password) { // generate the password with user's word
    var word = document.getElementsByName('word')[0].value; // get the word
    // if its length more than password's length or we have not user's word do nothing
    if (word.length > password.length || word.length === 0) return password;
    var position = Math.round(Math.random() * password.length - word.length); // set the start position of the word in the password
    var str = password.substr(position, word.length); // search of the replaced line
    return password.replace(str, word); // word insertion in the password
}
