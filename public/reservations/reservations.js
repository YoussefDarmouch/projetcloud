const RESERVATION_URL = 'http://localhost:3005';

let allReservations = [];

// Check if user is logged in
if (!localStorage.getItem('token')) {
    window.location.href = '../login.html';
}

// Helper function for authenticated requests
function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Token manquant. Veuillez vous connecter.');
    }

    return fetch(url, {

        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        }
    });
}


// =====================
// GET ALL
// =====================
async function getReservations() {

    const res = await fetchWithAuth(`${RESERVATION_URL}/reservations`);

    const data = await res.json();

    allReservations = data;

    displayReservations(data);
}


// =====================
// DISPLAY
// =====================
function displayReservations(reservations) {

    const container = document.getElementById('list');

    if (!container) return;

    container.innerHTML = reservations.map((r, index) => {

        return `
        <tr>

            <td>${index + 1}</td>

            <td>${r.supporter}</td>

            <td>${r.match}</td>

            <td>${r.tickets}</td>

            <td>${r.category}</td>

            <td>${r.reservationDate}</td>

            <td>
                <div class="action-buttons">
                    <button onclick="window.location.href='formreservation.html?id=${r.id}'">
                        Update
                    </button>

                    <button onclick="removeReservation(${r.id})">
                        Delete
                    </button>
                </div>
            </td>

        </tr>
        `;
    }).join('');
}


// =====================
// SEARCH
// =====================
function searchReservations() {

    const input = document.getElementById('search');

    if (!input) return;

    const value = input.value.toLowerCase();

    const filtered = allReservations.filter(r =>

        r.supporter.toLowerCase().includes(value) ||

        r.match.toLowerCase().includes(value) ||

        r.category.toLowerCase().includes(value)
    );

    displayReservations(filtered);
}


// =====================
// DELETE
// =====================
async function removeReservation(id) {

    const res = await fetchWithAuth(`${RESERVATION_URL}/reservations/${id}`, {
        method: "DELETE"
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || error.message || 'Erreur suppression reservation');
    }

    getReservations();
}


// =====================
// ADD
// =====================
async function addReservation(data) {

    const res = await fetchWithAuth(`${RESERVATION_URL}/reservations`, {

        method: "POST",

        body: JSON.stringify(data)
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || error.message || 'Erreur ajout reservation');
    }
}


// =====================
// UPDATE
// =====================
async function updateReservation(id, data) {

    const res = await fetchWithAuth(`${RESERVATION_URL}/reservations/${id}`, {

        method: "PUT",

        body: JSON.stringify(data)
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || error.message || 'Erreur mise a jour reservation');
    }
}


// =====================
// FORM PAGE
// =====================

const form = document.getElementById('reservationForm');

if (form) {

    const params = new URLSearchParams(window.location.search);

    const id = params.get('id');


    // =====================
    // LOAD DATA UPDATE
    // =====================
    async function loadReservation() {

        if (!id) return;

        const res = await fetch(`${RESERVATION_URL}/reservations/${id}`);

        const reservation = await res.json();

        console.log("RESERVATION LOADED:", reservation);

        document.getElementById('reservationId').value = reservation.id;

        document.getElementById('supporter').value = reservation.supporter;

        document.getElementById('match').value = reservation.match;

        document.getElementById('tickets').value = reservation.tickets;

        document.getElementById('category').value = reservation.category;

        document.getElementById('reservationDate').value = reservation.reservationDate;
    }

    loadReservation();


    // =====================
    // SAVE
    // =====================
    form.addEventListener('submit', async function (e) {

        e.preventDefault();

        try {
            const data = {

                supporter: document.getElementById('supporter').value,

                match: document.getElementById('match').value,

                tickets: document.getElementById('tickets').value,

                category: document.getElementById('category').value,

                reservationDate: document.getElementById('reservationDate').value
            };


            // UPDATE
            if (id) {

                await updateReservation(id, data);
            }

            // ADD
            else {

                await addReservation(data);
            }


            // REDIRECT
            window.location.href = "reservations.html";
        } catch (error) {
            console.error('Erreur sauvegarde reservation:', error);
            alert(error.message || 'Une erreur est survenue.');
        }
    });
}


// =====================
// START TABLE PAGE
// =====================

if (document.getElementById('list')) {

    getReservations();
}