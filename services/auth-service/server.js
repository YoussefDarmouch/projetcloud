const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const app = express();

// Middlewares
app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Database files
const USERS_FILE = path.join(__dirname, '../../data/users.json');

// Utility functions
async function getUsers() {
  const data = await fs.readFile(USERS_FILE, 'utf8');
  return JSON.parse(data);
}

async function saveUsers(users) {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

// ============================================
// POST /auth/register - INSCRIPTION
// ============================================
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    const users = await getUsers();

    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Email deja utilise' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
      email,
      password: hashedPassword
    };

    users.push(newUser);
    await saveUsers(users);

    res.status(201).json({ message: 'Utilisateur cree', id: newUser.id });

  } catch (error) {
    console.error('Erreur register:', error.message);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// ============================================
// POST /auth/login - CONNEXION
// ============================================
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    const users = await getUsers();

    const user = users.find(u => u.email === email);

    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.SECRET_KEY,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Connexion reussie',
      token,
      userId: user.id
    });

  } catch (error) {
    console.error('Erreur login:', error.message);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`\n Auth Service    → http://localhost:${PORT}`);
  console.log(`   POST /auth/register  (inscription)`);
  console.log(`   POST /auth/login     (connexion)\n`);
});