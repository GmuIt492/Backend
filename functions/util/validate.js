//validate signup for null values
const isEmpty = (string) => {
    if(string.trim() === '') {
        return true;
    }
    else {
        return false;
    }
};

//validate BMI for null values
const isNull = (Int) => {
    if(!Int) {
        return true;
    }
    else {
        return false;
    }
};

//validate email
const isEmail = (email) => {
    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(email.match(regEx)) {
        return true;
    }
    else {
        return false;
    }
}

//validate user sign up data
exports.validateSignupData = (newUser) => {
    let errors = {}; //initialize error object

    //validate email
    if(isEmpty(newUser.email)) {
        errors.email = 'must not be empty';
    } else if(!isEmail(newUser.email)){
        errors.email = 'must be a valid email address';
    }

    //validate password to not be null
    if(isEmpty(newUser.password)) {
        errors.password = 'must not be empty';
    }

    //validate passwords to match
    if(newUser.password !== newUser.confirmPassword) {
        errors.confirmPassword = 'passwords must match';
    }

    //validates unique handle
    if(isEmpty(newUser.handle)) {
        errors.handle = 'must not be empty';
    }

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
}

//validate user login data
exports.validateLoginData = (user) => {
    let errors = {}; //initialize error object
    
    //validate email login
    if(isEmpty(user.email)) {
        errors.email = 'must not be empty';
    }

    //validate password login
    if(isEmpty(user.password)) {
        errors.password = 'must not be empty';
    }

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
}