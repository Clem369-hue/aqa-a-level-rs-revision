const fs = require('fs');
const vm = require('vm');
const path = require('path');
const root = require('path').resolve(process.argv[2] || require('path').join(__dirname, '..'));
const source=fs.readFileSync(path.join(root,'index.html'),'utf8');
const subject=source.includes('var SR_KIND="geo"')?'geography':'rs';
const assert=require('node:assert/strict');
let checks=0;
function test(name,fn){fn();checks++;console.log('PASS '+name);}
function harness(subject, initial = {}) {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  const store = new Map(Object.entries(initial));
  const elements = new Map(), selectors = new Map(), timers = [];
  function el(id) {
    if (!elements.has(id)) elements.set(id, {id, value:'', textContent:'', innerHTML:'', dataset:{}, style:{}, events:{}, classList:{toggle(){},add(){},remove(){}}, matches(sel){return sel==='[data-essay-field]'?!!this.dataset.essayField:sel==='[data-annotation-cat]'?this.dataset.annotationCat!==undefined:false}, addEventListener(n,f){(this.events[n] ||= []).push(f)}, setAttribute(){}, removeAttribute(){}, showModal(){this.open=true}, close(){this.open=false}, appendChild(x){elements.set(x.id,x)},focus(){}, select(){}, remove(){}, insertAdjacentElement(_,x){elements.set(x.id,x)}, click(){this.clicked=true;(this.events.click||[]).forEach(f=>f({target:this}))}, querySelector(){return null}, querySelectorAll(){return []}});
    return elements.get(id);
  }
  const context = {console, Date, Math, Set, Map, URL, URLSearchParams, TextEncoder, TextDecoder,
    localStorage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)},
    location:{href:'https://review.test/'+subject+'/',search:'',reload(){}}, history:{replaceState(){}}, navigator:{},
    document:{body:{classList:{toggle(){},add(){},remove(){}},appendChild(x){elements.set(x.id,x)}},documentElement:{dataset:{}},getElementById:id=>id==='save-warning'?(elements.get(id)||null):id==='smart-idk'?null:el(id),querySelector:s=>selectors.get(s)||null,querySelectorAll:s=>selectors.get(s)||[],createElement:()=>el('new-'+Math.random()),addEventListener(){}},
    MutationObserver:class{observe(){}},setTimeout:f=>{timers.push(f);return timers.length},clearTimeout(){},setInterval:()=>1,clearInterval(){},alert(){},
    Blob:class{constructor(parts){context.lastBlob=parts.join('')}},btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),
    Event:class {constructor(type){this.type=type}},__modules:{},
  };
  context.window=context;context.addEventListener=()=>{};context.URL=class extends URL {static createObjectURL(){return 'blob:test'}static revokeObjectURL(){}};
  vm.createContext(context);
  const beforeUI=scripts[0].slice(0,scripts[0].indexOf('const $'));
  vm.runInContext(beforeUI,context);
  if(subject==='rs')vm.runInContext(scripts[0].match(/const CARDS=.*?;\n/)[0],context);
  else vm.runInContext('const state={edits:{}};const revisionCases=()=>CASES.map(c=>({...c,...state.edits[c.id]}));',context);
  const exports={
   1:'srState,srCards,srLoad,srRate,srAddMistake,srOpen,srExamView,srGenerateExam,srRec',
   2:'index,cards,heatData,exportBackup,importBackup,addSmartIdk,newMock,mockView,caseView,mark,getMock:()=>mock',
   3:'improveView,progressPayload,quizBank,answerAdaptive,nextAdaptive,essayView,notesView,render,availableTopics,applySet,captureEssay,getLab:()=>lab,getAdaptive:()=>adaptive,getEssayQuestion:()=>essayQuestion'+(subject==='geography'?',dataPool,dataView':',quotesPool,quotesView'),
   4:'sheetData',
   5:'analytics,logQuestion,seedHistory,paragraphView,startParagraph,finishParagraph,annotationView,buildAnnotation,retryCandidates,retryView,getPerf:()=>perf,getPara:()=>para,render'+(subject==='geography'?',neaNums,neaSpearman,neaMannWhitney,neaParseMatrix,neaChiSquare,neaView,neaRecommendation,neaResultHtml,neaInputs':''),
   6:'stTopicFromCardId,stStats,chooseTask,start,render'
  };
  for(let i=1;i<scripts.length;i++){
    const instrumented=scripts[i].replace(/\}\)\(\);\s*$/,`window.__modules[${i}]={${exports[i]}};})();`);
    vm.runInContext(instrumented,context,{filename:subject+'-script-'+i+'.js'});
  }
  function event(container,type,target){(el(container).events[type]||[]).forEach(f=>f({target}));}
  function click(container,button){(el(container).events.click||[]).forEach(f=>f({target:{closest:()=>button}}));}
  return {context,modules:context.__modules,store,el,selectors,timers,click,event,eval:s=>vm.runInContext(s,context)};
}
const kind=subject==='geography'?'geo':'rs';
const smart='aqa-'+kind+'-smart-v1', lab='aqa-'+kind+'-study-lab-v1', perf='aqa-'+kind+'-performance-v1', theme='aqa-'+kind+'-theme-v1', custom='aqa-'+kind+'-custom-cards-v1', plus='aqa-'+kind+'-plus-v1';
function fresh(seed={}){return harness(subject,seed);}
test('All embedded scripts parse',()=>{for(const match of source.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(match[1]);});
test('Backup and sync cover identical keys including notes, resources, theme and subject tools',()=>{
 const h=fresh({[lab]:JSON.stringify({notes:{test:'Personal note'},resources:[{text:'Teacher notes'}]}),[theme]:'light'});
 h.modules[2].exportBackup();const backup=JSON.parse(h.context.lastBlob).data,sync=h.modules[3].progressPayload().keys;
 assert.deepEqual(JSON.parse(JSON.stringify(sync)),backup);assert.equal(backup[theme],'light');assert.ok(backup[lab]);assert.ok(Object.hasOwn(backup,perf));assert.equal(Object.keys(backup).length,7);
 const other=fresh();other.context.__aqaProgress.restore(backup);assert.equal(other.store.get(lab),backup[lab]);assert.equal(other.store.get(theme),'light');
});
test('Restores clear explicit nulls, preserve omitted legacy keys and reject malformed data before writes',()=>{
 const h=fresh({[theme]:'light',[lab]:'{"notes":{"test":"keep"}}'});
 h.context.__aqaProgress.restore({[theme]:null});assert.equal(h.store.has(theme),false);assert.equal(h.store.get(lab),'{"notes":{"test":"keep"}}');
 assert.throws(()=>h.context.__aqaProgress.restore({[theme]:'dark',[lab]:'invalid JSON'}));assert.equal(h.store.has(theme),false);
});
test('Smart card IDK records correct answer and remains after another rating',()=>{
 const h=fresh(),c=h.modules[1].srCards()[0];h.context.__aqaSmart.markUnknown();let s=JSON.parse(h.store.get(smart));assert.equal(s.mistakes.length,1);assert.equal(s.mistakes[0].q,c.q);assert.equal(s.mistakes[0].answer,c.a);assert.ok(s.sr[c.id].due>Date.now());
 h.modules[1].srRate(h.modules[1].srCards()[1],'good');s=JSON.parse(h.store.get(smart));assert.equal(s.mistakes.length,1);
});
test('Mock IDK and adaptive errors update the same mistake bank',()=>{
 const h=fresh();h.modules[2].newMock();h.click('revision-plus-dialog',{dataset:{mockIdk:'0'}});assert.equal(h.modules[1].srState.mistakes.length,1);
 h.modules[3].nextAdaptive();const q=h.modules[3].getAdaptive();h.modules[3].answerAdaptive(q.options.findIndex(x=>x!==q.correct));assert.equal(h.modules[1].srState.mistakes.length,2);assert.ok(h.modules[1].srState.mistakes.some(m=>m.answer===q.correct));
});
test('Deleting a custom card removes its schedule from live state and storage',()=>{
 const h=fresh({[smart]:JSON.stringify({sr:{'custom-test':{last:1,due:1,reps:1,interval:1,ease:2.5}}})});h.context.__aqaSmart.forgetCard('custom-test');h.modules[1].srRate(h.modules[1].srCards()[0],'good');assert.equal(JSON.parse(h.store.get(smart)).sr['custom-test'],undefined);
});
test('Built-in IDs resolve to the actual topic in both subjects',()=>{
 const h=fresh();for(const card of h.modules[1].srCards())assert.equal(h.modules[6].stTopicFromCardId(card.id),card.topic);
});
test('Heatmap includes custom cards',()=>{
 const h=fresh({[custom]:JSON.stringify([{id:'custom-test',topic:subject==='geography'?'water':'arguments',q:'Custom question',a:'Custom answer'}])});assert.ok(h.modules[2].cards().some(c=>c.id==='custom-test'));
});
test('Smart task starts the exact recommended retry, not the oldest due item',()=>{
 const now=Date.now(),h=fresh({[perf]:JSON.stringify({questions:[{id:'low',q:'LOW SCORE',topic:subject==='geography'?'water':'arguments',score:20,retryDue:now-1000},{id:'old',q:'OLDER DUE',topic:subject==='geography'?'coasts':'evil',score:60,retryDue:now-2000}]})});
 assert.equal(h.modules[6].chooseTask().questionId,'low');h.modules[6].render();h.modules[6].start();assert.ok(h.modules[5].retryView().includes('<h3>LOW SCORE</h3>'));assert.equal(h.el('performance-dialog').open,true);
});
test('Smart task starts a focused adaptive topic and resets stale questions',()=>{
 const h=fresh(),topic=subject==='geography'?'coasts':'evil';h.modules[3].nextAdaptive();h.context.__aqaStartAdaptive(topic);assert.equal(h.modules[3].getAdaptive().topic,topic);
 for(let i=0;i<6;i++){h.modules[3].nextAdaptive();assert.equal(h.modules[3].getAdaptive().topic,topic);}assert.equal(h.el('study-lab-dialog').open,true);
});
test('Generated and initially-created mock questions retain topic and marks without double logging',()=>{
 const h=fresh();h.el('sr-exam-marks').value=subject==='geography'?'20':'25';const q=h.modules[1].srGenerateExam(),records=h.modules[5].getPerf().questions;
 assert.equal(records.length,1);assert.equal(records[0].topic,q.topic);assert.equal(records[0].marks,Number(h.el('sr-exam-marks').value));assert.ok(h.modules[1].srExamView().includes('value="'+records[0].marks+'" selected'));
 h.modules[2].newMock();for(const x of h.modules[2].getMock().items){const entry=records.find(r=>r.q===x.q)||h.modules[5].getPerf().questions.find(r=>r.q===x.q);assert.equal(entry.topic,x.topic);assert.equal(entry.marks,x.marks);}
});
test('Existing incomplete mock history is repaired without rescheduling a retry',()=>{
 const q='Stored mock question',topic=subject==='geography'?'water':'arguments',h=fresh({[perf]:JSON.stringify({questions:[{id:'old',q,topic:'',marks:null,retryDue:123,score:30}]}),[plus]:JSON.stringify({mockHistory:[{items:[{q,topic,marks:20,result:{total:12}}]}]})});
 const r=h.modules[5].getPerf().questions[0];assert.equal(r.topic,topic);assert.equal(r.marks,20);assert.equal(r.retryDue,123);assert.equal(r.score,30);
});
test('Timed paragraph retains input through rerender and assesses state even away from the textarea',()=>{
 const h=fresh();h.modules[5].startParagraph();const input=h.el('para-answer');input.value='Evidence shows this because there is a clear process. However the outcome depends on context.';h.event('performance-dialog','input',input);
 assert.ok(h.modules[5].paragraphView().includes(input.value));input.value='';h.modules[5].finishParagraph(true);assert.ok(h.modules[5].getPerf().paragraphs[0].text.includes('Evidence shows'));
 const reloaded=fresh(Object.fromEntries(h.store));assert.ok(reloaded.modules[5].getPara().answer.includes('Evidence shows'));
});
test('Essay draft retains both question and fields through topic navigation and reload',()=>{
 const h=fresh();h.modules[3].essayView();const q=h.el('lab-essay-question');q.value='My precise edited question';const field=h.el('test-field');field.dataset.essayField='intro';field.value='My saved introduction';h.selectors.set('[data-essay-field]',[field]);h.modules[3].captureEssay();
 const saved=h.modules[3].getLab().essayDrafts;assert.ok(Object.values(saved).some(d=>d.question===q.value&&d.intro===field.value));const reloaded=fresh(Object.fromEntries(h.store));const html=reloaded.modules[3].essayView();assert.ok(html.includes(q.value));assert.ok(html.includes(field.value));
});
test('Revision sets reset quizzes and filter subject-specific trainers',()=>{
 const h=fresh(),topic=subject==='geography'?'coasts':'evil';h.modules[3].nextAdaptive();h.modules[3].essayView();h.modules[3].applySet([topic]);assert.equal(h.modules[3].getAdaptive(),null);assert.equal(h.modules[3].getEssayQuestion(),'');assert.equal(h.modules[3].availableTopics().length,1);h.modules[3].nextAdaptive();assert.equal(h.modules[3].getAdaptive().topic,topic);
 if(subject==='geography'){assert.ok(h.modules[3].dataPool().every(d=>d.topic===topic));h.modules[3].applySet(['glaciers']);assert.ok(h.modules[3].dataView().includes('No datasets match'));}
 else assert.ok(h.modules[3].quotesPool().every(q=>q[0].split(' ').includes(topic)));
});
test('Saved annotations reappear and older snapshots can be selected',()=>{
 const annotations=[{at:1,text:'Latest annotation.',segments:[{text:'Latest annotation.',cat:'Knowledge'}]},{at:2,text:'Older annotation.',segments:[{text:'Older annotation.',cat:'Evidence'}]}];const h=fresh({[perf]:JSON.stringify({annotations})});assert.ok(h.modules[5].annotationView().includes('Latest annotation.'));const select=h.el('annotation-snapshot');select.value='1';h.event('performance-dialog','change',select);assert.ok(h.modules[5].annotationView().includes('Older annotation.'));
});
test('Bulk generation uses the edited resource textarea',()=>{
 const h=fresh({[lab]:JSON.stringify({resources:[{id:'r1',text:'Old concept: the old definition describes a former theory.'}]})});h.click('performance-dialog',{dataset:{phTab:'bulk'}});h.el('bulk-resource').value='r1';h.el('bulk-topic').value=subject==='geography'?'water':'arguments';h.el('bulk-count').value='10';h.el('bulk-text').value='New concept: the edited definition describes the current theory.';h.click('performance-dialog',{id:'bulk-generate',dataset:{}});assert.ok(h.el('ph-content').innerHTML.includes('New concept'));assert.ok(!h.el('ph-content').innerHTML.includes('What is Old concept?'));
});
test('Both apps contain browser theme metadata',()=>{assert.match(source,/<meta name="theme-color" content="#121212">/);});
if(subject==='geography'){
 test('Geography case edits feed search, mastery, sheets and evidence terms',()=>{
  const h=fresh();h.eval("state.edits[CASES[0].id]={name:'Edited case',stats:'Edited evidence'}");assert.ok(h.modules[2].index().some(x=>x.title==='Edited case'));assert.ok(h.modules[2].caseView().includes('Edited evidence'));assert.ok(h.modules[4].sheetData(h.eval('CASES[0].tags[0]')).extra.some(x=>x.includes('Edited evidence')));
 });
 test('NEA exact Spearman is two-sided and handles ties',()=>{
  const h=fresh(),f=h.modules[5].neaSpearman;const r=f([1,2,3,4,5],[1,2,3,5,4]);assert.equal(r.stat,.9);assert.ok(Math.abs(r.p-1/12)<1e-12);assert.equal(r.significant,false);
  const perfect=f([1,2,3,4,5],[5,4,3,2,1]);assert.ok(Math.abs(perfect.p-1/60)<1e-12);assert.equal(perfect.significant,true);
  const tied=f([1,1,2,3,4],[1,2,2,3,4]);assert.ok(tied.p>=0&&tied.p<=1);
  const larger=f(Array.from({length:10},(_,i)=>i),Array.from({length:10},(_,i)=>i));assert.equal(larger.significant,null);assert.equal(larger.p,null);
 });
 test('NEA rejects invalid, missing, non-finite and constant paired values',()=>{
  const h=fresh(),m=h.modules[5];for(const text of ['1,2,bad,4,5','1,,2','1,2,','Infinity,2',''])assert.throws(()=>m.neaNums(text));assert.throws(()=>m.neaSpearman([1,1,1,1,1],[1,2,3,4,5]));assert.throws(()=>m.neaSpearman([1,2,3,4,5],[1,2,3,4,Infinity]));
 });
 test('NEA small-sample Mann–Whitney uses exact permutations',()=>{
  const r=fresh().modules[5].neaMannWhitney([1,2,3],[4,5,6]);assert.equal(r.stat,0);assert.equal(r.p,.1);assert.equal(r.significant,false);assert.equal(r.exact,true);
 });
 test('NEA chi-squared validates counts and avoids unsupported significance',()=>{
  const m=fresh().modules[5];assert.throws(()=>m.neaParseMatrix('1.5,2\n3,4'));assert.throws(()=>m.neaChiSquare([[0,0],[3,4]]));assert.throws(()=>m.neaChiSquare([[0,2],[0,3]]));const r=m.neaChiSquare([[1,1],[1,1]]);assert.equal(r.significant,null);assert.equal(r.assumptionOK,false);assert.equal(m.neaChiSquare([[10,10],[10,10]]).significant,false);
 });
 test('Paired differences do not recommend a correlation test',()=>{
  const h=fresh();h.el('nea-aim').value='difference';h.el('nea-data').value='ordinal';h.el('nea-groups').value='paired';assert.equal(h.modules[5].neaRecommendation().test,null);
 });
 test('NEA inputs and versioned output restore, while old conclusions are flagged',()=>{
  const h=fresh();const r=h.modules[5].neaSpearman([1,2,3,4,5],[1,2,3,5,4]);r.calculationVersion=2;const seed={[perf]:JSON.stringify({neaStats:{lastResult:r,inputs:{'nea-x':'1,2,3,4,5'}}})};const restored=fresh(seed);assert.ok(restored.modules[5].neaView().includes('exact p = 0.0833'));assert.ok(restored.modules[5].neaInputs().includes('>1,2,3,4,5</textarea>'));assert.ok(h.modules[5].neaResultHtml({writeup:'Old conclusion'}).includes('Recalculate'));
 });
}
test('Mock drafts survive reload and are present in backups',()=>{
 const h=fresh();h.modules[2].newMock();const item=h.modules[2].getMock().items[0];
 const input=h.el('test-mock');input.dataset.mockAnswer='0';input.value='A saved mock answer';input.matches=s=>s==='[data-mock-answer]';h.event('revision-plus-dialog','input',input);
 const r=fresh(Object.fromEntries(h.store));assert.equal(r.modules[2].getMock().items[0].answer,input.value);assert.equal(r.modules[2].getMock().items[0].q,item.q);
 assert(h.context.__aqaProgress.snapshot()[plus].includes(input.value));
});
test('Improvement drafts keep question and both answers across topics, tabs and reload',()=>{
 const h=fresh();const ids=h.modules[3].availableTopics().map(t=>t.id);h.modules[3].improveView();
 h.el('lab-improve-topic').value=ids[0];h.el('lab-improve-question').value='Saved question';h.el('lab-improve-a').value='First <answer>';h.el('lab-improve-b').value='Second answer';h.event('study-lab-dialog','input',h.el('lab-improve-a'));
 h.el('lab-improve-topic').value=ids[1];h.event('study-lab-dialog','change',h.el('lab-improve-topic'));assert(!h.modules[3].improveView().includes('Saved question'));
 h.el('lab-improve-topic').value=ids[0];h.event('study-lab-dialog','change',h.el('lab-improve-topic'));
 const html=fresh(Object.fromEntries(h.store)).modules[3].improveView();assert(html.includes('Saved question'));assert(html.includes('First &lt;answer&gt;'));assert(html.includes('Second answer'));
});
test('Retry drafts persist and blank ratings cannot replace scores or advance the schedule',()=>{
 const h=fresh(),m=h.modules[5],id=h.modules[3].availableTopics()[0].id;m.logQuestion('Retry test',id,'Mock exam',20,true,25);const q=m.getPerf().questions[0];h.context.__aqaOpenRetry(q.id);const due=q.retryDue;
 h.el('retry-answer').value='';h.click('performance-dialog',{dataset:{retryRate:'secure'}});assert.equal(q.retryDue,due);assert.equal(q.score,25);assert.equal(q.retryCount,0);
 h.el('retry-answer').value='My revised answer';h.event('performance-dialog','input',h.el('retry-answer'));
 const r=fresh(Object.fromEntries(h.store));r.context.__aqaOpenRetry(q.id);assert(r.modules[5].retryView().includes('My revised answer'));
 h.click('performance-dialog',{dataset:{retryRate:'secure'}});assert.equal(q.score,25);assert.equal(q.retryRating,'secure');assert.equal(q.lastRetryAnswer,'My revised answer');assert.equal(q.retryDraft,'');assert.equal(q.retryCount,1);assert(q.retryDue>due);
});
test('Topic analytics distinguish no data, zero accuracy and measured accuracy',()=>{
 const h=fresh();assert(h.modules[5].analytics().includes('No data yet'));assert(!h.modules[5].analytics().includes('<strong>45%</strong>'));
 const ids=h.modules[3].availableTopics().map(t=>t.id);const data={adaptive:{[ids[0]]:{right:0,wrong:2},[ids[1]]:{right:3,wrong:1}}};
 const html=fresh({[lab]:JSON.stringify(data)}).modules[5].analytics();assert(html.includes('<strong>0%</strong>'));assert(html.includes('<strong>75%</strong>'));
});
test('Paragraph feedback survives navigation and reload and clears for a new prompt',()=>{
 const h=fresh(),m=h.modules[5];m.paragraphView();m.getPara().answer='Because evidence supports this claim however overall it depends on context.';m.finishParagraph(false);const result=m.getPara().result;const html=m.paragraphView();assert(html.includes('ph-result'));assert(html.includes(result.words+' words'));
 const r=fresh(Object.fromEntries(h.store));assert(r.modules[5].paragraphView().includes(result.words+' words'));
 h.click('performance-dialog',{id:'para-new',dataset:{}});assert.equal(m.getPara().result,null);assert(!m.paragraphView().includes('class="ph-result"'));
});
test('Failed saves warn, remain recoverable in backups and retry successfully',()=>{
 const h=fresh(),id=h.modules[3].availableTopics()[0].id;const write=h.context.localStorage.setItem;let alerts=[];h.context.alert=s=>alerts.push(s);h.context.localStorage.setItem=()=>{throw Error('QuotaExceededError')};
 h.el('lab-note-topic').value=id;h.el('lab-note-text').value='Unsaved but recoverable';h.click('study-lab-dialog',{id:'lab-save-note',dataset:{}});
 assert.equal(alerts.length,1);assert.equal(h.el('save-warning').hidden,false);assert(!String(h.store.get(lab)).includes('Unsaved but recoverable'));assert(h.context.__aqaProgress.snapshot()[lab].includes('Unsaved but recoverable'));
 h.el('lab-note-text').value='Latest draft';h.click('study-lab-dialog',{id:'lab-save-note',dataset:{}});assert.equal(alerts.length,1);assert(h.context.__aqaRead(lab).includes('Latest draft'));
 h.context.localStorage.setItem=write;for(const [k,v] of h.context.__aqaPendingWrites)assert.equal(h.context.__aqaStore(k,v),true);
 assert.equal(h.context.__aqaPendingWrites.size,0);assert.equal(h.el('save-warning').hidden,true);assert.equal(fresh(Object.fromEntries(h.store)).modules[3].getLab().notes[id],'Latest draft');
});

(async()=>{
 const handlers={},deleted=[];let done;
 vm.runInNewContext(fs.readFileSync(path.join(root,'sw.js'),'utf8'),{self:{addEventListener:(n,f)=>handlers[n]=f,clients:{claim(){}},skipWaiting(){}},caches:{keys:async()=>['geo-revision-pwa-v1','geo-revision-pwa-v2','rs-revision-pwa-v1','rs-revision-pwa-v2'],delete:async k=>deleted.push(k)}});
 handlers.activate({waitUntil:p=>done=p});await done;assert.deepEqual(deleted,[kind+'-revision-pwa-v1',kind+'-revision-pwa-v2']);checks++;console.log('PASS Service worker retains sibling caches');
 console.log(`${subject}: ${checks} regression checks passed`);
})().catch(e=>{console.error(e);process.exitCode=1});
