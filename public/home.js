const HOME_JOUEUR_URL = 'http://localhost:3002/joueurs';
const HOME_CLASSEMENT_URL = 'http://localhost:3003/classements';

async function loadHomeStats() {
    try {
        const [joueursRes, classementsRes] = await Promise.all([
            fetch(HOME_JOUEUR_URL),
            fetch(HOME_CLASSEMENT_URL)
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
