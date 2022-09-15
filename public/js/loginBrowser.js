const form = document.getElementById('form');
const loginId = document.getElementById('loginId');
const password = document.getElementById('password');

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

form.addEventListener('submit', function(e){
    let data = e.target;
    e.preventDefault();
    console.log(data);
    
    if(checkRequired([loginId, password]) && checkLength(loginId, 3, 60) && checkLength(password, 5, 30)){
        data.submit();
    }
});