
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')
const validation = require("../validations/validation")
const productModel = require('../models/productModel')



let createProduct = async function (req, res) {
    try {
        let data = req.body
       
        let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments, deletedAt, isDeleted } = data


        if (!validation.isValidRequestBody(data)) { return res.status(400).send({ status: false, msg: "please provide Data" }) }


        // title
        if (!title) { return res.status(400).send({ status: false, msg: "Please mention title" }) }
        let findTitle = await productModel.findOne({ title: title })
        if (findTitle) { return res.status(400).send({ status: false, msg: "this title already exists" }) }

        //description
        if (!description) { return res.status(400).send({ status: false, msg: "Please mention description" }) }

        //price
        if (!price) { return res.status(400).send({ status: false, msg: "please mention price" }) }
        if (!validation.isValidPrice(price) || !validation.isValidNum(price)) { return res.status(400).send({ status: false, msg: "not valid entry" }) }


        //currencyId
        if (!currencyId) { return res.status(400).send({ status: false, msg: "Please mention currencyId INR or USD" }) }

        if (currencyId) {
            currencyId = currencyId.toUpperCase()
            if (!(currencyId == "INR" || (currencyId == "USD"))) {
                return res.status(400).send({ status: false, msg: "currencyId must be INR or USD" })
            }
        }

        if (currencyId == "INR") {
           currencyFormat = "₹"
        }

        if (currencyId == "USD") {
           currencyFormat = "$"
        }



        //availableSizes

        if (!availableSizes) { return res.status(400).send({ status: false, msg: "please mention sizes" }) }

        const sizeArr = availableSizes.toUpperCase().split(",").map((x) => x.trim());
        availableSizes = sizeArr;

        //--------------checking the array that given size is valid or invalid-------------------------------------
        if (Array.isArray(sizeArr)) {
            for (let i = 0; i < sizeArr.length; i++) {
                if (["S", "XS", "M", "X", "L", "XXL", "XL"].indexOf(sizeArr[i]) == -1) //if does not includes it gives -1
                    return res.status(400).send({ status: false, message: "Please Enter valid sizes, it should include only sizes from  (S,XS,M,X,L,XXL,XL) " })
            }
        };


        // deletedAt
        if (isDeleted == false) { return deletedAt = "null" }

       
            let createData = await productModel.create(data)
          

            return res.status(201).send({ status: true, message: "Success", data: createData })

        
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }

}


//------------------------------------------ get("/products/:productId")-----------------------------------------

const getProductById = async function (req, res) {
    try {
        const productId = req.params.productId

        if (!validation.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Invalid product Id" })

        }

        const data = await productModel.findOne({ isDeleted: false, _id: productId })
        if (!data) {
            return res.status(404).send({ status: false, message: "product not found" })
        }

        return res.status(200).send({ status: true, message: "Success", data: data })


    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }

}


//-----------------------------------------------------GET /products by filtering---------------------------------------------------------------

let productDetail = async function (req, res) {
    try {

        let data = req.query  //we will have to filter 
        let fdata = {}

        fdata["isDeleted"] = false 
        if (Object.keys(data).length === 0) return res.status(400).send({ status: false, message: "please use any filter(name, size and price,priceSort) to get product" })


        let { size, name,  priceSort, ...rest } = data
        if (Object.keys(rest).length > 0) return res.status(400).send({ status: false, message: "try (name, size and priceSort) to get product detail" })

        if (size) {
            size = size.trim()
            let size1 = size.split(",").map(ele => ele.toUpperCase())  //string to array element
            for (let i = 0; i < size1.length; i++) {
                if (!size.includes(size1[i])) return res.status(400).send({ status: false, message: "please use correct Size" })
            }

            fdata["availableSizes"] = { $in: size1 }   //matches one of the element in array
        }

        if (name) {
            name = name.trim()
            if (!isValid(name)) return res.status(400).send({ status: false, message: "use correct format " })

            let regex = new RegExp(name, "i")  //i is for case insensitive
            fdata["title"] = { $regex: regex }
        }


        let sort = {}

        if (priceSort) {
            if (!(priceSort == 1 || priceSort == -1)) return res.status(400).send({ status: false, message: 'plz give correct value for sotring ex=>  for:- ascending:1 & descending :-1' })
            sort['price'] = priceSort
        }

        const products = await productModel.find(fdata).sort(sort)
        return res.status(200).send({ status: true, message: 'Success', count: products.length, data: products })
    }
    catch (error) {
    }
}


//--------------------------------------delete product/delete("/products/:productId")----------------------------------

const deleteProductById = async (req, res) => {
    try {
        let productId = req.params.productId;

        if (!validation.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Invalid product Id" })
        }

        let deleteByproductId = await productModel.findOneAndUpdate({ _id: productId, isDeleted: false },
            { isDeleted: true, deletedAt: Date.now() }, { new: true })

        if (!deleteByproductId) { return res.status(404).send({ status: false, message: "this product is already deleted" }) }

        res.status(200).send({ status: true, message: 'Product Deleted Successfully' })

    } catch (error) {

        res.status(500).send({ status: 'error', error: error.message })
    }
}

//***********************************update product(/products/:productId)**************************************

const updateProduct = async function (req, res) {
    const productId = req.params.productId

    if (!validation.isValidObjectId(productId)) {
        return res.status(400).send({ status: false, message: "productId is not valid" })
    }

    const checkProductId = await productModel.findOne({ _id: productId, isDeleted: false })
    if (!checkProductId) {
        return res.status(404).send({ status: false, message: "Product ID not found" })
    }

    let data = { ...req.body }
    


    if (!validation.isValidRequestBody(data) ) {
        return res.status(400).send({ status: false, message: "Invalid request parameters. Please provide updating keys details" })
    }

    let { title, description, price, currencyId, currencyFormat, isFreeShipping,  style, availableSizes, installments } = data

    let filter = {}

    if (data.hasOwnProperty("title")) {
        if (!validation.isValid(title)) {
            return res.status(400).send({ status: false, message: "please provide title in proper format" })
        }

        const checkTitle = await productModel.findOne({ title: title })
        if (checkTitle) {
            return res.status(400).send({ status: false, message: "Title is already present, please use another title" })
        }
        filter.title = title
    }

    if (data.hasOwnProperty("description")) {
        if (!validation.isValid(description)) {
            return res.status(400).send({ status: false, message: "please provide description in proper format" })
        }
        filter.description = description
    }

    if (data.hasOwnProperty("price")) {
        if (!validation.isValidPrice(price)) {
            return res.status(400).send({ status: false, message: "please enter valid price" })
        }
        filter.price = price
    }

    if (data.hasOwnProperty("currencyId")) {
        currencyId = currencyId.toUpperCase()
        if (!(currencyId == "INR" || (currencyId == "USD"))) {
            return res.status(400).send({ status: false, msg: "currencyId must be INR or USD" })
        }
        filter.currencyId = currencyId.toUpperCase()

        if (currencyId == "INR") {
            filter.currencyFormat = "₹"
        }

        if (currencyId == "USD") {
            filter.currencyFormat = "$"
        }
    }

    if (data.hasOwnProperty("currencyFormat")) {
        if (!validation.isValid(currencyFormat)) {
            return res.status(400).send({ status: false, message: "please provide currencyFormat in proper format" })
        }
        filter.currencyFormat = currencyFormat
    }

    if (data.hasOwnProperty("isFreeShipping")) {
        if (!validation.isValidBoolean(isFreeShipping)) {
            return res.status(400).send({ status: false, message: "please provide only true or false" })
        }
        filter.isFreeShipping = isFreeShipping
    }

   

    if (data.hasOwnProperty("style")) {
        if (!validation.isValid(style)) {
            return res.status(400).send({ status: false, message: "please provide style in proper format" })
        }
        filter.style = style
    }

    if (data.hasOwnProperty("availableSizes")) {
        if (!validation.isValidSize(availableSizes)) {
            return res.status(400).send({ status: false, message: `please provide only sizes ` })
        }
        filter.availableSizes = availableSizes.toUpperCase()
    }

    if (data.hasOwnProperty("installments")) {
        if (!validation.isValidNum(installments)) {
            return res.status(400).send({ status: false, message: `please provide only number ` })
        }
        filter.installments = installments
    }

   

    const update = await productModel.findOneAndUpdate(
        { _id: productId },
        { $set: filter },
        { new: true })
    return res.status(200).send({ status: true, message: "Product Updated Successfully", data: update })
}


//------------------------------export modules--------------------------------------------------------------------


module.exports = { getProductById, deleteProductById, updateProduct, productDetail, createProduct }