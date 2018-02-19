var express = require('express');
var productRouter = express.Router();
var mongoose = require('mongoose');
var productModel = mongoose.model('Product');
var ObjectId = require('mongodb').ObjectId; 


module.exports.controller = function(app){
		// route to render product create page
		productRouter.get('/create', function(req, res){
			res.render('product-create.hbs');
		});

		// route to save product data to database

		productRouter.post('/save', function(req, res){
			var newProduct = new productModel();
			newProduct.productName = req.body.name;
			newProduct.category = req.body.category;
			newProduct.price = req.body.price;
			newProduct.description = req.body.description;
			var today = Date.now();
			newProduct.createdAt = today;
			newProduct.save(function(error){
				if (error) {
					res.render('error.hbs', {error:error}); 
				}
				else{
					req.flash('success', 'successfully Created.');
					res.redirect('/products/list');
				}
			});	

		});

		// route to list all saved products

		productRouter.get('/list', function(req, res){
			productModel.find({}, function(err, result){
				if (err) {
					res.render('error.hbs', {error:err});
				}
				else{
					res.render('product-list.hbs', {products:result});
				}
			});
		});

		// route to show details of single product based on id

		productRouter.get('/detail/:id', function(req, res){
			var id = req.params.id;

			// checking if id is valid

			if (!ObjectId.isValid(id)) {
				res.send("invalid id");
			}

			productModel.findById(id, function(err, result){
				if (err) {
					res.status(400).send(err);
				}
				else{
					res.render('product-details.hbs', {product:result});
				}
			});
		});

		// route to render edit form with data

		productRouter.get('/edit/:id', function(req, res){
			var id = req.params.id;

			// checking if id is valid

			if (!ObjectId.isValid(id)) {
				res.send("invalid id");
			}

			productModel.findById(id, function(err, result){
				if (err) {
					res.status(400).send(err);
				}
				else{
					res.render('product-edit.hbs', {product:result});
				}
			});
		});

		// route to save edited product data

		productRouter.post('/edit/:id', function(req, res){
			var updatedData = req.body;
			productModel.findOneAndUpdate({'_id':req.params.id}, updatedData, function(err, result){
				if (err) {
					res.render('error.hbs', {error:err});
				}
				else{
					req.flash('success', 'successfully Updated.');
					res.redirect('/products/list');
				}
			});
		});

		// route to delete particular product

		productRouter.get('/delete/:id', function(req, res){

			productModel.remove({'_id':req.params.id}, function(err, result){
				if (err) {
					res.render('error.hbs', {error:err});
				}
				else{
					req.flash('success', 'successfully Deleted.');
					res.redirect('/products/list');
				}
			});
	
		});

		// route to show all the product like shop

		productRouter.get('/cart-list', function(req, res){
			productModel.find({}, function(err, result){
				if (err) {
					res.render('error.hbs', {error:err});
				}
				else{
					res.render('cart-list.hbs', {products:result});
				}
			});
		});

		// route to functionality of add to cart

		productRouter.get('/add-to-cart/:id', function(req, res){
			 req.session.cart = req.session.cart || {};
			 var cart = req.session.cart;
			 var id = req.params.id;

			// checking if id is valid

			if (!ObjectId.isValid(id)) {
				res.send("invalid id");
			}

			productModel.findById(id, function(err, result){
				if (err) {
					res.status(400).send(err);
				}
				else{
					if (cart[id]) {
						cart[id].qty++;
					}
					else{
						cart[id] = {
							id:result.id,
							name:result.productName,
							price:result.price,
							qty: 1
						}
					}
					req.flash('success', 'successfully Added To Cart.');
					res.redirect('/products/cart');
				}


			});

		});

		// route to render cart page that contain all added item

		productRouter.get('/cart', function(req, res){
			var cart = req.session.cart;
			totalCarts = [];
			for (var item in cart) {
				totalCarts.push(cart[item]);
			}
			res.render('cart.hbs', {carts:totalCarts});
		});

		// route to delete a item from cart

		productRouter.get('/delete-cart/:id', function(req, res){
			var id = req.params.id;
			delete req.session.cart[id];
			req.flash('success', 'successfully Deleted.');
			res.redirect('/products/cart');

		});

		// making a group of route with prefix products
		
		app.use('/products', productRouter);

}