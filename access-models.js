/* Published accessibility families with explicit demonstration parameters. */
(() => {'use strict';
 function score(times,{model='nearest',threshold=15,halfLife=15}={}){
  if(!['nearest','cumulative','potential'].includes(model))throw Error('Unknown model');
  if(!Number.isFinite(threshold)||threshold<0||!Number.isFinite(halfLife)||halfLife<=0)throw Error('Invalid model parameters');
  const valid=times.filter(t=>Number.isFinite(t)&&t>=0);if(!valid.length)return null;
  if(model==='nearest')return Math.min(...valid);
  if(model==='cumulative')return valid.filter(t=>t<=threshold).length;
  return valid.reduce((sum,t)=>sum+Math.pow(2,-t/halfLife),0);
 }
 function frontier(rows){return rows.filter(a=>Number.isFinite(a.time)&&Number.isFinite(a.vegetation)&&!rows.some(b=>b.id!==a.id&&Number.isFinite(b.time)&&Number.isFinite(b.vegetation)&&b.time<=a.time&&b.vegetation>=a.vegetation&&(b.time<a.time||b.vegetation>a.vegetation))).map(r=>r.id);}
 const api={score,frontier};if(typeof module!=='undefined'&&module.exports)module.exports=api;else window.SportSpaceAccessModels=api;
})();
