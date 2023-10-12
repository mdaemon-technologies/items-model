!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):(t="undefined"!=typeof globalThis?globalThis:t||self)["items-model"]=e()}(this,(function(){"use strict";const t={string:function(t){return"string"==typeof t},object:function(t){return"object"==typeof t&&null!==t&&!Array.isArray(t)},array:function(t){return Array.isArray(t)},bool:function(t){return"boolean"==typeof t},number:function(t){return"number"==typeof t},func:function(t){return"function"==typeof t},nul:function(t){return null===t},undef:function(t){return void 0===t||void 0===t}};function e(t,e,n){this.name=t,this.id=e,this.func=n}function n(){const n=[],r=[],i=(t,e)=>{let r=n.length;for(;r;)if(r-=1,n[r].name===t&&n[r].id===e)return r;return-1};this.register=(r,s,u)=>{const o=r;let l=u,f=s;if(t.func(f))if(t.string(l)){const t=l;l=f,f=t}else l=s,f="all";if(!o)return;const c=i(o,f),d=new e(o,f,l);-1===c?n.push(d):n[c]=d},this.on=this.register,this.subscribe=this.register,this.once=(t,n)=>{if(!t)return;const i=new e(t,"",n);r.push(i)},this.onMany=(t,e)=>{e&&Object.keys(e).forEach((n=>{this.on(n,t,e[n])}))},this.unregister=(t,e)=>{if(!t)return;let s=0;if("all"!==(e||"all"))s=i(t,e),-1!==s&&n.splice(s,1);else{for(s=n.length;s;)s-=1,"all"===n[s].id&&n.splice(s,1);for(s=r.length;s;)s-=1,r[s].name===t&&r.splice(s,1)}},this.off=this.unregister,this.unsubscribe=this.unregister,this.offAll=t=>{let e=n.length;for(;e;)e-=1,n[e].id===t&&n.splice(e,1)},this.trigger=(t,e)=>{const i=(t=>{const e=[];for(let r=0,i=n.length;r<i;r+=1)n[r].name===t&&e.push(n[r]);return e})(t);for(let n=0,r=i.length;n<r;n+=1)i[n].func(e,t);let s=r.length;for(;s;)s-=1,r[s].name===t&&(r[s].func(e,t),r.splice(s,1))},this.emit=this.trigger,this.publish=this.trigger,this.propagate=(t,e)=>{this.trigger(e,t)},this.isRegistered=(t,e)=>{const i=e||"all";let s=n.length;for(;s;)if(s-=1,n[s].id===i&&n[s].name===t)return!0;for(s=r.length;s;)if(s-=1,r[s].name===t)return!0;return!1}}const r={object:t=>"object"==typeof t&&null!==t,number:t=>"number"==typeof t,string:t=>"string"==typeof t,array:t=>Array.isArray(t),undef:t=>void 0===t,validID:t=>r.number(t)||r.string(t)},i=(t,e)=>{let n=!1;return!(!r.object(t)||!r.object(e))&&(Object.keys(e).forEach((s=>{if(r.object(t[s]))n=i(t[s],e[s]);else if(r.array(t[s])&&r.array(e[s]))for(var u=0,o=e[s].length;u<o;u++)r.object(t[s][u])?n=i(t[s][u],e[s][u]):t[s][u]!==e[s][u]&&(t[s][u]=e[s][u],n=!0);else t[s]!==e[s]&&(t[s]=e[s],n=!0)})),n)};return function(t){const e=this;Object.assign(this,new n);const s=t.itemConstructor;let u=!1;r.validID(s.prototype.id)||(s.prototype.id=-1,u=!0);const o=()=>{let t=f.length;return e.getAllIds().reduce(((t,e)=>Math.max(t,e)),t)},l=t.itemName;this.getName=function(){return l};const f=new Map,c=new Map;this.clear=function(){f.clear(),c.clear()},this.add=function(t){return!!r.object(t)&&(t=new s(t),u&&-1===t.id&&(t.id=o()),f.set(t.id,t),e.emit(`added-${l}`,t),((t,n)=>{const r=n||f.size-1;c.set(t,r),e.emit(`indexed-${l}`,`id: ${t}, index: ${r}`)})(t.id),!0)},this.getAll=function(){return Array.from(f.values())},this.getAllIds=function(){return Array.from(f.keys()).filter((t=>r.string(t)||r.number(t)))};const d=window&&window.structuredClone?structuredClone:t=>Object.assign({},t);this.getCopies=function(){return e.getAll().map((t=>d(t)))},this.getCopy=function(t){let e=f.get(t);return e?d(e):e},this.getById=function(t){return f.get(t)||null},this.getIndex=function(t){if(!r.validID(t))return-1;let e=c.get(t);return r.undef(e)?-1:e};const a=(t,e)=>{if(e.includes(".")){let n=e.split(".").filter((t=>!!t.trim())),r={...t};for(let t=0,e=n.length;t<e;t++)r=r[n[t]];return r}return t[e]};this.getByAttribute=function(t,e){if(!r.string(t)||r.undef(e))return null;for(let n of f.values()){if(a(n,t)===e)return n}return null},this.getAllByAttribute=function(t,e){let n=[];if(!r.string(t)||r.undef(e))return n;for(let r of f.values()){e===a(r,t)&&n.push(r)}return n},this.setAttributes=function(t,n){if(!r.validID(t)||!r.object(n))return!1;if(r.string(t)&&!t.trim())return!1;let s=e.getById(t);return null!==s&&(!!i(s,n)&&(f.set(s.id,s),e.emit(`set-${l}-${s.id}`,s),!0))},this.insert=function(t,n){if(!r.validID(t)||!r.array(n))return!1;let i=e.getIndex(t);if(-1===i)return!1;let d=[];for(let t=0,r=n.length;t<r;t++)e.update(n[t])||d.push(n[t]);const a=Array.from(f.values());return d.forEach(((t,n)=>{t=new s(t),u&&-1===t.id&&(t.id=o());const r=i+1+n;a.splice(r,0,t),e.emit(`inserted-${l}-${t.id}`,t)})),e.clear(),a.forEach(((t,e)=>{f.set(t.id,t),c.set(t.id,e)})),!0},this.upsert=this.insert,this.update=function(t){if(!r.object(t)||!r.validID(t.id))return!1;if(-1===e.getIndex(t.id))return!1;let n=e.getById(t.id);return!!i(n,t)&&(f.set(t.id,n),e.emit(`updated-${l}-${t.id}`,n),!0)},this.remove=function(t){if(!r.validID(t))return!1;if(f.delete(t)){e.emit(`removed-${l}-${t}`);const n=c.get(t);return c.delete(t),c.forEach(((t,e)=>{t>=n&&c.set(e,t-1)})),!0}return!1}}}));
