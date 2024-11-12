const express = require('express');
const mongoose = require('mongoose');
const mysql = require('mysql2');
const cors = require('cors');

const Product = require('./models/Product');
const Inventory = require('./models/Inventory');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB Local Server Connection using Mongoose
const mongoUri = 'mongodb://localhost:27017/LocationB'; // Local MongoDB URI
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('Connected to MongoDB Local Server (LocationB)'));

// MySQL (LocationA) Configuration
const mysqlConnection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234567890',  // Replace with your MySQL password
  database: 'LocationA'
});

mysqlConnection.connect((err) => {
  if (err) {
    console.error("MySQL connection error:", err);
    process.exit(1);  // Exit if MySQL connection fails
  } else {
    console.log("Connected to MySQL LocationA");
  }
});

// Routes for CRUD Operations

// Fetch data from MySQL (LocationA)
app.get('/locationA', (req, res) => {
  mysqlConnection.query(
    'SELECT * FROM Products INNER JOIN Inventory ON Products.ProductID = Inventory.ProductID',
    (err, results) => {
      if (err) {
        console.error("Error fetching data from MySQL:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json(results);
    }
  );
});

// Fetch data from MongoDB (LocationB)
app.get('/locationB', async (req, res) => {
  try {
    const products = await Product.find();
    const inventory = await Inventory.find().populate('ProductID');

    const results = products.map((product) => ({
      ...product.toObject(),
      Stock: inventory.find((item) => item.ProductID.equals(product._id))?.Stock || 0,
    }));

    res.json(results);
  } catch (err) {
    console.error("Error fetching data from MongoDB:", err);
    res.status(500).json({ error: err.message });
  }
});

// Fetch combined data from both databases
app.get('/combinedData', async (req, res) => {
  try {
    const products = await Product.find();
    const inventory = await Inventory.find().populate('ProductID');
    
    mysqlConnection.query(
      'SELECT * FROM Products INNER JOIN Inventory ON Products.ProductID = Inventory.ProductID',
      (err, mysqlResults) => {
        if (err) {
          console.error("Error fetching data from MySQL:", err);
          return res.status(500).json({ error: err.message });
        }
        
        const results = products.map((product) => ({
          ...product.toObject(),
          Stock: inventory.find((item) => item.ProductID.equals(product._id))?.Stock || 0,
        }));

        res.json({ mysqlData: mysqlResults, mongoData: results });
      }
    );
  } catch (err) {
    console.error("Error fetching data from MongoDB:", err);
    res.status(500).json({ error: err.message });
  }
});


// Insert data into MySQL (LocationA)
app.post('/locationA', (req, res) => {
  const { ProductName, Price, Stock } = req.body;
  mysqlConnection.query(
    'INSERT INTO Products (ProductName, Price) VALUES (?, ?)',
    [ProductName, Price],
    (err, result) => {
      if (err) {
        console.error("Error inserting data into MySQL:", err);
        return res.status(500).json({ error: err.message });
      }
      const productId = result.insertId;
      mysqlConnection.query(
        'INSERT INTO Inventory (ProductID, Stock) VALUES (?, ?)',
        [productId, Stock],
        (err) => {
          if (err) {
            console.error("Error inserting inventory into MySQL:", err);
            return res.status(500).json({ error: err.message });
          }
          res.json({ message: 'Data inserted into LocationA' });
        }
      );
    }
  );
});

// Insert data into MongoDB (LocationB)
app.post('/locationB', async (req, res) => {
  const { ProductName, Price, Stock } = req.body;
  try {
    const product = await Product.create({ ProductName, Price });
    await Inventory.create({ ProductID: product._id, Stock });
    res.json({ message: 'Data inserted into LocationB' });
  } catch (err) {
    console.error("Error inserting data into MongoDB:", err);
    res.status(500).json({ error: err.message });
  }
});

// Update data in MySQL (LocationA)
app.put('/locationA/:ProductID', (req, res) => {
  const { ProductName, Price, Stock } = req.body;
  const { ProductID } = req.params;
  mysqlConnection.query(
    'UPDATE Products SET ProductName = ?, Price = ? WHERE ProductID = ?',
    [ProductName, Price, ProductID],
    (err) => {
      if (err) {
        console.error("Error updating data in MySQL:", err);
        return res.status(500).json({ error: err.message });
      }
      mysqlConnection.query(
        'UPDATE Inventory SET Stock = ? WHERE ProductID = ?',
        [Stock, ProductID],
        (err) => {
          if (err) {
            console.error("Error updating inventory in MySQL:", err);
            return res.status(500).json({ error: err.message });
          }
          res.json({ message: 'Data updated in LocationA' });
        }
      );
    }
  );
});

// Update data in MongoDB (LocationB)
app.put('/locationB/:ProductID', async (req, res) => {
  const { ProductName, Price, Stock } = req.body;
  const { ProductID } = req.params;
  if (!mongoose.Types.ObjectId.isValid(ProductID)) {
    return res.status(400).json({ error: 'Invalid ProductID' });
  }
  try {
    await Product.findByIdAndUpdate(ProductID, { ProductName, Price });
    await Inventory.findOneAndUpdate({ ProductID }, { Stock });
    res.json({ message: 'Data updated in LocationB' });
  } catch (err) {
    console.error("Error updating data in MongoDB:", err);
    res.status(500).json({ error: err.message });
  }
});


// Delete data from MySQL (LocationA)
app.delete('/locationA/:ProductID', (req, res) => {
  const { ProductID } = req.params;
  mysqlConnection.query('DELETE FROM Inventory WHERE ProductID = ?', [ProductID], (err) => {
    if (err) {
      console.error("Error deleting inventory from MySQL:", err);
      return res.status(500).json({ error: err.message });
    }
    mysqlConnection.query('DELETE FROM Products WHERE ProductID = ?', [ProductID], (err) => {
      if (err) {
        console.error("Error deleting data from MySQL:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Data deleted from LocationA' });
    });
  });
});

// Delete data from MongoDB (LocationB)
app.delete('/locationB/:ProductID', async (req, res) => {
  const { ProductID } = req.params;
  if (!mongoose.Types.ObjectId.isValid(ProductID)) {
    return res.status(400).json({ error: 'Invalid ProductID' });
  }
  try {
    await Product.findByIdAndDelete(ProductID);
    await Inventory.deleteMany({ ProductID });
    res.json({ message: 'Data deleted from LocationB' });
  } catch (err) {
    console.error("Error deleting data from MongoDB:", err);
    res.status(500).json({ error: err.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.use(express.static('public'));