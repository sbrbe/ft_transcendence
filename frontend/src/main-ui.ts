interface User {
	id: number;
	first_name: string;
	last_name: string;
	username: string;
	password?: string;
	email: string;
	display_name: string;
	avatar_url?: string;
	wins?: number;
	losses?: number;
	last_seen?: string;
	created_at?: string;
	is_online?: boolean;
  }
  
  function toggleRegister(): void {
	showOnly('view-register');
  }
  
  function sendUser(): void {
	const data = {
	  first_name: (document.getElementById('first_name') as HTMLInputElement).value,
	  last_name: (document.getElementById('last_name') as HTMLInputElement).value,
	  username: (document.getElementById('username') as HTMLInputElement).value,
	  password: (document.getElementById('password') as HTMLInputElement).value,
	  email: (document.getElementById('email') as HTMLInputElement).value,
	  display_name: (document.getElementById('display_name') as HTMLInputElement).value,
	};
  
	fetch('/sign-up', {
	  method: 'POST',
	  headers: { 'Content-Type': 'application/json' },
	  body: JSON.stringify(data)
	})
	  .then(async res => {
		if (!res.ok) {
		  const text = await res.text();
		  throw new Error(`Erreur HTTP ${res.status} : ${text}`);
		}
		return res.json() as Promise<User>;
	  })
	  .then(user => {
		setLoggedInUser(user);
		(document.getElementById('logUser') as HTMLElement).textContent = JSON.stringify(user, null, 2);
		(document.getElementById('view-register') as HTMLElement).style.display = 'none';
	  })
	  .catch(err => {
		(document.getElementById('logUser') as HTMLElement).textContent = 'Erreur : ' + err.message;
	  });
  
	['first_name', 'last_name', 'username', 'password', 'email', 'display_name'].forEach(id => {
	  (document.getElementById(id) as HTMLInputElement).value = '';
	});
  }
  
  function setLoggedInUser(user: User): void {
	localStorage.setItem('user', JSON.stringify(user));
	(document.getElementById('nav-public') as HTMLElement).style.display = 'none';
	(document.getElementById('nav-user') as HTMLElement).style.display = 'block';
	(document.getElementById('nav-displayname') as HTMLElement).textContent = `👤 ${user.display_name}`;
  }
  
  function logout(): void {
	const userStr = localStorage.getItem('user');
	if (!userStr) return;
	const user: User = JSON.parse(userStr);
  
	fetch('/logout', {
	  method: 'POST',
	  headers: { 'Content-Type': 'application/json' },
	  body: JSON.stringify({ id: user.id })
	})
	  .then(() => {
		localStorage.removeItem('user');
		(document.getElementById('nav-public') as HTMLElement).style.display = 'block';
		(document.getElementById('nav-user') as HTMLElement).style.display = 'none';
		(document.getElementById('nav-displayname') as HTMLElement).textContent = '';
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
	  const user = JSON.parse(savedUser) as User;
	  setLoggedInUser(user);
	}
  });
  
  function toggleLogin(): void {
	showOnly('view-login');
  }
  
  function loginUser(): void {
	const data = {
	  email: (document.getElementById('login_email') as HTMLInputElement).value,
	  password: (document.getElementById('login_password') as HTMLInputElement).value
	};
  
	fetch('/login', {
	  method: 'POST',
	  headers: { 'Content-Type': 'application/json' },
	  body: JSON.stringify(data)
	})
	  .then(async res => {
		if (!res.ok) {
		  const text = await res.text();
		  throw new Error(`Erreur HTTP ${res.status} : ${text}`);
		}
		return res.json() as Promise<User>;
	  })
	  .then(user => {
		setLoggedInUser(user);
		(document.getElementById('view-login') as HTMLElement).style.display = 'none';
		(document.getElementById('logLogin') as HTMLElement).textContent = '';
	  })
	  .catch(err => {
		(document.getElementById('logLogin') as HTMLElement).textContent = 'Erreur : ' + err.message;
	  });
  }
  
  function openSettings(): void {
	const userStr = localStorage.getItem('user');
	if (!userStr) return;
	const user = JSON.parse(userStr) as User;
  
	(document.getElementById('param_first_name') as HTMLInputElement).value = user.first_name || '';
	(document.getElementById('param_last_name') as HTMLInputElement).value = user.last_name || '';
	(document.getElementById('param_email') as HTMLInputElement).value = user.email || '';
	(document.getElementById('param_display_name') as HTMLInputElement).value = user.display_name || '';
	(document.getElementById('param_avatar_url') as HTMLInputElement).value = user.avatar_url || '';
  
	showOnly('view-settings');
  }
  
  function updateUser(): void {
	const userStr = localStorage.getItem('user');
	if (!userStr) return;
	const user = JSON.parse(userStr) as User;
  
	const data = {
	  first_name: (document.getElementById('param_first_name') as HTMLInputElement).value,
	  last_name: (document.getElementById('param_last_name') as HTMLInputElement).value,
	  email: (document.getElementById('param_email') as HTMLInputElement).value,
	  display_name: (document.getElementById('param_display_name') as HTMLInputElement).value,
	  avatar_url: (document.getElementById('param_avatar_url') as HTMLInputElement).value
	};
  
	fetch(`/users/${user.id}`, {
	  method: 'PUT',
	  headers: { 'Content-Type': 'application/json' },
	  body: JSON.stringify(data)
	})
	  .then(async res => {
		if (!res.ok) {
		  const text = await res.text();
		  throw new Error(`Erreur HTTP ${res.status} : ${text}`);
		}
		return res.json() as Promise<User>;
	  })
	  .then(updatedUser => {
		localStorage.setItem('user', JSON.stringify(updatedUser));
		(document.getElementById('logUpdateUser') as HTMLElement).textContent = '✅ Modifications enregistrées.';
		setLoggedInUser(updatedUser);
	  })
	  .catch(err => {
		(document.getElementById('logUpdateUser') as HTMLElement).textContent = 'Erreur : ' + err.message;
	  });
  }
  
  function showLocalGame(): void {
	showOnly('view-game');
  }
  
  function showOnly(viewId: string): void {
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
	  if (el) el.style.display = (id === viewId) ? 'block' : 'none';
	});
  }
  
  function showSettingsSubView(subViewId: string): void {
	const subViews = ['view-edit-settings', 'view-profile'];
	subViews.forEach(id => {
	  const el = document.getElementById(id);
	  if (el) el.style.display = (id === subViewId) ? 'block' : 'none';
	});
  }
  
  function formatDate(isoString: string | null | undefined): string {
	if (!isoString) return 'non défini';
	const date = new Date(isoString);
	return date.toLocaleDateString('fr-FR', {
	  year: 'numeric',
	  month: 'long',
	  day: 'numeric'
	});
  }
  
  function loadProfile(): void {
	const stored = localStorage.getItem('user');
	if (!stored) return;
	const user = JSON.parse(stored) as User;
  
	fetch(`/users/${user.id}`)
	  .then(res => {
		if (!res.ok) throw new Error('Impossible de charger le profil');
		return res.json() as Promise<User>;
	  })
	  .then(user => {
		const statusIndicator = document.getElementById('profile_status')!;
		statusIndicator.textContent = user.is_online ? 'En ligne' : 'Hors ligne';
		statusIndicator.className = 'status-badge absolute top-3 right-3 ' + (user.is_online ? 'online' : 'offline');
  
		const updateText = (id: string, value: string) => {
		  const el = document.getElementById(id);
		  if (el) el.innerText = value;
		};
  
		(document.getElementById('profile_avatar') as HTMLImageElement).src = user.avatar_url || '/default.png';
		updateText('profile_display_name', user.display_name || '');
		updateText('profile_email', user.email || '');
		updateText('profile_username', user.username || '');
		updateText('profile_first_name', user.first_name || '');
		updateText('profile_last_name', user.last_name || '');
		updateText('profile_created_at', formatDate(user.created_at));
		updateText('profile_last_seen', formatDate(user.last_seen));
		updateText('profile_wins', String(user.wins ?? 0));
		updateText('profile_losses', String(user.losses ?? 0));
	  })
	  .catch(err => {
		console.error('Erreur profil :', err);
	  });
  }
  
  document.addEventListener('DOMContentLoaded', () => {
	const card = document.querySelector('.card-3d');
	if (!card) return;
  
	card.addEventListener('click', () => {
	  card.classList.toggle('flipped');
	});
  });
  