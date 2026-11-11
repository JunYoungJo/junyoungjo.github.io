import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { projects, publicRepositories, ui } from '../src/content.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(projectRoot, 'dist');
const esc = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const lines = value => esc(value).replace(/\n/g, '<br>');
const arrow = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.5"/></svg>';
const external = '<span aria-hidden="true">↗</span>';
const github = 'https://github.com/JunYoungJo';
const ext = (href, text, cls='') => `<a class="${cls}" href="${esc(href)}" target="_blank" rel="noopener noreferrer">${text}${external}</a>`;
const badge = (p,t) => `<span class="badge ${p.status}"><i aria-hidden="true"></i>${t[p.status]}</span>`;
const tags = p => `<span class="platforms">${p.platforms.map(esc).join(' / ')}</span>`;
const image = (src, alt, root, cls='', eager=false) => `<img class="${cls}" src="${root}assets/${src}" alt="${esc(alt)}" loading="${eager?'eager':'lazy'}" decoding="async">`;
const screenshot = (src, alt, root, cls='', label='') => `<button class="image-zoom ${cls}" type="button" data-zoom data-src="${root}assets/${src}" data-alt="${esc(alt)}" aria-label="${esc(alt)} — ${esc(label)}">${image(src,alt,root)}<span class="zoom-indicator" aria-hidden="true">↗</span></button>`;

function context(lang, route) {
  const depth = 1 + route.split('/').filter(Boolean).length;
  const root = '../'.repeat(depth);
  const href = (target='',locale=lang) => `${root}${locale}/${target ? target.replace(/\/$/,'')+'/' : ''}`;
  return {t:ui[lang],lang,route,root,href};
}

function card(p,c,large=false) {
  const {t,lang,root,href}=c, text=p[lang];
  return `<article class="project-card ${p.slug} ${large?'large':''}" data-project data-name="${esc(p.name)}" data-status="${p.status}" data-search="${esc([p.name,text.summary,text.type,...p.stack,...p.platforms].join(' ').toLowerCase())}">
    <a class="project-art" href="${href('projects/'+p.slug)}" tabindex="-1" aria-hidden="true"><div class="art-grid"></div>${image(p.cover,text.type,root,'card-screen '+(p.layout==='portrait'?'portrait':''))}<span class="art-open">${arrow}</span></a>
    <div class="card-content"><div class="card-title">${image(p.icon,'',root,'card-icon')}<h3><a href="${href('projects/'+p.slug)}">${p.name}</a></h3>${badge(p,t)}</div><p class="card-type">${text.type}</p><p class="card-summary">${text.summary}</p><div class="card-bottom">${tags(p)}<a href="${href('projects/'+p.slug)}" aria-label="${p.name} — ${t.details}">${t.details}${arrow}</a></div></div>
  </article>`;
}

function header(c) {
  const {t,lang,root,route,href}=c;
  return `<a class="skip" href="#main">${t.skip}</a><header class="site-header"><div class="container header-inner"><a class="brand" href="${href()}">JunYoungJo<span class="brand-slash"> / </span><span class="brand-label">Portfolio</span></a><button type="button" class="menu-toggle" aria-label="${t.menu}" aria-expanded="false" aria-controls="main-nav"><span></span><span></span></button><nav id="main-nav" aria-label="${lang==='ko'?'주 메뉴':'Main navigation'}">${[['',t.home],['projects',t.projects],['about',t.about]].map(([target,label])=>`<a href="${href(target)}" ${route===target || target==='projects'&&route.startsWith('projects/')?'aria-current="page"':''}>${label}</a>`).join('')}</nav><div class="header-controls"><a class="language-switch" href="${href(route,lang==='ko'?'en':'ko')}" lang="${lang==='ko'?'en':'ko'}" hreflang="${lang==='ko'?'en':'ko'}" data-language="${lang==='ko'?'en':'ko'}" aria-label="${t.otherLang}"><span class="language-current">${lang.toUpperCase()}</span><span aria-hidden="true">/</span><span>${lang==='ko'?'EN':'KO'}</span></a><button class="theme-toggle" type="button" aria-label="${t.theme}" data-theme-toggle data-dark-label="${t.toDark}" data-light-label="${t.toLight}"><svg class="sun" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="3.5" stroke="currentColor" stroke-width="1.5"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" stroke="currentColor" stroke-width="1.5"/></svg><svg class="moon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20.5 14.5A9 9 0 0 1 9.5 3.5a9 9 0 1 0 11 11Z" stroke="currentColor" stroke-width="1.5"/></svg></button></div></div></header>`;
}

function footer(c) {
  const {t,href}=c;
  return `<footer class="site-footer container"><div class="footer-main"><a class="brand" href="${href()}">JunYoungJo</a><p>${t.footer}</p><div class="footer-nav"><a href="${href('projects')}">${t.projects}</a><a href="${href('about')}">${t.about}</a>${ext(github,'GitHub')}</div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} JunYoungJo</span><span>${t.updated}</span><a href="#top">${t.top} ↑</a></div></footer><dialog class="lightbox" aria-label="${t.galleryLabel}"><button type="button" class="lightbox-close" aria-label="${t.close}">×</button><img src="" alt=""><p></p></dialog>`;
}

function home(c) {
  const {t,lang,root,href}=c;
  const featured=projects.filter(p=>p.featured).slice(0,4);
  return `<section class="home-hero container"><div class="hero-intro"><p class="eyebrow">JUNYOUNGJO — SOFTWARE DEVELOPER</p><h1>${lines(t.hero)}</h1><p class="hero-description">${t.heroText}</p><div class="hero-actions"><a class="button" href="${href('projects')}">${t.browse}${arrow}</a><a class="quiet-link" href="${href('about')}">${t.aboutLink}${external}</a></div></div>
    <div class="hero-showcase" data-hero><div class="showcase-backdrop"></div><span class="showcase-label">PROJECT PREVIEW</span><div class="showcase-tabs" role="group" aria-label="${t.projects}">${featured.slice(0,3).map((p,i)=>`<button type="button" data-preview="${p.slug}" aria-pressed="${i===0}">${image(p.icon,'',root)}${p.name}</button>`).join('')}</div>${featured.slice(0,3).map((p,i)=>`<a class="showcase-project ${p.layout==='portrait'?'portrait':''}" href="${href('projects/'+p.slug)}" data-preview-panel="${p.slug}" ${i?'hidden':''}>${image(p.cover,p[lang].type,root,'showcase-screen',true)}<span class="showcase-caption">${p.name}<small>${p[lang].type}</small>${arrow}</span></a>`).join('')}</div>
    <div class="hero-meta"><span>DESKTOP SOFTWARE</span><span>C++ / RUST / TYPESCRIPT</span><a href="#selected">${t.selected}<span>↓</span></a></div></section>
    <section class="section container" id="selected"><div class="section-header reveal"><div><p class="eyebrow">PROJECTS</p><h2>${t.selected}<span class="count">${String(featured.length).padStart(2,'0')}</span></h2></div><a class="text-link" href="${href('projects')}">${t.all}${arrow}</a></div><p class="section-intro reveal">${t.homeIntro}</p><div class="project-grid">${featured.map(p=>card(p,c)).join('')}</div></section>
    <section class="section project-index container"><div class="section-header reveal"><div><p class="eyebrow">INDEX</p><h2>${t.current}</h2></div><p>${t.currentText}</p></div><div class="index-table">${projects.map((p,i)=>`<a href="${href('projects/'+p.slug)}" class="index-row"><span class="index-number">${String(i+1).padStart(2,'0')}</span><span class="index-name">${p.name}<small>${p[lang].type}</small></span><span class="index-platform">${p.platforms.join(' / ')}</span>${badge(p,t)}${arrow}</a>`).join('')}</div></section>
    <section class="about-band"><div class="container about-band-inner"><div><p class="eyebrow">ABOUT</p><h2>${t.aboutTeaser}</h2><p>${t.aboutTeaserText}</p></div><a class="circle-link" href="${href('about')}" aria-label="${t.aboutLink}">${arrow}</a></div></section>`;
}

function directory(c) {
  const {t}=c;
  return `<section class="page-intro container"><p class="eyebrow">PROJECT DIRECTORY</p><h1>${t.directoryTitle}<span class="count">${String(projects.length).padStart(2,'0')}</span></h1><p>${t.directoryText}</p></section><section class="directory container" data-directory><div class="directory-toolbar"><div class="filter-tabs" role="group" aria-label="${t.status}">${[['all',t.filterAll],['available',t.filterAvailable],['development',t.filterDevelopment]].map(([key,label])=>`<button type="button" data-filter="${key}" aria-pressed="${key==='all'}">${label}</button>`).join('')}</div><label class="project-search"><span class="sr-only">${t.search}</span><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="6" stroke="currentColor" stroke-width="1.5"/><path d="m15 15 5 5" stroke="currentColor" stroke-width="1.5"/></svg><input type="search" placeholder="${t.searchPlaceholder}" data-search autocomplete="off"></label></div><div class="directory-meta"><output data-result-count aria-live="polite" data-label="${t.results}">${projects.length} ${t.results}</output><label>${t.sort}<select data-sort><option value="default">${t.orderDefault}</option><option value="name">${t.orderName}</option></select></label></div><div class="project-grid" data-project-grid>${projects.map(p=>card(p,c,true)).join('')}</div><div class="empty-state" hidden data-empty><p>${t.noResults}</p><button type="button" class="button" data-reset>${t.reset}</button></div></section>`;
}

function detail(p,c) {
  const {t,lang,root,href}=c, text=p[lang];
  const others=projects.filter(other=>other.slug!==p.slug).slice(0,3);
  return `<div class="project-page ${p.slug}"><section class="detail-hero container"><a class="breadcrumb" href="${href('projects')}">← ${t.backProjects}</a><div class="detail-title-row"><div class="detail-identity">${image(p.icon,'',root)}<div><h1>${p.name}</h1><p>${text.type}</p></div></div>${badge(p,t)}</div><div class="detail-intro"><h2>${lines(text.heading)}</h2><div><p>${text.intro}</p><div class="hero-actions">${p.download||p.repo?ext(p.download||p.repo,p.download?t.download:t.readDocs,'button'):`<a class="button" href="#start">${t.gettingStarted}${arrow}</a>`}${p.download&&p.repo?ext(p.repo,'GitHub','quiet-link'):''}</div></div></div><div class="detail-facts"><span>${tags(p)}</span><span>${p.stack.slice(0,4).join(' / ')}</span><span>${p.license?esc(p.license)+' LICENSE':t.development}</span></div></section>
    <section class="detail-cover container"><div class="detail-cover-stage ${p.slug}"><div class="cover-caption"><span>${t.actualScreen}</span><div class="screenshot-theme" role="group" aria-label="${t.screenTheme}"><button type="button" data-screen-theme="dark" aria-pressed="true">${t.dark}</button><button type="button" data-screen-theme="light" aria-pressed="false">${t.light}</button></div></div><button class="image-zoom cover-zoom" type="button" data-zoom data-cover data-light-src="${root}assets/${p.lightCover}" data-src="${root}assets/${p.cover}" data-alt="${p.name} — ${t.actualScreen}" aria-label="${t.enlarge}">${image(p.cover,p.name+' — '+t.actualScreen,root,'detail-cover-image',true)}<span class="zoom-indicator" aria-hidden="true">↗</span></button></div></section>
    <nav class="detail-nav" aria-label="${p.name}"><div class="container"><span>${p.name}</span>${[['overview',t.overview],['features',t.features],['screens',t.screenshots],['start',t.gettingStarted],['faq',t.faq]].map(([id,title])=>`<a href="#${id}">${title}</a>`).join('')}</div></nav>
    <section class="detail-section container overview" id="overview"><div class="detail-label"><span class="eyebrow">01 / ${t.overview}</span></div><div class="overview-copy"><h2>${text.type}</h2><p>${text.overview}</p></div></section>
    <section class="detail-section container" id="features"><div class="section-header reveal"><div><p class="eyebrow">02 / FEATURES</p><h2>${t.features}</h2></div></div><div class="feature-grid">${text.features.map(([title,body],i)=>`<article class="feature reveal"><span class="feature-number">${String(i+1).padStart(2,'0')}</span><h3>${title}</h3><p>${body}</p></article>`).join('')}</div></section>
    <section class="screens-section" id="screens"><div class="container"><div class="section-header reveal"><div><p class="eyebrow">03 / INTERFACE</p><h2>${t.screenshots}</h2></div><p>${t.galleryHint}</p></div>${text.sections.map((s,i)=>`<article class="screen-story reveal ${s.narrow?'narrow':''}"><div class="screen-story-copy"><span class="screen-number">${String(i+1).padStart(2,'0')} / ${String(text.sections.length).padStart(2,'0')}</span><h3>${s.title}</h3><p>${s.text}</p></div><figure><div class="story-image-stage">${screenshot(s.image,s.alt,root,'',t.enlarge)}</div><figcaption>${t.actualScreen}</figcaption></figure></article>`).join('')}</div></section>
    <section class="detail-section container" id="start"><div class="section-header reveal"><div><p class="eyebrow">04 / GETTING STARTED</p><h2>${t.gettingStarted}</h2></div></div><div class="steps">${text.steps.map(([title,body],i)=>`<article class="step reveal"><span>${String(i+1).padStart(2,'0')}</span><h3>${title}</h3><p>${body}</p></article>`).join('')}</div><div class="installation"><div><h3>${t.requirements}</h3><p>${text.installNote}</p></div>${p.download||p.repo?ext(p.download||p.repo,p.download?t.download:t.repository,'button'):badge(p,t)}</div></section>
    <section class="detail-section container faq-section" id="faq"><div><p class="eyebrow">05 / FAQ</p><h2>${t.faq}</h2><div class="stack-label">${t.stack}</div><div class="stack-list">${p.stack.map(x=>`<span>${x}</span>`).join('')}</div></div><div class="faq-list">${text.faqs.map(([question,answer])=>`<details><summary>${question}<span aria-hidden="true">＋</span></summary><p>${answer}</p></details>`).join('')}</div></section>
    ${others.length?`<section class="related-section container"><div class="section-header"><div><p class="eyebrow">EXPLORE</p><h2>${t.related}</h2></div><a class="text-link" href="${href('projects')}">${t.all}${arrow}</a></div>${others.map(other=>`<a class="related-project" href="${href('projects/'+other.slug)}">${image(other.icon,'',root)}<div><h3>${other.name}</h3><p>${other[lang].summary}</p></div>${arrow}</a>`).join('')}</section>`:''}</div>`;
}

function about(c) {
  const {t,lang,href}=c;
  return `<section class="about-hero container"><p class="eyebrow">ABOUT</p><h1>${t.aboutTitle}<span class="about-period">.</span></h1><div class="about-hero-body"><p class="about-role">${t.aboutSubtitle}</p><div><p class="about-lead">${t.aboutBody}</p><p>${t.aboutBody2}</p>${ext(github,'GitHub','text-link')}</div></div></section>
    <section class="section container"><div class="section-header"><div><p class="eyebrow">FOCUS</p><h2>${t.areas}</h2></div></div><div class="focus-list">${t.areaItems.map(([title,body],i)=>`<article class="focus-row reveal"><span>0${i+1}</span><h3>${title}</h3><p>${body}</p></article>`).join('')}</div></section>
    <section class="technology-section"><div class="container"><div class="section-header"><div><p class="eyebrow">TECHNOLOGY</p><h2>${t.techTitle}</h2></div></div><div class="technology-grid">${t.techGroups.map(([title,items])=>`<article><h3>${title}</h3><div>${items.map(item=>`<span>${item}</span>`).join('')}</div></article>`).join('')}</div></div></section>
    <section class="section container ai-workflow"><div class="section-header"><div><p class="eyebrow">AI-ASSISTED DEVELOPMENT</p><h2>${t.aiTitle}</h2></div></div><p class="section-intro">${t.aiIntro}</p><div class="ai-grid">${t.aiItems.map(([title,body],i)=>`<article class="reveal"><span class="feature-number">0${i+1}</span><h3>${title}</h3><p>${body}</p></article>`).join('')}</div></section>
    <section class="section container"><div class="section-header"><div><p class="eyebrow">CURRENT PROJECTS</p><h2>${t.projects}</h2></div><a class="text-link" href="${href('projects')}">${t.all}${arrow}</a></div><div class="project-grid">${projects.map(p=>card(p,c)).join('')}</div></section>
    <section class="section container public-code"><div class="section-header"><div><p class="eyebrow">OPEN SOURCE</p><h2>${t.publicCode}</h2></div></div><p class="section-intro">${t.publicCodeText}</p><div class="repository-list">${publicRepositories.map(repo=>`<a class="repository-row" href="${repo.url}" target="_blank" rel="noopener noreferrer"><div><h3>${repo.name}</h3><p>${repo[lang]}</p></div><span class="repository-language">${repo.language}</span>${arrow}</a>`).join('')}</div></section>
    <section class="contact-band"><div class="container"><div><p class="eyebrow">ELSEWHERE</p><h2>${t.find}</h2><p>${t.findText}</p></div>${ext(github,'github.com/JunYoungJo','text-link')}</div></section>`;
}

function shell(c,body,title,description) {
  const {lang,root,route,t,href}=c;
  return `<!doctype html><html lang="${lang}" data-locale="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><meta name="description" content="${esc(description)}"><title>${esc(title)} — JunYoungJo</title><meta property="og:title" content="${esc(title)} — JunYoungJo"><meta property="og:description" content="${esc(description)}"><meta property="og:type" content="website"><link rel="icon" href="${root}assets/lumber.svg" type="image/svg+xml"><link rel="alternate" hreflang="ko" href="${href(route,'ko')}"><link rel="alternate" hreflang="en" href="${href(route,'en')}"><script>try{const t=localStorage.getItem('portfolio-theme');document.documentElement.dataset.theme=t==='dark'||t==='light'?t:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';localStorage.setItem('portfolio-language','${lang}')}catch{}</script><link rel="stylesheet" href="${root}styles.css"><script src="${root}app.js" defer></script></head><body id="top" data-root="${root}">${header(c)}<main id="main">${body}</main>${footer(c)}</body></html>`;
}

const pages=[];
for (const lang of ['ko','en']) {
  const t=ui[lang];
  for (const route of ['', 'projects', 'about', ...projects.map(p=>'projects/'+p.slug)]) {
    const c=context(lang,route), p=projects.find(x=>route==='projects/'+x.slug);
    const body=p?detail(p,c):route==='projects'?directory(c):route==='about'?about(c):home(c);
    const title=p?p.name:route==='projects'?t.projects:route==='about'?t.about:'Portfolio';
    const description=p?p[lang].summary:t.heroText;
    const file=path.join(out,lang,route,'index.html');
    fs.mkdirSync(path.dirname(file),{recursive:true});
    fs.writeFileSync(file,shell(c,body,title,description));pages.push(path.relative(out,file));
  }
}
fs.copyFileSync(path.join(projectRoot,'src/styles.css'),path.join(out,'styles.css'));
fs.copyFileSync(path.join(projectRoot,'src/app.js'),path.join(out,'app.js'));
fs.writeFileSync(path.join(out,'index.html'),`<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Software projects by JunYoungJo. Lumber and Lore."><title>JunYoungJo — Portfolio</title><script>try{const l=localStorage.getItem('portfolio-language');location.replace((l==='en'||l==='ko'?l:navigator.language.toLowerCase().startsWith('ko')?'ko':'en')+'/')}catch{location.replace('ko/')}</script><link rel="stylesheet" href="styles.css"></head><body><main class="language-landing"><h1>JunYoungJo</h1><p>Software projects</p><a class="button" href="ko/">한국어</a> <a class="button" href="en/">English</a></main></body></html>`);
fs.writeFileSync(path.join(out,'404.html'),`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>404 — JunYoungJo</title></head><body style="font-family:system-ui;padding:10vw;background:#f4f3f0;color:#272727"><h1>404</h1><p>Page not found / 페이지를 찾을 수 없습니다.</p><a href="./">Home / 홈</a></body></html>`);
fs.writeFileSync(path.join(out,'.nojekyll'),'');
console.log(`Generated ${pages.length} localized pages + root and 404. Projects: ${projects.map(p=>p.name).join(', ')}.`);
