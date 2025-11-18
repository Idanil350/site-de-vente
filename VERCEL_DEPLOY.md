# Déployer sur Vercel — guide rapide

1) Pré-requis locaux
- Assure-toi d'avoir installé les dépendances localement:

```powershell
npm install
```

2) Valider la build localement

```powershell
npm run build
npm run start
```

3) Variables d'environnement (obligatoires)
- Dans le projet Vercel -> Settings -> Environment Variables, ajoute:
  - `MONGODB_URI` = <ta chaîne MongoDB Atlas>
  - `STRIPE_SECRET_KEY` = <clé Stripe>
  - `NEXT_PUBLIC_BASE_URL` = `https://<ton-projet>.vercel.app`
  - `ADMIN_PASSWORD` = <mot_de_passe_admin> (optionnel mais recommandé)
  - Pour Cloudinary (uploads): `CLOUDINARY_URL` (ou `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`)
  - `CLOUDINARY_FOLDER` (optionnel)

4) Importer le repo sur Vercel
- Va sur https://vercel.com/new, connecte ton repo GitHub/GitLab et importe `ma-boutique`.
- Vercel détecte Next.js automatiquement; laisse la commande de build par défaut (`npm run build`).

5) Déployer et vérifier
- Après le déploiement, vérifie:
  - `/` (page publique) — images et lightbox
  - `/admin/login` — connexion admin
  - Test d'édition produit (upload d'images)
  - Paiement Stripe (checkout flow) si configuré

6) Notes importantes
- Les images sont maintenant envoyées à Cloudinary (serverless-safe). Assure-toi d'avoir les variables Cloudinary configurées.
- Si tu veux garder les uploads dans `public/images` (pas recommandé en production), renseigne-le et je peux remettre cette logique.
