const fs = require("fs");
const path = require("path");
const express = require("express");
const verifyToken = require("../../middleware/verifyToken");
const app = express();

require('dotenv').config({ path: path.join(__dirname, '../../.env') });

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

app.use('/classements', verifyToken);

// Chemin vers le fichier JSON du classement
const filePath = path.join(__dirname, "../../data/classmant.json");

// ==========================================
// Hadi function bach njibou ga3 tarteeb dial lfra9i w nchoufou chkoun lawel
// ==========================================
function getAllClassements() {
    // Kan9raw data men lfile w kanrej3ouha 3la chkel objet JSON
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
}

// API: Get all classements
app.get("/classements", (req, res) => {
    const classements = getAllClassements();
    res.json(classements);
});


// ==========================================
// Hadi function bach n9elbou 3la tarteeb dial fer9a wehda bel ID dialha
// ==========================================
function getClassementById(id) {
    const classements = getAllClassements();
    // Kan9elbou 3la lfer9a li 3ndha nefs l'ID
    return classements.find(c => c.id == id);
}

// API: Get classement by ID
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
// Hadi function bach nzido fer9a jdida f tarteeb w nsejjlouha f lfile
// ==========================================
function addClassement(nouveauClassement) {
    const classements = getAllClassements();

    // Kaneswbo objet jdid fih id jdid w les infos li jawna
    const newEntry = {
        id: classements.length > 0 ? Math.max(...classements.map(c => c.id || 0)) + 1 : 1,
        ...nouveauClassement
    };

    classements.push(newEntry);
    // Kanketbou data jdida f lfile
    fs.writeFileSync(filePath, JSON.stringify(classements, null, 2));

    return newEntry;
}

// API: Add new classement entry
app.post("/classements", (req, res) => {
    const classement = addClassement(req.body);
    res.status(201).json(classement);
});


// ==========================================
// Hadi function bach nbedlou les points (pts) wla les stats (mj, bp, bc) dial chi fer9a
// ==========================================
function updateClassement(id, donneesMisesAJour) {
    const classements = getAllClassements();
    const index = classements.findIndex(c => c.id == id);

    // Ila mal9inach lfer9a, kanrej3ou null
    if (index === -1) {
        return null;
    }

    // Kanbedlou ghir les infos li tbdelou w kankhliw lakhrin kima homa
    classements[index] = {
        ...classements[index],
        ...donneesMisesAJour
    };

    fs.writeFileSync(filePath, JSON.stringify(classements, null, 2));
    return classements[index];
}

// API: Update classement
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
// Hadi function bach nms7ou chi fer9a men tarteeb b mara
// ==========================================
function removeClassement(id) {
    let classements = getAllClassements();

    // Kanfiltriw tableau bach nkhliw ga3 lfra9i mn ghir hadik li bghina nms7ou
    const initialLength = classements.length;
    classements = classements.filter(c => c.id != id);

    // Kansejjlou lfile jdida
    fs.writeFileSync(filePath, JSON.stringify(classements, null, 2));

    // Kanrejcou tableau jdid
    return classements;
}

// API: Remove classement
app.delete("/classements/:id", (req, res) => {
    const resultats = removeClassement(req.params.id);
    res.json({ message: "Équipe supprimée du classement", data: resultats });
});


// Export des fonctions pour pouvoir les utiliser ailleurs si besoin
module.exports = {
    getAllClassements,
    getClassementById,
    addClassement,
    updateClassement,
    removeClassement
};

// Lancement du serveur sur le port 3003
app.listen(3003, () => {
    console.log("Classement Service running on port 3003");
});