const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');


const app = express();
app.use(cors());
app.use(express.json());

// Paths
const usersFilePath = './users.json'; // Path for user data
const JWT_SECRET = 'your_jwt_secret'; // Secure your secret

// Utility function to read users from the JSON file
const getUsers = () => {
  try {
    const data = fs.readFileSync(usersFilePath);
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

// Utility function to save users to the JSON file
const saveUsers = (users) => {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

// Serve static files from the 'frontend' directory
app.use(express.static(path.join(__dirname, 'frontend')));

// Route handling
app.get('/HomePage', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'login.html'));
});

// Login POST route
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Get users from JSON
  const users = getUsers();

  // Find the user
  const user = users.find(user => user.username === username && user.password === password);

  if (user) {
    // Generate JWT token
    const token = jwt.sign({ username: user.username }, JWT_SECRET);
    user.token = token;

    // Respond with token
    res.status(200).send({ message: 'Login successful', token });
  } else {
    res.status(403).send({
      message: "Invalid username or password"
    });
  }
});


// Helper function to read users from users.json
const readUsersFromFile = () => {
  try {
      const data = fs.readFileSync('users.json'); // Synchronously read the file
      return JSON.parse(data); // Parse and return users
  } catch (error) {
      console.error('Error reading users file:', error);
      return {}; // Return empty object in case of error
  }
};

app.post('/signup', (req, res) => {
    const { username, password } = req.body;
  // Get users from JSON
  const users = getUsers();

  // Find the user
  const user = users.find(user => user.username === username);
    // Check if user already exists
    if (user) {
        return res.status(400).send('User already exists'); // Return 400 Bad Request
    }

    const newUser = { username, password }; // Store both username and password

    // Add the new user to the existing users
    users.push(newUser); // Store the new user as an object

    // Save the updated users back to the users.json file using saveUsers
    saveUsers(users);

    res.status(201).send('User registered successfully'); // Send success response
});




// Serve the signup page
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'signup.html'));
});

// Serve tasks page
app.get('/tasks', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'tasks.html'));
});

// Middleware to authenticate JWT
function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, 'your_jwt_secret_key', (err) => {
      if (err) return res.sendStatus(403);
      next();
  });
}

app.post('/tasks', authenticateToken, (req, res) => {
  const newTask = { id: tasks.length + 1, ...req.body };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

app.put('/tasks/:id', authenticateToken, (req, res) => {
  const taskId = parseInt(req.params.id);
  const taskIndex = tasks.findIndex(task => task.id === taskId);
  if (taskIndex === -1) return res.sendStatus(404); // Not Found

  tasks[taskIndex] = { ...tasks[taskIndex], ...req.body };
  res.json(tasks[taskIndex]);
});

app.delete('/tasks/:id', authenticateToken, (req, res) => {
  const taskId = parseInt(req.params.id);
  tasks = tasks.filter(task => task.id !== taskId);
  res.sendStatus(204); // No Content
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}/HomePage`);
});
