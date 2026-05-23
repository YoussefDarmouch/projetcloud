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

// Middleware pour vérifier le token pour toutes les routes /match
app.use('/match', verifyToken);

// Chemin vers le fichier de données des matchs
const filePath = path.join(__dirname, "../../data/match.json");

// Fonction pour obtenir tous les matchs depuis le fichier de données
function getAllMatches() {
    const data = fs.readFileSync(filePath);
    return JSON.parse(data);
}

// Point de terminaison de l'API pour obtenir tous les matchs
app.get("/match", (req, res) => {
    const matchs = getAllMatches();
    res.json(matchs);
});

// Fonction pour obtenir un match par son ID
function getMatchById(id) {
    const Matchs = getAllMatches();
    return Matchs.find(m => m.id == id);
}

// Point de terminaison de l'API pour obtenir un match par son ID
app.get("/match/:id", (req, res) => {
    const match = getMatchById(req.params.id);
    if (!match) {
        return res.status(404).json({ message: "Match non trouvé" });
    }
    res.json(match);
});

// Fonction pour ajouter un nouveau match
function addMatch(match) {
    const Matchs = getAllMatches();
    const newMatch = {
        id: Matchs.length + 1,
        ...match
    };
    Matchs.push(newMatch);
    fs.writeFileSync(filePath, JSON.stringify(Matchs, null, 2));
    return newMatch;
}

// Point de terminaison de l'API pour ajouter un nouveau match
app.post("/match", (req, res) => {
    const match = addMatch(req.body);
    res.json(match);
});

// Fonction pour mettre à jour un match existant
function updateMatch(id, match) {
    const Matchs = getAllMatches();

    const index = Matchs.findIndex(m => m.id == id);

    if (index === -1)
        return null;
    Matchs[index] =
        { ...Matchs[index], ...match };
    fs.writeFileSync(filePath, JSON.stringify(Matchs, null, 2));

    return Matchs[index];
}

// Point de terminaison de l'API pour mettre à jour un match
app.put("/match/:id", (req, res) => {
    const match = updateMatch(req.params.id, req.body);
    if (!match) return res.status(404).json({ message: "Match non trouvé" });
    res.json(match);
});

// Fonction pour supprimer un match
function removeMatch(id) {
    let Matchs = getAllMatches();
    Matchs = Matchs.filter(m => m.id != id);
    fs.writeFileSync(filePath, JSON.stringify(Matchs, null, 2));
    return Matchs;
}

// Point de terminaison de l'API pour supprimer un match
app.delete("/match/:id", (req, res) => {
    const matchs = removeMatch(req.params.id);
    res.json(matchs);
});

// Exporter les fonctions pour une utilisation externe
module.exports = {
    getAllMatches,
    addMatch,
    getMatchById,
    removeMatch,
    updateMatch,
}

// Démarrer le serveur
const PORT = process.env.PORT || 3006;

app.listen(PORT, () => {
    console.log(`Match service running on port ${PORT}`);
});
