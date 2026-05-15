const MATCH_URL = 'http://localhost:3006';

let allMatchs = [];

if (!localStorage.getItem('token')) {
    window.location.href = '../login.html';
}

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

async function getMatchs() {
    const res = await fetchWithAuth(`${MATCH_URL}/match`);
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erreur chargement matchs');
    }
    const data = await res.json();
    allMatchs = data;
    displayMatchs(data);
}

function displayMatchs(matchs) {
    const container = document.getElementById('list');
    if (!container) return;
    if (!Array.isArray(matchs)) return;

    container.innerHTML = matchs.map(m => {
        return `
        <tr>
            <td>${m.equipeA}</td>
            <td>${m.equipeB}</td>
            <td>${m.date}</td>
            <td>${m.scoreA ?? ''}</td>
            <td>${m.scoreB ?? ''}</td>
            <td>${m.lieu}</td>
            <td>
                <button onclick="window.location.href='formmatch.html?id=${m.id}'">Update</button>
                <button onclick="removeMatch(${m.id})">Delete</button>
            </td>
        </tr>
        `;
    }).join('');
}

function searchMatchs() {
    const input = document.getElementById('search');
    if (!input) return;
    const value = input.value.toLowerCase();
    const filtered = allMatchs.filter(m =>
        (m.equipeA || '').toLowerCase().includes(value) ||
        (m.equipeB || '').toLowerCase().includes(value) ||
        (m.lieu || '').toLowerCase().includes(value)
    );
    displayMatchs(filtered);
}

async function removeMatch(id) {
    await fetchWithAuth(`${MATCH_URL}/match/${id}`, { method: "DELETE" });
    getMatchs();
}

async function addMatch(data) {
    await fetchWithAuth(`${MATCH_URL}/match`, { method: "POST", body: JSON.stringify(data) });
}

async function updateMatch(id, data) {
    await fetchWithAuth(`${MATCH_URL}/match/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

const form = document.getElementById('matchForm');

if (form) {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    async function loadMatch() {
        if (!id) return;
        const res = await fetchWithAuth(`${MATCH_URL}/match/${id}`);
        if (!res.ok) return;
        const match = await res.json();
        document.getElementById('matchId').value = match.id;
        document.getElementById('equipeA').value = match.equipeA || '';
        document.getElementById('equipeB').value = match.equipeB || '';
        document.getElementById('date').value = match.date || '';
        document.getElementById('scoreA').value = match.scoreA ?? '';
        document.getElementById('scoreB').value = match.scoreB ?? '';
        document.getElementById('lieu').value = match.lieu || '';
    }

    loadMatch();

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const data = {
            equipeA: document.getElementById('equipeA').value,
            equipeB: document.getElementById('equipeB').value,
            date: document.getElementById('date').value,
            scoreA: document.getElementById('scoreA').value,
            scoreB: document.getElementById('scoreB').value,
            lieu: document.getElementById('lieu').value,
        };

        if (id) {
            await updateMatch(id, data);
        } else {
            await addMatch(data);
        }

        window.location.href = "match.html";
    });
}

if (document.getElementById('list')) {
    getMatchs();
}
