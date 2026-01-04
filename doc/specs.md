# Stokosor — Spécifications

## Concept

Application mobile d'inventaire domestique complet. Scanner, organiser, retrouver tout ce que tu possèdes.

**Nom** : Stokosor
**Mascotte** : Dinosaure en carton (friendly, cartoon)
**Langues** : Français + Anglais (i18n dès le départ)
**Modèle** : 100% gratuit (premium prévu dans 3-6 mois)
**Plateforme** : iOS + Android

---

## Structure de données

### Hiérarchie

```
Lieu (Maison, Appartement, Garage...)
  └── Zone (Pièce ou espace)
        └── Contenant (Boîte, étagère, placard, classeur...)
              └── Item (Objet physique)
```

### Entités

#### Lieu
| Champ      | Type                | Requis |
| ---------- | ------------------- | ------ |
| id         | uuid                | oui    |
| name       | string              | oui    |
| address    | string              | non    |
| photo      | string (path local) | non    |
| created_at | datetime            | oui    |
| updated_at | datetime            | oui    |

#### Zone
| Champ      | Type      | Requis |
| ---------- | --------- | ------ |
| id         | uuid      | oui    |
| lieu_id    | uuid (FK) | oui    |
| name       | string    | oui    |
| icon       | string    | non    |
| created_at | datetime  | oui    |
| updated_at | datetime  | oui    |

#### Contenant
| Champ      | Type                | Requis            |
| ---------- | ------------------- | ----------------- |
| id         | uuid                | oui               |
| zone_id    | uuid (FK)           | oui               |
| name       | string              | oui               |
| qr_code    | string (unique)     | oui (auto-généré) |
| photo      | string (path local) | non               |
| created_at | datetime            | oui               |
| updated_at | datetime            | oui               |

#### Item
| Champ           | Type                    | Requis |
| --------------- | ----------------------- | ------ |
| id              | uuid                    | oui    |
| contenant_id    | uuid (FK)               | oui    |
| name            | string                  | oui    |
| photos          | string[] (paths locaux) | non    |
| category        | enum                    | oui    |
| barcode         | string                  | non    |
| purchase_price  | number                  | non    |
| estimated_value | number                  | non    |
| purchase_date   | date                    | non    |
| expiration_date | date                    | non    |
| notes           | string                  | non    |
| tags            | string[]                | non    |
| created_at      | datetime                | oui    |
| updated_at      | datetime                | oui    |

### Catégories d'items (enum)

- electronics (Électronique)
- appliances (Électroménager)
- furniture (Mobilier)
- clothing (Vêtements)
- books (Livres)
- documents (Documents/Papiers)
- food (Alimentation)
- household (Hygiène/Ménager)
- tools (Outils)
- leisure (Loisirs/Sport)
- decoration (Décoration)
- other (Autres)

---

## Fonctionnalités MVP

### Navigation
- Navigation hiérarchique : Lieu → Zone → Contenant → Items
- Breadcrumb visible pour savoir où on est
- Retour facile à chaque niveau

### CRUD complet
- Ajout/édition/suppression pour chaque entité
- Formulaires simples et rapides
- Validation des champs requis

### Caméra et photos
- Prise de photo pour items et contenants
- Galerie photos pour les items (plusieurs photos possibles)
- Stockage local sur le device

### Scanner QR Code
- Lecture QR pour identifier un contenant instantanément
- Navigation directe vers le contenant scanné

### Génération QR Code
- Chaque contenant a un QR unique auto-généré
- Export/partage du QR pour impression
- Le QR contient l'ID du contenant

### Scanner code-barres
- Lecture EAN/ISBN pour produits du commerce
- Pré-remplissage automatique via APIs externes

### Intégrations API (gratuites)
- **Open Food Facts** : produits alimentaires via code-barres
- **Google Books API** : livres via ISBN

### Recherche globale
- Recherche par nom, tags, catégorie
- Résultats avec chemin complet (Lieu > Zone > Contenant)
- Accès direct à l'item depuis les résultats

### Statistiques
- Valeur totale de tous les items
- Nombre d'items par catégorie
- Items avec péremption proche

### Alertes péremption
- Notifications locales pour items avec date de péremption
- Configurable : X jours avant expiration

### Export
- Export JSON (backup complet)
- Export CSV (tableau simple)
- Sauvegarde sur le device / partage

### Internationalisation
- Français et Anglais
- Détection automatique de la langue du device
- Changement manuel possible dans les paramètres

---

## Écrans

1. **Home** — Liste des lieux + stats globales
2. **Lieu** — Détail lieu + liste des zones
3. **Zone** — Détail zone + liste des contenants
4. **Contenant** — Détail + QR code + liste des items
5. **Item** — Détail complet + édition
6. **Scanner** — QR code + code-barres
7. **Recherche** — Recherche globale
8. **Paramètres** — Langue, export, à propos

---

## UX Guidelines

- **Onboarding** : Premier lancement guide l'utilisateur pour créer son premier lieu
- **Empty states** : Illustrations sympa quand une liste est vide (avec le dino)
- **Feedback** : Toast/snackbar pour confirmer les actions
- **Swipe actions** : Swipe pour supprimer/éditer dans les listes
- **Pull to refresh** : Sur les listes
- **Skeleton loading** : Pendant les chargements
- **Dark mode** : Support natif iOS/Android

---

## Ce qui n'est PAS dans le MVP

- Sync cloud (coûte de l'argent)
- Comptes utilisateurs
- Reconnaissance visuelle IA
- OCR documents
- Partage multi-utilisateurs
- Export PDF

Ces fonctionnalités sont prévues pour la version premium future.
