# 🧪 GUIDE DE TEST RAPIDE - Jadoo Travels

**Objectif** : Vérifier que la communication Frontend-Backend fonctionne correctement

---

## ✅ ÉTAPE 1 : Vérifier les serveurs

### Backend Laravel
```bash
cd laravel-backend
php artisan serve
```
**Résultat attendu** : `Laravel development server started: http://127.0.0.1:8000`

### Frontend Vite
```bash
npm run dev
```
**Résultat attendu** : `Local: http://localhost:5173/`

---

## ✅ ÉTAPE 2 : Tester la page d'accueil

1. **Ouvrir** : http://localhost:5173/
2. **Vérifier** :
   - ✅ La page se charge sans erreur
   - ✅ Pas de toast "Failed to load cities" ou "Failed to load destinations"
   - ✅ Section "Top Destinations" affiche le carousel
   - ✅ Pas d'erreurs dans la console (F12)

**Si erreur** : Vérifier que le backend est bien démarré

---

## ✅ ÉTAPE 3 : Tester la connexion admin

1. **Ouvrir** : http://localhost:5173/admin/login
2. **Entrer** :
   - Email : `admin@jadoo.com`
   - Password : `admin123`
3. **Cliquer** : Login
4. **Vérifier** :
   - ✅ Message "Login successful!"
   - ✅ Redirection vers `/admin/dashboard`
   - ✅ Token stocké dans sessionStorage

**Vérifier le token** (Console F12) :
```javascript
sessionStorage.getItem('auth_token')
```

---

## ✅ ÉTAPE 4 : Tester l'inscription

1. **Ouvrir** : http://localhost:5173/admin/register
2. **Remplir le formulaire** avec des données de test
3. **Soumettre**
4. **Vérifier** :
   - ✅ Message "Registration successful!"
   - ✅ Redirection vers `/admin/login`

---

## ✅ ÉTAPE 5 : Tester la recherche de voyages

1. **Sur la page d'accueil**, utiliser le formulaire de recherche
2. **Sélectionner** :
   - Ville de départ
   - Ville d'arrivée
   - Date
3. **Cliquer** : Rechercher
4. **Vérifier** :
   - ✅ Résultats de recherche s'affichent
   - ✅ Pas d'erreurs dans la console

---

## ✅ ÉTAPE 6 : Tester le dashboard admin (si admin)

1. **Se connecter** comme admin
2. **Naviguer** vers différentes sections :
   - 📊 Statistiques
   - 🚌 Gestion de la flotte
   - 🗺️ Gestion des routes
   - 🏙️ Gestion des villes
3. **Vérifier** :
   - ✅ Les données se chargent correctement
   - ✅ Pas d'erreurs 401 (Unauthorized)
   - ✅ Les actions CRUD fonctionnent

---

## ✅ ÉTAPE 7 : Vérifier l'authentification

### Test PrivateRoute

1. **Se déconnecter** (si connecté)
2. **Essayer d'accéder** : http://localhost:5173/admin/dashboard
3. **Vérifier** :
   - ✅ Message "Veuillez vous connecter"
   - ✅ Redirection vers `/admin/login`

---

## 🔍 TESTS DE DIAGNOSTIC

### Test 1 : Console du navigateur (F12)

**Pas d'erreurs** comme :
- ❌ `CORS policy error`
- ❌ `Network request failed`
- ❌ `401 Unauthorized` (sauf si attendu)
- ❌ `404 Not Found` pour les routes API

### Test 2 : Onglet Network (F12)

**Vérifier les requêtes API** :
```
GET http://localhost:8000/api/destinations → 200 OK
GET http://localhost:8000/api/trips → 200 OK
POST http://localhost:8000/api/login → 200 OK (ou 401 si mauvais credentials)
```

**Headers de réponse** :
```
Access-Control-Allow-Origin: http://localhost:5173 ✅
Content-Type: application/json ✅
```

### Test 3 : SessionStorage

**Ouvrir la console** (F12) et taper :
```javascript
// Vérifier le token
console.log(sessionStorage.getItem('auth_token'));

// Vérifier l'utilisateur
console.log(JSON.parse(sessionStorage.getItem('user')));
```

---

## 🚨 RÉSOLUTION DE PROBLÈMES

### Problème : "Failed to load destinations"

**Cause** : Backend non démarré  
**Solution** :
```bash
cd laravel-backend
php artisan serve
```

### Problème : CORS Error

**Cause** : Configuration CORS incorrecte  
**Solution** : Vérifier `laravel-backend/config/cors.php`
```php
'allowed_origins' => [
    'http://localhost:5173',
],
```

### Problème : 401 Unauthorized

**Cause** : Token manquant ou invalide  
**Solution** :
1. Se déconnecter et se reconnecter
2. Vérifier que le token est stocké :
   ```javascript
   sessionStorage.getItem('auth_token')
   ```

### Problème : 404 Not Found

**Cause** : Route API n'existe pas  
**Solution** : Vérifier `laravel-backend/routes/api.php`

---

## ✅ CHECKLIST FINALE

Avant de considérer que tout fonctionne, vérifier :

- [ ] ✅ Backend Laravel tourne sur port 8000
- [ ] ✅ Frontend Vite tourne sur port 5173
- [ ] ✅ Page d'accueil se charge sans erreur
- [ ] ✅ Pas de toast d'erreur au chargement
- [ ] ✅ Section destinations s'affiche
- [ ] ✅ Login fonctionne
- [ ] ✅ Registration fonctionne
- [ ] ✅ Recherche de voyages fonctionne
- [ ] ✅ Dashboard admin accessible (si admin)
- [ ] ✅ PrivateRoute protège les routes
- [ ] ✅ Pas d'erreurs dans la console
- [ ] ✅ Tokens stockés correctement

---

## 📊 RÉSULTATS ATTENDUS

### ✅ SUCCÈS

Si tous les tests passent :
- 🎉 La communication Frontend-Backend est **fonctionnelle**
- 🎉 L'authentification est **opérationnelle**
- 🎉 Les routes API sont **accessibles**
- 🎉 Le CORS est **correctement configuré**

### ❌ ÉCHEC

Si des tests échouent :
1. Consulter `DIAGNOSTIC_API_COMMUNICATION.md`
2. Consulter `SOLUTION_COMPLETE.md`
3. Vérifier les logs du backend Laravel
4. Vérifier la console du navigateur

---

## 🔗 RESSOURCES

- **Diagnostic complet** : `DIAGNOSTIC_API_COMMUNICATION.md`
- **Solution détaillée** : `SOLUTION_COMPLETE.md`
- **Configuration API** : `src/services/api.ts`
- **Routes Laravel** : `laravel-backend/routes/api.php`
- **Config CORS** : `laravel-backend/config/cors.php`

---

**Temps estimé** : 10-15 minutes  
**Dernière mise à jour** : 2026-01-26
