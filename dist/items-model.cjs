"use strict";const e={string:function(e){return"string"==typeof e},object:function(e){return"object"==typeof e&&null!==e&&!Array.isArray(e)},array:function(e){return Array.isArray(e)},bool:function(e){return"boolean"==typeof e},number:function(e){return"number"==typeof e},func:function(e){return"function"==typeof e},nul:function(e){return null===e},undef:function(e){return void 0===e||void 0===e}};function t(t,r,n,i){this.name=t,this.namespace=r,this.func=n,this.priority=e.number(i)?i:1}function r(r){this.config={},Object.defineProperty(this.config,"maxListeners",{value:r&&"number"==typeof r.maxListeners?r.maxListeners:50,writable:!1,enumerable:!0}),Object.defineProperty(this.config,"maxOnceListeners",{value:r&&"number"==typeof r.maxOnceListeners?r.maxOnceListeners:50,writable:!1,enumerable:!0});const n=[],i=[],s=e=>n.filter((t=>t.name===e)).length>=this.config.maxListeners,o=e=>i.filter((t=>t.name===e)).length>=this.config.maxListeners,u=(e,t)=>{let r=n.length;for(;r;)if(r-=1,n[r].name===e&&n[r].namespace===t)return r;return-1};this.register=(r,i,o,l)=>{if(!r)return;if(void 0!==l&&!e.number(l))throw new Error("priority must be a number");if(e.func(i))if(e.string(o)){const e=o;o=i,i=e}else e.number(o)&&(l=o),o=i,i="all";const f=u(r,i),a=new t(r,i,o,l);-1===f?s(r)?console.warn(`Max listeners reached for event ${r}`):n.push(a):n[f]=a,n.sort(((e,t)=>e.priority===t.priority?0:e.priority<t.priority?1:-1))},this.on=this.register,this.subscribe=this.register,this.once=(e,r,n)=>{if(!e)return;const s=new t(e,"",r,n);o(e)?console.warn(`Max once listeners reached for event ${e}`):i.push(s),i.sort(((e,t)=>e.priority===t.priority?0:e.priority>t.priority?1:-1))},this.onMany=(e,t)=>{t&&Object.keys(t).forEach((r=>{this.on(r,e,t[r])}))},this.unregister=(e,t)=>{if(!e)return;let r=0;if("all"!==(t=t||"all"))r=u(e,t),-1!==r&&n.splice(r,1);else{for(r=n.length;r;)r-=1,n[r].name===e&&"all"===n[r].namespace&&n.splice(r,1);for(r=i.length;r;)r-=1,i[r].name===e&&i.splice(r,1)}},this.off=this.unregister,this.unsubscribe=this.unregister,this.offAll=e=>{let t=n.length;for(;t;)t-=1,n[t].namespace===e&&n.splice(t,1)},this.trigger=(e,t)=>{const r=(e=>{const t=[];for(let r=0,i=n.length;r<i;r+=1)((n[r].name.indexOf("*")>-1||n[r].name.indexOf("?")>-1)&&new RegExp(n[r].name.replace(/\*/g,".*")).test(e)||n[r].name===e)&&t.push(n[r]);return t})(e);for(let n=0,i=r.length;n<i;n+=1)r[n].func(t,e);((e,t)=>{let r=i.length;for(;r;)r-=1,((i[r].name.indexOf("*")>-1||i[r].name.indexOf("?")>-1)&&new RegExp(i[r].name.replace(/\*/g,".*").replace(/\?/g,".")).test(e)||i[r].name===e)&&(i[r].func(t,e),i.splice(r,1))})(e,t)},this.emit=this.trigger,this.publish=this.trigger,this.propagate=(e,t)=>{this.trigger(t,e)},this.isRegistered=(e,t)=>{t=t||"all";let r=n.length;for(;r;)if(r-=1,n[r].namespace===t&&n[r].name===e)return!0;for(r=i.length;r;)if(r-=1,i[r].name===e)return!0;return!1}}r.HIGH_PRIORITY=2,r.NORMAL_PRIORITY=1,r.LOW_PRIORITY=0;const n={object:e=>"object"==typeof e&&null!==e,number:e=>"number"==typeof e,string:e=>"string"==typeof e,array:e=>Array.isArray(e),undef:e=>void 0===e,validID:e=>n.number(e)||n.string(e)},i=(e,t)=>{let r=!1;return!(!n.object(e)||!n.object(t))&&(Object.keys(t).forEach((s=>{if(n.object(e[s]))r=i(e[s],t[s]);else if(n.array(e[s])&&n.array(t[s]))for(var o=0,u=t[s].length;o<u;o++)n.object(e[s][o])?r=i(e[s][o],t[s][o]):e[s][o]!==t[s][o]&&(e[s][o]=t[s][o],r=!0);else e[s]!==t[s]&&(e[s]=t[s],r=!0)})),r)};module.exports=function(e){const t=this;Object.assign(this,new r);const s=e.itemConstructor;let o=!1;n.validID(s.prototype.id)||(s.prototype.id=-1,o=!0);const u=()=>{let e=f.length;return t.getAllIds().reduce(((e,t)=>Math.max(e,t)),e)},l=e.itemName;this.getName=function(){return l};const f=new Map,a=new Map;this.clear=function(){f.clear(),a.clear()},this.add=function(e){return!!n.object(e)&&(e=new s(e),o&&-1===e.id&&(e.id=u()),f.set(e.id,e),t.emit(`added-${l}`,e),((e,r)=>{const n=r||f.size-1;a.set(e,n),t.emit(`indexed-${l}`,`id: ${e}, index: ${n}`)})(e.id),!0)},this.addAll=function(e){return!!n.array(e)&&(e.forEach((e=>{t.add(e)})),!0)},this.getAll=function(){return Array.from(f.values())},this.getAllIds=function(){return Array.from(f.keys()).filter((e=>n.string(e)||n.number(e)))};const c=window&&window.structuredClone?structuredClone:e=>Object.assign({},e);this.getCopies=function(){return t.getAll().map((e=>c(e)))},this.getCopy=function(e){let t=f.get(e);return t?c(t):t},this.getById=function(e){return f.get(e)||null},this.getIndex=function(e){if(!n.validID(e))return-1;let t=a.get(e);return n.undef(t)?-1:t};const h=(e,t)=>{if(t.includes(".")){let r=t.split(".").filter((e=>!!e.trim())),n={...e};for(let e=0,t=r.length;e<t;e++)n=n[r[e]];return n}return e[t]};this.getByAttribute=function(e,t){if(!n.string(e)||n.undef(t))return null;for(let r of f.values()){if(h(r,e)===t)return r}return null},this.getFirstByAttribute=this.getByAttribute,this.getAllByAttribute=function(e,t){let r=[];if(!n.string(e)||n.undef(t))return r;for(let n of f.values()){t===h(n,e)&&r.push(n)}return r},this.setAttributes=function(e,r){if(!n.validID(e)||!n.object(r))return!1;if(n.string(e)&&!e.trim())return!1;let s=t.getById(e);return null!==s&&(!!i(s,r)&&(f.set(s.id,s),t.emit(`set-${l}`,s),!0))},this.setAttributesByAttribute=function(e,r,s){if(!n.string(e)||!n.object(s))return[];if(s.id&&delete s.id,Object.keys(s).length<1)return[];return this.getAllByAttribute(e,r).map((e=>i(e,s)?(f.set(e.id,e),t.emit(`set-${l}`,e),{[e.id]:!0}):{[e.id]:!1}))},this.insert=function(e,r){if(!n.validID(e)||!n.array(r))return!1;let i=t.getIndex(e);if(-1===i)return!1;let c=[];for(let e=0,n=r.length;e<n;e++)t.update(r[e])||c.push(r[e]);const h=Array.from(f.values());return c.forEach(((e,r)=>{e=new s(e),o&&-1===e.id&&(e.id=u());const n=i+1+r;h.splice(n,0,e),t.emit(`inserted-${l}`,e)})),t.clear(),h.forEach(((e,t)=>{f.set(e.id,e),a.set(e.id,t)})),!0},this.upsert=this.insert,this.update=function(e){if(!n.object(e)||!n.validID(e.id))return!1;if(-1===t.getIndex(e.id))return!1;let r=t.getById(e.id);return!!i(r,e)&&(f.set(e.id,r),t.emit(`updated-${l}`,r),!0)},this.remove=function(e){if(!n.validID(e))return!1;if(f.delete(e)){t.emit(`removed-${l}`,e);const r=a.get(e);return a.delete(e),a.forEach(((e,t)=>{e>=r&&a.set(t,e-1)})),!0}return!1}};
