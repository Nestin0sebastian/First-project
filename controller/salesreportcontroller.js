
const session=require('express-session')
const express=require('express')
const path=require('path')
const router=express.Router()
const addressmodel = require('../model/addressschema');
const userModel = require('../model/schema');
const cartmodel = require('../model/cartschema');
const ordermodel=require('../model/orderschema.js');
const addcatagory = require('../model/catagoryschema');



const dailyreport= async (req,res)=>{
    const data= await ordermodel.find().populate('products.productId')
    res.render('admin/dailyreport',{data})
}



const weeklyreport= async (req,res)=>{
    const data= await ordermodel.find().populate('products.productId')
    res.render('admin/weeklyreport',{data})
}


const yearlyreport = async (req, res) => {
    // Get start and end date from query parameters
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    // Fetch data based on the date range
    let data;
    if (startDate && endDate) {
        data = await ordermodel.find({
            date: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }).populate('products.productId');
    } else {
        // If no date range is specified, fetch all data
        data = await ordermodel.find().populate('products.productId');
    }

    // Render the EJS template with the filtered data
    res.render('admin/yearlyreport', { data });
}










const weeklygraph = async (req, res) => {
    try {
        // Fetch data from the ordermodel and populate products with productId details
        const data = await ordermodel.find().populate('products.productId');

        // Calculate daily sales data for the current week
        const currentWeekData = data.filter(item => {
            const reportDate = new Date(item.date);
            const currentDate = new Date();
            const currentWeekStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - currentDate.getDay()); // Start of the current week
            return reportDate >= currentWeekStartDate && reportDate <= currentDate;
        });

        const dailyLabels = [];
        const dailyData = [];

        // Logic to calculate daily sales for the current week
        // Assuming each data item has a date field and a total field
        currentWeekData.forEach(item => {
            const reportDate = new Date(item.date);
            const dayKey = formatDate(reportDate); // Assuming formatDate formats date to day
            dailyLabels.push(dayKey);
            dailyData.push(item.totalAmount); // Assuming 'totalAmount' is the daily sales amount
        });

        // Render the weeklygraph template with the calculated data
        res.render('admin/weeklygraph', { dailyLabels, dailyData });
    } catch (error) {
        console.error('Error fetching weekly report:', error);
        res.status(500).send('Internal Server Error');
    }
};



// Function to check if a date falls within the current week
function isInCurrentWeek(date) {
    const today = new Date();
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    const endOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 6);
    return date >= startOfWeek && date <= endOfWeek;
}

// Function to format date
function formatDate(date) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
}


const categorygraph= async (req, res) => {
    try {
        // Calculate the start and end dates of the current week
        const currentDate = new Date();
        const firstDayOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
        const lastDayOfWeek = new Date(firstDayOfWeek);
        lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6);
        
        // Fetch orders placed within the current week
        const weeklyOrders = await ordermodel.find({
            date: { $gte: firstDayOfWeek, $lte: lastDayOfWeek }
        }).populate('products.productId');

        // Calculate total sales amount for each category
        const categorySales = {};
        weeklyOrders.forEach(order => {
            order.products.forEach(product => {
                const categoryId = product.productId.category;
                if (!categorySales[categoryId]) {
                    categorySales[categoryId] = 0;
                }
                categorySales[categoryId] += product.total;
            });
        });

        // Fetch category names
        const categories = await addcatagory.find();

        // Prepare data for rendering
        const categoryLabels = categories.map(category => category.name);
        const categoryData = categories.map(category => categorySales[category._id] || 0);

        res.render('admin/catagorygraph', { categoryLabels, categoryData });
    } catch (error) {
        console.error('Error fetching weekly category sales:', error);
        res.status(500).send('Internal Server Error');
    }
};






const paymengraph = async (req, res) => {
    try {
        // Calculate the start and end dates of the current week
        const currentDate = new Date();
        const firstDayOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
        const lastDayOfWeek = new Date(firstDayOfWeek);
        lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6);

        // Fetch orders placed within the current week
        const weeklyOrders = await ordermodel.find({
            date: { $gte: firstDayOfWeek, $lte: lastDayOfWeek }
        });

        // Calculate total sales amount for each payment method
        const paymentMethodSales = {};
        weeklyOrders.forEach(order => {
            const paymentMethod = order.paymentMethod;
            if (!paymentMethodSales[paymentMethod]) {
                paymentMethodSales[paymentMethod] = 0;
            }
            paymentMethodSales[paymentMethod] += order.totalAmount;
        });

        // Prepare data for rendering
        const paymentMethodLabels = Object.keys(paymentMethodSales);
        const paymentMethodData = paymentMethodLabels.map(method => paymentMethodSales[method]);

        res.render('admin/paymentgraph', { paymentMethodLabels, paymentMethodData });
    } catch (error) {
        console.error('Error fetching weekly sales data:', error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports={dailyreport,weeklyreport,yearlyreport,weeklygraph,categorygraph,paymengraph}  