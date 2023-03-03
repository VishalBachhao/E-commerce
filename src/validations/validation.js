const mongoose = require('mongoose')

const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)        //check if ObjectID is valid
}

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0       //request body is not empty
}

const isValidObject = function (value) {
    return (typeof value === 'object')
}


const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false
    if (typeof value === "string" && value.trim().length === 0) return false  //empty string/undefined/null
    return true
}

const isValidName = function (value) {
    const regex = /^[a-zA-Z ]{2,30}$/                //No number or symbol is allowed and length must be in range 2-30 words
    if (typeof value !== "string") return false
    if (regex.test(value) === false) return false
    return true
}

const isValidEmail = function (email) {
    const regex = /^\s*[a-zA-Z0-9]+([\.\-\_\+][a-zA-Z0-9]+)*@[a-zA-Z]+([\.\-\_][a-zA-Z]+)*(\.[a-zA-Z]{2,3})+\s*$/
    return regex.test(email)
}

const isValidPhone = function (mobileNumber) {
    const regex = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/  //should start with +91 or 0 and no. of digits must be 10
    return regex.test(mobileNumber)
}

const isValidPassword = function (pass) {
    let regex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,15}$/      //atleast one capital alphabet and length 8-15
    return regex.test(pass)
}

const isValidPincode = function (value) {
    const regex = /^[0-9]{6}$/      //check for the length of pincode
    return regex.test(value)
}

function isValidImage(icon) {
    const ext = [".jpg", ".jpeg", ".bmp", ".gif", ".png", ".svg", ".PNG"]
    return ext.some((el) => icon.endsWith(el))
}


const isValidPrice = function (value) {
    if (/^\d+(\.\d{1,2})?$/.test(value)) return true
    return false
};

const isValidNum = function (value) {
    if (!/^[0-9]+$/.test(value)) {
        return false
    }
    return true
}

const isValidBoolean = function (value) {
    return value === "true" || value === "false" || value === true || value === false
}

const isValidSize=function(arrayOfSize){
    let size1 = ["S", "XS", "M", "X", "L", "XXL", "XL"];
            let size2 = arrayOfSize.toUpperCase().split(",").map((x) => x.trim())
            for (let i = 0; i < size2.length; i++) {
                if (!size1.includes(size2[i])) {
                    return false
                }
          }
     return true
 }


const isValidStatus = function (status) {
    let enumArr = ["pending", "completed", "cancelled"]
    return enumArr.includes(status); // returns a boolean
}


module.exports = { isValidObjectId, isValidRequestBody, isValidObject, isValid, isValidName, isValidEmail, isValidPhone, isValidPassword, isValidPincode, isValidImage,  isValidPrice, isValidNum, isValidBoolean, isValidSize, isValidStatus }