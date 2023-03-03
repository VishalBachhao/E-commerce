
const userModel = require("../models/userModel")
const bcrypt = require("bcrypt");
const validation = require("../validations/validation")
const jwt = require('jsonwebtoken')


//-------------------------------------------------create User/ post"register" ---------------------------------------------------
/*We will create user/Check for all the edge cases/email must be unique and password must be hashed*/ 

const createUser = async function (req, res) {

    try {
        let data = req.body;
       
        let { fname, lname, email, password, phone, address } = data   //destructured

        if (!validation.isValidRequestBody(data))
            return res.status(400).send({ status: false, msg: "please provide  details" }) //if no data is present

        //============================================NAME====================================================   
        
     //Check for empty string/undefined/null values
        if (!validation.isValid(fname))
            return res.status(400).send({ status: false, message: "first name is required or not valid" })

     //No number or symbol is allowed and name length must be in range 2-30 words
        if (!validation.isValidName(fname))
            return res.status(400).send({ status: false, message: "first name is not valid" })

     //Check for empty string/undefined/null values
        if (!validation.isValid(lname))
            return res.status(400).send({ status: false, message: "last name is required or not valid" })

    //No number or symbol is allowed and last name length must be in range 2-30 words
        if (!validation.isValidName(lname))
            return res.status(400).send({ status: false, message: "last name is not valid" })

        //============================================EMAIL====================================================
    
    //Check for empty string/undefined/null values
        if (!validation.isValid(email))
            return res.status(400).send({ status: false, message: "email is required " })
    
    //Check for the format of the email eg.leadsConnect@gmail.com
        if (!validation.isValidEmail(email))
            return res.status(400).send({ status: false, message: "email is not valid" })

        let checkEmail = await userModel.findOne({ email: email }) //check user is already present or not

        if (checkEmail) return res.status(409).send({ status: false, msg: "This email has already been registered" })
    //status code 409- conflict with the current state

        //===========================================PHONE=================================================
    //Check for empty string/undefined/null values
        if (!validation.isValid(phone))
            return res.status(400).send({ status: false, message: "phone No. is required " })
    
    //phone no. should start with +91 or 0 and no. of digits must be 10
        if (!validation.isValidPhone(phone))
            return res.status(400).send({ status: false, message: "Please provide a valid Indian phone No." })

        let checkPhone = await userModel.findOne({ phone: phone }) //check if phone already exist in DB

        if (checkPhone) return res.status(409).send({ status: false, msg: "This phone No. has already been registered" })
    //status code 409- conflict with the current state

        //==========================================PASSWORD================================================
     //Check for empty string/undefined/null values
        if (!validation.isValid(password))
            return res.status(400).send({ status: false, message: "Pasworrd is required or not valid" })

        if (!validation.isValidPassword(password))
            return res.status(400).send({ status: false, message: "Password length should be 8 to 15 digits and enter atleast one uppercase or lowercase and special charachter" })

        //===========================================HASHING PASSWORD==============================================
           
        const salt = await bcrypt.genSalt(10)
        // return res.send(salt.toString())
        const hashedPassword = await bcrypt.hash(data.password, salt)
        data.password = hashedPassword
        //===========================================ADDRESS==============================================
           
       
        if (!address) return res.status(400).send({ status: false, msg: "address requried" })
       
        //===========================================CREATING DOCUMENT==============================================
        let createData = await userModel.create(data)
        return res.status(201).send({ status: true, message: "User created successfully", data: createData })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
        
    }
}

//-------------------------------------------------login User/post(login) ------------------------------------------

const loginUser = async function (req, res) {
    try {

        const requestBody = req.body;

        //-----------validating request body----------

//check request body is not empty
        if (!validation.isValidRequestBody(requestBody)) {
            return res.status(400).send({
                status: false,
                message: " Please provide login credentials",
            });
        }

        //-----------destructuring--------------------

        let { email, password } = requestBody;

        //------------email validation-----------------
        if (!email) {
            return res.status(400).send({
                status: false,
                message: `Email is required`
            });
        }
        if (!validation.isValidEmail(email)) {      
            return res.status(400).send({
                status: false,
                message: `Provide valid email address`,
            });
        }

        //------------password validation-----------------

        if (!password) {
            return res.status(400).send({
                status: false,
                message: `Password is required`
            });
        }
        if (!validation.isValidPassword(password)) {    //atleast one capital alphabet and length 8-15
            return res.status(400).send({
                status: false,
                message: "Please enter a valid password"
            });
        }

        let user = await userModel.findOne({ email: email })
        if (!user) {
            return res.status(400).send({ status: false, message: "Invalid credentials" })
        }

        let userPass = user.password
        let checkPass = await bcrypt.compare(password, userPass)  //compare the entered password and hashed password stored in DB is same
        if (!checkPass) { return res.status(400).send({ status: false, message: "Invalid password" }) }

        //---------------- token creation--------------

        let token = jwt.sign(
            {
                userId: user._id.toString(),
                organisation: "Leads-Connect"

            },
            "Leads-connect-123456789", { expiresIn: '1h' }    //token expiration is 1 hour 
        );

        res.send({ status: true, msg: "login successful", data: { token: token, userId: user._id } });

    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
};


//------------------------------------------ get(/user/:userId/profile)-----------------------------------------

 //get the profile of a particular user by its userId
const getUser = async function (req, res) {
    try {
        const userId = req.params.userId
       
    //check if received ObjectId is valid   
        if (!validation.isValidObjectId(userId))
            return res.status(400).send({ status: false, message: "user id is not valid" })

        const user = await userModel.findById(userId)
        
            if (!user)
            return res.status(404).send({ status: false, message: "user does not exist" })
           

        return res.status(200).send({ status: true, msssage: "User profile details", data: user })

    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }

}

//------------------------------------------updateUser put("/user/:userId/profile")-----------------------------------------

const updateUser = async function (req, res) {
    try {
        let userId = req.params.userId
        if (!validation.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "userId is not valid" })
        }

        const checkUserId = await userModel.findById(userId)
        if (!checkUserId) {
            return res.status(404).send({ status: false, message: "User ID not found, please user correct user ID " })
        }

        let data = { ...req.body } //copy data to be updated from req.body
       

       
        let { fname, lname, email, phone, password, address } = data
        let filter = {}

        if (data.hasOwnProperty("fname")) {
            if (!validation.isValid(fname)) {
                return res.status(400).send({ status: false, message: "please provide fname in proper format" })
            }
            if (!validation.isValidName(fname)) {
                return res.status(400).send({ status: false, message: "please provide only alphabet in fname" })
            }
            filter.fname = fname
        }

        if (data.hasOwnProperty("lname")) {
            if (!validation.isValid(lname)) {
                return res.status(400).send({ status: false, message: "please provide lname in proper format" })
            }
            if (!validation.isValidName(lname)) {
                return res.status(400).send({ status: false, message: "please provide only alphabet in lname" })
            }
            filter.lname = lname
        }

        if (data.hasOwnProperty("email")) {
            if (!validation.isValidEmail(email)) {
                return res.status(400).send({ status: false, message: "please provide email in proper format" })
            }
            const checkEmail = await userModel.findOne({ email: email })
            if (checkEmail) {
                return res.status(400).send({ status: false, message: "email is already present" })
            }
            filter.email = email
        }

       
        if (data.hasOwnProperty("phone")) {
            if (!validation.isValidPhone(phone)) {
                return res.status(400).send({ status: false, message: "please provide only 10 digit number" })
            }
            const checkPhone = await userModel.find({ phone: phone })
            if (checkPhone) {
                return res.status(400).send({ status: false, message: "phone number is already present" })
            }
            filter.phone = phone
        }

        if (data.hasOwnProperty("password")) {
            if (!validation.isValidPassword(password)) {
                return res.status(400).send({ status: false, message: "please provide password in proper format" })
            }
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(password, salt)
            filter.password = hashedPassword
        }

        if (data.hasOwnProperty("address")) {
         
            const checkAdd = await userModel.find({ address: address })
            if (checkAdd) {
                return res.status(400).send({ status: false, message:" address is already present" })
            }
            filter.address = address
  
        }


        const update = await userModel.findOneAndUpdate(
            { _id: userId },
            { $set: filter },
            { new: true })
        return res.status(200).send({ status: true, message: "User profile updated", data: update })
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}


module.exports = { createUser, loginUser, getUser, updateUser }