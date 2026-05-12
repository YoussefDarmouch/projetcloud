const JOUEUR_URL = 'http://localhost:3002';

let allJoueurs = [];


// =====================
// GET ALL
// =====================
async function getJoueurs() {

    const res = await fetch(`${JOUEUR_URL}/joueurs`);

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

    await fetch(`${JOUEUR_URL}/joueurs/${id}`, {
        method: "DELETE"
    });

    getJoueurs();
}


// =====================
// ADD
// =====================
async function addJoueur(data) {

    await fetch(`${JOUEUR_URL}/joueurs`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(data)
    });
}


// =====================
// UPDATE
// =====================
async function updateJoueur(id, data) {

    await fetch(`${JOUEUR_URL}/joueurs/${id}`, {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

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

        const res = await fetch(`${JOUEUR_URL}/joueurs/${id}`);

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