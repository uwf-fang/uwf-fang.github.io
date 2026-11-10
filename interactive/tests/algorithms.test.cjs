const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const A=require('../lesson-algorithms.js');
const subsequence=(x,s)=>{let i=0;for(const c of s)if(c===x[i])i++;return i===x.length;};
function lcsOracle(a,b){let best=0;for(let mask=0;mask<2**a.length;mask++){let x='';for(let i=0;i<a.length;i++)if(mask&(1<<i))x+=a[i];if(x.length>best&&subsequence(x,b))best=x.length;}return best;}
test('LCS: every binary string through length 3, including empty inputs, agrees with independent subsequence enumeration',()=>{
  const strings=[''];for(let n=1;n<=3;n++)for(let i=0;i<2**n;i++)strings.push(i.toString(2).padStart(n,'0'));
  for(const a of strings)for(const b of strings)for(const mode of ['table','memo','naive']){const run=A.lcs(a,b,mode);assert.equal(run.length,lcsOracle(a,b));assert.equal(run.answer.length,run.length);assert.ok(subsequence(run.answer,a)&&subsequence(run.answer,b));assert.equal(run.frames.at(-1).phase,'done');}
});
test('LCS memoization reuses overlapping subproblems; tabulation and recursion reconstruct the same tie policy',()=>{
  const memo=A.lcs('ABCBD','BDCAB','memo'),naive=A.lcs('ABCBD','BDCAB','naive');assert.ok(memo.frames.at(-1).hits>0);assert.ok(memo.frames.at(-1).visits<naive.frames.at(-1).visits);
  assert.equal(memo.answer,A.lcs('ABCBD','BDCAB').answer);assert.throws(()=>A.lcs('ABCDEFG','ABCDEFG','naive'));
});
function chainOracle(d,i=0,j=d.length-2){if(i===j)return 0;return Math.min(...Array.from({length:j-i},(_,offset)=>{const k=i+offset;return chainOracle(d,i,k)+chainOracle(d,k+1,j)+d[i]*d[k+1]*d[j+1];}));}
test('Matrix chain: known optimal costs, single-matrix case, and independent exhaustive split oracle',()=>{
  assert.equal(A.matrixChain([30,35,15,5,10,20,25]).cost,15125);assert.equal(A.matrixChain([10,100,5,50]).cost,7500);assert.equal(A.matrixChain([10,20]).cost,0);
  for(const d of [[5,4,6,2,7],[1,1,1,1,1],[10,3,8,5,4,7],[2,7,3]])assert.equal(A.matrixChain(d).cost,chainOracle(d));
  assert.throws(()=>A.matrixChain([0,3]));assert.throws(()=>A.matrixChain([2]));
});
test('Recursion: successful/failed searches, sorted precondition, Fibonacci values, and an empty final call stack',()=>{
  for(const mode of ['linear','binary']){const yes=A.recursion(mode,[2,4,6,8],6,4),no=A.recursion(mode,[2,4,6,8],7,4);assert.equal(yes.result,2);assert.equal(no.result,-1);assert.deepEqual(yes.frames.at(-1).stack,[]);assert.ok(yes.frames.some(f=>f.stack.length>1));}
  assert.throws(()=>A.recursion('binary',[4,2],2,0));for(const [n,result] of [[0,0],[1,1],[4,3],[7,13]])assert.equal(A.recursion('fib',[],0,n).result,result);
});
test('Search traces display the array, size, target, and changing index/bounds in every call',()=>{
  for(const mode of ['linear','binary']){
    const run=A.recursion(mode,[2,4,6,8],6,0),name=mode==='linear'?'linearSearch':'binarySearch';
    for(const frame of run.frames){
      for(const call of frame.stack){assert.ok(call.label.startsWith(`${name}(a, 4, 6, `));assert.match(call.args,/a=\[2, 4, 6, 8\], size=4, target=6/);}
      for(const call of frame.stack.filter(x=>x.pending.startsWith('return ')))if(call.pending.includes('Search('))assert.ok(call.pending.startsWith(`return ${name}(a, 4, 6, `));
    }
  }
});
test('Packing problem statements state the exact predicates used for each result',()=>{
  const html=fs.readFileSync(path.join(__dirname,'../problem-type-paradigm.html'),'utf8');
  const start=html.indexOf('// Problem items definition'),source=html.slice(start,html.indexOf('</script>',start));
  const context=vm.createContext({document:{addEventListener(){}}});vm.runInContext(source+';globalThis.review={TAB_DATA,feasible};',context);
  const {TAB_DATA:tabs,feasible}=context.review;
  for(const info of Object.values(tabs))assert.match(info.question,/at most 5 kg/);
  assert.match(tabs.search.question,/at least \$10/);assert.match(tabs.decision.question,/at least \$12/);
  assert.match(tabs.enumeration.question,/empty bag/);assert.match(tabs.counting.question,/empty bag/);
  const search=Array.from(feasible).filter((item,i)=>tabs.search.isMatch(item,i,feasible));
  assert.equal(search.length,1);assert.equal(search[0].names,'Water Bottle');assert.equal(search[0].weight,3);assert.equal(search[0].val,10);
  assert.ok(Array.from(feasible).filter(tabs.decision.isMatch).every(item=>item.weight<=5&&item.val>=12));
});
test('N-Queens enumerates the known counts for 3–6, and every displayed placement respects previous rows',()=>{
  for(const [n,count] of [[3,0],[4,2],[5,10],[6,4]]){const run=A.queens(n,true);assert.equal(run.solutions,count);for(const frame of run.frames)for(let i=0;i<frame.queens.length;i++)for(let j=0;j<i;j++){assert.notEqual(frame.queens[i],frame.queens[j]);assert.notEqual(Math.abs(frame.queens[i]-frame.queens[j]),i-j);}}
  assert.equal(A.queens(4).solutions,1);
});
test('Amortized growth: doubling potential bounds each amortized append by 3 and both policies account for every copy',()=>{
  for(let n=1;n<=48;n++){const double=A.growth(n),fixed=A.growth(n,'fixed');assert.equal(double.total,double.history.reduce((sum,h)=>sum+h.cost,0));assert.ok(double.total<=3*n);assert.ok(double.history.every(h=>h.amortized<=3));let copies=0;for(let i=4;i<n;i+=4)copies+=i;assert.equal(fixed.total,n+copies);}
});
test('Heapify and heapsort: duplicate/negative keys and both heap orders',()=>{
  let seed=59;const next=()=>{seed=(seed*1664525+1013904223)>>>0;return seed;};
  for(let n=1;n<=20;n++)for(let k=0;k<8;k++){const values=Array.from({length:n},()=>next()%19-9);for(const kind of ['min','max']){const heap=A.heap(values,'heapify',kind).result;for(let i=1;i<n;i++)assert.ok(kind==='max'?heap[Math.floor((i-1)/2)]>=heap[i]:heap[Math.floor((i-1)/2)]<=heap[i]);assert.deepEqual(A.heap(values,'sort',kind).result,[...values].sort(kind==='max'?(a,b)=>a-b:(a,b)=>b-a));}}
});
test('Lexer distinguishes maximal identifiers, integers, symbols, lexical errors, and syntax errors',()=>{
  assert.deepEqual(A.lexer(' x12 + 34*(a-2) ').tokens.map(t=>[t.type,t.value]),[['IDENTIFIER','x12'],['PLUS','+'],['INTEGER','34'],['TIMES','*'],['LPAREN','('],['IDENTIFIER','a'],['MINUS','-'],['INTEGER','2'],['RPAREN',')']]);
  assert.ok(A.lexer('_x').error);assert.equal(A.lexer('12a').error,undefined);assert.throws(()=>A.grammar('12a'));assert.throws(()=>A.grammar('x + * y'));assert.throws(()=>A.grammar(''));assert.throws(()=>A.grammar('(x+y'));
});
const evaluate=node=>node.children.length?({'+':(a,b)=>a+b,'-':(a,b)=>a-b,'*':(a,b)=>a*b,'/':(a,b)=>a/b}[node.label])(...node.children.map(evaluate)):Number(node.label);
test('Grammar: precedence, grouping, left associativity, and equal terminal strings under both derivation directions',()=>{
  for(const [expression,result] of [['2+3*4',14],['(2+3)*4',20],['8-3-2',3],['16/4/2',2]]){const left=A.grammar(expression,'left'),right=A.grammar(expression,'right');assert.equal(evaluate(left.ast),result);assert.equal(evaluate(right.ast),result);assert.deepEqual(left.frames.at(-1).derivation,right.frames.at(-1).derivation);assert.equal(left.frames.at(-1).derivation.join(''),expression);}
});
test('Grammar derivations follow the displayed BNF; semantic errors stay distinct from successful syntax analysis',()=>{
  function check(n){if(n.terminal)return;const labels=n.children.map(c=>c.label).join(' ');if(n.label==='E')assert.ok(['T','E + T','E - T'].includes(labels));if(n.label==='T')assert.ok(['F','T * F','T / F'].includes(labels));n.children.forEach(check);}
  const parsed=A.grammar('x+y*z');check(parsed.tree);assert.equal(parsed.value,14);assert.equal(A.grammar('(x+y)*z').value,20);assert.match(A.grammar('q+2').evaluationError,/Parsing succeeded/);assert.match(A.grammar('2/0').evaluationError,/division by zero/);assert.equal(A.lcs('😀a','😀b').answer,'😀');
});
function packingOracle(values){const bins=[];let best=values.length;function visit(i){if(i===values.length){best=Math.min(best,bins.length);return;}for(let j=0;j<bins.length;j++)if(bins[j]+values[i]<=1+1e-9){bins[j]+=values[i];visit(i+1);bins[j]-=values[i];}if(bins.length<best){bins.push(values[i]);visit(i+1);bins.pop();}}visit(0);return best;}
test('Packing: exact optimum is distinct from the volume lower bound; compare against an exhaustive assignment oracle',()=>{
  assert.equal(A.packingOptimum([.6,.6,.6]),3);for(const values of [[.2,.5,.4,.7,.1,.3,.8,.2,.6,.4],[.6,.4,.6,.4],[.51,.49,.5,.5],[.4,.4,.4,.4,.4],[.1,.2,.3,.4,.5]]){const optimal=A.packingOptimum(values);assert.equal(optimal,packingOracle(values));for(const rule of ['first','best','next','offlineFirst','offlineNext'])assert.ok(A.packing(values,rule)>=optimal);}
});
test('Hash set: tombstones preserve search chains, duplicate keys are ignored, and rehash retains all keys',()=>{
  for(const method of ['chain','linear']){let table=Array.from({length:7},()=>[]);for(const key of [2,9,16])table=A.hashOperation(table,method,'insert',key,.9).table;const duplicate=A.hashOperation(table,method,'insert',9,.9);assert.equal(duplicate.table.flat().length,3);table=A.hashOperation(table,method,'remove',9,.9).table;assert.equal(A.hashOperation(table,method,'find',16).found,true);assert.equal(A.hashOperation(table,method,'find',9).found,false);table=A.hashOperation(table,method,'insert',23,.9).table;for(const key of [-1,-8,30,37,44])table=A.hashOperation(table,method,'insert',key,.6).table;assert.ok(table.length>7);for(const key of [2,16,23,-1,-8,30,37,44])assert.equal(A.hashOperation(table,method,'find',key).found,true);}
});
test('The catalog has unique existing pages; every local JS source and inline script parses',()=>{
  const root=path.resolve(__dirname,'..'),catalog=require('../catalog.json');assert.equal(catalog.length,25);assert.equal(new Set(catalog.map(x=>x.file)).size,25);
  for(const item of catalog){assert.ok(fs.existsSync(path.join(root,item.file)),item.file);const html=fs.readFileSync(path.join(root,item.file),'utf8');assert.match(html,/teaching\.js/);for(const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(match[1],{filename:item.file});}
  for(const file of fs.readdirSync(root).filter(f=>f.endsWith('.js')))new vm.Script(fs.readFileSync(path.join(root,file),'utf8'),{filename:file});
});
