function sendTheData() {
    document.getElementById('results').innerHTML = "Здесь будут выведены результаты";
    document.getElementById('loader').style.display = 'block';
    fetch('/checking', {
        method: 'post',
        body: JSON.stringify({
            password: document.getElementsByName('userPassword')[0].value,
            word: document.getElementsByName('badPart')[0].value
        })
    })
        .then(function (res) {
            return res.text();
        }).then(function (res) {
        document.getElementById('loader').style.display = 'none';
        document.getElementById('results').innerHTML = res;
    });
}

function checkWord(check) {
    var password = document.getElementsByName('userPassword')[0].value;
    var word = document.getElementsByName('badPart')[0].value;
    if (password.search(word) === -1 && word.length !== 0) {
        document.getElementsByName('badPart')[0].style = 'border-color : red';
        document.getElementById('results').innerHTML = "В Вашем пароле нет такого фрагмента";
        document.getElementById('results').style = 'color : red';
        document.getElementsByName('check')[0].setAttribute('disabled', true);
    } else {
        document.getElementsByName('badPart')[0].style = 'border-color : initial';
        document.getElementById('results').innerHTML = "Здесь будут выведены результаты";
        document.getElementById('results').style = 'color : black';
        document.getElementsByName('check')[0].removeAttribute('disabled');
    }
}
