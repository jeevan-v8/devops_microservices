// index.js or server.js (your main entry file)
const express = require('express');
const app = express();
app.use(express.json());

let products = [
  { id: 1, name: 'Product 1', description: 'Description of Product 1', price: 29.99 },
  { id: 2, name: 'Product 2', description: 'Description of Product 2', price: 49.99 },
];

app.get('/', (req, res) => {
  res.send('Welcome to the Product Service API. Use /products to interact with the products.');
});

// Get all products
app.get('/products', (req, res) => {
  res.json(products);
});

// Get a single product by ID
app.get('/products/:id', (req, res) => {
  const productId = parseInt(req.params.id, 10);
  const product = products.find(p => p.id === productId);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: 'Product not found.' });
  }
});

// Create a new product
app.post('/products', (req, res) => {
  const { name, description, price } = req.body;
  const newProduct = { id: products.length + 1, name, description, price };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// Update a product by ID
app.put('/products/:id', (req, res) => {
  const productId = parseInt(req.params.id, 10);
  const product = products.find(p => p.id === productId);
  if (product) {
    const { name, description, price } = req.body;
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    res.json(product);
  } else {
    res.status(404).json({ error: 'Product not found.' });
  }
});

// Delete a product by ID
app.delete('/products/:id', (req, res) => {
  const productId = parseInt(req.params.id, 10);
  const productIndex = products.findIndex(p => p.id === productId);
  if (productIndex !== -1) {
    products.splice(productIndex, 1);
    res.status(204).end();
  } else {
    res.status(404).json({ error: 'Product not found.' });
  }
});

// Start the server
app.listen(3002, () => {
  console.log('Product service running on http://localhost:3002');
});

