# Ordre des Migrations - Vérification

## Migrations dans l'ordre chronologique :

1. **2014_10_12_000000_create_users_table.php** ✅
2. **2014_10_12_100000_create_password_reset_tokens_table.php** ✅
3. **2019_08_19_000000_create_failed_jobs_table.php** ✅
4. **2019_12_14_000001_create_personal_access_tokens_table.php** ✅
5. **2026_01_18_125718_create_destinations_table.php** ✅
   - Champs: id, city_name, description, image
6. **2026_01_18_125719_create_buses_table.php** ✅
   - Champs: id, bus_name, matricule, type, total_seats, price, features
7. **2026_01_18_125719_create_trips_table.php** ✅
   - Champs: id, bus_id, departure_id, destination_id, departure_date, departure_time, arrival_date, arrival_time, price, occupied_seats, distance_km, status
   - **Note: available_seats SUPPRIMÉ** (calculé dynamiquement)
8. **2026_01_18_125720_create_reservations_table.php** ✅
9. **2026_01_18_125721_create_payments_table.php** ✅
10. **2026_01_18_125721_create_tickets_table.php** ✅
11. **2026_01_18_125722_create_comments_table.php** ✅
12. **2026_01_20_add_bus_management_fields.php** ✅
    - Ajoute: internal_number, registration, brand, year, state, maintenance_note, seat_configuration
13. **2026_01_20_add_routes_management_fields.php** ✅
14. **2026_01_20_create_cities_management_table.php** ✅
15. **2026_02_02_add_passenger_fields_to_reservations.php** ✅
16. **2026_02_02_create_tarifs_table.php** ✅
17. **2026_02_05_add_gender_and_cni_to_reservations.php** ✅
18. **2026_02_06_add_agencies_to_destinations.php** ✅
    - Crée table agencies
    - Ajoute departure_agency_id et arrival_agency_id aux trips
    - Ajoute departure_agency_id et arrival_agency_id aux reservations

## Vérifications effectuées :

✅ Table `buses` : plus de champ `available_seats`, `status`
✅ Table `trips` : champ `price` ajouté, `available_seats` supprimé
✅ Seeder corrigé : utilise `state` au lieu de `status`, `price` au lieu de `available_seats`
✅ Types de bus : 'vip' et 'standard' (lowercase)
