const EQUIPE_URL = 'http://localhost:3004';

let allEquipes = [];

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
async function getEquipes() {
    const res = await fetchWithAuth(`${EQUIPE_URL}/equipes`);
    const data = await res.json();
    allEquipes = data;
    displayEquipes(data);
}

// =====================
// DISPLAY
// =====================
function displayEquipes(equipes) {
    const container = document.getElementById('list');
    if (!container) return;
    if (!Array.isArray(equipes)) {
        console.error('Expected equipes array but got', equipes);
        return;
    }

    container.innerHTML = equipes.map(e => {
        return `
        <tr>
            <td>${e.nom}</td>
            <td>${e.pays}</td>
            <td>${e.ville}</td>
            <td>${e.stade}</td>
            <td>${e.capacite}</td>
            <td>${e.entraineur}</td>
            <td>${e.annee_fondation}</td>
            <td>${e.couleurs}</td>
            <td>
                <button onclick="window.location.href='formequipe.html?id=${e.id}'">
                    Update
                </button>
                <button onclick="removeEquipe(${e.id})">
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
function searchEquipes() {
    const input = document.getElementById('search');
    if (!input) return;

    const value = input.value.toLowerCase();
    const filtered = allEquipes.filter(e =>
        e.nom.toLowerCase().includes(value) ||
        e.pays.toLowerCase().includes(value) ||
        e.ville.toLowerCase().includes(value) ||
        e.entraineur.toLowerCase().includes(value)
    );
    displayEquipes(filtered);
}

// =====================
// DELETE
// =====================
async function removeEquipe(id) {
    if (confirm('Voulez-vous vraiment supprimer cette équipe ?')) {
        await fetchWithAuth(`${EQUIPE_URL}/equipes/${id}`, {
            method: "DELETE"
        });
        getEquipes();
    }
}

// =====================
// ADD
// =====================
async function addEquipe(data) {
    await fetchWithAuth(`${EQUIPE_URL}/equipes`, {
        method: "POST",
        body: JSON.stringify(data)
    });
}

// =====================
// UPDATE
// =====================
async function updateEquipe(id, data) {
    await fetchWithAuth(`${EQUIPE_URL}/equipes/${id}`, {
        method: "PUT",
        body: JSON.stringify(data)
    });
}

// =====================
// FORM PAGE
// =====================
const form = document.getElementById('equipeForm');

if (form) {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    // =====================
    // LOAD DATA UPDATE
    // =====================
    async function loadEquipe() {
        if (!id) return;

        const res = await fetchWithAuth(`${EQUIPE_URL}/equipes/${id}`);
        const equipe = await res.json();
        console.log("EQUIPE LOADED:", equipe);

        document.getElementById('equipeId').value = equipe.id;
        document.getElementById('nom').value = equipe.nom;
        document.getElementById('pays').value = equipe.pays;
        document.getElementById('ville').value = equipe.ville;
        document.getElementById('stade').value = equipe.stade;
        document.getElementById('capacite').value = equipe.capacite;
        document.getElementById('entraineur').value = equipe.entraineur;
        document.getElementById('annee_fondation').value = equipe.annee_fondation;
        document.getElementById('couleurs').value = equipe.couleurs;
    }

    loadEquipe();

    // =====================
    // SAVE
    // =====================
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const data = {
            nom: document.getElementById('nom').value,
            pays: document.getElementById('pays').value,
            ville: document.getElementById('ville').value,
            stade: document.getElementById('stade').value,
            capacite: parseInt(document.getElementById('capacite').value),
            entraineur: document.getElementById('entraineur').value,
            annee_fondation: parseInt(document.getElementById('annee_fondation').value),
            couleurs: document.getElementById('couleurs').value
        };

        if (id) {
            await updateEquipe(id, data);
        } else {
            await addEquipe(data);
        }

        window.location.href = "equipes.html";
    });
}

// =====================
// START TABLE PAGE
// =====================
if (document.getElementById('list')) {
    getEquipes();
}
