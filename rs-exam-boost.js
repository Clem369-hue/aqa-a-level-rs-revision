/* Exam Boost: Knowledge Gap, Scholar Network, Quote Challenge and 25-mark Dialogue Simulator. */
(function(){
"use strict";
if(typeof TOPICS==="undefined"||typeof BANK==="undefined"||!window.__aqaSmart)return;
const KEY="aqa-rs-exam-boost-v1";
const esc=v=>String(v==null?"":v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]);
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||"{}")||{};}catch(e){return{};}};
let st=Object.assign({gapRuns:[],quoteRight:0,quoteWrong:0,dialogueAttempts:[],dialogueDrafts:{}},read());
const save=()=>{try{if(window.__aqaStore)window.__aqaStore(KEY,JSON.stringify(st));else localStorage.setItem(KEY,JSON.stringify(st));}catch(e){}};
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
function addMistake(topic,q,a,note,cat){try{window.__aqaSmart.addMistake(topic||"arguments",q,a,note||"Exam Boost gap",cat||"Knowledge");}catch(e){}}
function logQ(q,topic,source,marks,attempted,score){try{window.__aqaLogQuestion?.(q,topic,source,marks,attempted,score);}catch(e){}}
const css=`
.exam-boost-launch{font-weight:800}.eb-dialog{width:min(1080px,96vw);max-height:92vh;background:var(--panel,#171b26);color:var(--text,#f1f2f6);border:1px solid var(--line,#414759);border-radius:18px;padding:1rem}.eb-dialog::backdrop{background:#000c}.eb-head,.eb-spread{display:flex;justify-content:space-between;gap:1rem;align-items:flex-start}.eb-tabs{display:flex;gap:.45rem;flex-wrap:wrap;margin:.8rem 0 1rem}.eb-tabs button[aria-pressed="true"]{border-color:var(--accent,#b7a4ff);box-shadow:inset 0 0 0 1px var(--accent,#b7a4ff)}.eb-box,.eb-card{border:1px solid var(--line,#414759);border-radius:14px;background:var(--surface,#171b26);padding:1rem;margin:.8rem 0}.eb-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.8rem}.eb-actions{display:flex;gap:.55rem;flex-wrap:wrap;margin:.8rem 0}.eb-primary{background:var(--accent,#b7a4ff)!important;color:#171323!important;border-color:var(--accent,#b7a4ff)!important}.eb-score{font-size:2rem;font-weight:900}.eb-pill{display:inline-block;border:1px solid var(--line,#414759);border-radius:999px;padding:.2rem .6rem;font-size:.8rem;color:var(--muted,#b6b8c4)}.eb-answer{white-space:pre-wrap;border-left:3px solid var(--accent,#b7a4ff);padding:.75rem 1rem;background:rgba(255,255,255,.03);margin:.8rem 0}.eb-topic-row{display:grid;grid-template-columns:1fr 100px;gap:.7rem;align-items:center;margin:.35rem 0}.eb-topic-row progress{width:100%}.scholar-net{width:100%;height:auto;max-height:540px;border:1px solid var(--line,#414759);border-radius:14px;background:rgba(255,255,255,.02)}.scholar-net .edge{stroke:currentColor;opacity:.28;stroke-width:2}.scholar-net .node{fill:var(--surface,#171b26);stroke:var(--accent,#b7a4ff);stroke-width:2;cursor:pointer}.scholar-net .node.active{fill:var(--accent,#b7a4ff)}.scholar-net .node-label{font-size:12px;fill:currentColor;text-anchor:middle;pointer-events:none}.scholar-net .node-label.active{fill:#171323;font-weight:800}.rel-list{display:grid;gap:.45rem}.rel-list button{text-align:left}.quote-box{font-size:1.15rem;line-height:1.6;padding:1rem;border-left:3px solid var(--accent,#b7a4ff);background:rgba(255,255,255,.03)}.quote-options{display:grid;gap:.55rem;margin:.8rem 0}.quote-options button{text-align:left}.dialogue-stage{border-left:3px solid var(--accent,#b7a4ff);padding:.8rem 1rem;margin:.7rem 0}.dialogue-stage textarea{min-height:115px}.timer{font-variant-numeric:tabular-nums;font-size:1.4rem;font-weight:900}.eb-feedback-good{border-left:3px solid #72d69a;padding:.7rem}.eb-feedback-warn{border-left:3px solid #e4b65d;padding:.7rem}
@media(max-width:760px){.eb-grid{grid-template-columns:1fr}.eb-dialog{width:100vw;max-width:none;margin:0;border-radius:0}.eb-actions{display:grid;grid-template-columns:1fr}.eb-actions button{min-height:46px}.scholar-net{min-width:760px}.net-scroll{overflow:auto}}
`;
const style=document.createElement("style");style.textContent=css;document.head.appendChild(style);
const launch=document.createElement("button");launch.id="exam-boost-launch";launch.type="button";launch.className="exam-boost-launch";launch.textContent="Exam Boost";
const perf=document.getElementById("performance-launch");perf?.parentNode?.insertBefore(launch,perf);
const dlg=document.createElement("dialog");dlg.id="exam-boost-dialog";dlg.className="eb-dialog no-print";dlg.innerHTML='<div class="eb-head"><div><p class="eyebrow">Exam-focused practice</p><h2>Exam Boost</h2></div><button type="button" id="eb-close">Close</button></div><nav class="eb-tabs" aria-label="Exam Boost tools"><button type="button" data-eb-tab="gap" aria-pressed="true">Knowledge Gap Test</button><button type="button" data-eb-tab="network">Scholar Network</button><button type="button" data-eb-tab="quotes">Quote Challenge</button><button type="button" data-eb-tab="dialogue">25-Mark Dialogue</button></nav><div id="eb-content"></div>';
document.body.appendChild(dlg);
let tab="gap",gap=null,networkTopic="arguments",selectedScholar="",quoteMode="quote-source",quoteItem=null,quoteAnswered=false,dialogueId=(typeof DIALOGUES!=="undefined"&&DIALOGUES[0]?DIALOGUES[0][0]:""),timerLeft=45*60,timerHandle=null,timerRunning=false,dialogueFeedback=null;

function gapPool(scope){
 const cards=window.__aqaSmart.cards().filter(c=>TOPICS.some(t=>t.id===c.topic)&&!c.custom&&(scope==="all"||TOPICS.find(t=>t.id===c.topic)?.p===Number(scope)));
 const by={};cards.forEach(c=>(by[c.topic]||(by[c.topic]=[])).push(c));
 const ids=shuffle(Object.keys(by)),out=[];let round=0;
 while(out.length<30&&ids.some(id=>by[id].length>round)){for(const id of ids){if(by[id][round]&&out.length<30)out.push(by[id][round]);}round++;}
 return shuffle(out);
}
function startGap(scope){gap={items:gapPool(scope||"all"),at:0,reveal:false,results:[]};gap.items.forEach(c=>logQ(c.q,c.topic,"Knowledge Gap Test",null,false,null));render();}
function topicName(id){return TOPICS.find(t=>t.id===id)?.title||id;}
function gapView(){
 if(!gap)return '<section class="eb-box"><h3>Knowledge Gap Test</h3><p class="muted">Thirty retrieval questions spread across your selected paper. Reveal each answer and rate yourself; Partial/Wrong answers go straight into your existing Mistakes Bank.</p><label>Coverage<select id="eb-gap-scope"><option value="all">Both papers</option><option value="1">Paper 1 · Philosophy & Ethics</option><option value="2">Paper 2 · Christianity</option></select></label><button class="eb-primary" id="eb-gap-start">Start 30-question test</button></section>';
 if(gap.at>=gap.items.length){
   const c=gap.results.filter(x=>x==="correct").length,p=gap.results.filter(x=>x==="partial").length,w=gap.results.filter(x=>x==="wrong").length,score=Math.round((c+p*.5)/Math.max(1,gap.results.length)*100);
   const topic={};gap.items.forEach((x,i)=>{const r=gap.results[i];topic[x.topic]=topic[x.topic]||{n:0,s:0};topic[x.topic].n++;topic[x.topic].s+=r==="correct"?1:r==="partial"?0.5:0;});
   st.gapRuns.unshift({at:Date.now(),score,correct:c,partial:p,wrong:w});st.gapRuns=st.gapRuns.slice(0,25);save();
   return '<section class="eb-box"><h3>Knowledge Gap result</h3><div class="eb-score">'+score+'%</div><p>'+c+' secure · '+p+' partial · '+w+' gaps</p>'+Object.keys(topic).sort((a,b)=>topic[a].s/topic[a].n-topic[b].s/topic[b].n).map(id=>'<div class="eb-topic-row"><div><strong>'+esc(topicName(id))+'</strong><progress max="100" value="'+Math.round(topic[id].s/topic[id].n*100)+'"></progress></div><span>'+Math.round(topic[id].s/topic[id].n*100)+'%</span></div>').join("")+'<div class="eb-actions"><button id="eb-gap-again" class="eb-primary">Run another test</button><button id="eb-open-mistakes">Open Mistakes Bank</button></div></section>';
 }
 const c=gap.items[gap.at];
 return '<section class="eb-box"><div class="eb-spread"><span class="eb-pill">Question '+(gap.at+1)+' / '+gap.items.length+'</span><span class="eb-pill">'+esc(topicName(c.topic))+'</span></div><h3>'+esc(c.q)+'</h3><textarea placeholder="Answer from memory before revealing."></textarea>'+(!gap.reveal?'<button id="eb-gap-reveal" class="eb-primary">Reveal answer</button>':'<div class="eb-answer"><strong>Answer:</strong> '+esc(c.a)+'</div><div class="eb-actions"><button data-gap-rate="correct" class="eb-primary">Correct</button><button data-gap-rate="partial">Partial</button><button data-gap-rate="wrong">Wrong / did not know</button></div>')+'</section>';
}

const EDGES=[
["Thomas Aquinas","David Hume","challenge","Hume questions causal inference and moves from observed effects to a divine cause."],
["William Paley","David Hume","challenge","Hume attacks weak analogies between organisms/world and human artefacts."],
["Anselm","Gaunilo","challenge","Gaunilo’s island parody challenges moving from a definition to existence."],
["Anselm","Immanuel Kant","challenge","Kant argues existence is not a real predicate."],
["F. R. Tennant","David Hume","contrast","Tennant develops cumulative design evidence despite Humean scepticism."],
["William James","Sigmund Freud","challenge","James assesses fruits of experience; Freud offers a naturalistic psychological account."],
["Richard Swinburne","Sigmund Freud","challenge","Swinburne gives experience/testimony initial trust unless defeated; Freud supplies possible defeaters."],
["Antony Flew","Basil Mitchell","response","Mitchell’s partisan answers Flew’s claim that endless qualification kills assertions."],
["Antony Flew","R. M. Hare","contrast","Hare treats religious commitment as a blik rather than an ordinary falsifiable hypothesis."],
["A. J. Ayer","Ludwig Wittgenstein","contrast","Verification demands empirical testability; language-games locate meaning in use and practice."],
["David Hume","Richard Swinburne","challenge","Hume sets a high evidential bar for miracles; Swinburne argues for case-by-case historical assessment."],
["Maurice Wiles","R. F. Holland","contrast","Wiles questions interventionist miracles morally; Holland allows providential coincidence without law violation."],
["René Descartes","Aristotle","contrast","Substance dualism contrasts with hylomorphic embodied accounts of soul."],
["Thomas Aquinas","Bernard Hoose","develop","Proportionalism develops natural-law reasoning by allowing proportionate reasons in hard cases."],
["Thomas Aquinas","John Finnis","develop","Finnis recasts natural law around basic human goods and practical reason."],
["Joseph Fletcher","Paul Ramsey","challenge","Ramsey argues love needs stable covenantal and moral structures."],
["Jeremy Bentham","Immanuel Kant","contrast","Consequential welfare maximisation contrasts with duty and dignity."],
["Aristotle","Thomas Aquinas","develop","Aquinas adapts virtue towards theological virtues and supernatural beatitude."],
["G. E. Moore","A. J. Ayer","contrast","Moore defends non-natural moral truth; Ayer treats moral language non-cognitively."],
["David Hume","Jean-Paul Sartre","contrast","Compatibilist freedom contrasts with Sartre’s radical responsibility."],
["Thomas Aquinas","Sigmund Freud","contrast","Rational conscience/synderesis contrasts with internalised superego accounts."],
["John Henry Newman","Sigmund Freud","challenge","Religious conscience as moral authority is challenged by psychological explanation."],
["Karl Barth","Thomas Aquinas","contrast","Barth stresses revelation; Aquinas allows natural theology and reason to know something of God."],
["John Hick","Gavin D’Costa","challenge","D’Costa argues pluralism can impose its own theology while weakening Christian particularity."],
["Karl Rahner","John Hick","contrast","Inclusivism retains Christ’s unique role; pluralism redescribes religions as responses to the Real."],
["Rosemary Radford Ruether","Mary Daly","contrast","Ruether reconstructs Christianity; Daly argues patriarchy requires moving beyond it."],
["Steve Bruce","Grace Davie","challenge","Strong secularisation theory is qualified by believing-without-belonging."],
["Gustavo Gutiérrez","Karl Marx","use/critique","Liberation theology can use structural critique without adopting Marxist atheism."],
["James H. Cone","Gustavo Gutiérrez","develop","Both centre oppression and liberation while working from different social locations."],
["John Polkinghorne","Ian Barbour","support","Both resist a simple conflict model between science and religion."]
];
function scholarEntries(name){return BANK.filter(b=>b[1]===name);}
function scholarTags(name){return [...new Set(scholarEntries(name).flatMap(b=>b[0].split(" ")))];}
function visibleEdges(){
 let rows=EDGES.filter(e=>networkTopic==="all"||scholarTags(e[0]).includes(networkTopic)||scholarTags(e[1]).includes(networkTopic));
 return rows.slice(0,14);
}
function netSVG(edges){
 const names=[...new Set(edges.flatMap(e=>[e[0],e[1]]))].slice(0,16),W=900,H=520,cx=450,cy=260,r=205;
 const pos={};names.forEach((n,i)=>{const a=-Math.PI/2+i*2*Math.PI/names.length;pos[n]=[cx+r*Math.cos(a),cy+r*Math.sin(a)];});
 let g='<svg class="scholar-net" viewBox="0 0 '+W+' '+H+'" aria-label="Interactive scholar relationship network">';
 edges.forEach(e=>{if(pos[e[0]]&&pos[e[1]])g+='<line class="edge" x1="'+pos[e[0]][0]+'" y1="'+pos[e[0]][1]+'" x2="'+pos[e[1]][0]+'" y2="'+pos[e[1]][1]+'"/>';});
 names.forEach((n,i)=>{const p=pos[n],active=n===selectedScholar,label=n.length>20?n.slice(0,18)+"…":n;g+='<g data-scholar="'+esc(n)+'"><circle class="node '+(active?"active":"")+'" cx="'+p[0]+'" cy="'+p[1]+'" r="42"/><text class="node-label '+(active?"active":"")+'" x="'+p[0]+'" y="'+(p[1]-3)+'">'+esc(label.split(" ")[0])+'</text><text class="node-label '+(active?"active":"")+'" x="'+p[0]+'" y="'+(p[1]+13)+'">'+esc(label.split(" ").slice(1).join(" "))+'</text></g>';});
 return g+'</svg>';
}
function networkView(){
 const edges=visibleEdges(),names=[...new Set(edges.flatMap(e=>[e[0],e[1]]))];if(!selectedScholar||!names.includes(selectedScholar))selectedScholar=names[0]||"";
 const entries=scholarEntries(selectedScholar),rels=edges.filter(e=>e[0]===selectedScholar||e[1]===selectedScholar);
 return '<section class="eb-box"><div class="eb-spread"><div><h3>Scholar Network</h3><p class="muted">Select a topic, then click a scholar to see their idea and who develops, challenges or contrasts with it.</p></div><label>Topic<select id="eb-net-topic"><option value="all">All topics</option>'+TOPICS.map(t=>'<option value="'+t.id+'" '+(networkTopic===t.id?"selected":"")+'>'+esc(t.title)+'</option>').join("")+'</select></label></div><div class="net-scroll">'+netSVG(edges)+'</div>'+(selectedScholar?'<div class="eb-grid"><article class="eb-card"><h3>'+esc(selectedScholar)+'</h3>'+(entries.length?entries.slice(0,2).map(b=>'<p>'+esc(b[3])+'</p><p class="small muted">'+esc(b[4])+'</p>').join(""):'<p class="muted">No bank entry found.</p>')+'</article><article class="eb-card"><h3>Connections</h3><div class="rel-list">'+rels.map(e=>'<button type="button" data-scholar="'+esc(e[0]===selectedScholar?e[1]:e[0])+'"><strong>'+esc(e[2])+' → '+esc(e[0]===selectedScholar?e[1]:e[0])+'</strong><br><span class="small">'+esc(e[3])+'</span></button>').join("")+'</div></article></div>':'<p>No relationships in this topic yet.</p>')+'</section>';
}

function quotePool(){return BANK.filter(b=>b[2]==="quote");}
function newQuote(){
 const pool=quotePool(),q=pool[Math.floor(Math.random()*pool.length)];
 if(quoteMode==="quote-source"){
   const sources=[...new Set(pool.map(x=>x[1]).filter(x=>x!==q[1]))];quoteItem={q,options:shuffle([q[1],...shuffle(sources).slice(0,3)]),correct:q[1]};
 }else{
   const others=pool.filter(x=>x!==q);quoteItem={q,options:shuffle([q[3],...shuffle(others).slice(0,3).map(x=>x[3])]),correct:q[3]};
 }
 quoteAnswered=false;
}
function quoteView(){
 if(!quoteItem)newQuote();const q=quoteItem.q;
 return '<section class="eb-box"><div class="eb-spread"><div><h3>Quote → Scholar / Source Challenge</h3><p class="muted">Retrieve who/where the quotation comes from, or reverse the challenge.</p></div><label>Mode<select id="eb-quote-mode"><option value="quote-source" '+(quoteMode==="quote-source"?"selected":"")+'>Quote → source</option><option value="source-quote" '+(quoteMode==="source-quote"?"selected":"")+'>Source → quote</option></select></label></div><div class="quote-box">'+(quoteMode==="quote-source"?'“'+esc(q[3])+'”':'<strong>'+esc(q[1])+'</strong><br><span class="small">'+esc(q[4])+'</span>')+'</div><div class="quote-options">'+quoteItem.options.map((o,i)=>'<button type="button" data-quote-answer="'+i+'" '+(quoteAnswered?"disabled":"")+'>'+esc(o)+'</button>').join("")+'</div><div id="eb-quote-feedback">'+(quoteAnswered?'<div class="eb-answer"><strong>Correct:</strong> '+esc(quoteItem.correct)+'<br><strong>Use it:</strong> '+esc(q[5])+'<br><span class="small">'+esc(q[4])+'</span></div>':'')+'</div><div class="eb-actions"><button id="eb-quote-next" class="eb-primary">New quote</button></div><p class="small muted">Score: '+st.quoteRight+' correct · '+st.quoteWrong+' to review</p></section>';
}

function dialoguePool(){return typeof DIALOGUES!=="undefined"?DIALOGUES:[];}
function dialogueItem(){return dialoguePool().find(d=>d[0]===dialogueId)||dialoguePool()[0];}
function dialogueClaim(d){const i=dialoguePool().indexOf(d);return typeof CLAIMS!=="undefined"&&CLAIMS[i]?CLAIMS[i]:(d[3]+" is convincing.");}
function dialogueQuestion(d){return '‘'+dialogueClaim(d)+'’ Critically examine and evaluate this view with reference to the dialogue between Christianity and '+(d[1]==="Ethics"?"ethical studies":"philosophy")+'.';}
const STAGES=[
["Thesis & criterion","State your provisional judgement and the criterion you will use to decide which side is stronger."],
["Christian AO1","Explain the relevant Christian belief accurately, including internal diversity or a source where useful."],
["Philosophy / Ethics AO1","Explain the philosophical or ethical argument accurately and use a scholar/source."],
["Explicit dialogue","Show exactly how the philosophy/ethics supports, challenges or changes the Christian belief."],
["Counterargument & reply","Develop the strongest objection to your current view, then answer it rather than merely listing it."],
["Final judgement","Reach a qualified conclusion and explain why your chosen argument is stronger by your stated criterion."]
];
function draft(){const d=dialogueItem();return st.dialogueDrafts[d?.[0]]||Array(STAGES.length).fill("");}
function saveDraft(){const d=dialogueItem();if(!d)return;st.dialogueDrafts[d[0]]=STAGES.map((_,i)=>document.querySelector('[data-dialogue-field="'+i+'"]')?.value||"");save();}
function fmtTime(n){return String(Math.floor(n/60)).padStart(2,"0")+":"+String(n%60).padStart(2,"0");}
function dialogueView(){
 const d=dialogueItem();if(!d)return '<section class="eb-box"><p>No dialogue material found.</p></section>';const dr=draft(),q=dialogueQuestion(d);
 return '<section class="eb-box"><div class="eb-spread"><div><h3>25-Mark Dialogue Simulator</h3><p class="muted">Build one connected dialogue answer. Local scoring is a revision heuristic, not an AQA mark.</p></div><div><div id="eb-timer" class="timer">'+fmtTime(timerLeft)+'</div><button id="eb-timer-toggle">'+(timerRunning?"Pause":"Start 45-min timer")+'</button></div></div><label>Dialogue<select id="eb-dialogue-select">'+dialoguePool().map(x=>'<option value="'+x[0]+'" '+(x[0]===d[0]?"selected":"")+'>'+esc(x[1]+" · "+x[3])+'</option>').join("")+'</select></label><div class="quote-box"><strong>'+esc(q)+'</strong></div>'+STAGES.map((x,i)=>'<div class="dialogue-stage"><label><strong>'+(i+1)+'. '+esc(x[0])+'</strong><span class="small muted">'+esc(x[1])+'</span><textarea data-dialogue-field="'+i+'" placeholder="Write this part of your plan/answer...">'+esc(dr[i]||"")+'</textarea></label></div>').join("")+'<div class="eb-actions"><button id="eb-dialogue-assess" class="eb-primary">Assess dialogue</button><button id="eb-dialogue-prompts">Reveal debate prompts</button><button id="eb-dialogue-new">Another dialogue</button></div><div id="eb-dialogue-extra">'+(dialogueFeedback||"")+'</div><p class="small muted">'+st.dialogueAttempts.length+' simulator attempt'+(st.dialogueAttempts.length===1?"":"s")+' saved.</p></section>';
}
function assessDialogue(){
 saveDraft();const d=dialogueItem(),texts=draft(),ans=texts.join("\n"),low=ans.toLowerCase(),words=ans.trim()?ans.trim().split(/\s+/).length:0;
 const scholarNames=[...new Set(BANK.filter(b=>b[2]==="idea").map(b=>b[1]))],named=scholarNames.filter(n=>low.includes(n.toLowerCase())).length;
 const christian=["christ","christian","god","scripture","bible","church","grace","salvation","trinity","incarnation","agape","resurrection","authority","sin"].filter(w=>low.includes(w)).length;
 const evals=["however","although","whereas","nevertheless","on the other hand","stronger","weaker","depends","to an extent","because","therefore"].filter(w=>low.includes(w)).length;
 const links=["challenges christian","supports christian","therefore christian","this means for christian","changes the christian","dialogue","if this is true","implication for","compatible with","conflicts with"].filter(w=>low.includes(w)).length;
 const judge=/overall|ultimately|on balance|therefore i|most convincing|stronger because|weaker because|in conclusion/i.test(ans);
 const counter=/however|on the other hand|counter|objection|although|critics/i.test(ans);
 let ao1=Math.min(10,Math.round(Math.min(4,words/130*4)+Math.min(3,named)+Math.min(3,christian/2)));
 let ao2=Math.min(15,Math.round(Math.min(5,evals)+Math.min(5,links*1.5)+(judge?3:0)+(counter?2:0)));
 if(words<120){ao1=Math.min(ao1,4);ao2=Math.min(ao2,5);}
 const total=ao1+ao2,feedback=[];
 if(named<2)feedback.push("Use at least two precise scholars or primary sources.");
 if(christian<4)feedback.push("Develop the Christian belief more precisely, including internal diversity where relevant.");
 if(links<2)feedback.push("Make the dialogue explicit: state how the philosophy/ethics changes, supports or challenges Christianity.");
 if(evals<3)feedback.push("Add comparative evaluation rather than alternating summaries.");
 if(!counter)feedback.push("Develop a strong counterargument and reply.");
 if(!judge)feedback.push("Finish with a justified comparative judgement.");
 if(words<400)feedback.push("For a full timed answer, develop the argument substantially further.");
 dialogueFeedback='<div class="eb-card"><div class="eb-score">'+total+' / 25</div><p><strong>AO1 heuristic:</strong> '+ao1+'/10 · <strong>AO2 heuristic:</strong> '+ao2+'/15</p>'+(feedback.length?'<ul>'+feedback.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ul>':'<div class="eb-feedback-good">Strong balance of knowledge, explicit dialogue and evaluation. Check accuracy and depth against teacher feedback.</div>')+'<p class="small muted">This is automated local feedback, not an official AQA mark.</p></div>';
 st.dialogueAttempts.unshift({at:Date.now(),id:d[0],q:dialogueQuestion(d),ao1,ao2,total,words});st.dialogueAttempts=st.dialogueAttempts.slice(0,40);save();logQ(dialogueQuestion(d),d[2].split(" ")[0],"25-mark Dialogue Simulator",25,true,total/25*100);render();
}
function prompts(){
 const d=dialogueItem();dialogueFeedback='<div class="eb-card"><h3>Debate prompts</h3><p><strong>Christian focus:</strong> '+esc(d[4])+'</p><p><strong>Supports/develops:</strong> '+esc(d[5])+'</p><p><strong>Challenges/conflicts:</strong> '+esc(d[6])+'</p><p><strong>Judgement direction:</strong> '+esc(d[7])+'</p></div>';render();
}
function startTimer(){if(timerHandle)clearInterval(timerHandle);timerRunning=true;timerHandle=setInterval(()=>{timerLeft=Math.max(0,timerLeft-1);const el=document.getElementById("eb-timer");if(el)el.textContent=fmtTime(timerLeft);if(timerLeft<=0){clearInterval(timerHandle);timerRunning=false;alert("45 minutes is up. Finish your final judgement and assess the answer.");}},1000);render();}
function stopTimer(){if(timerHandle)clearInterval(timerHandle);timerHandle=null;timerRunning=false;render();}

function render(){
 document.querySelectorAll("[data-eb-tab]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.ebTab===tab)));
 const box=document.getElementById("eb-content");if(!box)return;
 box.innerHTML=tab==="gap"?gapView():tab==="network"?networkView():tab==="quotes"?quoteView():dialogueView();
}
function open(){render();dlg.showModal?dlg.showModal():dlg.setAttribute("open","");}
function close(){if(timerHandle){clearInterval(timerHandle);timerHandle=null;timerRunning=false;}dlg.close?dlg.close():dlg.removeAttribute("open");}
launch.addEventListener("click",open);document.getElementById("eb-close").addEventListener("click",close);
dlg.addEventListener("input",e=>{if(e.target.matches("[data-dialogue-field]"))saveDraft();});
dlg.addEventListener("change",e=>{
 if(e.target.id==="eb-net-topic"){networkTopic=e.target.value;selectedScholar="";render();}
 if(e.target.id==="eb-quote-mode"){quoteMode=e.target.value;quoteItem=null;quoteAnswered=false;render();}
 if(e.target.id==="eb-dialogue-select"){saveDraft();dialogueId=e.target.value;dialogueFeedback=null;timerLeft=45*60;if(timerHandle)clearInterval(timerHandle);timerHandle=null;timerRunning=false;render();}
});
dlg.addEventListener("click",e=>{
 const b=e.target.closest("button,[data-scholar]");if(!b)return;
 if(b.dataset.ebTab){tab=b.dataset.ebTab;render();return;}
 if(b.id==="eb-gap-start"){startGap(document.getElementById("eb-gap-scope").value);return;}
 if(b.id==="eb-gap-reveal"){gap.reveal=true;render();return;}
 if(b.dataset.gapRate){const c=gap.items[gap.at],r=b.dataset.gapRate;gap.results.push(r);if(r!=="correct")addMistake(c.topic,c.q,c.a,"Knowledge Gap Test: "+r,"Knowledge");logQ(c.q,c.topic,"Knowledge Gap Test",null,true,r==="correct"?100:r==="partial"?50:0);gap.at++;gap.reveal=false;render();return;}
 if(b.id==="eb-gap-again"){gap=null;render();return;}
 if(b.id==="eb-open-mistakes"){close();document.getElementById("smart-launch")?.click();setTimeout(()=>document.querySelector('[data-sr-tab="mistakes"]')?.click(),50);return;}
 if(b.dataset.scholar){selectedScholar=b.dataset.scholar;render();return;}
 if(b.dataset.quoteAnswer!==undefined&&!quoteAnswered){const choice=quoteItem.options[Number(b.dataset.quoteAnswer)],ok=choice===quoteItem.correct;quoteAnswered=true;if(ok)st.quoteRight++;else{st.quoteWrong++;const q=quoteItem.q;addMistake(q[0].split(" ")[0],quoteMode==="quote-source"?'Who/what is the source of: “'+q[3]+'”':'Which quotation is linked to '+q[1]+'?',quoteItem.correct,"Quote Challenge","Evidence");}save();render();setTimeout(()=>{const box=document.getElementById("eb-quote-feedback");if(box)box.insertAdjacentHTML("afterbegin",'<div class="'+(ok?"eb-feedback-good":"eb-feedback-warn")+'"><strong>'+(ok?"Correct":"Needs review")+'</strong></div>');},0);return;}
 if(b.id==="eb-quote-next"){quoteItem=null;quoteAnswered=false;render();return;}
 if(b.id==="eb-dialogue-assess"){assessDialogue();return;}
 if(b.id==="eb-dialogue-prompts"){prompts();return;}
 if(b.id==="eb-dialogue-new"){saveDraft();const pool=dialoguePool().filter(x=>x[0]!==dialogueId);dialogueId=(pool[Math.floor(Math.random()*pool.length)]||dialoguePool()[0])[0];dialogueFeedback=null;timerLeft=45*60;if(timerHandle)clearInterval(timerHandle);timerHandle=null;timerRunning=false;logQ(dialogueQuestion(dialogueItem()),dialogueItem()[2].split(" ")[0],"25-mark Dialogue Simulator",25,false,null);render();return;}
 if(b.id==="eb-timer-toggle"){timerRunning?stopTimer():startTimer();return;}
});
})();