const form = document.getElementById('form');
const uname = document.getElementById('name');
const username = document.getElementById('username');
const email = document.getElementById('email');
const phone = document.getElementById('phone');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');

//Show input error messages
function showError(input, message) {
    const formControl = input.parentElement;
    formControl.className = 'form-control error';
    const small = formControl.querySelector('small');
    small.innerText = message;
}

//show success colour
function showSuccess(input) {
    const formControl = input.parentElement;
    formControl.className = 'form-control success';
}

//check email is valid
function checkEmail(input) {
    const re = /^[a-zA-Z0-9._]{3,}@[a-zA-Z0-9]{3,15}[.][a-zA-Z]+[.]*[a-zA-Z]*$/;
    if (re.test(input.value.trim())) {
        showSuccess(input);
        return true;
    } else {
        showError(input, 'Email is not invalid');
        return false;
    }
}

//checkRequired fields
function checkRequired(inputArr) {
    let result = false;
    result = inputArr.every(function (input) {
        if (input.value.trim() === '') {
            showError(input, `${getFieldName(input)} is required`);
            return false;
        } else {
            showSuccess(input);
            return true;
        }
    });
    return result;
}

//check input Length
function checkLength(input, min, max) {
    if (input.value.length < min) {
        showError(input, `${getFieldName(input)} must be at least ${min} characters`);
        return false;
    } else if (input.value.length > max) {
        showError(input, `${getFieldName(input)} must be less than ${max} characters`);
        return false;
    } else {
        showSuccess(input);
        return true;
    }
}

//get FieldName
function getFieldName(input) {
    return input.id.charAt(0).toUpperCase() + input.id.slice(1);
}

// check passwords match
function checkPasswordMatch(input1, input2) {
    if (input1.value !== input2.value) {
        showError(input2, 'Passwords do not match');
        return false;
    }
    else {
        return true;
    }
}

form.addEventListener('submit', function(e){
    let data = e.target;
    e.preventDefault();
    // console.log(data);

    let check1 = checkRequired([uname, username, email, password, confirmPassword]);
    let check2 = checkLength(username, 3, 60);
    let check3 = checkLength(uname, 3, 60);
    let check4 = checkLength(phone, 0, 0) || checkLength(phone, 10, 10);
    let check5 = checkEmail(email);
    let check6 = checkLength(password, 8, 30);
    let check7 = checkPasswordMatch(password, confirmPassword);
    
    if(check1 && check2 && check3 && check4 && check5 && check6 && check7){
        data.submit();
    }
});