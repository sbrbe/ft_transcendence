"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function toggleRegister() {
    showOnly('view-register');
}
function sendUser() {
    const data = {
        first_name: document.getElementById('first_name').value,
        last_name: document.getElementById('last_name').value,
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        email: document.getElementById('email').value,
        display_name: document.getElementById('display_name').value,
    };
    fetch('/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then((res) => __awaiter(this, void 0, void 0, function* () {
        if (!res.ok) {
            const text = yield res.text();
            throw new Error(`Erreur HTTP ${res.status} : ${text}`);
        }
        return res.json();
    }))
        .then(user => {
        setLoggedInUser(user);
        document.getElementById('logUser').textContent = JSON.stringify(user, null, 2);
        document.getElementById('view-register').style.display = 'none';
    })
        .catch(err => {
        document.getElementById('logUser').textContent = 'Erreur : ' + err.message;
    });
    ['first_name', 'last_name', 'username', 'password', 'email', 'display_name'].forEach(id => {
        document.getElementById(id).value = '';
    });
}
function setLoggedInUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
    document.getElementById('nav-public').style.display = 'none';
    document.getElementById('nav-user').style.display = 'block';
    document.getElementById('nav-displayname').textContent = `👤 ${user.display_name}`;
}
function logout() {
    const userStr = localStorage.getItem('user');
    if (!userStr)
        return;
    const user = JSON.parse(userStr);
    fetch('/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id })
    })
        .then(() => {
        localStorage.removeItem('user');
        document.getElementById('nav-public').style.display = 'block';
        document.getElementById('nav-user').style.display = 'none';
        document.getElementById('nav-displayname').textContent = '';
        showOnly('view-home');
    })
        .catch(() => {
        localStorage.removeItem('user');
        showOnly('view-home');
    });
}
window.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        const user = JSON.parse(savedUser);
        setLoggedInUser(user);
    }
});
function toggleLogin() {
    showOnly('view-login');
}
function loginUser() {
    const data = {
        email: document.getElementById('login_email').value,
        password: document.getElementById('login_password').value
    };
    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then((res) => __awaiter(this, void 0, void 0, function* () {
        if (!res.ok) {
            const text = yield res.text();
            throw new Error(`Erreur HTTP ${res.status} : ${text}`);
        }
        return res.json();
    }))
        .then(user => {
        setLoggedInUser(user);
        document.getElementById('view-login').style.display = 'none';
        document.getElementById('logLogin').textContent = '';
    })
        .catch(err => {
        document.getElementById('logLogin').textContent = 'Erreur : ' + err.message;
    });
}
function openSettings() {
    const userStr = localStorage.getItem('user');
    if (!userStr)
        return;
    const user = JSON.parse(userStr);
    document.getElementById('param_first_name').value = user.first_name || '';
    document.getElementById('param_last_name').value = user.last_name || '';
    document.getElementById('param_email').value = user.email || '';
    document.getElementById('param_display_name').value = user.display_name || '';
    document.getElementById('param_avatar_url').value = user.avatar_url || '';
    showOnly('view-settings');
}
function updateUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr)
        return;
    const user = JSON.parse(userStr);
    const data = {
        first_name: document.getElementById('param_first_name').value,
        last_name: document.getElementById('param_last_name').value,
        email: document.getElementById('param_email').value,
        display_name: document.getElementById('param_display_name').value,
        avatar_url: document.getElementById('param_avatar_url').value
    };
    fetch(`/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then((res) => __awaiter(this, void 0, void 0, function* () {
        if (!res.ok) {
            const text = yield res.text();
            throw new Error(`Erreur HTTP ${res.status} : ${text}`);
        }
        return res.json();
    }))
        .then(updatedUser => {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        document.getElementById('logUpdateUser').textContent = '✅ Modifications enregistrées.';
        setLoggedInUser(updatedUser);
    })
        .catch(err => {
        document.getElementById('logUpdateUser').textContent = 'Erreur : ' + err.message;
    });
}
function showLocalGame() {
    showOnly('view-game');
}
function showOnly(viewId) {
    const views = [
        'view-home',
        'view-game',
        'view-register',
        'view-login',
        'view-settings',
        'view-edit-settings',
        'view-profile'
    ];
    views.forEach(id => {
        const el = document.getElementById(id);
        if (el)
            el.style.display = (id === viewId) ? 'block' : 'none';
    });
}
function showSettingsSubView(subViewId) {
    const subViews = ['view-edit-settings', 'view-profile'];
    subViews.forEach(id => {
        const el = document.getElementById(id);
        if (el)
            el.style.display = (id === subViewId) ? 'block' : 'none';
    });
}
function formatDate(isoString) {
    if (!isoString)
        return 'non défini';
    const date = new Date(isoString);
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
function loadProfile() {
    const stored = localStorage.getItem('user');
    if (!stored)
        return;
    const user = JSON.parse(stored);
    fetch(`/users/${user.id}`)
        .then(res => {
        if (!res.ok)
            throw new Error('Impossible de charger le profil');
        return res.json();
    })
        .then(user => {
        var _a, _b;
        const statusIndicator = document.getElementById('profile_status');
        statusIndicator.textContent = user.is_online ? 'En ligne' : 'Hors ligne';
        statusIndicator.className = 'status-badge absolute top-3 right-3 ' + (user.is_online ? 'online' : 'offline');
        const updateText = (id, value) => {
            const el = document.getElementById(id);
            if (el)
                el.innerText = value;
        };
        document.getElementById('profile_avatar').src = user.avatar_url || '/default.png';
        updateText('profile_display_name', user.display_name || '');
        updateText('profile_email', user.email || '');
        updateText('profile_username', user.username || '');
        updateText('profile_first_name', user.first_name || '');
        updateText('profile_last_name', user.last_name || '');
        updateText('profile_created_at', formatDate(user.created_at));
        updateText('profile_last_seen', formatDate(user.last_seen));
        updateText('profile_wins', String((_a = user.wins) !== null && _a !== void 0 ? _a : 0));
        updateText('profile_losses', String((_b = user.losses) !== null && _b !== void 0 ? _b : 0));
    })
        .catch(err => {
        console.error('Erreur profil :', err);
    });
}
document.addEventListener('DOMContentLoaded', () => {
    const card = document.querySelector('.card-3d');
    if (!card)
        return;
    card.addEventListener('click', () => {
        card.classList.toggle('flipped');
    });
});
