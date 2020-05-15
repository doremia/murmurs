const isEmpty = (string) => {
    if (string.trim() === '') return true
    else return false
}

const isEmail = (email) => {
    const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    if (email.match(emailRegEx)) return true
    else return false
}


exports.validateUserSignup = (userData) => {
    let errors = {}
    if (isEmpty(userData.email)) {
        errors.email = 'Must not be empty.'
    } else if (!isEmpty(userData.email)) {
        if (!isEmail) {
            errors.email = 'Must be a valid email address'
        }
    }
    if (isEmpty(userData.password)) errors.password = 'Must not be empty'
    if (userData.confirmedPassword !== userData.password ) errors.confirmedPassword = 'Password is not the same'
    if (isEmpty(userData.handle)) errors.handle = 'Must not be empty'
    
    return {
        errors,
        valid: Object.keys(errors).length ===0 ? true : false
    }
}


exports.validateLogin = (user) => {
    let errors = {}
    if (isEmpty(user.email)) errors.email = 'Must not be empty'
    if (isEmpty(user.password)) errors.password = 'Must not be empty'  
    
    return {
        errors,
        valid: Object.keys(errors).length ===0 ? true : false
    }
}


exports.reduceUserDetails = (data) => {
    let userDetails = {}

    if (!isEmpty(data.bio.trim())) userDetails.bio = data.bio
    if(!isEmpty(data.website.trim())) {
        //https://webiste.com
        if(data.website.trim().substring(0,4) !== 'http') {
            userDetails.website = `http://${data.website.trim()}`
        } else userDetails.website = data.website.trim()
    }
    if (!isEmpty(data.location.trim())) userDetails.location = data.location
    
    return userDetails
}