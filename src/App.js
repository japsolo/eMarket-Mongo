const express = require('express');
const mongoose = require('mongoose');
const faker = require('faker');
const multer = require('multer');

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './public/images/pdtos/');
	},
	filename: function (req, file, cb) {
		let imgName = req.body.pdtoName.trim().replace(/ /g, '-').toLowerCase();
		let imgFinalName = imgName + '-' + Date.now();
		let ext = file.originalname.substr(file.originalname.length - 4);
		cb(null, imgFinalName + ext);
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
	slug: { type: String, required: true },
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
				let pdtoName = faker.commerce.productName();
				let slugText = pdtoName.replace(/ /g, '-').toLowerCase();
				Product.create({
					slug: slugText,
					pdtoName: pdtoName,
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
	let slug = req.body.pdtoName.trim().replace(/ /g, '-').toLowerCase();
	let pdtoName = req.body.pdtoName.trim();
	let pdtoPrice = req.body.pdtoPrice.trim();

	if (pdtoName === '' || pdtoPrice === '') {
		res.render('create', { errors: 'Todos los campos son obligatorios' });
	} else {
		Product.create({
			slug: slug,
			pdtoName: pdtoName,
			pdtoPrice: pdtoPrice,
			pdtoDesc: req.body.pdtoDesc.trim(),
			pdtoLongDesc: req.body.pdtoLongDesc.trim(),
			pdtoImage: req.file.filename
		}, (error, result) => {
			if (error) console.error(error);
			else res.redirect('/');
		});
	}
});

app.get('/product/detail/:slug', (req, res) => {
	Product.findOne({ slug: req.params.slug, _id: req.query.id }, (error, result) => {
		if (error) console.log('Consulta: ', error);
		else res.render('detail', { product: result });
	});
});

app.post('/product/delete/:id', (req, res) => {
	Product.deleteOne({ _id: req.params.id }, (error, result) => {
		if (error) console.log(error);
		else res.redirect('/');
	});
});

app.use((req, res, next) => {
	res.status(404).send('404 NO FOUND');
});
