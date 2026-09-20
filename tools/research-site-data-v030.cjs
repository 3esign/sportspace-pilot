'use strict';
const fs=require('node:fs'),path=require('node:path');const ROOT=path.resolve(__dirname,'..'),SITE=fs.existsSync(path.join(ROOT,'site/index.html'))?path.join(ROOT,'site'):ROOT;
const read=f=>JSON.parse(fs.readFileSync(path.join(ROOT,'data/processed/science/v025',f),'utf8'));
const data={schema:'sportspace-research-presentation/v030',source:'Saved v025 outputs; scientific models unchanged',summary:read('summary.json'),temporal:read('e3-temporal.json'),meteorology:read('meteorology.json')};
if(data.temporal.length!==12||data.meteorology.monthly.length!==12)throw Error('Unexpected research source dimensions');
fs.mkdirSync(path.join(SITE,'research'),{recursive:true});fs.writeFileSync(path.join(SITE,'data/research-data.js'),'window.SPORTSPACE_RESEARCH='+JSON.stringify(data)+';\n');fs.writeFileSync(path.join(SITE,'research/results.json'),JSON.stringify(data,null,2)+'\n');
console.log(JSON.stringify({ok:true,temporal_scenarios:12,months:12,scientific_models_changed:false}));
