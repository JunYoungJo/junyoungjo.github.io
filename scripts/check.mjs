import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { projects, ui } from '../src/content.mjs';

const root = path.resolve('dist');
const pages = [];
const walk = directory => fs.readdirSync(directory,{withFileTypes:true}).forEach(entry => {
  const file=path.join(directory,entry.name);
  if(entry.isDirectory()) walk(file); else if(file.endsWith('.html')) pages.push(file);
});
walk(root);
let references=0;
const errors=[];
for(const file of pages) {
  const html=fs.readFileSync(file,'utf8');
  for(const match of html.matchAll(/(?:href|src|data-src)="([^"]+)"/g)) {
    const value=match[1];
    if(!value||/^(?:https?:|mailto:|data:)/.test(value)) continue;
    const [url,hash]=value.split('#');
    const target=path.resolve(path.dirname(file),url||'.');
    let actual=url?target:file;
    if(fs.existsSync(actual)&&fs.statSync(actual).isDirectory()) actual=path.join(actual,'index.html');
    if(!fs.existsSync(actual)) { errors.push(`${path.relative(root,file)}: missing ${value}`); continue; }
    if(hash&&actual.endsWith('.html')&&!fs.readFileSync(actual,'utf8').includes(`id="${hash}"`)) errors.push(`${path.relative(root,file)}: missing anchor ${value}`);
    references++;
  }
  if(file.includes('/ko/')||file.includes('/en/')) {
    const lang=file.includes('/ko/')?'ko':'en';
    assert(html.includes(`<html lang="${lang}"`),`Incorrect locale: ${file}`);
    assert(html.includes('hreflang="ko"')&&html.includes('hreflang="en"'),`Missing language routes: ${file}`);
    assert(html.includes('data-theme-toggle'),`Missing theme toggle: ${file}`);
    const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
    assert.equal(new Set(ids).size,ids.length,`Duplicate IDs: ${file}`);
    if(lang==='en') assert(!/[가-힣]/.test(html.replace(/<a class="language-switch"[\s\S]*?<\/a>/,'')),`Untranslated Korean content: ${file}`);
  }
}
for(const p of projects) {
  for(const lang of ['ko','en']) {
    assert(p[lang]?.features?.length>=1,`Missing localized features for ${p.slug}/${lang}`);
    assert(p[lang]?.sections?.length>=1,`Missing localized screenshots for ${p.slug}/${lang}`);
    assert(fs.existsSync(path.join(root,lang,'projects',p.slug,'index.html')),`Missing detail page for ${p.slug}/${lang}`);
  }
}
assert.deepEqual(Object.keys(ui.ko).sort(),Object.keys(ui.en).sort(),'Language dictionaries have different keys');
assert(!errors.length,errors.join('\n'));
console.log(`Checked ${pages.length} pages, ${references} local references, bilingual route pairs, anchor targets, IDs, and project content.`);
