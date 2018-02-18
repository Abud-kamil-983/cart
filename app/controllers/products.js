var express = require('express');
var productRouter = express.Router();
var mongoose = require('mongoose');
var productModel = mongoose.model('Product');
var ObjectId = require('mongodb').ObjectId; 


module.exports.controller = function(app){

		productRouter.get('/create', function(req, res){
			res.render('product-create.hbs');
		});

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


		app.use('/products', productRouter);

}