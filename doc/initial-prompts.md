# Stokosor — Prompt Claude Code

Copie ce prompt pour démarrer avec Claude Code :

---

## Prompt initial

```
Je veux créer une application mobile React Native avec Expo appelée "Stokosor".

C'est une app d'inventaire domestique qui permet de :
- Gérer une hiérarchie Lieu → Zone → Contenant → Item
- Scanner des QR codes pour identifier les contenants
- Scanner des codes-barres pour identifier les produits (Open Food Facts, Google Books)
- Générer des QR codes pour chaque contenant
- Rechercher globalement dans tout l'inventaire
- Voir la valeur totale de son patrimoine
- Recevoir des alertes de péremption
- Exporter en JSON/CSV

L'app est 100% offline-first avec SQLite, bilingue FR/EN.

Lis les fichiers SPECS.md et TECHNICAL.md que j'ai joints pour les détails complets.

Commence par :
1. Initialiser le projet Expo avec TypeScript
2. Installer toutes les dépendances listées dans TECHNICAL.md
3. Créer la structure de dossiers
4. Implémenter le schéma SQLite
5. Créer les premiers écrans (Home avec liste des lieux)

Je veux une UX soignée, moderne, avec support dark mode. La mascotte est un dinosaure en carton friendly.
```

---

## Prompts de suivi suggérés

### Après l'initialisation
```
Maintenant crée le système de navigation avec Expo Router :
- Tabs en bas : Home, Recherche, Scanner, Paramètres
- Stack navigation pour les détails (lieu, zone, contenant, item)
- Écrans de création pour chaque entité
```

### Pour les formulaires
```
Crée les formulaires de création/édition pour chaque entité :
- LieuForm : nom (requis), adresse, photo
- ZoneForm : nom (requis), icône
- ContenantForm : nom (requis), photo, QR auto-généré
- ItemForm : nom, catégorie, photos multiples, valeurs, dates, tags

Utilise des composants UI réutilisables. Validation des champs requis.
```

### Pour le scanner
```
Implémente l'écran Scanner avec deux modes :
1. QR Code : scanne et navigue vers le contenant correspondant
2. Code-barres : scanne, appelle Open Food Facts ou Google Books, pré-remplit le formulaire d'item

Gère les permissions caméra proprement.
```

### Pour la recherche
```
Crée l'écran de recherche globale :
- Input de recherche avec debounce
- Recherche sur nom, tags, catégorie des items
- Résultats affichent le chemin complet (Lieu > Zone > Contenant)
- Tap sur un résultat navigue vers l'item
```

### Pour l'i18n
```
Configure i18next avec :
- Détection auto de la langue du device
- Fichiers fr.json et en.json
- Toutes les strings de l'app traduites
- Changement de langue dans les paramètres
```

### Pour l'export
```
Implémente l'export dans les paramètres :
- Export JSON : structure complète de la BDD
- Export CSV : tableau plat de tous les items
- Utilise expo-sharing pour partager le fichier
```

### Pour le polish final
```
Ajoute les finitions UX :
- Empty states avec illustrations du dino
- Skeleton loading sur les listes
- Swipe to delete avec confirmation
- Pull to refresh
- Toast de confirmation après chaque action
- Onboarding au premier lancement
```

---

## Tips pour travailler avec Claude Code

1. **Un truc à la fois** : ne demande pas tout d'un coup, procède écran par écran
2. **Montre le contexte** : si tu as une erreur, copie le message complet
3. **Itère** : "ça marche mais je voudrais que X" est un bon prompt
4. **Teste souvent** : lance `npx expo start` entre chaque grosse feature
5. **Commit régulièrement** : demande à Claude Code de t'aider à structurer tes commits
