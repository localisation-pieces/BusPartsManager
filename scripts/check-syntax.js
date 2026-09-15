#!/usr/bin/env node
// Vérifie que les scripts inline d'index.html sont syntaxiquement valides —
// même contrôle que celui fait manuellement à chaque modification avant de
// committer. Ne garantit pas que le code FONCTIONNE, juste qu'il n'y a pas
// de faute de syntaxe qui casserait TOUTE l'appli au chargement (un seul
// script global, sans modules : une erreur n'importe où bloque tout).
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(file, 'utf8');

const scripts = [...html.matchAll(/<script(?:\s+([^>]*))?>([\s\S]*?)<\/script>/g)]
  .map(m => ({ attrs: m[1] || '', code: m[2] }))
  .filter(s => !s.attrs.includes('src=') && s.code.trim().length > 0);

let ok = true;
scripts.forEach((s, i) => {
  const isModule = s.attrs.includes('module');
  // Les imports ES ne sont valides qu'en tête de vrai module — new Function()
  // ne les accepte pas, donc on les retire juste pour le contrôle de syntaxe
  // (les imports eux-mêmes sont une syntaxe fixe, peu susceptible de fautes
  // de frappe accidentelles comparée au reste du code applicatif).
  const code = isModule
    ? s.code.replace(/^\s*import[\s\S]*?from\s*["'][^"']+["'];?\s*$/gm, '')
    : s.code;
  try {
    new Function(code);
    console.log(`Script #${i}${isModule ? ' (module)' : ''} : OK (${code.length} caractères)`);
  } catch (e) {
    ok = false;
    console.error(`Script #${i}${isModule ? ' (module)' : ''} : ERREUR DE SYNTAXE — ${e.message}`);
  }
});

if (!ok) {
  console.error('\nÉchec : au moins un script inline contient une erreur de syntaxe.');
  process.exit(1);
}
console.log(`\n${scripts.length} script(s) inline vérifié(s), tout est OK.`);
