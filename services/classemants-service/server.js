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

// Configuration CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next(); 
});

// Middleware pour vérifier le token pour toutes les routes /classements
app.use('/classements', verifyToken);

// Chemin vers le fichier JSON des classements
const filePath = path.join(__dirname, "../../data/classmant.json");

// ==========================================
// Cette fonction permet d'obtenir le classement complet des équipes et de voir qui est premier
// ==========================================
function getAllClassements() {
    // On lit les données du fichier et on les retourne en tant qu'objet JSON
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
}

// API : Obtenir tous les classements
app.get("/classements", (req, res) => {
    const classements = getAllClassements();
    res.json(classements);
});

// ==========================================
// Cette fonction permet de rechercher le classement d'une seule équipe par son ID
// ==========================================
function getClassementById(id) {
    const classements = getAllClassements();
    // On recherche l'équipe qui a le même ID
    return classements.find(c => c.id == id);
}

// API : Obtenir le classement par ID
app.get("/classements/:id", (req, res) => {
    const classement = getClassementById(req.params.id);

    if (!classement) {
        return res.status(404).json({
            message: "Classement introuvable pour cette équipe"
        });
    }

    res.json(classement);
});

// ==========================================
// Cette fonction permet d'ajouter une nouvelle équipe au classement et de l'enregistrer dans le fichier
// ==========================================
function addClassement(nouveauClassement) {
    const classements = getAllClassements();

    // On crée un nouvel objet avec un nouvel id et les informations reçues
    const newEntry = {
        id: classements.length > 0 ? Math.max(...classements.map(c => c.id || 0)) + 1 : 1,
        ...nouveauClassement
    };

    classements.push(newEntry);
    // On écrit les nouvelles données dans le fichier
    fs.writeFileSync(filePath, JSON.stringify(classements, null, 2));

    return newEntry;
}

// API : Ajouter une nouvelle entrée de classement
app.post("/classements", (req, res) => {
    const classement = addClassement(req.body);
    res.status(201).json(classement);
});

// ==========================================
// Cette fonction permet de modifier les points (pts) ou les statistiques (mj, bp, bc) d'une équipe
// ==========================================
function updateClassement(id, donneesMisesAJour) {
    const classements = getAllClassements();
    const index = classements.findIndex(c => c.id == id);

    // Si on ne trouve pas l'équipe, on retourne null
    if (index === -1) {
        return null;
    }

    // On ne modifie que les informations qui ont changé et on laisse les autres telles quelles
    classements[index] = {
        ...classements[index],
        ...donneesMisesAJour
    };

    fs.writeFileSync(filePath, JSON.stringify(classements, null, 2));
    return classements[index];
}

// API : Mettre à jour le classement
app.put("/classements/:id", (req, res) => {
    const classement = updateClassement(req.params.id, req.body);

    if (!classement) {
        return res.status(404).json({
            message: "Classement introuvable pour la mise à jour"
        });
    }

    res.json(classement);
});

// ==========================================
// Cette fonction permet de supprimer complètement une équipe du classement
// ==========================================
function removeClassement(id) {
    let classements = getAllClassements();

    // On filtre le tableau pour garder toutes les équipes sauf celle qu'on veut supprimer
    const initialLength = classements.length;
    classements = classements.filter(c => c.id != id);

    // On enregistre le nouveau fichier
    fs.writeFileSync(filePath, JSON.stringify(classements, null, 2));

    // On retourne le nouveau tableau
    return classements;
}

// API : Supprimer le classement
app.delete("/classements/:id", (req, res) => {
    const resultats = removeClassement(req.params.id);
    res.json({ message: "Équipe supprimée du classement", data: resultats });
});

// Exporter les fonctions pour pouvoir les utiliser ailleurs si besoin
module.exports = {
    getAllClassements,
    getClassementById,
    addClassement,
    updateClassement,
    removeClassement
};

// Démarrer le serveur sur le port 3003
app.listen(3003, () => {
    console.log("Classement Service running on port 3003");
});