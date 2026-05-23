// Importer les modules nécessaires
const fs = require("fs");
const path = require("path");
const express = require("express");
const verifyToken = require("../../middleware/verifyToken");
const app = express();

// Charger les variables d'environnement
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Middleware pour parser les corps de requête JSON
app.use(express.json());

// Middleware de configuration CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Middleware pour vérifier le token pour toutes les routes /equipes
app.use('/equipes', verifyToken);

// Chemin vers le fichier de données des équipes
const filePath = path.join(__dirname, "../../data/equipes.json");

// Fonction pour obtenir toutes les équipes depuis le fichier de données
// logique pour obtenir toutes les données
function getAllEquipes() {
    const data = fs.readFileSync(filePath);
    return JSON.parse(data);
}

// Point de terminaison de l'API pour obtenir toutes les équipes
// api get all
app.get("/equipes", (req, res) => {
    const equipes = getAllEquipes();
    res.json(equipes);
});

// Fonction pour obtenir une équipe par son ID
// Obtenir par ID
function getEquipeById(id) {
    const equipes = getAllEquipes();
    return equipes.find(equipe => equipe.id == id);
}

// Point de terminaison de l'API pour obtenir une équipe par son ID
// api get by id
app.get("/equipes/:id", (req, res) => {
    const equipe = getEquipeById(req.params.id);
    if (!equipe) {
        return res.status(404).json({
            message: "Equipe non trouvée"
        });
    }
    res.json(equipe);
});

// Fonction pour ajouter une nouvelle équipe
// ajouter une équipe
function addEquipe(equipe) {
    const equipes = getAllEquipes();
    const newEquipe = {
        id: equipes.length + 1,
        ...equipe
    };
    equipes.push(newEquipe);
    fs.writeFileSync(
        filePath, JSON.stringify(equipes, null, 2)
    );
    return newEquipe;
}

// Point de terminaison de l'API pour ajouter une nouvelle équipe
// api add equipe
app.post("/equipes", (req, res) => {
    const equipe = addEquipe(req.body);
    res.json(equipe);
});

// Fonction pour mettre à jour une équipe existante
// mettre à jour une équipe
function updateEquipe(id, equipe) {
    const equipes = getAllEquipes();
    const index = equipes.findIndex(e => e.id == id);
    if (index === -1) {
        return null;
    }
    equipes[index] = {
        ...equipes[index],
        ...equipe
    };
    fs.writeFileSync(filePath, JSON.stringify(equipes, null, 2));
    return equipes[index];
}

// Point de terminaison de l'API pour mettre à jour une équipe
// api update equipe
app.put("/equipes/:id", (req, res) => {
    const equipe = updateEquipe(req.params.id, req.body);
    if (!equipe) {
        return res.status(404).json({
            message: "Equipe non trouvée"
        });
    }
    res.json(equipe);
});

// Fonction pour supprimer une équipe
// supprimer une équipe
function removeEquipe(id) {
    let equipes = getAllEquipes();
    equipes = equipes.filter(e => e.id != id);
    fs.writeFileSync(filePath, JSON.stringify(equipes, null, 2));
    return equipes;
}

// Point de terminaison de l'API pour supprimer une équipe
// api remove equipe
app.delete("/equipes/:id", (req, res) => {
    const equipes = removeEquipe(req.params.id);
    res.json(equipes);
});

module.exports = {
    getAllEquipes,
    addEquipe,
    getEquipeById,
    removeEquipe,
    updateEquipe,
};

// Démarrer le serveur
const PORT = process.env.PORT || 3004;

app.listen(PORT, () => {
    console.log(`Equipes Service running on port ${PORT}`);
});
