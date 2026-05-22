const fs = require("fs");
const path = require("path");

const express = require("express");
const verifyToken = require("../../middleware/verifyToken");
const app = express();

require('dotenv').config({ path: path.join(__dirname, '../../.env') });

app.use(express.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use('/joueurs', verifyToken);
// any request ghda l route ghs tdoz verifyToken

const filePath = path.join(__dirname, "../../data/joueurs.json");

// get all data logic 
function getAllJoueurs() {
    const data = fs.readFileSync(filePath);
    return JSON.parse(data);
}
// api get all
app.get("/joueurs", (req, res) => {

    const joueurs = getAllJoueurs()

    res.json(joueurs);
});


// Get All By Id


function getJoueursById(id) {
    const Joueurs = getAllJoueurs();
    return Joueurs.find(Joueur => Joueur.id == id);
}

// api get by id

app.get("/joueurs/:id", (req, res) => {

    const joueur = getJoueursById(req.params.id);

    if (!joueur) {
        return res.status(404).json({
            message: "Joueur not found"
        });
    }

    res.json(joueur);
});

// add Joueur

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
// api add joueur
app.post("/joueurs", (req, res) => {

    const joueur = addJoueur(req.body);
    res.json(joueur)
});

// upadate joueur
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
// api upadate jouer

app.put("/joueurs/:id", (req, res) => {

    const joueur = updateJoueur(req.params.id, req.body)
    if (!joueur) {
        return res.status(404).json({
            message: "Joueur not found"
        });
    }
    res.json(joueur);
});

//  remove jouer 

function removeJoueur(id) {
    let Joueurs = getAllJoueurs();

    Joueurs = Joueurs.filter(j => j.id != id);

    fs.writeFileSync(filePath, JSON.stringify(Joueurs, null, 2));

    return Joueurs;
}

// api remove jouer 
app.delete("/joueurs/:id", (req, res) => {

    const joueur = removeJoueur(req.params.id);
    res.json(joueur)
});
module.exports = {
    getAllJoueurs,
    addJoueur,
    getJoueursById,
    removeJoueur,
    updateJoueur,
}
app.listen(3002, () => {
    console.log("Server running on port 3002");
});