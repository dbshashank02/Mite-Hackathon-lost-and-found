const http = require("http");
const { parseJsonField } = require("./utils");

function postJson(url, body, timeoutMs = 1500) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const u = new URL(url);
    const req = http.request({
      hostname: u.hostname, port: u.port, path: u.pathname, method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data) },
      timeout: timeoutMs,
    }, (res) => {
      let chunks = "";
      res.on("data", d => chunks += d);
      res.on("end", () => {
        try { resolve(JSON.parse(chunks || "[]")); } catch (e) { reject(e); }
      });
    });
    req.on("timeout", () => { req.destroy(new Error("timeout")); });
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

// ---- Fallback JS scorer (mirrors AI engine logic lightly) ----
function tokenize(item) {
  const parts = [item.title, item.category, item.brand, item.color];
  const sensitive = parseJsonField(item.sensitive, {}) || {};
  Object.values(sensitive).forEach(v => { if (v && v !== "REDACTED") parts.push(String(v)); });
  return String(parts.filter(Boolean).join(" ")).toLowerCase().match(/[a-z0-9]+/g) || [];
}
function cosine(a, b) {
  if (!a.length || !b.length) return 0;
  const ca = {}, cb = {}; a.forEach(t => ca[t]=(ca[t]||0)+1); b.forEach(t => cb[t]=(cb[t]||0)+1);
  const vocab = new Set([...Object.keys(ca), ...Object.keys(cb)]);
  let dot=0,na=0,nb=0;
  vocab.forEach(t => { const x=ca[t]||0,y=cb[t]||0; dot+=x*y; na+=x*x; nb+=y*y; });
  return na&&nb ? dot/(Math.sqrt(na)*Math.sqrt(nb)) : 0;
}
function jaccard(a,b){ const sa=new Set(a), sb=new Set(b); if(!sa.size||!sb.size) return 0; let inter=0; sa.forEach(x=>{if(sb.has(x))inter++;}); return inter/new Set([...sa,...sb]).size; }
function parseTime(v){ if(!v) return null; const d=new Date(v); return isNaN(d)?null:d; }
function getCoords(item){ const c=parseJsonField(item.coords, {})||{}; return {x:+c.x||0,y:+c.y||0,lat:c.lat!=null?+c.lat:null,lng:c.lng!=null?+c.lng:null}; }
function haversine(lat1,lon1,lat2,lon2){ const R=6371000,toRad=x=>x*Math.PI/180; const dphi=toRad(lat2-lat1),dl=toRad(lon2-lon1); const a=Math.sin(dphi/2)**2+Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dl/2)**2; return 2*R*Math.atan2(Math.sqrt(a),Math.sqrt(1-a)); }
function locationScore(t,c){ const tc=getCoords(t), cc=getCoords(c); let dist=null; if(tc.lat!=null&&tc.lng!=null&&cc.lat!=null&&cc.lng!=null) dist=haversine(tc.lat,tc.lng,cc.lat,cc.lng); else dist=Math.hypot(tc.x-cc.x,tc.y-cc.y); if(dist<=50) return 100; if(dist>=1000) return 0; return Math.round(100*Math.pow(1-(dist-50)/950,1.2)*100)/100; }
function timeScore(t,c){ const tt=parseTime(t.timestamp||t.createdAt), ct=parseTime(c.timestamp||c.createdAt); if(!tt||!ct) return 40; const tType=(t.type||'').toUpperCase(), cType=(c.type||'').toUpperCase(); const lostT=tType==='LOST'?tt:(cType==='LOST'?ct:tt); const foundT=tType==='LOST'?ct:(cType==='LOST'?tt:ct); if(foundT<lostT) return 0; const dh=Math.abs(ct-tt)/3600000; if(dh<=2) return 100; const maxh=14*24; if(dh>=maxh) return 0; return Math.round(100*Math.pow(1-(dh-2)/(maxh-2),1.1)*100)/100; }
function categoryScore(t,c){ const same=t.category&&c.category&&t.category===c.category; const bt=tokenize({brand:t.brand,title:t.title}), bc=tokenize({brand:c.brand,title:c.title}); const bs=jaccard(bt,bc)*100; if(same) return Math.min(100,70+30*(bs/100)); return bs*0.4; }
function visualScore(t,c){ const base=cosine(tokenize(t),tokenize(c))*100; const vt=tokenize({brand:t.brand,color:t.color,title:t.title,category:t.category}); const vc=tokenize({brand:c.brand,color:c.color,title:c.title,category:c.category}); const vcos=cosine(vt,vc)*100; return 0.5*base+0.5*vcos; }

function fallbackScoreMatches(target, candidates) {
  const results = [];
  for (const cand of (candidates||[])) {
    if (cand.id && target.id && cand.id===target.id) continue;
    const b = { visual: visualScore(target,cand), category: categoryScore(target,cand), location: locationScore(target,cand), time: timeScore(target,cand) };
    const total = b.visual*0.35 + b.category*0.30 + b.location*0.20 + b.time*0.15;
    const breakdown = { visual: Math.round(Math.max(0,Math.min(100,b.visual))), category: Math.round(Math.max(0,Math.min(100,b.category))), location: Math.round(Math.max(0,Math.min(100,b.location))), time: Math.round(Math.max(0,Math.min(100,b.time))) };
    const explanation = [];
    if (breakdown.visual>=60) explanation.push(`Strong visual/description similarity (${breakdown.visual}%).`);
    if (breakdown.category>=70) explanation.push(`Category and attributes align well (${breakdown.category}%).`);
    if (breakdown.location>=70) explanation.push(`Close campus location (${breakdown.location}%).`);
    if (breakdown.time>=70) explanation.push(`Close in time (${breakdown.time}%).`);
    if (!explanation.length) explanation.push("Low overall match based on available attributes.");
    results.push({
      lostItemId: target.type==='LOST'?target.id:cand.id,
      foundItemId: target.type==='LOST'?cand.id:target.id,
      totalScore: Math.round(Math.max(0,Math.min(100,total))*100)/100,
      breakdown, explanation: explanation.slice(0,3)
    });
  }
  results.sort((a,b)=>b.totalScore-a.totalScore);
  return results;
}

async function scoreMatches(targetItem, candidateItems) {
  try {
    return await postJson("http://localhost:8000/score-matches", { targetItem, candidateItems });
  } catch (e) {
    return fallbackScoreMatches(targetItem, candidateItems);
  }
}
async function hotspots(items) {
  try {
    return await postJson("http://localhost:8000/hotspots", { items });
  } catch (e) {
    const counts = {}; (items||[]).forEach(it => { const b=it.buildingId||'UNKNOWN'; counts[b]=(counts[b]||0)+1; });
    const maxc = Math.max(1, ...Object.values(counts));
    const zones = Object.entries(counts).map(([buildingId,count])=>({buildingId,name:`Building ${buildingId}`,count,intensity:Math.round((count/maxc)*10000)/10000})).sort((a,b)=>b.count-a.count);
    return { zones };
  }
}

module.exports = { scoreMatches, hotspots, fallbackScoreMatches };
