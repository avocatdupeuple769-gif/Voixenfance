#!/bin/bash

echo ""
echo "========================================="
echo "   VoixEnfance — Construction APK Android"
echo "========================================="
echo ""

# Aller dans le dossier de l'application
cd "$(dirname "$0")"

# Vérifier que eas est installé
if ! command -v eas &> /dev/null; then
  echo "Installation de EAS CLI..."
  npm install -g eas-cli
fi

# Vérifier que le token est disponible
if [ -z "$EXPO_TOKEN" ]; then
  echo "❌ Token Expo manquant."
  echo "Entrez votre token Expo Access Token :"
  read -r EXPO_TOKEN
  export EXPO_TOKEN
fi

# Vérifier la connexion
echo "Vérification du compte Expo..."
ACCOUNT=$(EXPO_TOKEN=$EXPO_TOKEN eas whoami 2>&1)
echo "✅ Connecté : $ACCOUNT"
echo ""

# Lancer le build
echo "Lancement de la construction APK..."
echo "Durée estimée : 10 à 15 minutes"
echo ""

EXPO_TOKEN=$EXPO_TOKEN eas build \
  --platform android \
  --profile preview \
  --non-interactive

echo ""
echo "========================================="
echo "Build terminé ! Vérifiez le lien ci-dessus"
echo "ou consultez : https://expo.dev/accounts/libreville/projects/voixenfance-gabon/builds"
echo "========================================="
