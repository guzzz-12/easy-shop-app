const express = require("express");
const mongoose = require("mongoose");
const {check, validationResult} = require("express-validator");
const Order = require("../models/orderModel");
const OrderItem = require("../models/orderItemModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const checkRole = require("../middlewares/checkRole");
const router = express.Router();

/*-----------------------------------*/
// Consultar todas las órdenes creadas
/*-----------------------------------*/
router.get("/", checkRole, async (req, res) => {
  try {
    const orders = await Order.find()
    .populate({
      path: "orderItems",
      select: "-__v",
      populate: {
        path: "product",
        select: "name description category",
        populate: {path: "category", select: "name color icon"}
      }
    })
    .populate({
      path: "user",
      select: "_id name email phone zip country"
    })
    .sort({createdAt: -1})

    res.json({
      status: "success",
      data: orders
    })
    
  } catch (error) {
    res.status(500).json({
      status: "failed",
      msg: `Error: ${error.message}`
    })
  }
});


/*------------------------------*/
// Consultar una orden por su id
/*------------------------------*/
router.get("/:orderId", async (req, res) => {
  try {
    const {orderId} = req.params;
    const order = await Order.findById(orderId)
    .populate({
      path: "orderItems",
      select: "-__v",
      populate: {
        path: "product",
        select: "name description price category",
        populate: {path: "category", select: "name color icon"}
      }
    })
    .populate({
      path: "user",
      select: "_id name email phone zip country"
    })

    if(!order) {
      return res.status(404).json({
        status: "failed",
        msg: "Order not found"
      })
    }

    res.json({
      status: "success",
      data: order
    });
    
  } catch (error) {
    res.status(500).json({
      status: "failed",
      msg: `Error: ${error.message}`
    })
  }
})


/*--------------*/
// Crear órdenes
/*--------------*/
router.post("/", [
  check("orderItems", "You must especify at least one product and its quantity").isArray({min: 1}).bail(),
  check("shippingAddress1", "The shipping addres is required").not().isEmpty(),
  check("city", "The city of shipping is required").not().isEmpty(),
  check("zip", "The zip code is required").not().isEmpty(),
  check("zip", "Invalid zip code, must be a number type").isInt(),
  check("country", "The country is required").not().isEmpty(),
  check("phone", "The phone nomber is required").not().isEmpty(),
  check("user", "Invalid user identifier").isMongoId(),
  check("user", "The user identifier is required").not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    const message = errors.array({onlyFirstError: true})
    return res.status(400).json({
      status: "failed",
      msg: message[0].msg
    })
  }

  try {
    // Generar los order items y almacenarlos en la base de datos
    const orderItemsIds = [];
    let totalPrice = null;
    for(let item of req.body.orderItems) {
      
      let newOrderItem = new OrderItem({
        quantity: item.quantity,
        product: item.product
      });

      await newOrderItem.save();
      const product = await Product.findById(item.product).select("price");
      totalPrice = totalPrice + item.quantity * product.price;
      orderItemsIds.push(newOrderItem._id);
    }

    // Generar la orden y almacenarla en la base de datos
    const order = new Order({...req.body, orderItems: orderItemsIds, totalPrice});
    await order.save();

    res.json({
      status: "success",
      data: order
    })
    
  } catch (error) {
    res.status(500).json({
      status: "failed",
      msg: `Error: ${error.message}`
    })
  }
});


/*--------------------------------*/
// Modificar el status de una orden
/*--------------------------------*/
router.patch("/:orderId", checkRole, async (req, res) => {
  try {
    const {orderId} = req.params;
    const {status} = req.body;
    const order = await Order.findById(orderId);

    if(!order) {
      return res.status(404).json({status: "failed", msg: "Order not found or deleted"})
    }

    order.status = status;
    await order.save();

    res.json({
      status: "success",
      msg: "Order status modified successfully",
      data: order
    })
    
  } catch (error) {
    res.status(500).json({
      status: "failed",
      msg: `Error: ${error.message}`
    })
  }
});


/*-------------------*/
// Eliminar una orden
/*-------------------*/
router.delete("/:orderId", async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if(!order) {
      return res.status(404).json({status: "failed", msg: "Order not found or already deleted from database"})
    }

    // Extraer las ids de los order items asociados a la orden eliminada para eliminarlos también
    const orderItemsObjectIds = order.orderItems.map(id => {
      return new mongoose.Types.ObjectId(id)
    });
    
    // Borrar la orden de la base de datos
    await order.delete();
    // Borrar los order items asociados a la orden borrada
    const orderItems = await OrderItem.find({_id: {$in: orderItemsObjectIds}});
    await Promise.all(orderItems.map(item => item.delete()))

    res.json({
      status: "success",
      msg: "The order and its associated items were successfully removed from the database"
    })
    
  } catch (error) {
    res.status(500).json({
      status: "failed",
      msg: `Error: ${error.message}`
    })
  }
});


/*------------------------------------*/
// Consultar las órdenes de un usuario
/*------------------------------------*/
router.get("/user/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if(!user) {
      return res.status(404).json({
        status: "failed",
        msg: "User not found or deleted"
      })
    }

    const userOrders = await Order.find({user: user._id})
    .populate({
      path: "orderItems",
      select: "-__v",
      populate: {
        path: "product",
        select: "name description category",
        populate: {path: "category", select: "name color icon"}
      }
    })
    .populate({
      path: "user",
      select: "_id name email phone zip country"
    })
    .sort({createdAt: -1});

    res.json({
      status: "success",
      data: userOrders
    })
    
  } catch (error) {
    res.status(500).json({
      status: "failed",
      msg: `Error: ${error.message}`
    })
  }
})


/*----------------------------*/
// Calcular las ventas totales
/*----------------------------*/
router.get("/get/total-sales", checkRole, async (req, res) => {
  try {
    const totalSales = await Order.aggregate([
      {$group: {_id: mongoose.Types.ObjectId(), totalSales: {$sum: "$totalPrice"}}}
    ]);

    const ordersCount = await Order.countDocuments((count) => count);

    if(!totalSales || !ordersCount) {
      return res.status(400).json({status: "failed", msg: "The total sales couldn't be calculated"})
    };

    res.json({
      status: "success",
      data: {
        totalSales: totalSales[0].totalSales,
        totalOrders: ordersCount
      }
    });
    
  } catch (error) {
    res.status(500).json({
      status: "failed",
      msg: `Error: ${error.message}`
    })
  }
});

module.exports = router;