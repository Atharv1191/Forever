const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const connectCloudinary = require("./config/cloudinary");
const userRoute = require("./routes/UserRoute");
const productRoute = require("./routes/productRoute")
const CartRoute = require("./routes/CartRoute");
const orderRoute = require("./routes/OrderRoute");
//App Config
const app = express();
const port = process.env.PORT || 4000
dotenv.config();
connectDB();
connectCloudinary()
//middelewers

app.use(express.json())
app.use(cors());

//api end points
app.use('/api/user',userRoute)
app.use('/api/product',productRoute)
app.use('/api/cart',CartRoute)
app.use('/api/order',orderRoute)



app.listen(port,()=>{
    console.log("Server started on PORT: "+ port);
})