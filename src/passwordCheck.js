function sendTheData() { // send data to the server
    document.getElementById('results').innerHTML = "Здесь будут выведены результаты";
    document.getElementById('loader').style.display = 'block'; // see the loader
    fetch('/checking', {
        method: 'post',
        body: JSON.stringify({ // data for the server
            password: document.getElementsByName('userPassword')[0].value, // password
            word: document.getElementsByName('badPart')[0].value // word
        })
    })
        .then(function (res) {
            return res.text(); // parse results
        }).then(function (res) {
        document.getElementById('loader').style.display = 'none'; // delete loader
        document.getElementById('results').innerHTML = res; // see the results
    });
}

function checkWord(check) { // checking the inputs
    var password = document.getElementsByName('userPassword')[0].value; // password
    var word = document.getElementsByName('badPart')[0].value; // word
    if (password.replace(word).length === password.length && word.length !== 0) { // if this word is not a part of password
        document.getElementsByName('badPart')[0].style = 'border-color : red';
        document.getElementById('results').innerHTML = "В Вашем пароле нет такого фрагмента"; // see the red message
        document.getElementById('results').style = 'color : red';
        document.getElementsByName('check')[0].setAttribute('disabled', true); // can not click on the button
    } else { // all good
        document.getElementsByName('badPart')[0].style = 'border-color : initial';
        document.getElementById('results').innerHTML = "Здесь будут выведены результаты";
        document.getElementById('results').style = 'color : black';
        document.getElementsByName('check')[0].removeAttribute('disabled'); // can click on the button
    }
}
