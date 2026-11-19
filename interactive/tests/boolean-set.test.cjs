const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

function catalog(){
  const context=vm.createContext({});
  for(const file of ['impls.js','adts.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../adt-overview',file),'utf8'),context);
  return vm.runInContext('ADTS.find(adt => adt.id === "set")',context);
}

test('Boolean Set preserves membership and its count across bounds, duplicates, and absent removals',()=>{
  const instance=catalog().impls.find(impl=>impl.id==='boolean').make();
  assert.match(instance.ops.isEmpty().msg,/<b>true<\/b>/);
  assert.equal(instance.size(),0);
  for(const value of ['0','15']){
    assert.equal(instance.ops.add(value).steps,2);
    assert.equal(instance.ops.add(value).steps,1);
    assert.match(instance.ops.contains(value).msg,/<b>true<\/b>/);
  }
  assert.equal(instance.size(),2);
  for(const value of ['0','15']){
    assert.equal(instance.ops.remove(value).steps,2);
    assert.equal(instance.ops.remove(value).steps,1);
    const absent=instance.ops.contains(value);
    assert.equal(absent.hl,Number(value));
    assert.equal(absent.steps,1);
    assert.match(absent.msg,/<b>false<\/b>/);
  }
  assert.equal(instance.size(),0);
  assert.equal(instance.ops.isEmpty().steps,1);
  const rendering=instance.render(0);
  assert.equal((rendering.match(/class="boolean-cell/g)||[]).length,16);
  assert.match(rendering,/addressed" aria-current="true"/);
  assert.match(rendering,/Members: \{\}/);
});

test('Invalid Boolean Set values change neither state nor count; Compare validates the same domain',()=>{
  const adt=catalog(),instance=adt.impls.find(impl=>impl.id==='boolean').make();
  instance.ops.add('5');
  const before=instance.render(null);
  for(const value of ['', ' ', '-1', '16', '1.5', '5x', 'NaN', 'Infinity', '1e1', '0xF', '999999999999999999999']){
    assert.match(adt.validateCompare(value),/0 to 15/);
    for(const op of ['add','remove','contains']){
      const result=instance.ops[op](value);
      assert.equal(result.ok,false);
      assert.equal(result.steps,0);
      assert.match(result.msg,/0 to 15/);
      assert.equal(instance.size(),1);
      assert.equal(instance.render(null),before);
    }
  }
  for(const value of ['0','15',' 7 '])assert.equal(adt.validateCompare(value),null);
  for(const impl of adt.impls.filter(impl=>impl.id!=='boolean'))assert.equal(impl.make().ops.add('16').ok,true);
  assert.equal(adt.impls.find(impl=>impl.id==='boolean').make().size(),0);
});

test('All Set implementations agree with a reference Set after every prepared and mixed operation',()=>{
  const adt=catalog(),instances=Array.from(adt.impls,impl=>impl.make()),reference=new Set();
  const operations=Array.from(adt.workload.ops,op=>Array.from(op));
  // A repeatable mix covers the full domain, transitions, and no-op operations.
  for(let i=0;i<96;i++)operations.push([['add','contains','remove'][i%3],String((i*7)%16)]);
  for(const [op,raw] of operations){
    const value=Number(raw),wasPresent=reference.has(value);
    const expected=op==='add'?!wasPresent:op==='isEmpty'?true:wasPresent;
    for(const instance of instances)assert.equal(instance.ops[op](raw).ok,expected,`${op}(${raw})`);
    if(op==='add')reference.add(value);
    if(op==='remove')reference.delete(value);
    for(const instance of instances){
      assert.equal(instance.size(),reference.size);
      for(let v=0;v<16;v++)assert.equal(instance.ops.contains(String(v)).ok,reference.has(v));
      assert.match(instance.ops.isEmpty().msg,reference.size===0?/<b>true<\/b>/:/<b>false<\/b>/);
    }
  }
  const fresh=Array.from(adt.impls,impl=>impl.make());
  for(const [op,raw] of adt.workload.ops)fresh.forEach(instance=>instance.ops[op](raw));
  for(const instance of fresh){
    assert.equal(instance.size(),7);
    for(let v=0;v<16;v++)assert.equal(instance.ops.contains(String(v)).ok,[0,3,5,7,8,9,12].includes(v));
  }
});
