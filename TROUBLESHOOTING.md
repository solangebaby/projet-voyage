# 🔧 GUIDE DE DÉPANNAGE - JADOO TRAVELS

**Date**: 2026-01-26  
**Version**: 1.0.0

---

## ✅ ERREURS CORRIGÉES

### 1. ✅ `downloadTicket` is not exported
**Statut**: RÉSOLU  
**Solution**: Ajout de `getTicketDetails()` et `downloadTicket()` dans `src/services/api.ts`

### 2. ✅ `trip.bus.features.map is not a function`
**Statut**: RÉSOLU  
**Cause**: `features` est stocké comme JSON string dans la DB  
**Solution**: Parsing JSON avec `JSON.parse()` + gestion d'erreur

---

## ⚠️ WARNINGS NON BLOQUANTS

### Warning: validateDOMNesting (div dans p)
**Impact**: Aucun - Cosmétique seulement  
**Cause**: Structure HTML dans les animations `react-awesome-reveal`  
**Action**: Peut être ignoré, n'affecte pas le fonctionnement

### Warning: Missing "key" prop (Testimonials)
**Impact**: Aucun - Performance minimale  
**Cause**: Liste d'éléments sans clé unique  
**Action**: Peut être ignoré en production

### Warning: React Router Future Flags
**Impact**: Aucun - Information pour v7  
**Cause**: Préparation pour React Router v7  
**Action**: Peut être ignoré, comportement actuel fonctionne

---

## 🐛 ERREURS POSSIBLES ET SOLUTIONS

### Erreur: "Failed to load destinations"

**Symptômes**:
- Toast rouge au chargement de la page
- Pas de villes dans le formulaire

**Causes possibles**:
1. Backend Laravel non démarré
2. Port incorrect (pas 8000)
3. Base de données vide

**Solutions**:
```bash
# 1. Vérifier que le backend tourne
cd laravel-backend
php artisan serve

# 2. Vérifier la base de données
php artisan tinker --execute="echo \App\Models\Destination::count()"

# 3. Si vide, remplir la DB
php artisan migrate:fresh
php artisan db:seed --class=TestDataSeeder
```

---

### Erreur: "No trips available"

**Symptômes**:
- Message après recherche
- Liste vide

**Causes possibles**:
1. Date de recherche trop éloignée (trips sur 7 jours seulement)
2. Combinaison ville inexistante
3. Base de données vide

**Solutions**:
```bash
# 1. Chercher pour aujourd'hui ou demain
# 2. Utiliser: Yaoundé → Douala

# 3. Vérifier les trips
cd laravel-backend
php artisan tinker --execute="echo \App\Models\Trip::count()"

# 4. Si 0, reseeder
php artisan db:seed --class=TestDataSeeder
```

---

### Erreur: CORS Policy Error

**Symptômes**:
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Cause**: Frontend sur un port non autorisé

**Solution**:
```php
// laravel-backend/config/cors.php
'allowed_origins' => [
    'http://localhost:5173',  // Vite
    'http://localhost:3000',  // Backup
],
```

Puis redémarrer Laravel:
```bash
cd laravel-backend
php artisan config:clear
php artisan serve
```

---

### Erreur: "Please login to complete your booking"

**Symptômes**:
- Redirection vers /signup au moment du paiement
- Impossible de réserver

**Cause**: Pas de compte utilisateur connecté

**Solution**:
1. **Créer un compte**: http://localhost:5173/signup
2. **Ou utiliser un compte test**:
   - Email: `jean@example.com`
   - Password: `password`

---

### Erreur: 401 Unauthorized

**Symptômes**:
- Erreur API 401
- "Unauthenticated" dans la console

**Causes possibles**:
1. Token expiré
2. Pas de token
3. Token invalide

**Solutions**:
```javascript
// Console navigateur (F12)
sessionStorage.clear()
// Puis se reconnecter
```

---

### Erreur: 500 Internal Server Error

**Symptômes**:
- Erreur 500 sur les requêtes API
- Page blanche

**Causes possibles**:
1. Erreur Laravel backend
2. Base de données non accessible
3. Migration non exécutée

**Solutions**:
```bash
cd laravel-backend

# 1. Voir les logs
tail -f storage/logs/laravel.log

# 2. Vérifier la DB
php artisan migrate:status

# 3. Réexécuter migrations si besoin
php artisan migrate:fresh
php artisan db:seed --class=TestDataSeeder

# 4. Clear cache
php artisan cache:clear
php artisan config:clear
```

---

### Erreur: Page blanche après paiement

**Symptômes**:
- Paiement réussi
- Redirection vers page blanche
- Pas de ticket

**Causes possibles**:
1. Route `/ticket` non trouvée
2. Ticket non généré par le backend
3. Erreur dans Confirmationpage.tsx

**Solutions**:
1. Vérifier la console (F12)
2. Vérifier que le backend retourne bien le ticket
3. Vérifier les routes dans App.tsx

---

### Erreur: Bus seats not loading (SeatSelector)

**Symptômes**:
- Plan du bus vide
- Pas de sièges affichés

**Causes possibles**:
1. tripId ou busId incorrect
2. Backend ne retourne pas les sièges occupés
3. Structure de données incorrecte

**Solutions**:
```bash
# Vérifier que le trip existe
cd laravel-backend
php artisan tinker
>>> $trip = \App\Models\Trip::find(1);
>>> $trip->bus;
>>> $trip->occupied_seats;
```

---

### Erreur: PDF Download fails

**Symptômes**:
- Clic sur "Download PDF" ne fait rien
- Erreur 404 ou 500

**Causes possibles**:
1. Route PDF non configurée
2. PdfController non implémenté
3. Bibliothèque PDF manquante

**Solutions**:
```bash
cd laravel-backend

# Vérifier la route
php artisan route:list | grep pdf

# Installer la lib PDF si besoin
composer require barryvdh/laravel-dompdf
```

---

## 🔍 COMMANDES DE DIAGNOSTIC

### Vérifier l'état complet

```bash
cd laravel-backend

# Counts
php artisan tinker --execute="
echo 'Destinations: ' . \App\Models\Destination::count() . PHP_EOL;
echo 'Buses: ' . \App\Models\Bus::count() . PHP_EOL;
echo 'Trips: ' . \App\Models\Trip::count() . PHP_EOL;
echo 'Users: ' . \App\Models\User::count() . PHP_EOL;
echo 'Reservations: ' . \App\Models\Reservation::count() . PHP_EOL;
"
```

### Vérifier les connexions

```bash
# Backend
curl http://localhost:8000/api/destinations

# CORS
curl -H "Origin: http://localhost:5173" -I http://localhost:8000/api/destinations
```

### Vérifier les logs

```bash
# Laravel logs
cd laravel-backend
tail -f storage/logs/laravel.log

# Browser console
# Ouvrir DevTools (F12) → Console
```

---

## 📊 ÉTAT ATTENDU

### Base de données
```
Destinations: 6
Buses: 5
Trips: 210 (7 jours)
Users: 4 (1 admin + 3 voyageurs)
Reservations: Varie selon tests
```

### Serveurs
```
Backend: http://localhost:8000 (Laravel)
Frontend: http://localhost:5173 (Vite)
```

### Comptes
```
Admin: admin@jadoo.com / admin123
User: jean@example.com / password
```

---

## 🆘 AIDE SUPPLÉMENTAIRE

### Vérifications de base

1. ✅ Les deux serveurs tournent
2. ✅ La base de données contient des données
3. ✅ Le CORS est configuré pour port 5173
4. ✅ Les migrations sont à jour
5. ✅ Le cache Laravel est clear

### Reset complet

Si rien ne fonctionne, reset total:

```bash
# Backend
cd laravel-backend
php artisan cache:clear
php artisan config:clear
php artisan migrate:fresh
php artisan db:seed --class=TestDataSeeder
php artisan serve

# Frontend (nouveau terminal)
npm run dev
```

---

## 📝 NOTES IMPORTANTES

### Données de test
- Les trips sont créés pour **7 jours seulement**
- Chercher pour **aujourd'hui ou demain** pour voir des résultats
- Si date passée, aucun résultat

### Paiement
- Le paiement est **100% simulé**
- Aucun débit réel
- Toujours réussi après 2-3 secondes

### Authentification
- Utiliser Sanctum tokens
- Tokens stockés dans sessionStorage
- Se reconnecter si token expiré

---

**Besoin d'aide?** Consultez les autres fichiers de documentation:
- `APPLICATION_COMPLETE_GUIDE.md` - Guide complet
- `FINAL_CHECKLIST.md` - Tests à effectuer
- `IMPLEMENTATION_COMPLETE_BOOKING_SYSTEM.md` - Architecture

---

**Dernière mise à jour**: 2026-01-26  
**Version**: 1.0.0
