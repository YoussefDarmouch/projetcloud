const JOUEUR_URL = 'http://localhost:3002';

let allJoueurs = [];

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
async function getJoueurs() {

    const res = await fetchWithAuth(`${JOUEUR_URL}/joueurs`);

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erreur chargement joueurs');
    }

    const data = await res.json();

    allJoueurs = data;

    displayJoueurs(data);


}


// =====================
// DISPLAY
// =====================
function displayJoueurs(joueurs) {

    const container = document.getElementById('list');

    if (!container) return;

    if (!Array.isArray(joueurs)) {
        console.error('Expected joueurs array but got', joueurs);
        return;
    }

    container.innerHTML = joueurs.map(j => {

        return `
        <tr>
            <td>${j.nom}</td>
            <td>${j.age}</td>
            <td>${j.position}</td>
            <td>${j.club}</td>
            <td>${j.numero}</td>
            <td>${j.nationalite}</td>

            <td>

                <button onclick="window.location.href='formjoueur.html?id=${j.id}'">
                    Update
                </button>

                <button onclick="removeJoueur(${j.id})">
                    Delete
                </button>

            </td>
        </tr>
        `;
    }).join('');
}


// =====================
// SEARCH
// =====================
function searchJoueurs() {

    const input = document.getElementById('search');

    if (!input) return;

    const value = input.value.toLowerCase();

    const filtered = allJoueurs.filter(j =>

        j.nom.toLowerCase().includes(value) ||

        j.position.toLowerCase().includes(value) ||

        j.club.toLowerCase().includes(value)
    );

    displayJoueurs(filtered);
}


// =====================
// DELETE
// =====================
async function removeJoueur(id) {

    await fetchWithAuth(`${JOUEUR_URL}/joueurs/${id}`, {
        method: "DELETE"
    });

    getJoueurs();
}


// =====================
// ADD
// =====================
async function addJoueur(data) {

    await fetchWithAuth(`${JOUEUR_URL}/joueurs`, {

        method: "POST",

        body: JSON.stringify(data)
    });
}


// =====================
// UPDATE
// =====================
async function updateJoueur(id, data) {

    await fetchWithAuth(`${JOUEUR_URL}/joueurs/${id}`, {

        method: "PUT",

        body: JSON.stringify(data)
    });
}


// =====================
// FORM PAGE
// =====================

const form = document.getElementById('joueurForm');

if (form) {

    const params = new URLSearchParams(window.location.search);

    const id = params.get('id');


    // =====================
    // LOAD DATA UPDATE
    // =====================
    async function loadJoueur() {

        if (!id) return;

        const res = await fetchWithAuth(`${JOUEUR_URL}/joueurs/${id}`);

        if (!res.ok) {
            const error = await res.json();
            console.error('Erreur chargement joueur:', error);
            return;
        }

        const joueur = await res.json();
        console.log("JOUEUR LOADED:", joueur);

        document.getElementById('joueurId').value = joueur.id;
        document.getElementById('nom').value = joueur.nom;
        document.getElementById('age').value = joueur.age;
        document.getElementById('position').value = joueur.position;
        document.getElementById('club').value = joueur.club;
        document.getElementById('numero').value = joueur.numero;
        document.getElementById('nationalite').value = joueur.nationalite;
    }

    loadJoueur();


    // =====================
    // SAVE
    // =====================
    form.addEventListener('submit', async function (e) {

        e.preventDefault();

        const data = {


            nom: document.getElementById('nom').value,

            age: document.getElementById('age').value,

            position: document.getElementById('position').value,

            club: document.getElementById('club').value,

            numero: document.getElementById('numero').value,

            nationalite: document.getElementById('nationalite').value
        };


        // UPDATE
        if (id) {

            await updateJoueur(id, data);
        }

        // ADD
        else {

            await addJoueur(data);
        }


        // REDIRECT
        window.location.href = "joueurs.html";
    });
}


// =====================
// START TABLE PAGE
// =====================

if (document.getElementById('list')) {

    getJoueurs();
}

