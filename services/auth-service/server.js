// Importer les modules nécessaires
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const path = require('path');

// Charger les variables d'environnement depuis le fichier .env
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const app = express();

// Middlewares
// Activer l'analyse du corps JSON
app.use(express.json());

// Middleware CORS pour autoriser les requêtes cross-origin
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Chemin vers le fichier de données des utilisateurs
const USERS_FILE = path.join(__dirname, '../../data/users.json');

// Fonctions utilitaires
// Fonction pour lire les utilisateurs depuis le fichier JSON
async function getUsers() {
  const data = await fs.readFile(USERS_FILE, 'utf8');
  return JSON.parse(data);
}

// Fonction pour sauvegarder les utilisateurs dans le fichier JSON
async function saveUsers(users) {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

// ============================================
// POST /auth/register - Inscription de l'utilisateur
// ============================================
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier si l'email et le mot de passe sont fournis
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    const users = await getUsers();

    // Vérifier si l'email est déjà utilisé
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Email deja utilise' });
    }

    // Hacher le mot de passe pour la sécurité
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer un nouvel objet utilisateur
    const newUser = {
      id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
      email,
      password: hashedPassword
    };

    // Ajouter le nouvel utilisateur et sauvegarder dans le fichier
    users.push(newUser);
    await saveUsers(users);

    res.status(201).json({ message: 'Utilisateur cree', id: newUser.id });

  } catch (error) {
    console.error('Erreur register:', error.message);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// ============================================
// POST /auth/login - Connexion de l'utilisateur
// ============================================
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier si l'email et le mot de passe sont fournis
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    const users = await getUsers();

    // Trouver l'utilisateur par email
    const user = users.find(u => u.email === email);

    // Si l'utilisateur n'est pas trouvé, retourner une erreur
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Comparer le mot de passe fourni avec le mot de passe haché stocké
    const validPassword = await bcrypt.compare(password, user.password);

    // Si le mot de passe n'est pas valide, retourner une erreur
    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Générer un token JWT pour l'utilisateur
    const token = jwt.sign(
      { userId: user.id },
      process.env.SECRET_KEY,
      { expiresIn: '1h' }
    );

    // Envoyer le token et l'ID de l'utilisateur dans la réponse
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

const PORT = process.env.PORT || 3001;

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`\n Auth Service    → http://localhost:${PORT}`);
  console.log(`   POST /auth/register  (inscription)`);
  console.log(`   POST /auth/login     (connexion)\n`);
});
