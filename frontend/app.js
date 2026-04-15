const isLocalFrontend = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const API_URL = isLocalFrontend && window.location.port === '3000'
    ? 'http://localhost:8000'
    : window.location.origin;
const IMAGE_STORAGE_KEY = 'recipe_images';

function loadRecipeImages() {
    try {
        return JSON.parse(localStorage.getItem(IMAGE_STORAGE_KEY) || '{}');
    } catch (error) {
        return {};
    }
}

let state = {
    token: localStorage.getItem('token') || null,
    user: null,
    recipes: [],
    favorites: {},
    ratings: {},
    recipeImages: loadRecipeImages(),
    activeTab: 'search',
    selectedRecipe: null,
    editingRecipe: null,
    googleClientId: null,
    filters: { name: '', cuisine: '', dish_type: '', dietary_type: '', ingredients: '' }
};

function persistRecipeImages() {
    localStorage.setItem(IMAGE_STORAGE_KEY, JSON.stringify(state.recipeImages));
}

function setRecipeImage(recipeId, imageUrl) {
    if (!recipeId) return;
    const nextUrl = (imageUrl || '').trim();
    if (nextUrl) {
        state.recipeImages[recipeId] = nextUrl;
    } else {
        delete state.recipeImages[recipeId];
    }
    persistRecipeImages();
}

const FOOD_IMAGES = {
    'coq au vin':         'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=900&q=80',
    'carbonara':          'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=900&q=80',
    'sushi':              'https://images.unsplash.com/photo-1553621042-f6e147245754?w=900&q=80',
    'tacos':              'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=900&q=80',
    'buddha':             'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900&q=80',
    'soupe':              'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=900&q=80',
    'oignon':             'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=900&q=80',
    'tiramisu':           'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=900&q=80',
    'pad thai':           'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=900&q=80',
    'baguette':           'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=900&q=80',
    'pizza':              'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900&q=80',
    'burger':             'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900&q=80',
    'salade':             'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900&q=80',
    'risotto':            'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=900&q=80',
    'poulet':             'https://images.unsplash.com/photo-1598103442097-8b74394b95c3?w=900&q=80',
    'ramen':              'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=900&q=80',
    'tarte':              'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=900&q=80',
    'crêpe':              'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=900&q=80',
    'crepe':              'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=900&q=80',
    'curry':              'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=900&q=80',
    'pâtes':              'https://images.unsplash.com/photo-1551183053-bf91798d773a?w=900&q=80',
    'pates':              'https://images.unsplash.com/photo-1551183053-bf91798d773a?w=900&q=80',
};

function getRecipeImage(recipe) {
    if (state.recipeImages[recipe.id]) return state.recipeImages[recipe.id];
    const nameLower = (recipe.name || '').toLowerCase();
    for (const [keyword, url] of Object.entries(FOOD_IMAGES)) {
        if (nameLower.includes(keyword)) return url;
    }
    // Fallback: use a generic food photo with consistent seed
    const foodFallbacks = [
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&q=80',
        'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=900&q=80',
        'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=900&q=80',
        'https://images.unsplash.com/photo-1476224203421-9ac39bcb3df1?w=900&q=80',
    ];
    return foodFallbacks[recipe.id % foodFallbacks.length];
}

function getRecipeShareUrl(recipeId) {
    return `${window.location.origin}${window.location.pathname}?recipe=${recipeId}`;
}

function logout() {
    state.token = null;
    state.user = null;
    state.favorites = {};
    state.ratings = {};
    state.selectedRecipe = null;
    state.editingRecipe = null;
    state.activeTab = 'search';
    localStorage.removeItem('token');
    render();
}

function renderFooter() {
    return `
        <footer class="site-footer">
            <div class="footer-inner">
                <div>
                    <h3>World Recipes</h3>
                    <p>Cuisines du monde, portées à votre table.</p>
                </div>
                <div class="footer-meta">
                    <span>Propulsé par la passion du goût</span>
                    <span>© 2026 Gourmet Edition</span>
                </div>
            </div>
        </footer>
    `;
}

function renderHero(isAuth) {
    if (!isAuth) {
        return `
            <header class="hero animate-fade">
                <div class="hero-content">
                    <span class="hero-kicker">Cuisine Authentique</span>
                    <h1>🍽️ World Recipes</h1>
                    <p>Voyagez à travers les saveurs du monde entier. Découvrez, cuisinez et partagez des recettes d'exception.</p>
                    <div class="hero-actions">
                        <button class="btn btn-primary" onclick="state.activeTab = 'login'; render()">Commencer l'aventure</button>
                    </div>
                </div>
            </header>
        `;
    }

    return `
        <header class="hero hero-auth animate-fade">
            <div class="hero-content">
                <span class="hero-kicker">Ravi de vous revoir, ${state.user?.username || 'Gourmet'} !</span>
                <h1>🌍 Votre carnet de voyage culinaire</h1>
                <p>Gérez vos pépites, créez de nouvelles inspirations et explorez le monde.</p>
            </div>
            <button class="btn btn-danger" type="button" onclick="logout()">Se déconnecter</button>
        </header>
    `;
}

async function fetchUser() {
    if (!state.token) return;
    try {
        const res = await fetch(`${API_URL}/api/users/me`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        if (res.ok) {
            state.user = await res.json();
        } else if (res.status === 401) {
            // Vérifie si le token est expiré côté client avant de déconnecter
            try {
                const payload = JSON.parse(atob(state.token.split('.')[1]));
                const isExpired = payload.exp && Date.now() / 1000 > payload.exp;
                if (isExpired) {
                    // Token vraiment expiré → déconnexion propre
                    state.token = null;
                    localStorage.removeItem('token');
                }
                // Sinon (cold start Vercel, user absent de la DB) → on garde le token
            } catch {
                // JWT malformé → déconnecter
                state.token = null;
                localStorage.removeItem('token');
            }
        }
    } catch (error) {
        console.error(error);
    }
}

async function fetchRecipes() {
    try {
        const params = new URLSearchParams(state.filters);
        const res = await fetch(`${API_URL}/api/recipes/?${params}`);
        if (res.ok) {
            state.recipes = await res.json();
        }
    } catch (error) {
        console.error(error);
    }
}

async function fetchAuthConfig() {
    try {
        const res = await fetch(`${API_URL}/api/auth/config`);
        if (res.ok) {
            const config = await res.json();
            state.googleClientId = config.google_client_id;
        }
    } catch (error) {
        console.error('Failed to fetch auth config:', error);
    }
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
    } catch (error) {
        console.error(error);
    }
}

async function fetchRatings() {
    if (!state.token) {
        state.ratings = {};
        return;
    }

    try {
        const res = await fetch(`${API_URL}/api/user/ratings`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });

        if (!res.ok) return;

        // API returns { recipe_id: rating } — convert keys to numbers
        const data = await res.json();
        const ratings = {};
        for (const [recipeId, rating] of Object.entries(data)) {
            ratings[Number(recipeId)] = rating;
        }
        state.ratings = ratings;
    } catch (error) {
        console.error('Failed to fetch ratings:', error);
    }
}

async function handleLogin(event) {
    event.preventDefault();
    const username = event.target.username.value;
    const password = event.target.password.value;

    try {
        const res = await fetch(`${API_URL}/api/auth/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!res.ok) {
            alert('Email ou mot de passe incorrect');
            return;
        }

        const data = await res.json();
        state.token = data.access_token;
        localStorage.setItem('token', state.token);

        await Promise.all([fetchUser(), fetchRecipes()]);
        await fetchFavorites();
        await fetchRatings();

        state.activeTab = 'search';
        render();
    } catch (error) {
        alert('Erreur connexion');
    }
}

async function handleGoogleLogin(response) {
    try {
        const res = await fetch(`${API_URL}/api/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential: response.credential })
        });

        if (!res.ok) {
            const err = await res.json();
            alert(err.detail || 'Erreur Google Auth');
            return;
        }

        const data = await res.json();
        state.token = data.access_token;
        localStorage.setItem('token', state.token);

        await Promise.all([fetchUser(), fetchRecipes()]);
        await fetchFavorites();
        await fetchRatings();

        state.activeTab = 'search';
        render();
    } catch (error) {
        console.error('Google Auth Failed:', error);
        alert('Erreur connexion Google');
    }
}

async function handleRegister(event) {
    event.preventDefault();

    const payload = {
        username: event.target.username.value,
        email: event.target.email.value,
        password: event.target.password.value,
        full_name: event.target.fullName.value,
    };

    try {
        const res = await fetch(`${API_URL}/api/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert('Compte créé, connecte-toi.');
            state.activeTab = 'login';
            render();
            return;
        }

        let errorDetail = `Erreur inscription (${res.status})`;
        const rawBody = await res.text();

        if (rawBody) {
            try {
                const err = JSON.parse(rawBody);
                if (err?.detail) {
                    errorDetail = Array.isArray(err.detail)
                        ? err.detail.map((item) => item.msg || JSON.stringify(item)).join(' | ')
                        : err.detail;
                } else {
                    errorDetail = `${errorDetail} - ${rawBody.slice(0, 180)}`;
                }
            } catch (parseError) {
                errorDetail = `${errorDetail} - ${rawBody.slice(0, 180)}`;
            }
        }

        alert(errorDetail);
    } catch (error) {
        console.error('Register failed:', error);
        alert('Erreur réseau: impossible de contacter l\'API');
    }
}

async function handleCreateRecipe(event) {
    event.preventDefault();

    const imageUrl = event.target.image_url.value;
    const recipe = {
        name: event.target.name.value,
        description: event.target.description.value,
        ingredients: event.target.ingredients.value,
        instructions: event.target.instructions.value,
        cuisine: event.target.cuisine.value || 'Autre',
        dish_type: event.target.dish_type.value || 'Plat',
        dietary_type: event.target.dietary_type.value || 'Normal',
        difficulty: event.target.difficulty.value || 'Moyen',
        prep_time: parseInt(event.target.prep_time.value, 10) || 0,
        cook_time: parseInt(event.target.cook_time.value, 10) || 0,
        servings: parseInt(event.target.servings.value, 10) || 4
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

        if (!res.ok) {
            const err = await res.json();
            alert(err.detail || 'Erreur création');
            return;
        }

        let createdRecipe = null;
        try {
            createdRecipe = await res.json();
        } catch (error) {
            createdRecipe = null;
        }

        await fetchRecipes();
        await fetchFavorites();

        const recipeId = createdRecipe?.id || state.recipes.find((item) => item.name === recipe.name)?.id;
        setRecipeImage(recipeId, imageUrl);

        alert('Recette créée');
        state.editingRecipe = null;
        state.activeTab = 'search';
        event.target.reset();
        render();
    } catch (error) {
        alert('Erreur création');
    }
}

async function handleUpdateRecipe(event) {
    event.preventDefault();
    if (!state.editingRecipe) return;

    const imageUrl = event.target.image_url.value;

    const recipe = {
        name: event.target.name.value,
        description: event.target.description.value,
        ingredients: event.target.ingredients.value,
        instructions: event.target.instructions.value,
        cuisine: event.target.cuisine.value || 'Autre',
        dish_type: event.target.dish_type.value || 'Plat',
        dietary_type: event.target.dietary_type.value || 'Normal',
        difficulty: event.target.difficulty.value || 'Moyen',
        prep_time: parseInt(event.target.prep_time.value, 10) || 0,
        cook_time: parseInt(event.target.cook_time.value, 10) || 0,
        servings: parseInt(event.target.servings.value, 10) || 4
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

        if (!res.ok) {
            const err = await res.json();
            alert(err.detail || 'Erreur mise à jour');
            return;
        }

        setRecipeImage(state.editingRecipe, imageUrl);

        await fetchRecipes();
        await fetchFavorites();

        alert('Recette mise à jour');
        state.editingRecipe = null;
        state.activeTab = 'search';
        render();
    } catch (error) {
        alert('Erreur mise à jour');
    }
}

async function handleDeleteRecipe(recipeId) {
    if (!state.token) {
        alert('Connecte-toi d’abord');
        return;
    }

    if (!confirm('Supprimer cette recette ?')) return;

    try {
        const res = await fetch(`${API_URL}/api/recipes/${recipeId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${state.token}` }
        });

        if (!res.ok) {
            const err = await res.json();
            alert(err.detail || 'Erreur suppression');
            return;
        }

        setRecipeImage(recipeId, '');
        state.selectedRecipe = null;
        if (state.editingRecipe === recipeId) state.editingRecipe = null;

        await fetchRecipes();
        await fetchFavorites();

        alert('Recette supprimée');
        render();
    } catch (error) {
        alert('Erreur suppression');
    }
}

function startRecipeEdit(recipeId) {
    state.editingRecipe = recipeId;
    state.selectedRecipe = null;
    state.activeTab = 'create';
    render();
}

async function handleShareRecipe(recipeId) {
    const recipe = state.recipes.find((item) => item.id === recipeId);
    const shareUrl = getRecipeShareUrl(recipeId);

    try {
        if (navigator.share) {
            await navigator.share({
                title: recipe?.name || 'Recette du monde',
                text: `Découvre cette recette: ${recipe?.name || ''}`,
                url: shareUrl
            });
            return;
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(shareUrl);
            alert('Lien copié');
            return;
        }

        prompt('Copie ce lien:', shareUrl);
    } catch (error) {
        alert('Partage annulé ou indisponible');
    }
}

async function handleUpdateProfile(event) {
    event.preventDefault();
    if (!state.token) return;

    const payload = {
        full_name: event.target.full_name.value,
        email: event.target.email.value,
        username: event.target.username.value
    };

    const password = event.target.password.value;
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

        if (!res.ok) {
            const err = await res.json();
            alert(err.detail || 'Erreur profil');
            return;
        }

        state.user = await res.json();
        alert('Profil mis à jour');
        event.target.password.value = '';
        render();
    } catch (error) {
        alert('Erreur profil');
    }
}

function handleAuthError(status) {
    if (status === 401) {
        alert('Session expirée, veuillez vous reconnecter.');
        logout();
        return true;
    }
    return false;
}

async function handleToggleFavorite(recipeId) {
    if (!state.token) {
        alert('Connectez-vous pour ajouter des favoris.');
        state.activeTab = 'login';
        render();
        return;
    }

    try {
        const isFav = state.favorites[recipeId];
        const method = isFav ? 'DELETE' : 'POST';

        const res = await fetch(`${API_URL}/api/user/favorites/${recipeId}`, {
            method,
            headers: { 'Authorization': `Bearer ${state.token}` }
        });

        if (!res.ok) {
            if (handleAuthError(res.status)) return;
            alert('Impossible de modifier les favoris.');
            return;
        }

        state.favorites[recipeId] = !isFav;
        render();
    } catch (error) {
        alert('Erreur favoris');
    }
}

async function handleRate(recipeId, rating) {
    if (!state.token) {
        alert('Connectez-vous pour noter une recette.');
        state.activeTab = 'login';
        render();
        return;
    }

    try {
        const res = await fetch(`${API_URL}/api/user/rate/${recipeId}?rating=${rating}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${state.token}` }
        });

        if (!res.ok) {
            if (handleAuthError(res.status)) return;
            alert('Impossible de noter cette recette.');
            return;
        }

        state.ratings[recipeId] = rating;
        render();
    } catch (error) {
        alert('Erreur notation');
    }
}

async function applySearchFilters(event) {
    event.preventDefault();
    state.filters.name = event.target.query.value;
    state.filters.ingredients = event.target.ingredient?.value || '';
    await fetchRecipes();
    await fetchFavorites();
    render();
}

function clearSearchFilters() {
    state.filters = { name: '', cuisine: '', dish_type: '', dietary_type: '', ingredients: '' };
    fetchRecipes().then(fetchFavorites).then(render);
}

function renderStars(recipeId) {
    const rating = state.ratings[recipeId] || 0;
    let html = `<div class="star-rating" data-recipe="${recipeId}">`;

    for (let index = 1; index <= 5; index += 1) {
        const filled = index <= rating ? 'filled' : '';
        html += `<button type="button" class="star ${filled}" onclick="handleRate(${recipeId}, ${index})" aria-label="Noter ${index} sur 5">★</button>`;
    }

    html += '</div>';
    return html;
}

function renderRecipeCard(recipe) {
    const isFav = state.favorites[recipe.id] ? 'active' : '';
    const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);
    const imageUrl = getRecipeImage(recipe);

    return `
        <article class="recipe-card animate-fade" onclick="state.selectedRecipe = ${recipe.id}; render()">
            <div class="recipe-image-wrap">
                <img class="recipe-image" src="${imageUrl}" alt="${recipe.name}" loading="lazy" onerror="this.src='https://picsum.photos/seed/fallback-${recipe.id}/900/600'">
                <button type="button" class="fav-icon ${isFav}" onclick="event.stopPropagation(); handleToggleFavorite(${recipe.id})" aria-label="Favori">❤</button>
            </div>
            <div class="recipe-content">
                <div class="recipe-tags">
                    <span>${recipe.cuisine || 'Monde'}</span>
                    <span>${recipe.difficulty || 'Moyen'}</span>
                </div>
                <h3>${recipe.name}</h3>
                <p class="recipe-description">${recipe.description}</p>
                <div class="recipe-stats">
                    <span title="Temps total">⏱ ${totalTime} min</span>
                    <span title="Portions">👥 ${recipe.servings || 1}</span>
                    <div class="stars-wrap">${renderStars(recipe.id)}</div>
                </div>
            </div>
        </article>
    `;
}

function renderLoginForm() {
    return `
        <section class="auth-card">
            <h2>Connexion</h2>
            <form class="auth-form" onsubmit="handleLogin(event)">
                <div class="form-group">
                    <label>Nom d'utilisateur</label>
                    <input type="text" name="username" required>
                </div>
                <div class="form-group">
                    <label>Mot de passe</label>
                    <input type="password" name="password" required>
                </div>
                <button class="btn" type="submit">Se connecter</button>
            </form>
            
            <div class="auth-divider">
                <span>ou</span>
            </div>

            <div class="google-auth-container">
                <div id="google-signin-btn"></div>
            </div>
            
            <p class="auth-switch">Pas encore de compte ? <a href="#" onclick="event.preventDefault(); state.activeTab='register'; render()">S'inscrire</a></p>
        </section>
    `;
}

function renderRegisterForm() {
    return `
        <section class="auth-card">
            <h2>Inscription</h2>
            <form class="auth-form" onsubmit="handleRegister(event)">
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
                <button class="btn" type="submit">Créer mon compte</button>
            </form>
        </section>
    `;
}

function renderCreateForm() {
    const recipeToEdit = state.recipes.find((recipe) => recipe.id === state.editingRecipe);
    const isEditMode = Boolean(recipeToEdit);

    return `
        <section class="panel">
            <h2>${isEditMode ? 'Modifier une recette' : 'Créer une recette'}</h2>
            <form class="recipe-form" onsubmit="${isEditMode ? 'handleUpdateRecipe(event)' : 'handleCreateRecipe(event)'}">
                <div class="form-grid">
                    <div class="form-group">
                        <label>Nom *</label>
                        <input type="text" name="name" value="${recipeToEdit?.name || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Cuisine</label>
                        <input type="text" name="cuisine" value="${recipeToEdit?.cuisine || ''}" placeholder="Ex: Marocaine">
                    </div>
                    <div class="form-group">
                        <label>Image du plat (URL)</label>
                        <input type="url" name="image_url" value="${isEditMode ? (state.recipeImages[state.editingRecipe] || '') : ''}" placeholder="https://...">
                    </div>
                </div>

                <div class="form-grid">
                    <div class="form-group">
                        <label>Type</label>
                        <select name="dish_type">
                            <option value="Entrée" ${recipeToEdit?.dish_type === 'Entrée' ? 'selected' : ''}>Entrée</option>
                            <option value="Plat" ${recipeToEdit?.dish_type === 'Plat' || !recipeToEdit ? 'selected' : ''}>Plat</option>
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

                <div class="form-group">
                    <label>Description *</label>
                    <textarea name="description" required>${recipeToEdit?.description || ''}</textarea>
                </div>

                <div class="form-group">
                    <label>Ingrédients *</label>
                    <textarea name="ingredients" required>${recipeToEdit?.ingredients || ''}</textarea>
                </div>

                <div class="form-group">
                    <label>Instructions *</label>
                    <textarea name="instructions" required>${recipeToEdit?.instructions || ''}</textarea>
                </div>

                <div class="form-grid">
                    <div class="form-group">
                        <label>Préparation (min)</label>
                        <input type="number" name="prep_time" min="0" value="${recipeToEdit?.prep_time ?? 15}">
                    </div>
                    <div class="form-group">
                        <label>Cuisson (min)</label>
                        <input type="number" name="cook_time" min="0" value="${recipeToEdit?.cook_time ?? 30}">
                    </div>
                    <div class="form-group">
                        <label>Portions</label>
                        <input type="number" name="servings" min="1" value="${recipeToEdit?.servings ?? 4}">
                    </div>
                </div>

                <div class="form-actions">
                    <button class="btn" type="submit">${isEditMode ? 'Mettre à jour' : 'Publier la recette'}</button>
                    ${isEditMode ? '<button type="button" class="btn btn-soft" onclick="state.editingRecipe=null; state.activeTab=\'search\'; render()">Annuler</button>' : ''}
                </div>
            </form>
        </section>
    `;
}

function renderProfile() {
    return `
        <section class="panel">
            <h2>Mon profil</h2>
            <form class="recipe-form" onsubmit="handleUpdateProfile(event)">
                <div class="form-grid">
                    <div class="form-group">
                        <label>Nom complet</label>
                        <input type="text" name="full_name" value="${state.user?.full_name || ''}">
                    </div>
                    <div class="form-group">
                        <label>Nom d'utilisateur</label>
                        <input type="text" name="username" value="${state.user?.username || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" name="email" value="${state.user?.email || ''}" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Nouveau mot de passe (optionnel)</label>
                    <input type="password" name="password" placeholder="Laisser vide pour ne pas changer">
                </div>
                <button class="btn" type="submit">Enregistrer le profil</button>
            </form>
        </section>
    `;
}

function renderSearchSection() {
    return `
        <section class="panel animate-fade">
            <h2 class="section-title">Explorer les recettes</h2>
            <form class="search-row" onsubmit="applySearchFilters(event)">
                <input type="text" name="query" placeholder="Nom de recette..." value="${state.filters.name || ''}" aria-label="Recherche par nom">
                <input type="text" name="ingredient" placeholder="Ingrédient..." value="${state.filters.ingredients || ''}" aria-label="Recherche par ingrédient">
                <button class="btn btn-primary" type="submit">Chercher</button>
                <button class="btn btn-soft" type="button" onclick="clearSearchFilters()">Réinitialiser</button>
            </form>

            <div class="filters-row">
                <select onchange="state.filters.cuisine=this.value; fetchRecipes().then(fetchFavorites).then(render)">
                    <option value="" ${state.filters.cuisine === '' ? 'selected' : ''}>Toutes cuisines</option>
                    <option value="Française" ${state.filters.cuisine === 'Française' ? 'selected' : ''}>Française</option>
                    <option value="Italienne" ${state.filters.cuisine === 'Italienne' ? 'selected' : ''}>Italienne</option>
                    <option value="Japonaise" ${state.filters.cuisine === 'Japonaise' ? 'selected' : ''}>Japonaise</option>
                    <option value="Marocaine" ${state.filters.cuisine === 'Marocaine' ? 'selected' : ''}>Marocaine</option>
                    <option value="Asiatique" ${state.filters.cuisine === 'Asiatique' ? 'selected' : ''}>Asiatique</option>
                    <option value="Mexicaine" ${state.filters.cuisine === 'Mexicaine' ? 'selected' : ''}>Mexicaine</option>
                </select>
                <select onchange="state.filters.dish_type=this.value; fetchRecipes().then(fetchFavorites).then(render)">
                    <option value="" ${state.filters.dish_type === '' ? 'selected' : ''}>Tous types</option>
                    <option value="Entrée" ${state.filters.dish_type === 'Entrée' ? 'selected' : ''}>Entrée</option>
                    <option value="Plat" ${state.filters.dish_type === 'Plat' ? 'selected' : ''}>Plat principal</option>
                    <option value="Dessert" ${state.filters.dish_type === 'Dessert' ? 'selected' : ''}>Dessert</option>
                </select>
                <select onchange="state.filters.dietary_type=this.value; fetchRecipes().then(fetchFavorites).then(render)">
                    <option value="" ${state.filters.dietary_type === '' ? 'selected' : ''}>Tous régimes</option>
                    <option value="Normal" ${state.filters.dietary_type === 'Normal' ? 'selected' : ''}>Normal</option>
                    <option value="Végétarien" ${state.filters.dietary_type === 'Végétarien' ? 'selected' : ''}>Végétarien</option>
                    <option value="Sans gluten" ${state.filters.dietary_type === 'Sans gluten' ? 'selected' : ''}>Sans gluten</option>
                </select>
            </div>

            <div class="recipe-grid">
                ${state.recipes.length > 0 ? state.recipes.map(renderRecipeCard).join('') : '<p class="empty">Aucune recette trouvée.</p>'}
            </div>
        </section>
    `;
}

function renderFavoritesSection() {
    const favorites = state.recipes.filter((recipe) => state.favorites[recipe.id]);
    return `
        <section class="panel">
            <h2>Mes favoris</h2>
            <div class="recipe-grid">
                ${favorites.length > 0 ? favorites.map(renderRecipeCard).join('') : '<p class="empty">Tu n\'as pas encore de favoris.</p>'}
            </div>
        </section>
    `;
}

function renderModal() {
    const recipe = state.recipes.find((item) => item.id === state.selectedRecipe);
    if (!recipe) return '';

    const isFav = state.favorites[recipe.id] ? 'active' : '';
    const imageUrl = getRecipeImage(recipe);
    const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);

    return `
        <div class="modal-overlay" onclick="if(event.target===this){state.selectedRecipe=null; render();}">
            <article class="modal-card">
                <button type="button" class="modal-close" onclick="state.selectedRecipe=null; render()">✕</button>
                <div class="modal-image-panel">
                    <img class="modal-image" src="${imageUrl}" alt="${recipe.name}" onerror="this.src='https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&q=80'">
                </div>
                <div class="modal-body">
                    <span class="modal-sub">${recipe.cuisine || 'Monde'} • ${recipe.dish_type || 'Plat'}</span>
                    <h2>${recipe.name}</h2>
                    
                    <div class="mini-stats">
                        <div><b>${totalTime} min</b><span>Temps total</span></div>
                        <div><b>${recipe.servings || 1}</b><span>Portions</span></div>
                        <div><b>${recipe.difficulty || 'Moyen'}</b><span>Difficulté</span></div>
                        <div><b>${recipe.dietary_type || 'Normal'}</b><span>Régime</span></div>
                    </div>

                    <div class="modal-block">
                        <h3>Description</h3>
                        <p>${recipe.description}</p>
                    </div>

                    <div class="modal-block">
                        <h3>Ingrédients</h3>
                        <p class="preserve-lines">${recipe.ingredients}</p>
                    </div>

                    <div class="modal-block">
                        <h3>Instructions</h3>
                        <p class="preserve-lines">${recipe.instructions}</p>
                    </div>

                    <div class="modal-actions">
                        <button class="btn btn-primary" onclick="handleShareRecipe(${recipe.id})">Partager</button>
                        ${state.token && state.user && (recipe.owner_id === state.user.id || state.user.is_admin) ? `
                            <button class="btn btn-soft" onclick="startRecipeEdit(${recipe.id})">Modifier</button>
                            <button class="btn btn-danger" onclick="handleDeleteRecipe(${recipe.id})">Supprimer</button>
                        ` : ''}
                    </div>
                </div>
            </article>
        </div>
    `;
}


function renderAuthPage() {
    const authContent = state.activeTab === 'register' ? renderRegisterForm() : renderLoginForm();

    return `
        ${renderHero(false)}
        <main class="main-layout auth-layout">
            <nav class="tabs animate-fade">
                <button class="tab-btn ${state.activeTab === 'login' ? 'active' : ''}" onclick="state.activeTab='login'; render()">Connexion</button>
                <button class="tab-btn ${state.activeTab === 'register' ? 'active' : ''}" onclick="state.activeTab='register'; render()">Créer un compte</button>
            </nav>
            ${authContent}
        </main>
        ${renderFooter()}
    `;
}

function renderAppPage(content) {
    return `
        ${renderHero(true)}
        <main class="main-layout">
            <nav class="tabs animate-fade">
                <button class="tab-btn ${state.activeTab === 'search' ? 'active' : ''}" onclick="state.activeTab='search'; render()">Explorer</button>
                <button class="tab-btn ${state.activeTab === 'favorites' ? 'active' : ''}" onclick="state.activeTab='favorites'; render()">Favoris</button>
                <button class="tab-btn ${state.activeTab === 'create' ? 'active' : ''}" onclick="state.activeTab='create'; state.editingRecipe=null; render()">Créer</button>
                <button class="tab-btn ${state.activeTab === 'profile' ? 'active' : ''}" onclick="state.activeTab='profile'; render()">Profil</button>
            </nav>
            <div id="main-content">
                ${content}
                ${state.selectedRecipe ? renderModal() : ''}
            </div>
        </main>
        ${renderFooter()}
    `;
}

async function render() {
    const app = document.getElementById('app');

    // ── Auth page (not logged in) ──────────────────────────────────
    if (!state.token) {
        app.innerHTML = renderAuthPage();
        if (state.activeTab === 'login' && window.google && state.googleClientId) {
            google.accounts.id.initialize({
                client_id: state.googleClientId,
                callback: handleGoogleLogin
            });
            const btnContainer = document.getElementById('google-signin-btn');
            if (btnContainer) {
                google.accounts.id.renderButton(btnContainer, {
                    theme: 'outline', size: 'large', width: '100%',
                    text: 'signin_with', shape: 'pill'
                });
            }
        }
        return;
    }

    // ── Logged-in: compute content ─────────────────────────────────
    let content = '';
    if (state.activeTab === 'search')         content = renderSearchSection();
    else if (state.activeTab === 'favorites') content = renderFavoritesSection();
    else if (state.activeTab === 'create')    content = renderCreateForm();
    else                                      content = renderProfile();

    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        // Nav already in DOM — only replace the content area (no flash)
        mainContent.innerHTML = content + (state.selectedRecipe ? renderModal() : '');
    } else {
        // First render after login — build the full shell
        app.innerHTML = renderAppPage(content);
    }
}

(async () => {
    await Promise.all([fetchRecipes(), fetchUser(), fetchAuthConfig()]);
    await fetchFavorites();
    await fetchRatings();

    const params = new URLSearchParams(window.location.search);
    const sharedRecipeId = parseInt(params.get('recipe'), 10);

    if (!Number.isNaN(sharedRecipeId) && state.recipes.some((recipe) => recipe.id === sharedRecipeId)) {
        state.selectedRecipe = sharedRecipeId;
    }

    render();
})();
