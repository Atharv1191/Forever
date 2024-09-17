const express = require("express");
const router = express.Router()
const{addProduct,listProduct,removeProduct,singleProduct} = require("../controllers/ProductController");
const upload = require("../middlewere/multer");
const adminAuth = require("../middlewere/adminAuth");

router.post('/add',adminAuth,upload.fields([{name:'image1',maxCount:1},{name:'image2',maxCount:1},{name:'image3',maxCount:1},{name:'image1',maxCount:1},{name:'image4',maxCount:1}]),addProduct)
router.post('/remove',adminAuth,removeProduct)
router.post('/single',singleProduct)
router.get('/list',listProduct)


module.exports = router