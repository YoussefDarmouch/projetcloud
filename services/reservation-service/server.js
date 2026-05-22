// Importer les modules nécessaires
const fs = require("fs");
const path = require("path");
const express = require("express");
const verifyToken = require("../../middleware/verifyToken");

const app = express();
// Middleware pour parser les corps de requête JSON
app.use(express.json());

// Middleware de configuration CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");

    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }

    next();
});

// Chemin vers le fichier de données des réservations
const filePath = path.join(__dirname, "../../data/reservation.json");

// Fonction pour obtenir toutes les réservations depuis le fichier de données
function getAllReservations() {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data || "[]");
}

// Point de terminaison de l'API pour obtenir toutes les réservations
app.get("/reservations", (req, res) => {
    const reservations = getAllReservations();
    res.json(reservations);
});

// Fonction pour obtenir une réservation par son ID
function getReservationById(id) {
    const reservations = getAllReservations();
    return reservations.find(reservation => reservation.id == id);
}

// Point de terminaison de l'API pour obtenir une réservation par son ID
app.get("/reservations/:id", (req, res) => {
    const reservation = getReservationById(req.params.id);

    if (!reservation) {
        return res.status(404).json({
            message: "Réservation non trouvée"
        });
    }

    res.json(reservation);
});

// Fonction pour ajouter une nouvelle réservation
function addReservation(reservation) {
    const reservations = getAllReservations();
    const newReservation = {
        id: reservations.length > 0 ? Math.max(...reservations.map(item => item.id || 0)) + 1 : 1,
        ...reservation
    };

    reservations.push(newReservation);
    fs.writeFileSync(filePath, JSON.stringify(reservations, null, 2));

    return newReservation;
}

// Point de terminaison de l'API pour ajouter une nouvelle réservation, protégé par la vérification du token
app.post("/reservations", verifyToken, (req, res) => {
    const reservation = addReservation(req.body);
    res.status(201).json(reservation);
});

// Fonction pour mettre à jour une réservation existante
function updateReservation(id, reservation) {
    const reservations = getAllReservations();
    const index = reservations.findIndex(item => item.id == id);

    if (index === -1) {
        return null;
    }

    reservations[index] = {
        ...reservations[index],
        ...reservation
    };

    fs.writeFileSync(filePath, JSON.stringify(reservations, null, 2));

    return reservations[index];
}

// Point de terminaison de l'API pour mettre à jour une réservation, protégé par la vérification du token
app.put("/reservations/:id", verifyToken, (req, res) => {
    const reservation = updateReservation(req.params.id, req.body);

    if (!reservation) {
        return res.status(404).json({
            message: "Réservation non trouvée"
        });
    }

    res.json(reservation);
});

// Fonction pour supprimer une réservation
function removeReservation(id) {
    let reservations = getAllReservations();
    reservations = reservations.filter(item => item.id != id);

    fs.writeFileSync(filePath, JSON.stringify(reservations, null, 2));

    return reservations;
}

// Point de terminaison de l'API pour supprimer une réservation, protégé par la vérification du token
app.delete("/reservations/:id", verifyToken, (req, res) => {
    const reservations = removeReservation(req.params.id);
    res.json(reservations);
});

// Exporter les fonctions pour une utilisation externe
module.exports = {
    getAllReservations,
    getReservationById,
    addReservation,
    updateReservation,
    removeReservation
};

// Démarrer le serveur
app.listen(3005, () => {
    console.log("Reservation Service running on port 3005");
});
