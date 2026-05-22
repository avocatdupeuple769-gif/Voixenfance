var fs = require('fs');
var path = process.env.GRADLE_FILE || 'android/app/build.gradle';
var g = fs.readFileSync(path, 'utf8');

var releaseEntry = [
  '        release {',
  '            storeFile file("release.keystore")',
  '            storePassword "LesAiles2024"',
  '            keyAlias "lesailesdebride"',
  '            keyPassword "LesAiles2024"',
  '        }'
].join('\n');

// 1. Ajouter 'release' dans signingConfigs (après le bloc 'debug')
if (g.includes('signingConfigs')) {
  if (!g.includes('"lesailesdebride"') && !g.includes("'lesailesdebride'")) {
    // Trouver le bloc signingConfigs { ... } et insérer release après debug }
    var scStart = g.indexOf('signingConfigs');
    var openIdx = g.indexOf('{', scStart);
    // Trouver la fermeture du bloc signingConfigs
    var depth = 1;
    var pos = openIdx + 1;
    while (pos < g.length && depth > 0) {
      if (g[pos] === '{') depth++;
      else if (g[pos] === '}') depth--;
      pos++;
    }
    // Insérer releaseEntry avant la } fermante de signingConfigs
    var closePos = pos - 1;
    g = g.slice(0, closePos) + '\n' + releaseEntry + '\n' + g.slice(closePos);
    console.log('release ajouté dans signingConfigs');
  } else {
    console.log('release déjà dans signingConfigs');
  }
} else {
  console.log('ERREUR: signingConfigs non trouvé');
  process.exit(1);
}

// 2. Dans buildTypes.release, remplacer signingConfig signingConfigs.debug par release
// Trouver le bloc buildTypes { release { ... } } et remplacer
var btIdx = g.indexOf('buildTypes');
var relIdx = g.indexOf('release {', btIdx);
if (relIdx !== -1) {
  // Trouver la fin du bloc release { ... }
  var openR = g.indexOf('{', relIdx);
  var depthR = 1;
  var posR = openR + 1;
  while (posR < g.length && depthR > 0) {
    if (g[posR] === '{') depthR++;
    else if (g[posR] === '}') depthR--;
    posR++;
  }
  var releaseBlock = g.slice(relIdx, posR);
  
  // Remplacer signingConfig signingConfigs.debug par signingConfig signingConfigs.release
  var patchedBlock = releaseBlock.replace(/signingConfig\s+signingConfigs\.debug/g, 'signingConfig signingConfigs.release');
  
  // Supprimer toute ligne signingConfig déjà ajoutée par erreur si elle existe en double
  var lines = patchedBlock.split('\n');
  var seen = false;
  lines = lines.filter(function(line) {
    if (line.trim() === 'signingConfig signingConfigs.release') {
      if (seen) return false;
      seen = true;
    }
    return true;
  });
  patchedBlock = lines.join('\n');
  
  g = g.slice(0, relIdx) + patchedBlock + g.slice(posR);
  console.log('signingConfig .debug remplacé par .release dans buildTypes.release');
} else {
  console.log('ERREUR: release { non trouvé dans buildTypes');
  process.exit(1);
}

fs.writeFileSync(path, g);
console.log('build.gradle patché avec succès');

// Vérification rapide
var lines2 = g.split('\n');
console.log('--- Vérification signingConfigs ---');
var start = false;
lines2.forEach(function(l, i) {
  if (l.includes('signingConfigs') && !l.includes('signingConfigs.')) start = true;
  if (start) {
    console.log((i+1)+': '+l);
    if (l.trim() === '}' && start) { start = false; }
  }
  if (i > 130) start = false;
});
