const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const context=vm.createContext({window:{},document:{addEventListener(){}}});
vm.runInContext(fs.readFileSync(path.join(__dirname,'../lab-ui.js'),'utf8'),context);
const action=context.window.LabUI.shortcutAction;

test('Playback shortcuts map arrows and Space, preserving modified and composing keystrokes',()=>{
  assert.equal(action({key:'ArrowLeft'}),'back');
  assert.equal(action({key:'ArrowRight'}),'step');
  assert.equal(action({key:' ',code:'Space'}),'play');
  assert.equal(action({key:'Enter'}),null);
  for(const flag of ['defaultPrevented','isComposing','repeat','altKey','ctrlKey','metaKey','shiftKey'])assert.equal(action({key:'ArrowRight',[flag]:true}),null);
});

test('Typing, range/select controls, editable content, and native Space activation are not hijacked',()=>{
  for(const selector of ['input','textarea','select','contenteditable','role="textbox"','role="slider"','role="combobox"','role="spinbutton"']){
    const target={closest(query){return query.includes(selector)?{}:null;}};
    for(const key of ['ArrowLeft','ArrowRight',' '])assert.equal(action({key,target}),null);
  }
  for(const selector of ['button','a,','summary']){
    const target={closest(query){return query.startsWith('button,')&&query.includes(selector)?{}:null;}};
    assert.equal(action({key:' ',target}),null);
    assert.equal(action({key:'ArrowRight',target}),'step');
  }
});
