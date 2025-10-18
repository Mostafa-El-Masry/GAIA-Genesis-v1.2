#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const SRC_DIRS = ['app','components','lib','hooks'].map(p=>path.join(root,p)).filter(p=>fs.existsSync(p));
const exts = ['.tsx','.ts','.jsx','.js'];
const files = [];
function walk(dir){
  for(const name of fs.readdirSync(dir)){ const full=path.join(dir,name); const stat=fs.statSync(full);
    if(stat.isDirectory()) walk(full); else if(exts.includes(path.extname(full))) files.push(full);
  }
}
for(const d of SRC_DIRS) walk(d);
const importRx = /from\s+['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g;
const issues = [];
function resolveCaseSensitive(importPath){
  // Only check project paths
  if (!importPath.startsWith('./') && !importPath.startsWith('../') && !importPath.startsWith('@/')) return null;
  // Normalize alias @/
  let rel = importPath.startsWith('@/') ? importPath.slice(2) : path.normalize(importPath);
  let full = importPath.startsWith('@/') ? path.join(root, rel) : path.join(path.dirname(this), rel);
  // try to find a matching file or index in a case-insensitive way
  function existsExact(p){ if (fs.existsSync(p)) return p; for(const e of exts){ if(fs.existsSync(p+e)) return p+e; }
    const pIndex = path.join(p,'index'); for(const e of exts){ if(fs.existsSync(pIndex+e)) return pIndex+e; } return null; }
  if (existsExact(full)) return null; // not a case issue if it just doesn't exist; still report
  // attempt case-insensitive walk to detect case mismatch
  const parts = full.split(path.sep); let probe = parts[0]===''?path.sep:parts[0];
  for(let i=1;i<parts.length;i++){
    const seg = parts[i]; if(!fs.existsSync(probe)) break;
    const names = fs.readdirSync(probe);
    const match = names.find(n => n.toLowerCase() === seg.toLowerCase());
    if(!match){ probe = path.join(probe, seg); break; } else { probe = path.join(probe, match); }
  }
  const guess = existsExact(probe);
  if(guess){ return { expected: guess, requested: full }; }
  return { missing: full };
}
for(const file of files){
  const text = fs.readFileSync(file, 'utf8');
  importRx.lastIndex = 0;
  let m; while((m = importRx.exec(text))){
    const spec = m[1] || m[2];
    const res = resolveCaseSensitive.call(file, spec);
    if(res && (res.expected || res.missing)){
      issues.push({ file, import: spec, expected: res.expected, missing: res.missing });
    }
  }
}
if(issues.length===0){ console.log('✅ No case issues detected.'); process.exit(0); }
console.log('⚠️ Potential case/resolve issues:');
for(const it of issues){
  if(it.expected){
    console.log('-', it.file, '\n   import', it.import, '\n   -> actual on disk:', it.expected);
  }else{
    console.log('-', it.file, '\n   import', it.import, '\n   -> missing on disk:', it.missing);
  }
}
process.exit(1);
