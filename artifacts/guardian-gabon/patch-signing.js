var fs = require('fs');
var path = process.env.GRADLE_FILE || 'android/app/build.gradle';
var g = fs.readFileSync(path, 'utf8');

var signingBlock = [
  '',
  '    signingConfigs {',
  '        release {',
  '            if (project.hasProperty("RELEASE_STORE_FILE")) {',
  '                storeFile file(RELEASE_STORE_FILE)',
  '                storePassword RELEASE_STORE_PASSWORD',
  '                keyAlias RELEASE_KEY_ALIAS',
  '                keyPassword RELEASE_KEY_PASSWORD',
  '            }',
  '        }',
  '    }'
].join('\n');

if (!g.includes('signingConfigs')) {
  g = g.replace(/(\n[ \t]+buildTypes[ \t]*\{)/, signingBlock + '$1');
  console.log('signingConfigs bloc ajouté');
} else {
  console.log('signingConfigs déjà présent');
}

if (!g.includes('signingConfig signingConfigs.release')) {
  var btIdx = g.indexOf('buildTypes');
  var relIdx = g.indexOf('release {', btIdx);
  if (relIdx !== -1) {
    var ins = relIdx + 'release {'.length;
    g = g.slice(0, ins) + '\n            signingConfig signingConfigs.release' + g.slice(ins);
    console.log('signingConfig ajouté dans release buildType');
  }
} else {
  console.log('signingConfig déjà présent');
}

fs.writeFileSync(path, g);
console.log('build.gradle patché avec succès');
