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

// Middleware pour vérifier le token pour toutes les routes /joueurs
app.use('/joueurs', verifyToken);
// any request ghda l route ghs tdoz verifyToken

// Chemin vers le fichier de données des joueurs
const filePath = path.join(__dirname, "../../data/joueurs.json");


function getAllJoueurs() {
    const data = fs.readFileSync(filePath);
    return JSON.parse(data);
}
// Point de terminaison de l'API pour obtenir tous les joueurs
// api get all
app.get("/joueurs", (req, res) => {

    const joueurs = getAllJoueurs()

    res.json(joueurs);
});


// Fonction pour obtenir un joueur par son ID
// Obtenir tout par ID


function getJoueursById(id) {
    const Joueurs = getAllJoueurs();
    return Joueurs.find(Joueur => Joueur.id == id);
}

// Point de terminaison de l'API pour obtenir un joueur par son ID
// api get by id

app.get("/joueurs/:id", (req, res) => {

    const joueur = getJoueursById(req.params.id);

    if (!joueur) {
        return res.status(404).json({
            message: "Joueur non trouvé"
        });
    }

    res.json(joueur);
});

// Fonction pour ajouter un nouveau joueur
// ajouter un joueur

function addJoueur(Joueur) {
    const Joueurs = getAllJoueurs();
    const newJoueur = {
        id: Joueurs.length + 1,
        ...Joueur
    };
    Joueurs.push(newJoueur);
    fs.writeFileSync(
        filePath, JSON.stringify(Joueurs, null, 2)
    );
    return newJoueur;
}
// Point de terminaison de l'API pour ajouter un nouveau joueur
// api add joueur
app.post("/joueurs", (req, res) => {

    const joueur = addJoueur(req.body);
    res.json(joueur)
});

// Fonction pour mettre à jour un joueur existant
// mettre à jour un joueur
function updateJoueur(id, Joueur) {
    const Joueurs = getAllJoueurs();

    const index = Joueurs.findIndex(j => j.id == id);

    if (index === -1) {
        return null;
    }

    Joueurs[index] = {
        ...Joueurs[index],
        ...Joueur
    };

    fs.writeFileSync(filePath, JSON.stringify(Joueurs, null, 2));

    return Joueurs[index];
}
// Point de terminaison de l'API pour mettre à jour un joueur
// api update jouer

app.put("/joueurs/:id", (req, res) => {

    const joueur = updateJoueur(req.params.id, req.body)
    if (!joueur) {
        return res.status(404).json({
            message: "Joueur non trouvé"
        });
    }
    res.json(joueur);
});

// Fonction pour supprimer un joueur
//  supprimer un joueur 

function removeJoueur(id) {
    let Joueurs = getAllJoueurs();

    Joueurs = Joueurs.filter(j => j.id != id);

    fs.writeFileSync(filePath, JSON.stringify(Joueurs, null, 2));

    return Joueurs;
}

// Point de terminaison de l'API pour supprimer un joueur
// api remove jouer 
app.delete("/joueurs/:id", (req, res) => {

    const joueur = removeJoueur(req.params.id);
    res.json(joueur)
});
// Exporter les fonctions pour une utilisation externe
module.exports = {
    getAllJoueurs,
    addJoueur,
    getJoueursById,
    removeJoueur,
    updateJoueur,
}
// Démarrer le serveur
app.listen(3002, () => {
    console.log("Server running on port 3002");
});