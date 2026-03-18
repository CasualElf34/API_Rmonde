const API_URL = 'http://localhost:8000';
let state = {
    token: localStorage.getItem('token') || null,
    user: null,
    recipes: [],
    favorites: {},
    ratings: {},
    activeTab: 'search',
    selectedRecipe: null,
    editingRecipe: null,
    filters: { cuisine: '', dish_type: '', dietary_type: '' }
};

function getRecipeShareUrl(recipeId) {
    return `${window.location.origin}${window.location.pathname}?recipe=${recipeId}`;
}

function renderFooter() {
    return `
        <footer class="app-footer">
            <div class="footer-inner">
                <div class="footer-brand">
                    <span class="footer-logo" aria-hidden="true">WR</span>
                    <div class="footer-text">
                        <strong>World Recipes</strong>
                        <small>API Recette du Monde • 2026</small>
                    </div>
                </div>
                <p>Découvrez, partagez et cuisinez des recettes internationales.</p>
            </div>
        </footer>
    `;
}

async function fetchUser() {
    if (!state.token) return;
    try {
        const res = await fetch(`${API_URL}/api/users/me`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        if (res.ok) state.user = await res.json();
    } catch (e) { console.error(e); }
}

async function fetchRecipes() {
    try {
        const params = new URLSearchParams(state.filters);
        const res = await fetch(`${API_URL}/api/recipes/?${params}`);
        if (res.ok) {
            state.recipes = await res.json();
        }
    } catch (e) { console.error(e); }
}

async function fetchFavorites() {
    if (!state.token) {
        state.favorites = {};
        return;
    }

    try {
        const res = await fetch(`${API_URL}/api/user/favorites`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });

        if (!res.ok) return;

        const favoriteRecipes = await res.json();
        const favoriteIds = new Set(favoriteRecipes.map((recipe) => recipe.id));
        const nextFavorites = {};

        for (const recipe of state.recipes) {
            nextFavorites[recipe.id] = favoriteIds.has(recipe.id);
        }

        state.favorites = nextFavorites;
    } catch (e) {
        console.error(e);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    try {
        const res = await fetch(`${API_URL}/api/auth/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (res.ok) {
            const data = await res.json();
            state.token = data.access_token;
            localStorage.setItem('token', state.token);
            await Promise.all([fetchUser(), fetchFavorites()]);
            state.activeTab = 'search';
            render();
        } else {
            alert('Email ou mot de passe incorrect');
        }
    } catch (e) { alert('Erreur'); }
}

async function handleRegister(e) {
    e.preventDefault();
    const data = {
        username: e.target.username.value,
        email: e.target.email.value,
        password: e.target.password.value,
        full_name: e.target.fullName.value,
    };
    try {
        const res = await fetch(`${API_URL}/api/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            alert('Inscrit! Connectez-vous');
            state.activeTab = 'login';
            render();
        } else {
            const err = await res.json();
            alert(err.detail || 'Erreur');
        }
    } catch (e) { alert('Erreur'); }
}

async function handleCreateRecipe(e) {
    e.preventDefault();
    const recipe = {
        name: e.target.name.value,
        description: e.target.description.value,
        ingredients: e.target.ingredients.value,
        instructions: e.target.instructions.value,
        cuisine: e.target.cuisine.value || 'Autre',
        dish_type: e.target.dish_type.value || 'Plat',
        dietary_type: e.target.dietary_type.value || 'Normal',
        difficulty: e.target.difficulty.value || 'Moyen',
        prep_time: parseInt(e.target.prep_time.value) || 0,
        cook_time: parseInt(e.target.cook_time.value) || 0,
        servings: parseInt(e.target.servings.value) || 4
    };
    try {
        const res = await fetch(`${API_URL}/api/recipes/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify(recipe)
        });
        if (res.ok) {
            alert('Recette créée!');
            await fetchRecipes();
            state.editingRecipe = null;
            state.activeTab = 'search';
            e.target.reset();
            render();
        }
    } catch (e) { alert('Erreur'); }
}

async function handleUpdateRecipe(e) {
    e.preventDefault();
    if (!state.editingRecipe) return;

    const recipe = {
        name: e.target.name.value,
        description: e.target.description.value,
        ingredients: e.target.ingredients.value,
        instructions: e.target.instructions.value,
        cuisine: e.target.cuisine.value || 'Autre',
        dish_type: e.target.dish_type.value || 'Plat',
        dietary_type: e.target.dietary_type.value || 'Normal',
        difficulty: e.target.difficulty.value || 'Moyen',
        prep_time: parseInt(e.target.prep_time.value) || 0,
        cook_time: parseInt(e.target.cook_time.value) || 0,
        servings: parseInt(e.target.servings.value) || 4
    };

    try {
        const res = await fetch(`${API_URL}/api/recipes/${state.editingRecipe}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify(recipe)
        });

        if (res.ok) {
            alert('Recette mise à jour!');
            await fetchRecipes();
            state.editingRecipe = null;
            state.activeTab = 'search';
            render();
        } else {
            const err = await res.json();
            alert(err.detail || 'Erreur mise à jour');
        }
    } catch (e) { alert('Erreur'); }
}

async function handleDeleteRecipe(recipeId) {
    if (!state.token) { alert('Connectez-vous'); return; }
    const confirmed = confirm('Supprimer cette recette ?');
    if (!confirmed) return;

    try {
        const res = await fetch(`${API_URL}/api/recipes/${recipeId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${state.token}` }
        });

        if (res.ok) {
            alert('Recette supprimée');
            state.selectedRecipe = null;
            if (state.editingRecipe === recipeId) state.editingRecipe = null;
            await fetchRecipes();
            render();
        } else {
            const err = await res.json();
            alert(err.detail || 'Erreur suppression');
        }
    } catch (e) { alert('Erreur'); }
}

function startRecipeEdit(recipeId) {
    state.editingRecipe = recipeId;
    state.selectedRecipe = null;
    state.activeTab = 'create';
    render();
}

async function handleShareRecipe(recipeId) {
    const recipe = state.recipes.find(r => r.id === recipeId);
    const shareUrl = getRecipeShareUrl(recipeId);

    try {
        if (navigator.share) {
            await navigator.share({
                title: recipe?.name || 'Recette du monde',
                text: `Découvre cette recette: ${recipe?.name || ''}`,
                url: shareUrl
            });
        } else if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(shareUrl);
            alert('Lien de partage copié');
        } else {
            prompt('Copiez ce lien:', shareUrl);
        }
    } catch (e) {
        alert('Partage annulé ou indisponible');
    }
}

async function handleUpdateProfile(e) {
    e.preventDefault();
    if (!state.token) return;

    const payload = {
        full_name: e.target.full_name.value,
        email: e.target.email.value,
        username: e.target.username.value
    };

    const password = e.target.password.value;
    if (password) payload.password = password;

    try {
        const res = await fetch(`${API_URL}/api/users/me`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            state.user = await res.json();
            alert('Profil mis à jour');
            e.target.password.value = '';
            render();
        } else {
            const err = await res.json();
            alert(err.detail || 'Erreur profil');
        }
    } catch (e) { alert('Erreur'); }
}

async function handleToggleFavorite(recipeId) {
    if (!state.token) { alert('Connectez-vous'); return; }
    try {
        const isFav = state.favorites[recipeId];
        const method = isFav ? 'DELETE' : 'POST';
        await fetch(`${API_URL}/api/user/favorites/${recipeId}`, {
            method,
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        state.favorites[recipeId] = !isFav;
        render();
    } catch (e) { alert('Erreur'); }
}

async function handleRate(recipeId, rating) {
    if (!state.token) { alert('Connectez-vous'); return; }
    try {
        await fetch(`${API_URL}/api/user/rate/${recipeId}?rating=${rating}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        state.ratings[recipeId] = rating;
        render();
    } catch (e) { alert('Erreur'); }
}

function renderStars(recipeId) {
    const rating = state.ratings[recipeId] || 0;
    let html = `<div class="star-rating" data-recipe="${recipeId}">`;
    for (let i = 1; i <= 5; i++) {
        const filled = i <= rating ? 'filled' : '';
        html += `<button type="button" class="star ${filled}" onclick="handleRate(${recipeId}, ${i})" aria-label="Noter ${i} sur 5" title="Noter ${i} sur 5">★</button>`;
    }
    html += '</div>';
    return html;
}

function renderRecipeCard(recipe) {
    const isFav = state.favorites[recipe.id] ? 'active' : '';
    return `
        <div class="recipe-card" onclick="state.selectedRecipe = ${recipe.id}; render()">
            <div class="recipe-header">
                <div class="recipe-title-fav">
                    <h3>${recipe.name}</h3>
                    <button type="button" class="fav-btn ${isFav}" onclick="event.stopPropagation(); handleToggleFavorite(${recipe.id})" aria-label="Ajouter ou retirer des favoris" title="Favori">❤️</button>
                </div>
                <div class="recipe-meta">
                    <span>🌍 ${recipe.cuisine}</span>
                    <span>🍳 ${recipe.dish_type}</span>
                </div>
            </div>
            <div class="recipe-body">
                <p class="recipe-description">${recipe.description}</p>
                <div class="recipe-details">
                    <div>⏱️ ${recipe.prep_time + recipe.cook_time}min</div>
                    <div>👥 ${recipe.servings}</div>
                    <div>📊 ${recipe.difficulty}</div>
                </div>
                ${renderStars(recipe.id)}
            </div>
        </div>
    `;
}

async function render() {
    const app = document.getElementById('app');

    if (!state.token) {
        app.innerHTML = `
            <header>
                <h1>🌍 World Recipes</h1>
                <p>Découvrez et partagez les meilleures recettes du monde</p>
            </header>
            <div class="tabs">
                <button class="tab-btn ${state.activeTab === 'login' ? 'active' : ''}" onclick="state.activeTab='login'; render()">🔐 Connexion</button>
                <button class="tab-btn ${state.activeTab === 'register' ? 'active' : ''}" onclick="state.activeTab='register'; render()">✍️ Inscription</button>
            </div>
            ${state.activeTab === 'login' ? renderLoginForm() : renderRegisterForm()}
            ${renderFooter()}
        `;
        return;
    }

    let content = '';
    if (state.activeTab === 'search') {
        content = `
            <div class="search-bar">
                <input type="text" id="searchInput" placeholder="Rechercher..." aria-label="Rechercher une recette">
                <button type="button" onclick="state.filters.name = document.getElementById('searchInput').value; fetchRecipes().then(render)" aria-label="Lancer la recherche" title="Rechercher">🔍</button>
            </div>
            <div class="filters">
                <select onchange="state.filters.cuisine = this.value; fetchRecipes().then(render)" aria-label="Filtrer par cuisine">
                    <option value="">Cuisines</option>
                    <option value="Française">Française</option>
                    <option value="Italienne">Italienne</option>
                    <option value="Asiatique">Asiatique</option>
                </select>
                <select onchange="state.filters.dish_type = this.value; fetchRecipes().then(render)" aria-label="Filtrer par type">
                    <option value="">Types</option>
                    <option value="Entrée">Entrée</option>
                    <option value="Plat">Plat</option>
                    <option value="Dessert">Dessert</option>
                </select>
                <select onchange="state.filters.dietary_type = this.value; fetchRecipes().then(render)" aria-label="Filtrer par régime">
                    <option value="">Régimes</option>
                    <option value="Végétarien">Végétarien</option>
                    <option value="Sans gluten">Sans gluten</option>
                    <option value="Normal">Normal</option>
                </select>
            </div>
            <div class="recipe-grid">
                ${state.recipes.map(renderRecipeCard).join('')}
            </div>
        `;
    } else if (state.activeTab === 'create') {
        content = renderCreateForm();
    } else if (state.activeTab === 'profile') {
        content = `
            <div class="profile-section">
                <h2>Mon Profil 👤</h2>
                <form class="recipe-form" onsubmit="handleUpdateProfile(event)">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Nom complet</label>
                            <input type="text" name="full_name" value="${state.user?.full_name || ''}">
                        </div>
                        <div class="form-group">
                            <label>Nom d'utilisateur</label>
                            <input type="text" name="username" value="${state.user?.username || ''}" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" name="email" value="${state.user?.email || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Nouveau mot de passe (optionnel)</label>
                            <input type="password" name="password" placeholder="Laisser vide pour ne pas changer">
                        </div>
                    </div>
                    <button type="submit">Enregistrer</button>
                </form>
            </div>
        `;
    } else if (state.activeTab === 'favorites') {
        const favs = state.recipes.filter(r => state.favorites[r.id]);
        content = `
            <h2>Mes Favoris ❤️</h2>
            <div class="recipe-grid">
                ${favs.length > 0 ? favs.map(renderRecipeCard).join('') : '<p>Aucun favori</p>'}
            </div>
        `;
    }

    app.innerHTML = `
        <header>
            <h1>🌍 World Recipes</h1>
            <p>Découvrez et partagez les meilleures recettes du monde</p>
        </header>
        <div class="user-info">
            <span>✅ ${state.user?.username}</span>
            <button class="logout-btn" onclick="state.token=null; localStorage.removeItem('token'); state.activeTab='search'; state.selectedRecipe=null; state.editingRecipe=null; render()">Déconnexion</button>
        </div>
        <div class="tabs">
            <button type="button" class="tab-btn ${state.activeTab === 'search' ? 'active' : ''}" onclick="state.activeTab='search'; render()" aria-label="Ouvrir recherche" title="Recherche">🔍</button>
            <button type="button" class="tab-btn ${state.activeTab === 'favorites' ? 'active' : ''}" onclick="state.activeTab='favorites'; render()" aria-label="Ouvrir favoris" title="Favoris">❤️</button>
            <button type="button" class="tab-btn ${state.activeTab === 'create' ? 'active' : ''}" onclick="state.activeTab='create'; render()" aria-label="Ouvrir création" title="Ajouter">➕</button>
            <button type="button" class="tab-btn ${state.activeTab === 'profile' ? 'active' : ''}" onclick="state.activeTab='profile'; render()" aria-label="Ouvrir profil" title="Profil">👤</button>
        </div>
        <div>${content}</div>
        ${renderFooter()}
        ${state.selectedRecipe ? renderModal() : ''}
    `;
}

function renderLoginForm() {
    return `
        <form class="auth-form" onsubmit="handleLogin(event)">
            <h2>Se Connecter</h2>
            <div class="form-group">
                <label>Nom d'utilisateur</label>
                <input type="text" name="username" required>
            </div>
            <div class="form-group">
                <label>Mot de passe</label>
                <input type="password" name="password" required>
            </div>
            <button type="submit">Se connecter</button>
        </form>
    `;
}

function renderRegisterForm() {
    return `
        <form class="auth-form" onsubmit="handleRegister(event)">
            <h2>S'inscrire</h2>
            <div class="form-group">
                <label>Nom complet</label>
                <input type="text" name="fullName" required>
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" name="email" required>
            </div>
            <div class="form-group">
                <label>Nom d'utilisateur</label>
                <input type="text" name="username" required>
            </div>
            <div class="form-group">
                <label>Mot de passe</label>
                <input type="password" name="password" required>
            </div>
            <button type="submit">S'inscrire</button>
        </form>
    `;
}

function renderCreateForm() {
    const recipeToEdit = state.recipes.find(r => r.id === state.editingRecipe);
    const isEditMode = !!recipeToEdit;
    return `
        <form class="recipe-form" onsubmit="${isEditMode ? 'handleUpdateRecipe(event)' : 'handleCreateRecipe(event)'}">
            <h2>${isEditMode ? 'Modifier la Recette ✏️' : 'Ajouter une Recette ➕'}</h2>
            <div class="form-row">
                <div class="form-group"><label>Nom *</label><input type="text" name="name" value="${recipeToEdit?.name || ''}" required></div>
                <div class="form-group"><label>Cuisine</label><input type="text" name="cuisine" value="${recipeToEdit?.cuisine || ''}" placeholder="Française"></div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Type</label>
                    <select name="dish_type">
                        <option value="Plat" ${recipeToEdit?.dish_type === 'Plat' || !recipeToEdit ? 'selected' : ''}>Plat</option>
                        <option value="Entrée" ${recipeToEdit?.dish_type === 'Entrée' ? 'selected' : ''}>Entrée</option>
                        <option value="Dessert" ${recipeToEdit?.dish_type === 'Dessert' ? 'selected' : ''}>Dessert</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Régime</label>
                    <select name="dietary_type">
                        <option value="Normal" ${recipeToEdit?.dietary_type === 'Normal' || !recipeToEdit ? 'selected' : ''}>Normal</option>
                        <option value="Végétarien" ${recipeToEdit?.dietary_type === 'Végétarien' ? 'selected' : ''}>Végétarien</option>
                        <option value="Sans gluten" ${recipeToEdit?.dietary_type === 'Sans gluten' ? 'selected' : ''}>Sans gluten</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Difficulté</label>
                    <select name="difficulty">
                        <option value="Facile" ${recipeToEdit?.difficulty === 'Facile' ? 'selected' : ''}>Facile</option>
                        <option value="Moyen" ${recipeToEdit?.difficulty === 'Moyen' || !recipeToEdit ? 'selected' : ''}>Moyen</option>
                        <option value="Difficile" ${recipeToEdit?.difficulty === 'Difficile' ? 'selected' : ''}>Difficile</option>
                    </select>
                </div>
            </div>
            <div class="form-group"><label>Description *</label><textarea name="description" required>${recipeToEdit?.description || ''}</textarea></div>
            <div class="form-group"><label>Ingrédients *</label><textarea name="ingredients" placeholder="- Ingrédient 1\n- Ingrédient 2" required>${recipeToEdit?.ingredients || ''}</textarea></div>
            <div class="form-group"><label>Instructions *</label><textarea name="instructions" placeholder="1. Étape 1\n2. Étape 2" required>${recipeToEdit?.instructions || ''}</textarea></div>
            <div class="form-row">
                <div class="form-group"><label>Préparation (min)</label><input type="number" name="prep_time" min="0" value="${recipeToEdit?.prep_time ?? 15}"></div>
                <div class="form-group"><label>Cuisson (min)</label><input type="number" name="cook_time" min="0" value="${recipeToEdit?.cook_time ?? 30}"></div>
                <div class="form-group"><label>Portions</label><input type="number" name="servings" min="1" value="${recipeToEdit?.servings ?? 4}"></div>
            </div>
            <button type="submit">${isEditMode ? 'Mettre à jour' : 'Ajouter'}</button>
            ${isEditMode ? '<button type="button" class="modal-close-btn" onclick="state.editingRecipe=null; state.activeTab=\'search\'; render()">Annuler</button>' : ''}
        </form>
    `;
}

function renderModal() {
    const recipe = state.recipes.find(r => r.id === state.selectedRecipe);
    if (!recipe) return '';
    const isFav = state.favorites[recipe.id] ? 'active' : '';
    return `
        <div class="modal-overlay" onclick="if(event.target === this) { state.selectedRecipe = null; render(); }">
            <div class="modal-content">
                <button type="button" class="modal-close" onclick="state.selectedRecipe = null; render()" aria-label="Fermer la fenêtre" title="Fermer">✕</button>
                <h2>${recipe.name}</h2>
                <p class="modal-cuisine">🌍 ${recipe.cuisine} | 🍳 ${recipe.dish_type} | 📊 ${recipe.difficulty}</p>
                <div class="modal-section">
                    <h3>📝 Description</h3>
                    <p>${recipe.description}</p>
                </div>
                <div class="modal-section">
                    <h3>⏱️ Temps & Portions</h3>
                    <div class="info-grid">
                        <div><strong>Préparation:</strong> ${recipe.prep_time} min</div>
                        <div><strong>Cuisson:</strong> ${recipe.cook_time} min</div>
                        <div><strong>Total:</strong> ${recipe.prep_time + recipe.cook_time} min</div>
                        <div><strong>Portions:</strong> ${recipe.servings}</div>
                    </div>
                </div>
                <div class="modal-section">
                    <h3>🥘 Ingrédients</h3>
                    <p style="white-space: pre-wrap;">${recipe.ingredients}</p>
                </div>
                <div class="modal-section">
                    <h3>👨‍🍳 Instructions</h3>
                    <p style="white-space: pre-wrap;">${recipe.instructions}</p>
                </div>
                <div class="modal-rating">
                    <strong>Votre note:</strong>
                    ${renderStars(recipe.id)}
                </div>
                <div class="modal-actions">
                    <button type="button" class="fav-btn ${isFav}" onclick="handleToggleFavorite(${recipe.id})" aria-label="Ajouter ou retirer des favoris" title="Favori">
                        ${isFav === 'active' ? '❤️ Retiré' : '❤️ Ajouter'}
                    </button>
                    <button type="button" class="modal-close-btn" onclick="startRecipeEdit(${recipe.id})">✏️ Modifier</button>
                    <button type="button" class="modal-close-btn" onclick="handleDeleteRecipe(${recipe.id})">🗑️ Supprimer</button>
                    <button type="button" class="modal-close-btn" onclick="handleShareRecipe(${recipe.id})">🔗 Partager</button>
                    <button type="button" class="modal-close-btn" onclick="state.selectedRecipe = null; render()">Fermer</button>
                </div>
            </div>
        </div>
    `;
}

// Init
(async () => {
    await Promise.all([fetchRecipes(), fetchUser()]);
    await fetchFavorites();

    const params = new URLSearchParams(window.location.search);
    const sharedRecipeId = parseInt(params.get('recipe'));
    if (!Number.isNaN(sharedRecipeId) && state.recipes.some(r => r.id === sharedRecipeId)) {
        state.selectedRecipe = sharedRecipeId;
    }

    render();
})();
