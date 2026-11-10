const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

function models(){
  const context=vm.createContext({});
  for(const file of ['impls.js','adts.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../adt-overview',file),'utf8'),context);
  return vm.runInContext('({CircSeq, ADTS})',context);
}

test('Circular queue wraparound reuses slots without copying; growth only occurs when full and preserves FIFO order',()=>{
  const {CircSeq}=models(),queue=new CircSeq(6);
  for(let n=1;n<=6;n++)assert.equal(queue.enqueue(n).steps,1);
  for(let n=1;n<=3;n++)assert.equal(queue.dequeue().v,n);
  for(let n=7;n<=9;n++)assert.equal(queue.enqueue(n).steps,1);
  assert.equal(queue.cap,6);
  assert.deepEqual(Array.from(queue.toArray()),[4,5,6,7,8,9]);
  const growth=queue.enqueue(10);
  assert.equal(growth.steps,7);
  assert.equal(queue.cap,12);
  assert.match(growth.note,/6 copies \+ 1 write = 7 counted steps/);
  assert.deepEqual(Array.from(queue.toArray()),[4,5,6,7,8,9,10]);
});

test('Every supplied ADT workload uses valid operations and data; the queue growth spike is enqueue(7)',()=>{
  const {ADTS}=models();
  for(const adt of ADTS)for(const impl of adt.impls){
    const instance=impl.make();
    for(const [id,a='',b=''] of adt.workload.ops){
      const result=instance.ops[id](a,b);
      assert.notEqual(result.ok,false,`${adt.name}/${impl.name}: ${id}: ${result.msg}`);
      assert.ok(Number.isFinite(result.steps)&&result.steps>=0);
    }
  }
  const adt=ADTS.find(x=>x.id==='queue'),instance=adt.impls.find(x=>x.id==='circular').make();
  const results=adt.workload.ops.map(([id,a='',b=''])=>instance.ops[id](a,b));
  assert.deepEqual(Array.from(results.slice(0,8),r=>r.steps),[1,1,1,1,1,1,7,1]);
  assert.ok(results.slice(8).every(r=>r.steps===1));
});
