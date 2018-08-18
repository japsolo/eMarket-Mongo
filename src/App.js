const express = require('express');
const mongoose = require('mongoose');
const faker = require('faker');
const multer = require('multer');

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './public/images/pdtos/');
	},
	filename: function (req, file, cb) {
		let imgName = req.body.pdtoName.replace(/ /g, '-').toLowerCase();
		let ext = file.originalname.substr(file.originalname.length - 4);
		cb(null, imgName + ext);
	}
});

let upload = multer({ storage: storage });

const app = express();

app.listen(4040, () => console.log('Listen port 4040'));

app.set('view engine', 'ejs');
app.set('views', './src/templates');

app.use('/assets/', express.static(__dirname + '/../public/'));

// Connect se conecta a la bd
mongoose.connect('mongodb://localhost/dbShop');

const productSchema = new mongoose.Schema({
	// slug: { type: String, required: true },
	pdtoName: { type: String, required: true },
	pdtoPrice: { type: String, required: true },
	pdtoDesc: { type: String, required: true },
	pdtoLongDesc: { type: String, required: true },
	pdtoImage: { type: String, required: true }
}, { versionKey: false });

const Product = mongoose.model('product', productSchema);

Product.find({}, (error, result) => {
	if (error) console.log(error);
	else {
		if (result.length === 0) {
			for (var i = 1; i <= 12; i++) {
				Product.create({
					pdtoName: faker.commerce.productName(),
					pdtoPrice: faker.commerce.price(),
					pdtoDesc: faker.lorem.sentence(),
					pdtoLongDesc: faker.lorem.sentences(),
					pdtoImage: 'no-image.png'
				}, (error, result) => {
					if (error) console.log('El error fue: ' + error);
					else console.log('Resultado del create: ' + result);
				});
			}
		}
	}
});

app.get('/', (req, res) => {
	Product.find({}, (error, result) => {
		if (error) console.log(error);
		else res.render('index', { theProducts: result });
	});
});

app.get('/create', (req, res) => {
	res.render('create');
});

app.post('/create', upload.single('pdtoImage'), (req, res) => {
	// res.send({ body: req.body, file: req.file });
	Product.create({
		pdtoName: req.body.pdtoName,
		pdtoPrice: req.body.pdtoPrice,
		pdtoDesc: req.body.pdtoDesc,
		pdtoLongDesc: req.body.pdtoLongDesc,
		pdtoImage: req.file.filename
	}, (error, result) => {
		if (error) console.error(error);
		else res.redirect('/');
	});
});
