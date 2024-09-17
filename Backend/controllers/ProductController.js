const cloudinary = require("cloudinary").v2;
const productModel = require("../models/productModel")
//function for add product

const addProduct = async (req, res) => {
    try {
      const { name, description, price, category, subCategory, sizes, bestSeller } = req.body;
  
      // Safely access files using req.files
      const image1 = req.files?.image1?.[0]; // Correctly access the first image
      const image2 = req.files?.image2?.[0];
      const image3 = req.files?.image3?.[0];
      const image4 = req.files?.image4?.[0];
  
      // Filter out undefined images
      const images = [image1, image2, image3, image4].filter((item) => item !== undefined);
      let imagesUrl = await Promise.all(
        images.map(async(item)=>{
            let result = await cloudinary.uploader.upload(item.path,{resource_type:'image'})
            return result.secure_url

        }) 

      )
      const productData ={
        name,
        description,
        category,
        price:Number(price),
        subCategory,
        bestSeller:bestSeller === 'true' ? true :false,
        sizes:JSON.parse(sizes),
        image:imagesUrl,
        date:Date.now()
      }
      console.log(productData);
      const product = new productModel(productData);
      await product.save()
      // Log the product details and images for debugging
      console.log(name, description, price, category, subCategory, sizes, bestSeller);
      console.log(imagesUrl);
  
      // Send a response (can be adjusted to handle product saving, etc.)
      res.json({
        success: true,
        message: "Product added successfully",
       
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
  

//function for list product
const listProduct = async(req,res)=>{
  try {
    const products = await productModel.find({});
    return res.status(200).json({
      success:"true",
      products
    })
    
  } catch (error) {
    console.log(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    
  }
    
}

//functionn for removing product
const removeProduct = async(req,res)=>{
    try {
      await productModel.findByIdAndDelete(req.body.id)
      return res.status(200).json({
        success: true,
        message: "Product removed successfully",
      })
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
}
//function for single product info

const singleProduct = async(req,res)=>{
  try {
    const {productId} = req.body;
    const product = await productModel.findById(productId);
    return res.status(200).json({
      success: true,
      product
    })
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
      
    })
    
  }
    
}

module.exports = {addProduct,listProduct,removeProduct,singleProduct}