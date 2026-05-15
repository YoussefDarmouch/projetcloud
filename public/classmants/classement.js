// L'URL de votre API Classement (Port 3003)
const API_URL = "http://localhost:3003/classements";

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

// ==========================================
// LOGIQUE DU DASHBOARD (classement.html)
// ==========================================

// 1. Charger tous les classements
async function getClassements() {
    try {
        const response = await fetchWithAuth(API_URL);
        const data = await response.json();
        renderTable(data);
    } catch (error) {
        console.error("Erreur lors du chargement des classements:", error);
    }
}
async function loadStats() {

    const res = await fetchWithAuth(API_URL);
    const data = await res.json();

    const countEl = document.querySelector(".classements-count");

    if (countEl) {
        countEl.innerText = data.length;
    }
}
document.addEventListener("DOMContentLoaded", () => {
    loadStats();
});
// 2. Afficher les données dans le tableau HTML
// Remplacez votre fonction renderTable par celle-ci
function renderTable(classements) {
    const tbody = document.getElementById("list");
    if (!tbody) return;

    tbody.innerHTML = "";

    // Tri des équipes par points (du plus grand au plus petit)
    const classementsTries = classements.sort((a, b) => b.pts - a.pts);

    // On utilise l'index (i) pour générer le numéro de rang
    classementsTries.forEach((c, index) => {
        const row = `
            <tr>
                <td style="color: #39ff14; font-weight: bold;">${index + 1}</td> <!-- Affiche 1, 2, 3... -->
                <td><strong>${c.equipe}</strong></td>
                <td>${c.championnat}</td>
                <td>${c.mj}</td>
                <td>${c.g}</td>
                <td>${c.n}</td>
                <td>${c.p}</td>
                <td>${c.diff}</td>
                <td><strong>${c.pts}</strong></td>
                <td>
                    <button onclick="editClassement(${c.id})">✏️ Edit</button>
                    <button onclick="deleteClassement(${c.id})" style="background-color: #ff4c4c; color: white;">Delete</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// 3. Barre de recherche par équipe ou championnat
function searchClassements() {
    const input = document.getElementById("search").value.toLowerCase();
    fetchWithAuth(API_URL)
        .then(res => res.json())
        .then(data => {
            const filtered = data.filter(c =>
                c.equipe.toLowerCase().includes(input) ||
                c.championnat.toLowerCase().includes(input)
            );
            renderTable(filtered);
        });
}

// 4. Supprimer une équipe
async function deleteClassement(id) {
    if (confirm("Voulez-vous vraiment supprimer cette équipe du classement ?")) {
        await fetchWithAuth(`${API_URL}/${id}`, { method: "DELETE" });
        getClassements(); // Recharger le tableau
    }
}

// 5. Rediriger vers la page du formulaire avec l'ID pour l'édition
function editClassement(id) {
    window.location.href = `formclassement.html?id=${id}`;
}


// ==========================================
// LOGIQUE DU FORMULAIRE (formclassement.html)
// ==========================================

// Cette fonction s'exécute dès que la page HTML est chargée
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("classementForm");

    // Si le formulaire existe (ça veut dire qu'on est sur formclassement.html)
    if (form) {
        // Vérifier s'il y a un ID dans l'URL (ex: formclassement.html?id=2)
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get("id");

        if (id) {
            // Si on a un ID, on est en mode "Édition", on charge les données de l'équipe
            loadClassementForEdit(id);
        }

        // Écouter la soumission du formulaire
        form.addEventListener("submit", async (e) => {
            e.preventDefault(); // Empêcher la page de se recharger
            await saveClassement();
        });
    } else {
        // Si le formulaire n'existe pas, c'est qu'on est sur le Dashboard, on charge le tableau
        if (document.getElementById("list")) {
            getClassements();
        }
    }
});

// 6. Remplir le formulaire avec les données existantes (Mode Édition)
async function loadClassementForEdit(id) {
    try {
        const response = await fetchWithAuth(`${API_URL}/${id}`);
        const data = await response.json();

        // Remplir les inputs avec les données récupérées
        document.getElementById("classementId").value = data.id;
        document.getElementById("equipe").value = data.equipe;
        document.getElementById("championnat").value = data.championnat;
        document.getElementById("mj").value = data.mj;
        document.getElementById("pts").value = data.pts;
        document.getElementById("g").value = data.g;
        document.getElementById("n").value = data.n;
        document.getElementById("p").value = data.p;
        document.getElementById("bp").value = data.bp;
        document.getElementById("bc").value = data.bc;
        document.getElementById("diff").value = data.diff;
    } catch (error) {
        console.error("Erreur de chargement pour l'édition:", error);
    }
}

// 7. Sauvegarder (Créer une nouvelle équipe OU Mettre à jour une existante)
async function saveClassement() {
    const id = document.getElementById("classementId").value;

    // Récupérer toutes les valeurs tapées par l'utilisateur
    // On utilise parseInt() pour s'assurer que les chiffres sont bien des nombres (Number) et pas du texte (String)
    const classementData = {
        equipe: document.getElementById("equipe").value,
        championnat: document.getElementById("championnat").value,
        mj: parseInt(document.getElementById("mj").value),
        pts: parseInt(document.getElementById("pts").value),
        g: parseInt(document.getElementById("g").value),
        n: parseInt(document.getElementById("n").value),
        p: parseInt(document.getElementById("p").value),
        bp: parseInt(document.getElementById("bp").value),
        bc: parseInt(document.getElementById("bc").value),
        diff: parseInt(document.getElementById("diff").value)
    };

    // Si on a un ID, on fait un PUT (Update), sinon un POST (Create)
    const method = id ? "PUT" : "POST";
    const url = id ? `${API_URL}/${id}` : API_URL;

    try {
        await fetchWithAuth(url, {
            method: method,
            body: JSON.stringify(classementData)
        });

        // Une fois sauvegardé, on redirige l'utilisateur vers le tableau
        window.location.href = "classement.html";
    } catch (error) {
        console.error("Erreur lors de la sauvegarde:", error);
        alert("Erreur lors de la sauvegarde !");
    }
}