const AUTH_URL = 'http://localhost:3001';
const Joueur_URL = 'http://localhost:3002';

function showMessage(text, type) {
    const div = document.getElementById('message');

    div.textContent = text;
    div.className = `message ${type} show`;

    setTimeout(() => {
        div.classList.remove('show');
    }, 4000);
}

// REGISTER
async function register() {

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
        showMessage('Veuillez remplir tous les champs', 'error');
        return;
    }

    try {

        const response = await fetch(`${AUTH_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage(data.message, 'success');
        } else {
            showMessage(data.error, 'error');
        }

    } catch (error) {
        showMessage('Serveur indisponible', 'error');
    }
}

// LOGIN
async function login() {

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
        showMessage('Veuillez remplir tous les champs', 'error');
        return;
    }

    try {

        const response = await fetch(`${AUTH_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {

            document.getElementById('tokenDisplay').innerHTML = `
                <strong>JWT TOKEN :</strong><br><br>
                ${data.token}
            `;

            localStorage.setItem('token', data.token);

            showMessage(data.message, 'success');

             window.location.href = "home.html";

        } else {
            showMessage(data.error, 'error');
        }

    } catch (error) {
        showMessage('Serveur indisponible', 'error');
    }
}