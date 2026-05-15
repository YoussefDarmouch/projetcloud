const HOME_JOUEUR_URL = 'http://localhost:3002/joueurs';
const HOME_CLASSEMENT_URL = 'http://localhost:3003/classements';

// Check if user is logged in
function checkAuthentication() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = './login.html';
        return false;
    }
    return true;
}

// Redirect to login if not authenticated
if (!checkAuthentication()) {
    throw new Error('Not authenticated');
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

async function loadHomeStats() {
    try {
        const [joueursRes, classementsRes] = await Promise.all([
            fetchWithAuth(HOME_JOUEUR_URL),
            fetchWithAuth(HOME_CLASSEMENT_URL)
        ]);

        if (joueursRes.ok) {
            const joueurs = await joueursRes.json();
            const countEl = document.querySelector('.joueurs-count');
            if (countEl) countEl.innerText = joueurs.length;
        }

        if (classementsRes.ok) {
            const classements = await classementsRes.json();
            const countEl = document.querySelector('.classements-count');
            if (countEl) countEl.innerText = classements.length;
        }
    } catch (error) {
        console.error('Erreur lors du chargement des stats home:', error);
    }
}

document.addEventListener('DOMContentLoaded', loadHomeStats);
