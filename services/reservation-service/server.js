const fs = require("fs");
const path = require("path");
const express = require("express");
const verifyToken = require("../../middleware/verifyToken");

const app = express();
app.use(express.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");

    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }

    next();
});

const filePath = path.join(__dirname, "../../data/reservation.json");

function getAllReservations() {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data || "[]");
}

app.get("/reservations", (req, res) => {
    const reservations = getAllReservations();
    res.json(reservations);
});

function getReservationById(id) {
    const reservations = getAllReservations();
    return reservations.find(reservation => reservation.id == id);
}

app.get("/reservations/:id", (req, res) => {
    const reservation = getReservationById(req.params.id);

    if (!reservation) {
        return res.status(404).json({
            message: "Reservation not found"
        });
    }

    res.json(reservation);
});

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

app.post("/reservations", verifyToken, (req, res) => {
    const reservation = addReservation(req.body);
    res.status(201).json(reservation);
});

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

app.put("/reservations/:id", verifyToken, (req, res) => {
    const reservation = updateReservation(req.params.id, req.body);

    if (!reservation) {
        return res.status(404).json({
            message: "Reservation not found"
        });
    }

    res.json(reservation);
});

function removeReservation(id) {
    let reservations = getAllReservations();
    reservations = reservations.filter(item => item.id != id);

    fs.writeFileSync(filePath, JSON.stringify(reservations, null, 2));

    return reservations;
}

app.delete("/reservations/:id", verifyToken, (req, res) => {
    const reservations = removeReservation(req.params.id);
    res.json(reservations);
});

module.exports = {
    getAllReservations,
    getReservationById,
    addReservation,
    updateReservation,
    removeReservation
};

app.listen(3005, () => {
    console.log("Reservation Service running on port 3005");
});
