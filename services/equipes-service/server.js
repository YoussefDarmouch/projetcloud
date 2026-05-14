const fs = require("fs");
const path = require("path");
const express = require("express");
const app = express();
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

const filePath = path.join(__dirname, "../../data/equipes.json");

// get all data logic
function getAllEquipes() {
    const data = fs.readFileSync(filePath);
    return JSON.parse(data);
}

// api get all
app.get("/equipes", (req, res) => {
    const equipes = getAllEquipes();
    res.json(equipes);
});

// Get By Id
function getEquipeById(id) {
    const equipes = getAllEquipes();
    return equipes.find(equipe => equipe.id == id);
}

// api get by id
app.get("/equipes/:id", (req, res) => {
    const equipe = getEquipeById(req.params.id);
    if (!equipe) {
        return res.status(404).json({
            message: "Equipe not found"
        });
    }
    res.json(equipe);
});

// add Equipe
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

// api add equipe
app.post("/equipes", (req, res) => {
    const equipe = addEquipe(req.body);
    res.json(equipe);
});

// update equipe
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

// api update equipe
app.put("/equipes/:id", (req, res) => {
    const equipe = updateEquipe(req.params.id, req.body);
    if (!equipe) {
        return res.status(404).json({
            message: "Equipe not found"
        });
    }
    res.json(equipe);
});

// remove equipe
function removeEquipe(id) {
    let equipes = getAllEquipes();
    equipes = equipes.filter(e => e.id != id);
    fs.writeFileSync(filePath, JSON.stringify(equipes, null, 2));
    return equipes;
}

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

app.listen(3004, () => {
    console.log("Equipes Service running on port 3004");
});
