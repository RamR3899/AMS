const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
const port = 5000;

// Middleware setup
app.use(bodyParser.json());
app.use(cors());
app.use('/images', express.static(path.join(__dirname, 'images')));

// MySQL database connection setup
const db = mysql.createConnection({
 host: 'localhost',
 user: 'root',
 password: '1234', 
 database: 'ams_db',
});

db.connect(err => {
 if (err) {
 console.error('Error connecting to the database:', err);
 return;
 }
 console.log('Connected to the MySQL database.');
});

// Multer setup for file uploads
const storage = multer.diskStorage({
 destination: function (req, file, cb) {
 cb(null, 'images/');
 },
 filename: function (req, file, cb) {
 cb(null, Date.now() + path.extname(file.originalname));
 }
});
const upload = multer({ storage: storage });

// Helper function to format date for MySQL
const formatDateForMySQL = (date) => {
  if (!date) return null;
  const d = new Date(date);
  const month = ('0' + (d.getMonth() + 1)).slice(-2);
  const day = ('0' + d.getDate()).slice(-2);
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
};

// Welcome route
app.get('/', (req, res) => {
  res.send('Welcome to the Asset Management System API');
});

// Fetch all assets from MySQL database
app.get('/api/assets', (req, res) => {
  const query = `
    SELECT 
      a.asset_id AS id, 
      a.asset_name AS name, 
      a.unit_price AS unitPrice, 
      DATE_FORMAT(a.due_date, '%Y-%m-%d') AS dueDate, 
      DATE_FORMAT(a.assignedDate, '%Y-%m-%d') AS assignedDate, 
      DATE_FORMAT(a.purchase_date, '%Y-%m-%d') AS dateOfPurchase, 
      a.description AS description,
      u.username AS userName,
      t.type_name AS typeName,
      s.subcategory_name AS subCategoryName,
      a.image
    FROM assets a
    JOIN users u ON a.username = u.username
    JOIN types t ON a.type_id = t.type_id
    JOIN subcategories s ON a.subcategory_id = s.subcategory_id;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching assets:', err);
      res.status(500).send('Server error');
    } else {
      res.json(results);
    }
  });
});  

// Fetch all types
app.get('/api/types', (req, res) => {
  const query = 'SELECT type_id AS id, type_name AS name FROM types';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching types:', err);
      res.status(500).json({ error: 'Failed to fetch types' });
    } else {
      res.json(results);
    }
  });
});

// Fetch subcategories by typeId
app.get('/api/subcategories/:typeId', (req, res) => {
  const { typeId } = req.params;
  const query = 'SELECT subcategory_id AS id, subcategory_name AS name FROM subcategories WHERE type_id = ?';
  
  db.query(query, [typeId], (err, results) => {
    if (err) {
      console.error('Error fetching subcategories:', err);
      res.status(500).json({ error: 'Failed to fetch subcategories' });
    } else {
      res.json(results);
    }
  });
});

// Add a new asset
app.post('/api/assets', upload.single('image'), (req, res) => {
  const { name, typeId, subCategoryId, userName, unitPrice, dueDate, assignedDate, dateOfPurchase, description } = req.body;
  const image = req.file ? `/images/${req.file.filename}` : null;

  const query = `
    INSERT INTO assets (asset_name, type_id, subcategory_id, username, unit_price, due_date, 
    assignedDate, purchase_date, description, image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `;

  db.query(
    query,
    [name, typeId, subCategoryId, userName, unitPrice, formatDateForMySQL(dueDate), formatDateForMySQL(assignedDate), formatDateForMySQL(dateOfPurchase), description, image],
    (err, result) => {
      if (err) {
        console.error('Error adding asset:', err);
        res.status(500).send('Server error');
      } else {
        res.json({
          id: result.insertId,
          name,
          typeId,
          subCategoryId,
          userName,
          unitPrice,
          dueDate: formatDateForMySQL(dueDate),
          assignedDate: formatDateForMySQL(assignedDate),
          dateOfPurchase: formatDateForMySQL(dateOfPurchase),
          description,
          image,
        });
      }
    }
  );
});

// Delete an asset by ID
app.delete('/api/assets/:id', (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM assets WHERE asset_id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting asset:', err);
      res.status(500).send('Server error');
    } else {
      res.send('Asset deleted successfully');
    }
  });
});  
// Add a new request to the inbox table
app.post('/api/requests', (req, res) => {
  const { id, userName, dueDate } = req.body;

  const query = `
    SELECT asset_name, type_name AS assetType, subcategory_name AS subCategory, image 
    FROM assets
    JOIN types ON assets.type_id = types.type_id
    JOIN subcategories ON assets.subcategory_id = subcategories.subcategory_id
    WHERE asset_id = ?`;

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error fetching asset details:', err);
      res.status(500).send('Server error');
    } else if (results.length === 0) {
      res.status(404).send('Asset not found');
    } else {
      const { asset_name, assetType, subCategory, image } = results[0];
      const availability = 'Available';
      const status = 'Approved';

      const insertQuery = `
        INSERT INTO inbox (image, assetName, assetType, subCategory, userName, dueDate, availability, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

      db.query(insertQuery, [image, asset_name, assetType, subCategory, userName, formatDateForMySQL(dueDate), availability, status], (err) => {
        if (err) {
          console.error('Error inserting request:', err);
          res.status(500).send('Server error');
        } else {
          res.sendStatus(200);
        }
      });
    }
  });
});

// Fetch all requests from the inbox table
app.get('/api/inbox', (req, res) => {
  const query = `
    SELECT id, image, assetName, assetType, subCategory, userName, dueDate, availability, status
    FROM inbox`;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching requests:', err);
      res.status(500).send('Server error');
    } else {
      res.json(results);
    }
  });
});

// Update request in the inbox
app.put('/api/inbox/:id', (req, res) => {
  const { id } = req.params;
  const { availability, status } = req.body;

  const query = `
    UPDATE inbox
    SET availability = ?, status = ?
    WHERE id = ?`;

  db.query(query, [availability, status, id], (err, result) => {
    if (err) {
      console.error('Error updating request:', err);
      res.status(500).send('Server error');
    } else if (result.affectedRows === 0) {
      res.status(404).send('Request not found');
    } else {
      res.send('Request updated successfully');
    }
  });
});

// ---------------------------------Users---------------------------------------

app.get('/api/users', (req, res) => {
  const query = `
      SELECT users.id, users.username, users.email, users.phoneNumber, 
      roles.role_name AS role, roles.role_id, 
      DATE_FORMAT(users.createdDate, "%Y-%m-%d") AS createdDate
      FROM users
      JOIN roles ON users.role_id = roles.role_id
  `;
  db.query(query, (err, results) => {
      if (err) {
          console.error('Error fetching users:', err);
          res.status(500).json({ error: 'Internal Server Error' });
      } else {
          res.json(results);
      }
  });
});

// Create new user with formatted date (no hashed password)
app.post('/api/users', (req, res) => {
  const { username, email, phoneNumber, password, createdDate, role_id } = req.body;
  const formattedDate = formatDate(createdDate);
  const query = 'INSERT INTO users (username, email, phoneNumber, password, createdDate, role_id) VALUES (?, ?, ?, ?, ?, ?)';
  const values = [username, email, phoneNumber, password, formattedDate, role_id];

  db.query(query, values, (err, result) => {
      if (err) {
          console.error('Error saving user:', err);
          res.status(500).json({ error: 'Failed to save user' });
      } else {
          res.status(201).json({ id: result.insertId, username, email, phoneNumber, createdDate: formattedDate, role_id });
      }
  });
});

// Update existing user with formatted date (no password unless provided)
app.put('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  const { username, email, phoneNumber, createdDate, role_id } = req.body;
  const formattedDate = formatDate(createdDate);
  const query = 'UPDATE users SET username = ?, email = ?, phoneNumber = ?, createdDate = ?, role_id = ? WHERE id = ?';
  const values = [username, email, phoneNumber, formattedDate, role_id, userId];

  db.query(query, values, (err, result) => {
      if (err) {
          console.error('Error updating user:', err);
          res.status(500).json({ error: 'Failed to update user' });
      } else {
          res.json({ id: userId, username, email, phoneNumber, createdDate: formattedDate, role_id });
      }
  });
});

// User authentication (no hashed password for testing)
app.post('/api/authenticate', (req, res) => {
  const { email, password } = req.body;  // Changed to email
  const query = 'SELECT * FROM users WHERE email = ? AND password = ?';  // Changed to email
  
  db.query(query, [email, password], (err, result) => {
      if (err) return res.status(500).json({ error: 'Failed to authenticate user' });
      if (result.length > 0) {
          res.status(200).json({ message: 'User authenticated successfully', user: result[0] });
      } else {
          res.status(401).json({ error: 'Invalid email or password' });  // Updated error message
      }
  });
});

// Fetch all roles
app.get('/api/roles', (req, res) => {
  const query = 'SELECT role_id AS id, role_name AS name FROM roles';
  db.query(query, (err, results) => {
      if (err) {
          console.error('Error fetching roles:', err);
          res.status(500).json({ error: 'Failed to fetch roles' });
      } else {
          res.json(results);
      }
  });
});

// Fetch all usernames
app.get('/api/usernames', (req, res) => {
  const query = 'SELECT username FROM users';

  db.query(query, (err, results) => {
      if (err) {
          console.error('Error fetching usernames:', err);
          res.status(500).json({ error: 'Server Error' });
      } else {
          const usernames = results.map(user => user.username);
          res.json(usernames);
      }
  });
});


// ----------------------------  DashBoard  ------------------------------->

// Fetch subcategory-based asset counts
app.get('/api/assets/subcategories', (req, res) => {
  const query = `
    SELECT s.subcategory_name AS name, COUNT(a.asset_id) AS count
    FROM assets a
    JOIN subcategories s ON a.subcategory_id = s.subcategory_id
    GROUP BY s.subcategory_name;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching subcategory-based data:', err);
      res.status(500).send('Server error');
    } else {
      res.json(results);
    }
  });
});

// API endpoint to fetch user-based data
app.get('/api/assets/users', (req, res) => {
  const query = `SELECT username AS name, COUNT(*) AS count 
                 FROM assets 
                 GROUP BY username`;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching user-based data:', err);
      res.status(500).send('Server error');
    } else {
      res.json(results);
    }
  });
});

// API endpoint to fetch month-based data for Assigned Date
// Updated API endpoint to fetch assignedDate-based data
app.get('/api/assets/assignedDate', (req, res) => {
  const query = `
    SELECT DATE_FORMAT(assignedDate, '%Y-%m') AS month, COUNT(*) AS count
    FROM assets
    WHERE assignedDate IS NOT NULL
    GROUP BY month
    ORDER BY month ASC;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching assigned date-based data:', err);
      res.status(500).send('Server error');
    } else {
      res.json(results);
    }
  });
});

//-------------------------------Login Page --------------------------------

app.get('/api/assets/username/:username', (req, res) => {
  const username = req.params.username;

  const query = `
    SELECT * 
    FROM assets
    WHERE username = ?
  `;

  // Execute the query with the username as a parameter
  db.query(query, [username], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);  // Return the assets that belong to the user
  });
});



// Start the server
app.listen(port, () => {
 console.log(`Server is running on http://localhost:${port}`);
});