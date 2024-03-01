const express = require('express')
var router = express.Router();
const app = express();
require("dotenv").config()
const stripe = require("stripe")(process.env.STRIPE_SECRET_TEST)
const bodyParser = require('body-parser');
var cors = require('cors')
var xss = require('xss-clean')

const config = require('./config/default');
// Mobile app
require('./routes/routes')(router);

// Website routes
var loginRouter = require('./routes/login_routes');
var userRouter = require('./routes/user_routes');
var newsRouter = require('./routes/newsletter_routes');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.json());

app.use('/uploads', express.static('uploads'));
app.use('/api/public', express.static('public'));
app.use('/api/uploads', express.static('uploads'));


app.use(xss())
app.use(cors());

app.set('view engine', 'ejs');
app.use('/api', router);
app.use('/api/login', loginRouter);
app.use('/api/user', userRouter);
app.use('/api/newsletter', newsRouter);

app.post("/api/payment", cors(), async (req, res) => {
	let { amount, id } = req.body
	try {
		const payment = await stripe.paymentIntents.create({
			amount,
			currency: "EUR",
			description: "YourBuca S.L.",
			payment_method: id,
			confirm: true
		})
		console.log("Payment", payment)
		res.json({
			message: "Payment successful",
			success: true
		})
	} catch (error) {
		console.log("Error", error)
		res.json({
			message: "Payment failed",
			success: false
		})
	}
})

app.use("*", function (req, res) {
	res.status(404).send('<center><h3>Not Found</h3></center>');
});

app.listen(config.port, () => {
  console.log('app listening on port '+config.port)
});
