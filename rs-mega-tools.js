/* RS Mega Tools: knowledge gaps, scholar network, quote challenge and 25-mark dialogue simulator. */
(function(){
"use strict";
if(document.getElementById("rs-mega-launch"))return;

var KEY="aqa-rs-mega-tools-v1";
var state={gapRuns:0,gaps:0,secure:0,quoteCorrect:0,quoteTotal:0,dialogueRuns:0};
try{var saved=JSON.parse(localStorage.getItem(KEY)||"null");if(saved&&typeof saved==="object")Object.assign(state,saved);}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){}}
function esc(v){return String(v==null?"":v).replace(/[&<>"']/g,function(c){return({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c];});}
function norm(s){return String(s||"").toLowerCase().replace(/\s+/g," ").trim();}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
function pick(a){return a[Math.floor(Math.random()*a.length)];}
function smartCards(){try{return window.__aqaSmart&&typeof window.__aqaSmart.cards==="function"?window.__aqaSmart.cards():[];}catch(e){return[];}}
function topics(){
 var out=[{id:"all",title:"All topics"}];
 try{if(typeof TOPICS!=="undefined")TOPICS.forEach(function(t){out.push({id:t.id,title:t.title});});}catch(e){}
 return out;
}
function bank(){
 try{return typeof BANK!=="undefined"&&Array.isArray(BANK)?BANK:[];}catch(e){return[];}
}
function scholarEntries(){
 return bank().filter(function(x){return Array.isArray(x)&&x[2]==="idea";}).map(function(x,i){return{id:"s"+i,tags:String(x[0]||"").split(/\s+/).filter(Boolean),name:x[1]||"Scholar",idea:x[3]||"",source:x[4]||"",use:x[5]||""};});
}
function quoteEntries(){
 return bank().filter(function(x){return Array.isArray(x)&&x[2]==="quote";}).map(function(x,i){return{id:"q"+i,tags:String(x[0]||"").split(/\s+/).filter(Boolean),name:x[1]||"Source",quote:x[3]||"",source:x[4]||"",use:x[5]||""};});
}

var css=document.createElement("style");
css.textContent=[
"#rs-mega-launch{position:fixed;left:1rem;bottom:1rem;z-index:49;background:var(--accent,#d6a7ff);color:var(--ink,#1d1024);border:0;border-radius:999px;padding:.8rem 1rem;font-weight:800;box-shadow:0 8px 28px #0008}",
"#rs-mega-dialog{width:min(1120px,97vw);max-height:94vh;background:var(--surface,#1b1d25);color:var(--text,#f4eef8);border:1px solid var(--line,#44394d);border-radius:16px;padding:1rem}",
"#rs-mega-dialog::backdrop{background:#000c}.rm-head,.rm-row,.rm-spread{display:flex;gap:.7rem;align-items:center;justify-content:space-between}.rm-tabs{display:flex;gap:.4rem;overflow:auto;border-bottom:1px solid var(--line,#44394d);padding:.7rem 0;margin-bottom:1rem}.rm-tabs button{white-space:nowrap}.rm-tabs button[aria-pressed=true]{border-color:var(--accent,#d6a7ff);color:var(--accent,#d6a7ff)}",
".rm-box{border:1px solid var(--line,#44394d);border-radius:14px;padding:1rem;background:var(--raised,#24212d);margin:.75rem 0}.rm-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.8rem}.rm-grid3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.8rem}.rm-kpi{font-size:1.8rem;font-weight:900;color:var(--accent,#d6a7ff)}.rm-muted{color:var(--muted,#bbb0c3)}",
".rm-answer{border-left:3px solid var(--accent,#d6a7ff);padding:.8rem 1rem;background:#211d29;margin:.8rem 0}.rm-actions{display:flex;gap:.5rem;flex-wrap:wrap}.rm-actions button{min-height:42px}.rm-good{border-color:#4ade80!important}.rm-bad{border-color:#fb7185!important}.rm-chip{display:inline-block;border:1px solid var(--line,#44394d);border-radius:999px;padding:.2rem .55rem;margin:.15rem;font-size:.82rem}",
".rm-box input,.rm-box select,.rm-box textarea{width:100%;margin:.35rem 0 .7rem}.rm-box textarea{min-height:100px}.rm-scholar{display:grid;grid-template-columns:1fr 1.4fr 1fr;gap:.8rem;align-items:start}.rm-node{border:1px solid var(--line,#44394d);border-radius:14px;padding:.85rem}.rm-node.center{border-color:var(--accent,#d6a7ff);background:#2a2130}.rm-link{width:100%;text-align:left;margin:.25rem 0}.rm-quote{font:1.35rem/1.55 Georgia,serif}.rm-step{border-left:3px solid var(--line,#44394d);padding-left:1rem}.rm-step.active{border-left-color:var(--accent,#d6a7ff)}",
"@media(max-width:760px){#rs-mega-launch{left:.7rem;bottom:.7rem}.rm-grid,.rm-grid3,.rm-scholar{grid-template-columns:1fr}.rm-head{align-items:flex-start}.rm-row{display:block}}"
].join("");
document.head.appendChild(css);

var launch=document.createElement("button");
launch.id="rs-mega-launch";launch.type="button";launch.textContent="RS Mega Tools";
document.body.appendChild(launch);
var dialog=document.createElement("dialog");
dialog.id="rs-mega-dialog";
dialog.innerHTML='<div class="rm-head"><div><p class="rm-muted" style="margin:0">Advanced exam training</p><h2 style="margin:.15rem 0">RS Mega Tools</h2></div><button id="rm-close" type="button">Close</button></div>'+
'<nav class="rm-tabs" aria-label="RS mega tools">'+
'<button type="button" data-rm-tab="gaps" aria-pressed="true">Knowledge Gap Test</button>'+
'<button type="button" data-rm-tab="scholars">Scholar Network</button>'+
'<button type="button" data-rm-tab="quotes">Quote → Scholar</button>'+
'<button type="button" data-rm-tab="dialogue">25-Mark Dialogue Simulator</button></nav>'+
'<div id="rm-content"></div>';
document.body.appendChild(dialog);
var content=dialog.querySelector("#rm-content"),active="gaps";
function setTab(t){active=t;dialog.querySelectorAll("[data-rm-tab]").forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.rmTab===t));});render();}
launch.addEventListener("click",function(){render();dialog.showModal();});
dialog.querySelector("#rm-close").addEventListener("click",function(){dialog.close();});
dialog.querySelector(".rm-tabs").addEventListener("click",function(e){var b=e.target.closest("[data-rm-tab]");if(b)setTab(b.dataset.rmTab);});

/* ---------- Knowledge Gap Test ---------- */
var gap={cards:[],i:0,reveal:false,runSecure:0,runGaps:0,topic:"all"};
function startGap(topic){
 var cards=smartCards().filter(function(c){return topic==="all"||c.topic===topic;});
 gap={cards:shuffle(cards).slice(0,Math.min(12,cards.length)),i:0,reveal:false,runSecure:0,runGaps:0,topic:topic||"all"};
}
function gapView(){
 var tops=topics();
 if(!gap.cards.length)return'<section class="rm-box"><h3>Knowledge Gap Test</h3><p>Run a 12-card diagnostic. Marking “Gap” also sends that item into Smart Revision mistakes where available.</p>'+
 '<label>Topic<select id="rm-gap-topic">'+tops.map(function(t){return'<option value="'+esc(t.id)+'">'+esc(t.title)+'</option>';}).join("")+'</select></label><button id="rm-gap-start" type="button">Start test</button></section>'+
 '<div class="rm-grid3"><section class="rm-box"><div class="rm-kpi">'+state.gaps+'</div><div class="rm-muted">gaps found</div></section><section class="rm-box"><div class="rm-kpi">'+state.secure+'</div><div class="rm-muted">secure recalls</div></section><section class="rm-box"><div class="rm-kpi">'+state.gapRuns+'</div><div class="rm-muted">completed runs</div></section></div>';
 if(gap.i>=gap.cards.length)return'<section class="rm-box"><h3>Diagnostic complete</h3><div class="rm-grid"><div><div class="rm-kpi">'+gap.runSecure+'</div><p>Secure</p></div><div><div class="rm-kpi">'+gap.runGaps+'</div><p>Knowledge gaps</p></div></div><p class="rm-muted">Use Smart Revision next to revisit the items you marked as gaps.</p><button id="rm-gap-again" type="button">Run another test</button></section>';
 var c=gap.cards[gap.i];
 return'<section class="rm-box"><div class="rm-spread"><span class="rm-chip">'+(gap.i+1)+' / '+gap.cards.length+'</span><span class="rm-muted">'+esc(c.title||c.topic||"")+'</span></div><h3>'+esc(c.q)+'</h3><textarea id="rm-gap-draft" placeholder="Answer from memory before revealing..."></textarea>'+
 (gap.reveal?'<div class="rm-answer"><strong>Model answer</strong><p>'+esc(c.a)+'</p></div><div class="rm-actions"><button class="rm-good" data-gap-rate="secure" type="button">Secure</button><button class="rm-bad" data-gap-rate="gap" type="button">Gap</button></div>':'<button id="rm-gap-reveal" type="button">Reveal model answer</button>')+'</section>';
}
function rateGap(rate){
 var c=gap.cards[gap.i];
 if(rate==="gap"){gap.runGaps++;state.gaps++;try{if(window.__aqaSmart&&window.__aqaSmart.addMistake)window.__aqaSmart.addMistake(c.topic||"general",c.q,c.a,"Knowledge Gap Test","Knowledge");}catch(e){}}
 else{gap.runSecure++;state.secure++;}
 gap.i++;gap.reveal=false;if(gap.i>=gap.cards.length)state.gapRuns++;save();render();
}

/* ---------- Scholar Network ---------- */
var scholarSelected=null,scholarQuery="",scholarTopic="all";
function sameTags(a,b){return a.tags.filter(function(t){return b.tags.indexOf(t)>=0;}).length;}
function scholarFiltered(){
 var q=norm(scholarQuery);
 return scholarEntries().filter(function(s){return(scholarTopic==="all"||s.tags.indexOf(scholarTopic)>=0)&&(!q||norm([s.name,s.idea,s.source,s.use,s.tags.join(" ")].join(" ")).indexOf(q)>=0);});
}
function scholarView(){
 var list=scholarFiltered(),tops=topics();
 if(!scholarSelected||list.indexOf(scholarSelected)<0)scholarSelected=list[0]||null;
 var related=scholarSelected?scholarEntries().filter(function(s){return s.id!==scholarSelected.id&&sameTags(s,scholarSelected)>0;}).sort(function(a,b){return sameTags(b,scholarSelected)-sameTags(a,scholarSelected);}).slice(0,8):[];
 return'<section class="rm-box"><h3>RS Scholar Network</h3><p class="rm-muted">Explore thinkers by shared AQA topics, then compare their arguments rather than memorising names in isolation.</p><div class="rm-grid"><label>Topic<select id="rm-scholar-topic">'+tops.map(function(t){return'<option value="'+esc(t.id)+'" '+(t.id===scholarTopic?"selected":"")+'>'+esc(t.title)+'</option>';}).join("")+'</select></label><label>Search<input id="rm-scholar-search" value="'+esc(scholarQuery)+'" placeholder="Scholar, idea or source"></label></div><div class="rm-muted">'+list.length+' scholar/source entries in this view</div></section>'+
 (scholarSelected?'<section class="rm-scholar"><div class="rm-node"><strong>Connected thinkers</strong>'+related.slice(0,4).map(function(s){return'<button class="rm-link" data-scholar="'+esc(s.id)+'" type="button">'+esc(s.name)+'<br><span class="rm-muted">'+esc(s.tags.join(" · "))+'</span></button>';}).join("")+'</div>'+
 '<article class="rm-node center"><span class="rm-chip">'+esc(scholarSelected.tags.join(" · "))+'</span><h3>'+esc(scholarSelected.name)+'</h3><p>'+esc(scholarSelected.idea)+'</p><p class="rm-muted">'+esc(scholarSelected.source)+'</p><div class="rm-answer"><strong>Use in an essay:</strong> '+esc(scholarSelected.use)+'</div></article>'+
 '<div class="rm-node"><strong>More connections</strong>'+related.slice(4,8).map(function(s){return'<button class="rm-link" data-scholar="'+esc(s.id)+'" type="button">'+esc(s.name)+'<br><span class="rm-muted">'+esc(s.tags.join(" · "))+'</span></button>';}).join("")+'</div></section>':'<section class="rm-box">No matching scholar entries.</section>');
}

/* ---------- Quote → Scholar challenge ---------- */
var quoteQ=null,quoteFeedback="";
function newQuote(){
 var qs=quoteEntries();if(!qs.length){quoteQ=null;return;}
 var q=pick(qs),names=Array.from(new Set(qs.map(function(x){return x.name;}))).filter(function(n){return n!==q.name;});
 var opts=shuffle([q.name].concat(shuffle(names).slice(0,3)));
 quoteQ={item:q,options:opts};quoteFeedback="";
}
function quoteView(){
 if(!quoteQ)newQuote();
 if(!quoteQ)return'<section class="rm-box"><h3>Quote → Scholar Challenge</h3><p>No quote bank is available.</p></section>';
 var q=quoteQ.item;
 return'<div class="rm-grid3"><section class="rm-box"><div class="rm-kpi">'+state.quoteCorrect+'/'+state.quoteTotal+'</div><div class="rm-muted">all-time score</div></section><section class="rm-box"><strong>'+esc(q.tags.join(" · "))+'</strong><div class="rm-muted">topic tags</div></section><section class="rm-box"><button id="rm-quote-new" type="button">New quote</button></section></div>'+
 '<section class="rm-box"><p class="rm-muted">Who is the attributed speaker / author / source label used in the bank?</p><div class="rm-quote">“'+esc(q.quote)+'”</div><div class="rm-actions">'+quoteQ.options.map(function(o){return'<button data-quote-option="'+esc(o)+'" type="button">'+esc(o)+'</button>';}).join("")+'</div>'+
 (quoteFeedback?'<div class="rm-answer"><strong>'+esc(quoteFeedback)+'</strong><p><strong>Reference:</strong> '+esc(q.source)+'</p><p><strong>Essay use:</strong> '+esc(q.use)+'</p></div>':"")+'</section>';
}
function answerQuote(name){
 if(quoteFeedback)return;
 state.quoteTotal++;if(name===quoteQ.item.name){state.quoteCorrect++;quoteFeedback="Correct — "+name;}else quoteFeedback="Not quite — "+quoteQ.item.name;
 save();render();
}

/* ---------- 25-mark dialogue simulator ---------- */
var sim={item:null,claim:"",phase:0,answers:["","","","",""],showMap:false};
var phaseTitles=["1. Opening judgement","2. Build the strongest case","3. Present the strongest challenge","4. Make Christianity respond","5. Weigh and conclude"];
var phasePrompts=[
"State a precise judgement and define the exact issue. Avoid a generic introduction.",
"Develop the strongest reason supporting the statement. Add scholarship and explain its force.",
"Develop the strongest counter-argument. Put it into direct tension with the previous point.",
"Explain how a Christian belief, source, denomination or scholar could respond. Keep philosophy/ethics and Christianity in dialogue.",
"Weigh which argument matters most, qualify the claim and finish with a justified final judgement."
];
function dialoguePool(){try{return typeof DIALOGUES!=="undefined"&&Array.isArray(DIALOGUES)?DIALOGUES:[];}catch(e){return[];}}
function claimPool(){try{return typeof CLAIMS!=="undefined"&&Array.isArray(CLAIMS)?CLAIMS:[];}catch(e){return[];}}
function startSim(){
 var pool=dialoguePool();if(!pool.length){sim.item=null;return;}
 var idx=Math.floor(Math.random()*pool.length),d=pool[idx],claims=claimPool();
 sim={item:d,claim:claims[idx]||("Evaluate how "+d[3]+" affects "+d[4]+"."),phase:0,answers:["","","","",""],showMap:false};
 state.dialogueRuns++;save();
}
function simTags(){return sim.item?String(sim.item[2]||"").split(/\s+/).filter(Boolean):[];}
function simScholars(){
 var tags=simTags();
 return scholarEntries().filter(function(s){return sameTags({tags:tags},s)>0;}).slice(0,8);
}
function readiness(){
 var joined=sim.answers.join(" "),filled=sim.answers.filter(function(x){return norm(x).length>=80;}).length;
 var names=scholarEntries().filter(function(s){return joined.toLowerCase().indexOf(s.name.toLowerCase())>=0;}).map(function(s){return s.name;});
 var judgement=/because|therefore|however|although|overall|more convincing|depends|extent|stronger|weaker/i.test(joined);
 return{filled:filled,names:Array.from(new Set(names)),judgement:judgement};
}
function simView(){
 if(!sim.item)return'<section class="rm-box"><h3>RS 25-Mark Dialogue Simulator</h3><p>Practise Paper 2 dialogue by forcing philosophy/ethics and Christianity into sustained conversation across five moves.</p><button id="rm-sim-start" type="button">Start random dialogue</button><p class="rm-muted">'+state.dialogueRuns+' simulations started so far.</p></section>';
 var d=sim.item,r=readiness(),sch=simScholars(),p=sim.phase;
 return'<section class="rm-box"><div class="rm-spread"><div><span class="rm-chip">'+esc(d[1])+' dialogue</span><h3>'+esc(sim.claim)+'</h3><p class="rm-muted">'+esc(d[3])+' ↔ '+esc(d[4])+'</p></div><button id="rm-sim-new" type="button">New question</button></div></section>'+
 '<div class="rm-grid"><section class="rm-box"><div class="rm-step active"><strong>'+esc(phaseTitles[p])+'</strong><p>'+esc(phasePrompts[p])+'</p></div><textarea id="rm-sim-text" placeholder="Write this move as if it were part of your answer...">'+esc(sim.answers[p])+'</textarea><div class="rm-actions">'+(p>0?'<button id="rm-sim-prev" type="button">Previous</button>':"")+(p<4?'<button id="rm-sim-next" type="button">Save + next move</button>':'<button id="rm-sim-finish" type="button">Check readiness</button>')+'<button id="rm-sim-map" type="button">'+(sim.showMap?"Hide":"Show")+' examiner map</button></div>'+
 (sim.showMap?'<div class="rm-answer"><p><strong>Support route:</strong> '+esc(d[5])+'</p><p><strong>Challenge route:</strong> '+esc(d[6])+'</p><p><strong>Evaluation focus:</strong> '+esc(d[7])+'</p></div>':"")+'</section>'+
 '<aside class="rm-box"><h3>Possible scholarly voices</h3><p class="rm-muted">Use only scholars you can explain accurately; name-dropping earns little.</p>'+sch.map(function(s){return'<div class="rm-node" style="margin:.5rem 0"><strong>'+esc(s.name)+'</strong><p>'+esc(s.idea)+'</p></div>';}).join("")+'</aside></div>'+
 '<section class="rm-box"><h3>Readiness check</h3><div class="rm-grid3"><div><div class="rm-kpi">'+r.filled+'/5</div><div class="rm-muted">developed moves (80+ chars)</div></div><div><div class="rm-kpi">'+r.names.length+'</div><div class="rm-muted">recognised scholars used</div></div><div><div class="rm-kpi">'+(r.judgement?"Yes":"Not yet")+'</div><div class="rm-muted">explicit evaluative language</div></div></div><p class="rm-muted">This is a planning diagnostic, not an AQA mark prediction. Strong answers still need accurate AO1, sustained AO2 and a reasoned judgement.</p></section>';
}
function captureSim(){var ta=dialog.querySelector("#rm-sim-text");if(ta&&sim.item)sim.answers[sim.phase]=ta.value;}
function nextPhase(delta){captureSim();sim.phase=Math.max(0,Math.min(4,sim.phase+delta));render();}
function finishSim(){captureSim();render();var box=content.querySelector(".rm-box:last-child");if(box)box.scrollIntoView({behavior:"smooth",block:"nearest"});}

function render(){
 if(active==="gaps")content.innerHTML=gapView();
 if(active==="scholars")content.innerHTML=scholarView();
 if(active==="quotes")content.innerHTML=quoteView();
 if(active==="dialogue")content.innerHTML=simView();
}
content.addEventListener("click",function(e){
 var b=e.target.closest("button");if(!b)return;
 if(b.id==="rm-gap-start"){var s=dialog.querySelector("#rm-gap-topic");startGap(s?s.value:"all");render();}
 if(b.id==="rm-gap-reveal"){gap.reveal=true;render();}
 if(b.dataset.gapRate)rateGap(b.dataset.gapRate);
 if(b.id==="rm-gap-again"){gap.cards=[];render();}
 if(b.dataset.scholar){var found=scholarEntries().find(function(s){return s.id===b.dataset.scholar;});if(found){scholarSelected=found;render();}}
 if(b.dataset.quoteOption)answerQuote(b.dataset.quoteOption);
 if(b.id==="rm-quote-new"){newQuote();render();}
 if(b.id==="rm-sim-start"||b.id==="rm-sim-new"){startSim();render();}
 if(b.id==="rm-sim-prev")nextPhase(-1);
 if(b.id==="rm-sim-next")nextPhase(1);
 if(b.id==="rm-sim-finish")finishSim();
 if(b.id==="rm-sim-map"){captureSim();sim.showMap=!sim.showMap;render();}
});
content.addEventListener("change",function(e){
 if(e.target.id==="rm-scholar-topic"){scholarTopic=e.target.value;scholarSelected=null;render();}
});
content.addEventListener("input",function(e){
 if(e.target.id==="rm-scholar-search"){scholarQuery=e.target.value;scholarSelected=null;}
});
content.addEventListener("keydown",function(e){
 if(e.key==="Enter"&&e.target.id==="rm-scholar-search"){e.preventDefault();render();}
});
})();
