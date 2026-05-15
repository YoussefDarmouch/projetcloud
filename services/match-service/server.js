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

app.use('/match', verifyToken);

const filePath = path.join(__dirname, "../../data/match.json");

function getAllMatches() {
    const data = fs.readFileSync(filePath);
    return JSON.parse(data);
}

app.get("/match", (req, res) => {
    const matchs = getAllMatches();
    res.json(matchs);
});

function getMatchById(id) {
    const Matchs = getAllMatches();
    return Matchs.find(m => m.id == id);
}

app.get("/match/:id", (req, res) => {
    const match = getMatchById(req.params.id);
    if (!match) {
        return res.status(404).json({ message: "Match not found" });
    }
    res.json(match);
});

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

app.post("/match", (req, res) => {
    const match = addMatch(req.body);
    res.json(match);
});

function updateMatch(id, match) {
    const Matchs = getAllMatches();
    const index = Matchs.findIndex(m => m.id == id);
    if (index === -1) return null;
    Matchs[index] = { ...Matchs[index], ...match };
    fs.writeFileSync(filePath, JSON.stringify(Matchs, null, 2));
    return Matchs[index];
}

app.put("/match/:id", (req, res) => {
    const match = updateMatch(req.params.id, req.body);
    if (!match) return res.status(404).json({ message: "Match not found" });
    res.json(match);
});

function removeMatch(id) {
    let Matchs = getAllMatches();
    Matchs = Matchs.filter(m => m.id != id);
    fs.writeFileSync(filePath, JSON.stringify(Matchs, null, 2));
    return Matchs;
}

app.delete("/match/:id", (req, res) => {
    const matchs = removeMatch(req.params.id);
    res.json(matchs);
});

module.exports = {
    getAllMatches,
    addMatch,
    getMatchById,
    removeMatch,
    updateMatch,
}

app.listen(3006, () => {
    console.log("Match service running on port 3006");
});
