/* Deterministic lesson models. No DOM or playback dependencies. */
(function(root){
  'use strict';
  const copy=x=>JSON.parse(JSON.stringify(x));
  function recorder(state){const frames=[];return {frames,push(trace,extra={}){Object.assign(state,extra,{trace});frames.push(copy(state));}};}
  function integers(raw,min=1,max=20){const p=raw.split(',').map(x=>x.trim());if(p.length<min||p.length>max||p.some(x=>!/^[-+]?\d+$/.test(x)||!Number.isSafeInteger(+x)||Math.abs(+x)>9999))throw Error(`Use ${min}–${max} comma-separated integers from −9999 to 9999.`);return p.map(Number);}
  function lcs(a,b,mode='table'){
    a=Array.from(a);b=Array.from(b);if(a.length>12||b.length>12)throw Error('Use at most 12 characters per string.');
    if(mode==='naive'&&(a.length>6||b.length>6))throw Error('Naive recursion is limited to 6 characters per string; use memoization or tabulation for larger examples.');
    const m=a.length,n=b.length,dp=Array.from({length:m+1},()=>Array(n+1).fill(null));
    for(let i=0;i<=m;i++)dp[i][0]=0;for(let j=0;j<=n;j++)dp[0][j]=0;
    const s={kind:'lcs',a,b,dp,active:null,reads:[],calls:[],visits:0,hits:0,path:[],answer:'',phase:'solve'},r=recorder(s);
    const value=(i,j)=>a[i-1]===b[j-1]?dp[i-1][j-1]+1:Math.max(dp[i-1][j],dp[i][j-1]);
    r.push('Base row and column are 0: an empty string has no common nonempty subsequence.');
    if(mode==='table')for(let i=1;i<=m;i++)for(let j=1;j<=n;j++){
      s.active=[i,j];s.reads=a[i-1]===b[j-1]?[[i-1,j-1]]:[[i-1,j],[i,j-1]];s.visits++;
      r.push(`Predict L[${i},${j}] from the highlighted dependencies.`,{quiz:{prompt:`What is L[${i},${j}]?`,answer:String(value(i,j)),why:a[i-1]===b[j-1]?'Matching characters extend the diagonal solution by 1.':'Different characters: take the larger of the upper and left solutions.'}});
      dp[i][j]=value(i,j);r.push(a[i-1]===b[j-1]?`${a[i-1]} matches ${b[j-1]}: L[${i},${j}] = 1 + L[${i-1},${j-1}] = ${dp[i][j]}.`:`Different characters: L[${i},${j}] = max(${dp[i-1][j]}, ${dp[i][j-1]}) = ${dp[i][j]}.`,{quiz:null});
    }else{
      const seen=new Set();function solve(i,j){s.calls.push(`L(${i},${j})`);s.active=[i,j];s.reads=[];s.visits++;const key=i+','+j;
        if(mode==='memo'&&seen.has(key)){s.hits++;r.push(`Reuse cached L(${i},${j}) = ${dp[i][j]}.`);s.calls.pop();return dp[i][j];}
        r.push(`Enter L(${i},${j})${i&&j?' and inspect the final characters.':': empty-prefix base case.'}`);
        let v;if(!i||!j)v=0;else if(a[i-1]===b[j-1])v=1+solve(i-1,j-1);else v=Math.max(solve(i-1,j),solve(i,j-1));
        dp[i][j]=v;seen.add(key);s.active=[i,j];r.push(`Return L(${i},${j}) = ${v}.`);s.calls.pop();return v;
      }solve(m,n);
    }
    let i=m,j=n;s.calls=[];s.phase='traceback';s.quiz=null;s.reads=[];
    r.push(`Length ${dp[m][n]} is known. Now reconstruct one subsequence, starting at the lower-right cell.`);
    while(i>0&&j>0){s.active=[i,j];s.path.push([i,j]);if(a[i-1]===b[j-1]){s.answer=a[i-1]+s.answer;r.push(`Match ${a[i-1]}: prepend it to the answer and move diagonally.`);i--;j--;}else if(dp[i-1][j]>=dp[i][j-1]){r.push('Move up to an equal-or-larger neighbor. Ties go up, giving a deterministic answer.');i--;}else{r.push('Move left to the larger neighbor.');j--;}}
    s.active=[i,j];s.path.push([i,j]);s.phase='done';r.push(`Complete: length ${dp[m][n]}, one LCS = ${s.answer||'ε (empty)'}. Other longest subsequences may also be valid.`);
    return {frames:r.frames,length:dp[m][n],answer:s.answer};
  }
  function matrixChain(dims){
    if(dims.length<2||dims.length>8||dims.some(x=>!Number.isInteger(x)||x<1||x>500))throw Error('Use 2–8 positive dimensions, each at most 500.');
    const n=dims.length-1,cost=Array.from({length:n},()=>Array(n).fill(null)),split=copy(cost);for(let i=0;i<n;i++)cost[i][i]=0;
    const s={kind:'matrix',dims,cost,split,active:null,reads:[],candidate:null,expression:'',candidates:0},r=recorder(s);
    r.push('One matrix needs no multiplication. Diagonal costs are 0; fill by increasing chain length.');
    for(let len=2;len<=n;len++)for(let i=0;i+len<=n;i++){const j=i+len-1;s.active=[i,j];let best=Infinity;
      for(let k=i;k<j;k++){const scalar=dims[i]*dims[k+1]*dims[j+1],v=cost[i][k]+cost[k+1][j]+scalar;s.candidates++;s.reads=[[i,k],[k+1,j]];s.candidate={i,j,k,left:cost[i][k],right:cost[k+1][j],scalar,value:v};
        r.push(`Split A${i+1}…A${j+1} after A${k+1}: ${cost[i][k]} + ${cost[k+1][j]} + ${dims[i]}×${dims[k+1]}×${dims[j+1]}.`,{quiz:{prompt:'What is the candidate scalar-multiplication cost?',answer:String(v),why:'Add both subchain costs and the cost of multiplying their resulting matrices.'}});
        if(v<best){best=v;cost[i][j]=v;split[i][j]=k;}r.push(`Candidate = ${v}; best cost for this interval = ${best}${split[i][j]===k?' (retain this split).':'.'}`,{quiz:null});
      }
    }
    function tree(i,j){if(i===j)return {label:'A'+(i+1),children:[]};const k=split[i][j];return {label:`A${i+1}…A${j+1}`,children:[tree(i,k),tree(k+1,j)]};}
    function expression(i,j){if(i===j)return 'A'+(i+1);const k=split[i][j];return '('+expression(i,k)+' × '+expression(k+1,j)+')';}
    s.reads=[];s.candidate=null;s.tree=tree(0,n-1);s.expression=expression(0,n-1);r.push(`Complete: ${cost[0][n-1]} scalar multiplications using ${s.expression}. The matrix order stays fixed; only parentheses change.`);
    return {frames:r.frames,cost:cost[0][n-1],expression:s.expression,split};
  }
  function recursion(mode,values,target,n){
    if(mode==='binary'&&values.some((v,i)=>i&&v<values[i-1]))throw Error('Binary search requires a sorted array.');
    if(!Number.isInteger(n)||n<0||n>7)throw Error('Use Fibonacci n from 0 to 7.');
    const s={kind:'recursion',mode,values,target,stack:[],nodes:[],active:null,result:null,line:'call'},r=recorder(s);r.push('Step into a call, follow its base case or recursive call, and watch the return value resume its caller.');
    function call(label,parent,args,body){const id=s.nodes.length;s.nodes.push({id,label,parent,result:null});s.stack.push({id,label,args,pending:'Evaluate the base case'});s.active=id;s.line='call';r.push(`Call ${label}. A new activation becomes the top of the call stack.`);const v=body(id);s.active=id;s.line='return';s.stack.at(-1).pending='return '+v;s.nodes[id].result=v;r.push(`${label} returns ${v}.`);s.stack.pop();s.active=s.stack.at(-1)?.id??null;return v;}
    function linear(i,p=null){return call(`linearSearch(a, ${values.length}, ${target}, ${i})`,p,`a=[${values.join(", ")}], size=${values.length}, target=${target}, i=${i}`,id=>{if(i===values.length){s.line='base';r.push('Base case: the suffix is empty; return −1.');return -1;}if(values[i]===target){s.line='base';r.push(`Match at index ${i}; return ${i}.`);return i;}s.stack.at(-1).pending=`return linearSearch(a, ${values.length}, ${target}, ${i+1})`;s.line='recurse';r.push(`a[${i}] = ${values[i]} differs from ${target}; search the remaining suffix.`);return linear(i+1,id);});}
    function binary(lo,hi,p=null){return call(`binarySearch(a, ${values.length}, ${target}, ${lo}, ${hi})`,p,`a=[${values.join(", ")}], size=${values.length}, target=${target}, lo=${lo}, hi=${hi}`,id=>{if(lo>hi){s.line='base';r.push('Base case: empty interval; return −1.');return -1;}const mid=Math.floor((lo+hi)/2);if(values[mid]===target){s.line='base';r.push(`Middle index ${mid} matches; return ${mid}.`);return mid;}const [l,h]=target<values[mid]?[lo,mid-1]:[mid+1,hi];s.stack.at(-1).pending=`return binarySearch(a, ${values.length}, ${target}, ${l}, ${h})`;s.line='recurse';r.push(`Middle value ${values[mid]}: recurse into [${l}…${h}].`);return binary(l,h,id);});}
    function fib(k,p=null){return call(`fib(${k})`,p,`n=${k}`,id=>{if(k<2){s.line='base';r.push(`Base case fib(${k}) = ${k}.`);return k;}s.stack.at(-1).pending=`fib(${k-1}) + fib(${k-2})`;s.line='recurse';r.push('Evaluate the first recursive call; the addition waits.');const a=fib(k-1,id);s.stack.at(-1).pending=`${a} + fib(${k-2})`;s.line='recurse';r.push(`Left call returned ${a}. Evaluate the second call before adding.`);const b=fib(k-2,id);return a+b;});}
    s.result=mode==='fib'?fib(n):mode==='binary'?binary(0,values.length-1):linear(0);s.line='done';r.push(`Complete: result ${s.result}. The call stack is empty; the call tree records all invocations.`);return {frames:r.frames,result:s.result};
  }
  function queens(n,all=false){
    if(!Number.isInteger(n)||n<3||n>6)throw Error('Choose a board size from 3 to 6.');
    const s={kind:'queens',n,queens:[],trial:null,conflicts:[],checks:0,pruned:0,solutions:0,stack:[],path:[],quiz:null},r=recorder(s);let answer=null;
    r.push('Place one queen per row. Reject a column or diagonal conflict immediately; undo a placement when its branch is exhausted.');
    function visit(row){if(row===n){s.solutions++;answer=[...s.queens];r.push(`Solution ${s.solutions}: every row, column, and diagonal is safe.`);return !all;}
      s.stack.push(`solve(row ${row+1})`);
      for(let col=0;col<n;col++){s.trial=[row,col];s.conflicts=s.queens.flatMap((c,i)=>c===col||Math.abs(c-col)===row-i?[[i,c]]:[]);s.checks++;
        r.push(`Try row ${row+1}, column ${col+1}.`,{quiz:{prompt:'Is this placement safe? (yes/no)',answer:s.conflicts.length?'no':'yes',why:'Queens cannot share a column or diagonal; earlier rows are already occupied.'}});s.quiz=null;
        if(s.conflicts.length){s.pruned++;r.push('Conflict: prune this branch without placing another queen.');continue;}
        s.queens.push(col);s.path.push(`r${row+1}c${col+1}`);s.trial=null;r.push(`Place queen at (${row+1}, ${col+1}); explore the next row.`);
        if(visit(row+1)){s.stack.pop();return true;}s.queens.pop();s.path.pop();s.trial=null;s.conflicts=[];r.push(`Backtrack: remove the queen in row ${row+1} and try another column.`);
      }s.stack.pop();return false;
    }visit(0);s.stack=[];s.trial=null;s.conflicts=[];s.quiz=null;r.push(`Complete: ${s.solutions} solution${s.solutions===1?'':'s'} found${all?' (all solutions)':' (stop after the first)'}. ${s.checks} candidate placements checked. An unpruned enumeration has ${n}^${n} = ${n**n} full row assignments; that is a search-space size, not the same operation count.`);return {frames:r.frames,solutions:s.solutions,answer};
  }
  function growth(count,policy='double',initial=4){
    if(!Number.isInteger(count)||count<1||count>48)throw Error('Use 1–48 appends.');
    const s={kind:'growth',capacity:initial,size:0,total:0,history:[],policy,initial,quiz:null},r=recorder(s);r.push('Each append writes one value. A full array grows and copies its existing values first. Count writes and copied elements.');
    for(let i=1;i<=count;i++){const before=s.capacity,copied=s.size===s.capacity?s.size:0,phi0=Math.max(0,2*s.size-s.capacity);if(copied)s.capacity=policy==='double'?s.capacity*2:s.capacity+initial;
      s.quiz={prompt:'How many writes/copies will this append cost?',answer:String(copied+1),why:'One write for the new value, plus one copy for each existing element when full.'};r.push(`Append ${i}: size ${s.size}, capacity ${before}${copied?'; growth is needed.':'; there is room.'}`);
      s.size++;s.total+=copied+1;const phi=Math.max(0,2*s.size-s.capacity);s.history.push({i,copied,cost:copied+1,total:s.total,capacity:s.capacity,potential:phi,amortized:copied+1+phi-phi0});s.quiz=null;r.push(`Append ${i}: ${copied} copies + 1 new write = ${copied+1}. Total ${s.total}; average ${(s.total/s.size).toFixed(2)}.`);
    }r.push(`Complete: ${s.size} appends cost ${s.total} writes/copies. A costly individual append can coexist with a small amortized cost over a sequence.`);return {frames:r.frames,total:s.total,history:s.history};
  }
  function heap(values,mode='sort',kind='max'){
    const a=[...values],s={kind:'heap',a,size:a.length,focus:[],comparisons:0,swaps:0,phase:'heapify',quiz:null},r=recorder(s),better=(x,y)=>kind==='max'?x>y:x<y;
    r.push(`Start ${kind}-heapify at the last nonleaf. Children are already heaps when their parent is processed.`);
    function down(i,end){while(2*i+1<end){let best=2*i+1;if(best+1<end){s.comparisons++;s.focus=[best,best+1];r.push(`Compare children ${a[best]} and ${a[best+1]}; choose the ${kind==='max'?'larger':'smaller'}.`);if(better(a[best+1],a[best]))best++;}s.comparisons++;s.focus=[i,best];r.push(`Compare parent ${a[i]} with selected child ${a[best]}.`,{quiz:{prompt:'Is a swap required? (yes/no)',answer:better(a[best],a[i])?'yes':'no',why:`A ${kind}-heap orders each parent against its children.`}});s.quiz=null;if(!better(a[best],a[i]))break;[a[i],a[best]]=[a[best],a[i]];s.swaps++;r.push('Swap and continue downward inside the active heap.');i=best;}}
    for(let i=Math.floor(a.length/2)-1;i>=0;i--){s.focus=[i];r.push(`Heapify subtree rooted at array index ${i}.`);down(i,a.length);}s.focus=[];s.phase='heap-ready';r.push('Bottom-up heapify complete. The array satisfies heap order, not globally sorted order.');
    if(mode==='sort'){s.phase='sort';for(let end=a.length-1;end>0;end--){[a[0],a[end]]=[a[end],a[0]];s.swaps++;s.size=end;s.focus=[0,end];r.push(`Move the root into final sorted position ${end}; shrink the heap to ${end} values.`);down(0,end);}s.size=0;s.focus=[];s.phase='done';r.push(`Heapsort complete: ${kind==='max'?'ascending':'descending'} order. Heapify is Θ(n); the complete sort is Θ(n log n).`);}
    let repeated=0,b=[];for(const v of values){b.push(v);let i=b.length-1;while(i>0){let p=Math.floor((i-1)/2);repeated++;if(!better(b[i],b[p]))break;[b[i],b[p]]=[b[p],b[i]];i=p;}}
    return {frames:r.frames,result:a,repeatedComparisons:repeated,heapifyComparisons:r.frames.findLast(x=>x.phase==='heap-ready').comparisons};
  }
  function lexer(source){
    if(source.length>100)throw Error('Use at most 100 source characters.');
    const s={kind:'lexer',source,pos:0,end:0,state:'Start',tokens:[],quiz:null},r=recorder(s);r.push('Scan left to right. An identifier starts with a lowercase letter; an integer contains digits. Operators and parentheses are single-character tokens.');
    const names={'+':'PLUS','-':'MINUS','*':'TIMES','/':'DIVIDE','(':'LPAREN',')':'RPAREN'};let i=0;
    while(i<source.length){s.pos=i;s.end=i+1;if(/\s/.test(source[i])){s.state='Whitespace';r.push('Skip whitespace; it separates lexemes but produces no token.');i++;continue;}
      const start=i;let type;if(/[a-z]/.test(source[i])){type='IDENTIFIER';s.state='Identifier';while(i<source.length&&/[a-z0-9]/.test(source[i])){i++;s.end=i;r.push(`Read identifier character; current lexeme ${source.slice(start,i)}.`);}}
      else if(/[0-9]/.test(source[i])){type='INTEGER';s.state='Integer';while(i<source.length&&/[0-9]/.test(source[i])){i++;s.end=i;r.push(`Read digit; current lexeme ${source.slice(start,i)}.`);}}
      else if(names[source[i]]){type=names[source[i]];i++;s.end=i;s.state='Symbol';}else{s.state='Error';r.push(`Lexical error at column ${i+1}: ${source[i]} is outside this calculator's alphabet.`);return {frames:r.frames,tokens:s.tokens,error:s.trace};}
      s.tokens.push({type,value:source.slice(start,i),start,end:i});s.state='Emit';r.push(`Emit ${type}(${source.slice(start,i)}). Longest match consumes the complete lexeme.`);
    }s.pos=s.end=source.length;s.state='Done';r.push(`Complete: ${s.tokens.length} tokens. Tokenization alone does not establish that an expression is grammatically valid.`);return {frames:r.frames,tokens:s.tokens};
  }
  function grammar(source,direction='left',bindings={x:2,y:3,z:4,a:2,b:3,c:4}){
    const lex=lexer(source);if(lex.error)throw Error(lex.error);const tokens=lex.tokens;let p=0,id=0;
    const s={kind:'grammar',source,tokens,pos:0,tree:null,ast:null,derivation:['E'],focus:null,phase:'parse',stack:[]},r=recorder(s);
    const node=(label,children=[],terminal=false)=>({id:id++,label,children,terminal});
    const consume=()=>{const t=tokens[p++];s.pos=p;return node(t.value,[],true);};
    function factor(){const t=tokens[p];if(!t)throw Error('Syntax error: expected an identifier, integer, or opening parenthesis at the end.');if(t.type==='IDENTIFIER'||t.type==='INTEGER'){const term=consume();return {tree:node('F',[term]),ast:node(t.value,[],true)};}
      if(t.type==='LPAREN'){const left=consume(),e=expr();if(tokens[p]?.type!=='RPAREN')throw Error(`Syntax error: expected ')' at token ${p+1}.`);return {tree:node('F',[left,e.tree,consume()]),ast:e.ast};}throw Error(`Syntax error at token ${p+1}: expected an operand, found ${t.value}.`);}
    function term(){let f=factor(),tree=node('T',[f.tree]),ast=f.ast;while(['TIMES','DIVIDE'].includes(tokens[p]?.type)){const op=consume(),next=factor();tree=node('T',[tree,op,next.tree]);ast=node(op.label,[ast,next.ast]);}return {tree,ast};}
    function expr(){let t=term(),tree=node('E',[t.tree]),ast=t.ast;while(['PLUS','MINUS'].includes(tokens[p]?.type)){const op=consume(),next=term();tree=node('E',[tree,op,next.tree]);ast=node(op.label,[ast,next.ast]);}return {tree,ast};}
    const parsed=expr();if(p!==tokens.length)throw Error(`Syntax error: unexpected ${tokens[p].value} at token ${p+1}.`);
    s.pos=0;s.tree=parsed.tree;s.ast=parsed.ast;s.phase='derivation';r.push('The E/T/F grammar gives multiplication/division higher precedence and left associativity. Each derivation step expands one actual grammar production; terminal leaves display token lexemes.');
    let frontier=[parsed.tree];while(frontier.some(x=>!x.terminal)){const indices=frontier.flatMap((x,i)=>x.terminal?[]:[i]),index=direction==='right'?indices.at(-1):indices[0],current=frontier[index];s.focus=current.id;frontier.splice(index,1,...current.children);s.derivation=frontier.map(x=>x.label);r.push(`${direction==='right'?'Rightmost':'Leftmost'} expansion: ${current.label} → ${current.children.map(x=>x.label).join(' ')}.`);}
    s.phase='tokens';for(let i=0;i<tokens.length;i++){s.pos=i;r.push(`Token ${i+1}: ${tokens[i].type}(${tokens[i].value}) is a terminal in the parse tree.`);}s.pos=tokens.length;s.focus=null;s.phase='evaluation';s.bindings=bindings;s.evaluated={};s.value=null;
    function evaluate(node){let value;if(!node.children.length){value=/^\d+$/.test(node.label)?Number(node.label):bindings[node.label];if(!Number.isFinite(value))throw Error(`No finite value is bound to ${node.label}. Parsing succeeded; add a binding to evaluate it.`);}else{const left=evaluate(node.children[0]),right=evaluate(node.children[1]);if(node.label==='/'&&right===0)throw Error('Parsing succeeded, but division by zero is undefined in this calculator.');value=({'+':()=>left+right,'-':()=>left-right,'*':()=>left*right,'/':()=>left/right}[node.label])();if(!Number.isFinite(value))throw Error('Arithmetic result is outside the finite range of this calculator.');}s.astActive=node.id;s.evaluated[node.id]=value;r.push(`Evaluate AST node ${node.label} → ${value}.`);return value;}
    let evaluationError=null;try{s.value=evaluate(parsed.ast);}catch(error){evaluationError=error.message;r.push(evaluationError);}s.astActive=null;s.phase='done';r.push(`Complete. The parse tree retains grammar symbols and parentheses; the AST retains operators and operands.${evaluationError?' '+evaluationError:' Evaluation result: '+s.value+'.'}`);return {frames:r.frames,tree:parsed.tree,ast:parsed.ast,tokens,value:s.value,evaluationError};
  }
  function packing(values,rule){
    const items=values.map((size,index)=>({size,index}));if(rule.startsWith('offline'))items.sort((a,b)=>b.size-a.size||a.index-b.index);const bins=[];
    for(const item of items){let at=-1;if(rule==='first'||rule==='offlineFirst')at=bins.findIndex(b=>b+item.size<=1+1e-9);else if(rule==='next'||rule==='offlineNext'){if(bins.length&&bins.at(-1)+item.size<=1+1e-9)at=bins.length-1;}else{let best=Infinity;bins.forEach((b,i)=>{const rem=1-b-item.size;if(rem>=-1e-9&&rem<best){best=rem;at=i;}});}if(at<0){at=bins.length;bins.push(0);}bins[at]+=item.size;}return bins.length;
  }
  function packingOptimum(values){
    if(!values.length||values.length>12||values.some(x=>!Number.isFinite(x)||x<.001||x>1||Math.abs(x*1000-Math.round(x*1000))>1e-7))throw Error('Use 1–12 sizes from 0.001 to 1 with at most 3 decimal places.');
    const items=[...values].sort((a,b)=>b-a),lower=Math.ceil(items.reduce((a,b)=>a+b,0)-1e-9);let best=packing(items,'offlineFirst');const loads=[];
    function visit(i){if(best===lower)return;if(i===items.length){best=Math.min(best,loads.length);return;}const seen=[];for(let j=0;j<loads.length;j++){if(seen.some(x=>Math.abs(x-loads[j])<1e-9)||loads[j]+items[i]>1+1e-9)continue;seen.push(loads[j]);loads[j]+=items[i];visit(i+1);loads[j]-=items[i];}if(loads.length+1<best){loads.push(items[i]);visit(i+1);loads.pop();}}
    visit(0);return best;
  }
  function hashOperation(table,method,operation,key,threshold=.75){
    const s={table:copy(table),method,operation,key,focus:-1,probes:0,comparisons:0,rehashMoves:0,trace:'',found:false};const r=recorder(s),home=(k,m)=>{const rem=k%m;return rem<0?rem+m:rem;};let at=-1,position=-1;
    const tomb=b=>b.length===1&&b[0]==='†',count=()=>s.table.reduce((n,b)=>n+(tomb(b)?0:b.length),0);
    const h=home(key,s.table.length);r.push(`Ready to ${operation} ${key}. h(${key}) = ${key} % ${s.table.length} = ${h}${key<0?' after adjusting a negative remainder':''}.`);
    if(method==='chain'){s.focus=h;s.probes++;r.push(`Read bucket ${h}. A bucket access is separate from a key comparison.`);at=h;for(let j=0;j<s.table[h].length;j++){s.comparisons++;r.push(`Compare ${key} with chained key ${s.table[h][j]}.`);if(s.table[h][j]===key){position=j;s.found=true;break;}}}
    else{let firstTomb=-1;for(let i=0;i<s.table.length;i++){const slot=(h+i)%s.table.length,b=s.table[slot];s.focus=slot;s.probes++;r.push(`Probe (${h} + ${i}) % ${s.table.length} = ${slot}: ${tomb(b)?'tombstone; continue searching':b.length?'occupied by '+b[0]:'empty; end the search'}.`);if(tomb(b)){if(firstTomb<0)firstTomb=slot;continue;}if(!b.length){at=firstTomb>=0?firstTomb:slot;break;}s.comparisons++;if(b[0]===key){s.found=true;at=slot;position=0;break;}}if(at<0&&firstTomb>=0)at=firstTomb;}
    if(operation==='insert'){
      if(s.found)r.push(`Key ${key} already exists. This lab uses set semantics: duplicates are ignored.`);
      else if(at<0)throw Error('Table is full. Choose a lower resize threshold and rebuild.');
      else{s.table[at]=method==='chain'?[...s.table[at],key]:[key];s.focus=at;r.push(`Insert ${key} at ${method==='chain'?'bucket':'slot'} ${at}.`);
        if(count()/s.table.length>threshold){const old=s.table.flat().filter(x=>x!=='†');let size=s.table.length*2;function prime(n){for(let d=2;d*d<=n;d++)if(n%d===0)return false;return true;}while(!prime(size))size++;s.table=Array.from({length:size},()=>[]);s.focus=-1;r.push(`Load exceeded ${threshold}. Grow to ${size} buckets; reinsert each existing key with the new capacity.`);
          for(const value of old){let slot=home(value,size);if(method==='linear')while(s.table[slot].length)slot=(slot+1)%size;s.table[slot].push(value);s.focus=slot;s.rehashMoves++;r.push(`Rehash ${value}: ${value} % ${size} gives home ${home(value,size)}; place at ${slot}.`);}
        }
      }
    }else if(operation==='remove'){if(!s.found)r.push(`Key ${key} is absent; nothing is removed.`);else{if(method==='chain')s.table[at].splice(position,1);else s.table[at]=['†'];r.push(method==='chain'?`Remove ${key} from its chain.`:`Replace ${key} with a tombstone. Searches continue past it; an insertion can reuse it.`);}}
    else r.push(s.found?`Found ${key}.`:`Key ${key} is absent.`);
    s.focus=-1;r.push(`Operation complete.${operation==='find'?s.found?' Found '+key+'.':' Key '+key+' is absent.':''} ${s.probes} bucket/slot reads, ${s.comparisons} key comparisons, ${s.rehashMoves} rehash moves. These counts measure different actions.`);return {frames:r.frames,table:s.table,found:s.found};
  }
  const api={copy,integers,lcs,matrixChain,recursion,queens,growth,heap,lexer,grammar,packing,packingOptimum,hashOperation};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.TeachingAlgorithms=api;
})(typeof globalThis!=='undefined'?globalThis:this);
