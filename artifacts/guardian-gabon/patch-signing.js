var fs = require('fs');
var path = process.env.GRADLE_FILE || 'android/app/build.gradle';
var g = fs.readFileSync(path, 'utf8');

console.log('--- build.gradle original (lignes 100-130) ---');
var lines = g.split('\n');
lines.slice(99, 130).forEach(function(l, i) { console.log((i+100)+': '+l); });
console.log('---');

var releaseConfig = [
  '        release {',
  '            if (project.hasProperty("RELEASE_STORE_FILE")) {',
  '                storeFile file(RELEASE_STORE_FILE)',
  '                storePassword RELEASE_STORE_PASSWORD',
  '                keyAlias RELEASE_KEY_ALIAS',
  '                keyPassword RELEASE_KEY_PASSWORD',
  '            }',
  '        }'
].join('\n');

var fullSigningBlock = [
  '    signingConfigs {',
  releaseConfig,
  '    }'
].join('\n');

if (g.includes('signingConfigs')) {
  // signingConfigs existe déjà — ajouter 'release' à l'intérieur
  if (!g.includes('signingConfigs.release') && !g.includes('release {')) {
    // Trouver la fin du bloc signingConfigs et insérer release avant la fermeture
    var scIdx = g.indexOf('signingConfigs');
    var openBrace = g.indexOf('{', scIdx);
    // Trouver l'accolade fermante correspondante
    var depth = 1;
    var pos = openBrace + 1;
    while (pos < g.length && depth > 0) {
      if (g[pos] === '{') depth++;
      else if (g[pos] === '}') depth--;
      pos++;
    }
    // pos est maintenant après la }, insérer release juste avant
    var closingPos = pos - 1;
    g = g.slice(0, closingPos) + '\n' + releaseConfig + '\n' + g.slice(closingPos);
    console.log('release ajouté dans signingConfigs existant');
  } else {
    console.log('release déjà dans signingConfigs');
  }
} else {
  // Pas de signingConfigs — créer le bloc avant buildTypes
  g = g.replace(/(\n[ \t]+buildTypes[ \t]*\{)/, '\n' + fullSigningBlock + '$1');
  console.log('signingConfigs créé avec release');
}

// Ajouter signingConfig dans buildTypes.release
if (!g.includes('signingConfig signingConfigs.release')) {
  var btIdx = g.indexOf('buildTypes');
  if (btIdx !== -1) {
    var relIdx = g.indexOf('release {', btIdx);
    if (relIdx !== -1) {
      var ins = relIdx + 'release {'.length;
      g = g.slice(0, ins) + '\n            signingConfig signingConfigs.release' + g.slice(ins);
      console.log('signingConfig signingConfigs.release ajouté dans buildTypes.release');
    } else {
      console.log('WARN: release { non trouvé dans buildTypes');
    }
  }
} else {
  console.log('signingConfig déjà présent dans buildTypes.release');
}

fs.writeFileSync(path, g);
console.log('build.gradle patché avec succès');

console.log('--- build.gradle patché (lignes 100-135) ---');
var patchedLines = g.split('\n');
patchedLines.slice(99, 135).forEach(function(l, i) { console.log((i+100)+': '+l); });
console.log('---');
