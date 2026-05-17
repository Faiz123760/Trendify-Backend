import orderModel from '../models/orderModel.js';
import userModel from '../models/userModel.js';
import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();

const currency = 'USD'; // Default currency, can be changed as needed
const deliveryCharge = 10; // Example delivery charges, adjust as needed

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Placing order using cod method
const placeOrder =async(req,res)=>{

    try {
        const { userId, items, amount, address } = req.body;
        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: 'COD',
            payment: false,
            date: Date.now(),
        }
        const newOrder = new orderModel(orderData);
        await newOrder.save();

        await userModel.findByIdAndUpdate(userId, {cartData:{}});
        res.status(200).json({success: true, message: 'Order placed successfully'});
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }

}

//placing order using stripe method
const placeOrderStripe =async(req,res)=>{
    try {
        const { userId, items, amount, address } = req.body;
         const origin = req.headers.origin;

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: 'Stripe',
            payment: false,
            date: Date.now(),
        }
        const newOrder = new orderModel(orderData);
        await newOrder.save(); 
        const line_items = items.map((item )=> ({
            price_data: {
                currency: currency,
                product_data: {
                    name: item.name
                },
                unit_amount: item.price * 100, // Convert to cents
            },
            quantity: item.quantity,
        }))
        line_items.push({
            price_data: {
                currency: currency,
                product_data: {
                    name: 'Delivery Charges'
                },
                unit_amount: deliveryCharge * 100, // Convert to cents
            },
            quantity: 1,
        })
        const session = await stripe.checkout.sessions.create({
            // payment_method_types: ['card'],
            
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode: 'payment'
        });
        res.status(200).json({ success: true, session_url: session.url });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}


//verify stripe
const verifyStripe = async(req, res) => {
    const {orderId, success, userId} = req.body;
    try{
        if (success === true || success === 'true') {
            await orderModel.findByIdAndUpdate(orderId, { payment: true});
            await userModel.findByIdAndUpdate(userId, { cartData: {} });
            res.status(200).json({ success: true, message: 'Payment successful and order verified' });
        }
        else{
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false, message: 'Payment failed or cancelled' });
        }
    }catch(error){
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// all order data for Admin panel
const allOrders = async(req,res)=>{
    try{

        const orders = await orderModel.find({}).lean();
        res.status(200).json({ success: true, orders });
    }catch(error){
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }

}

// user order data for frontend
const userOrders = async(req,res)=>{
    try{

        const { userId } = req.body;
        const orders = await orderModel.find({ userId }).lean();
        res.status(200).json({ success: true, orders });
    }catch(error){
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }

}

// update order status from Admin panel
const updateStatus = async(req,res)=>{
      try{
          const {orderId, status} = req.body;
          await orderModel.findByIdAndUpdate(orderId, { status });
          res.status(200).json({ success: true, message: 'Order status updated successfully' });
      }catch(error){
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
      }
}

// update payment status from Admin panel
const updatePayment = async(req,res)=>{
    try{
        const {orderId, payment} = req.body;
        await orderModel.findByIdAndUpdate(orderId, { payment });
        res.status(200).json({ success: true, message: 'Payment status updated successfully' });
    }catch(error){
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
}

export {
 verifyStripe, placeOrder, placeOrderStripe, allOrders, userOrders, updateStatus, updatePayment}

