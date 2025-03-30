const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 5001;


app.use(cors());
app.use(bodyParser.json());
app.use(cors());
const dbConfig = require('./config/dbConfig');


mongoose.connect(dbConfig.mongoURI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    retryWrites: true, 
    w: 'majority' 
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => {
        console.error('MongoDB connection error:', err.message);
        console.error('Error details:', err);
    });

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

app.use('/uploads', express.static(uploadsDir)); 

const User = require('./models/User');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product'); 

app.use('/auth', authRoutes);
app.use('/products', productRoutes); 


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'An internal server error occurred.' });
});


app.use((req, res, next) => {
  if (req.body.role === 'seller') {
    console.log('Seller-specific logic can be applied here.');
  } else if (req.body.role === 'admin') {
    console.log('Admin-specific logic can be applied here.');
  }
  next();
});


app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));


const calculateDiscountPrice = (price, discount) => {
  if (discount > 0) {
    return price - (price * discount) / 100;
  }
  return null;
};


app.use((req, res, next) => {
  if (req.body.price && req.body.discount) {
    req.body.discountPrice = calculateDiscountPrice(req.body.price, req.body.discount);
  }
  next();
});
