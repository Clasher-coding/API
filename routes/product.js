const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const Product = require('../models/Product');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

router.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Create a new product
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const productData = {
      ...req.body,
      image: req.file ? `/uploads/${req.file.filename}` : undefined,
      category: req.body.category,
      isBestSeller: req.body.isBestSeller === 'true', // Convert to boolean
      isSpecialOffer: req.body.isSpecialOffer === 'true', // Convert to boolean
      isNewArrival: req.body.isNewArrival === 'true', // Handle isNewArrival
      seller: req.user ? req.user.id : undefined, // Associate product with the logged-in user if available
    };

    router.get("/products", async (req, res) => {
      try {
        const search = req.query.search || "";
        const products = await Product.find({
          productName: { $regex: search, $options: "i" },
        });
        res.json(products);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch products" });
      }
    });
    

    // Calculate discount price if applicable
    if (productData.price && productData.discount) {
      productData.discountPrice = productData.price - (productData.price * productData.discount) / 100;
    }

    const product = new Product(productData);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
  
    products.forEach(product => {
      if (product.image && !fs.existsSync(path.join(__dirname, '..', product.image))) {
        product.image = null;
      }
    });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get bestseller products
router.get('/bestsellers', async (req, res) => {
  try {
    const bestSellers = await Product.find({ isBestSeller: true });
    res.status(200).json(bestSellers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get special offer products
router.get('/special-offers', async (req, res) => {
  try {
    const specialOffers = await Product.find({ isSpecialOffer: true });
    res.status(200).json(specialOffers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/view/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a product by ID
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const productData = {
      ...req.body,
      category: req.body.category,
      isBestSeller: req.body.isBestSeller === 'true', // Convert to boolean
      isSpecialOffer: req.body.isSpecialOffer === 'true', // Convert to boolean
      isNewArrival: req.body.isNewArrival === 'true', // Handle isNewArrival
    };

    if (req.file) {
      productData.image = `/uploads/${req.file.filename}`;
    }

    // Calculate discount price if applicable
    if (productData.price && productData.discount) {
      productData.discountPrice = productData.price - (productData.price * productData.discount) / 100;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, productData, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a product by ID
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, seller: req.user ? req.user.id : undefined });
    if (!product) return res.status(404).json({ error: 'Product not found or not authorized.' });
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
