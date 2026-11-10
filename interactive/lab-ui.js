/* State is supplied explicitly by each lab; this layer does not infer algorithm state. */
window.LabUI={
  playback({step,play,ready=true,done=false,running=false,busy=false,reason='Begin an operation first.'}){
    const next=document.getElementById(step),toggle=document.getElementById(play),state=document.getElementById('playbackState');
    if(next)next.disabled=!ready||done||running||busy;
    if(toggle){toggle.disabled=done||(!ready&&!running)||(busy&&!running);toggle.textContent=running?'Pause':'Play';toggle.setAttribute('aria-pressed',String(running));toggle.title=done?'Completed. Reset or begin another operation.':!ready?reason:running?'Pause after the current action.':'Continue automatically from the current step.'}
    if(state)state.textContent=done?'Completed':busy?(running?'Playing · action in progress':'Finishing current action'):running?'Playing':ready?'Ready to step or play':reason;
  },
  selections(){document.querySelectorAll('[data-ui-role="choice"]').forEach(button=>button.setAttribute('aria-pressed',String(button.classList.contains('active')||button.classList.contains('on'))))},
  shortcutAction(event){
    if(event.defaultPrevented||event.isComposing||event.repeat||event.altKey||event.ctrlKey||event.metaKey||event.shiftKey)return null;
    const target=event.target;
    if(target?.closest?.('input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"],[role="combobox"],[role="slider"],[role="spinbutton"]'))return null;
    if(event.key==='ArrowLeft')return 'back';
    if(event.key==='ArrowRight')return 'step';
    // Space must keep its native activation behavior on focused buttons and links.
    if((event.key===' '||event.code==='Space')&&!target?.closest?.('button,a,summary,[role="button"]'))return 'play';
    return null;
  }
};
document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('button:not([type])').forEach(button=>button.type='button');
  const status=document.querySelector('#status,#statusText,#status-msg,#out');
  if(status){status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.setAttribute('data-lab-status','');const trace=document.getElementById('trace');if(trace&&trace!==status)trace.removeAttribute('aria-live')}
  LabUI.selections();
  // Legacy labs add Back and other operation controls in later DOMContentLoaded handlers.
  setTimeout(installPlaybackDock,0);
});
document.addEventListener('click',event=>{
  LabUI.selections();
  document.querySelectorAll('.lab-browser[open]').forEach(menu=>{if(!menu.contains(event.target))menu.removeAttribute('open')});
});
document.addEventListener('keydown',event=>{if(event.key==='Escape')document.querySelectorAll('.lab-browser[open]').forEach(menu=>{menu.removeAttribute('open');menu.querySelector('summary').focus()})});

function installPlaybackDock(){
  if(document.getElementById('playbackDock'))return;
  const play=document.querySelector('button[data-ui-role="play"]');
  if(!play)return; // Conceptual lessons, ADT sandboxes, and manual sorting have no playback.
  const steps=[...document.querySelectorAll('button[data-ui-role="step"]')];
  if(!steps.length)return;
  const back=document.getElementById('prev')||[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Back');
  const speed=document.querySelector('#speed[type="range"],#speedSlider[type="range"]');
  const state=document.getElementById('playbackState');
  const next=()=>steps.find(button=>!button.disabled)||steps[0];
  const hintText=`Keyboard outside controls: ${back?'← Back · ':''}→ Step · Space Play/Pause`;
  const hint=document.createElement('p');hint.className='lab-shortcut-hint';hint.textContent=hintText+'. Playback controls float at the bottom when this row scrolls out of view.';
  const originalRow=play.closest('.lab-control-section,.playback,.controls,.control-panel')||play.parentElement;
  originalRow.append(hint);
  if(back)back.setAttribute('aria-keyshortcuts','ArrowLeft');
  steps.forEach(button=>button.setAttribute('aria-keyshortcuts','ArrowRight'));
  play.setAttribute('aria-keyshortcuts','Space');

  const dock=document.createElement('div');dock.id='playbackDock';dock.className='lab-playback-dock';dock.hidden=true;dock.setAttribute('role','group');dock.setAttribute('aria-label','Floating playback controls');
  const actions=document.createElement('div');actions.className='lab-dock-actions';
  const proxies={};
  for(const [action,label,original] of [['back','Back',back],['step','Step',steps[0]],['play','Play',play]]){
    if(!original)continue;
    const button=document.createElement('button');button.type='button';button.textContent=label;button.dataset.dockAction=action;
    button.setAttribute('data-ui-role',action==='step'?'step':action==='play'?'play':'reset');
    button.onclick=()=>{const source=action==='step'?next():action==='back'?back:play;if(source&&!source.disabled)source.click();sync();};
    actions.append(button);proxies[action]=button;
  }
  dock.append(actions);
  let speedProxy=null;
  if(speed){
    const label=document.createElement('label');label.className='lab-dock-speed';label.textContent='Speed · slow → fast';
    speedProxy=document.createElement('input');speedProxy.type='range';speedProxy.setAttribute('aria-label','Floating playback speed · slow to fast');
    for(const attribute of ['min','max','step'])if(speed.hasAttribute(attribute))speedProxy.setAttribute(attribute,speed.getAttribute(attribute));
    speedProxy.value=speed.value;
    speedProxy.oninput=()=>{speed.value=speedProxy.value;speed.dispatchEvent(new Event('input',{bubbles:true}));sync();};
    label.append(speedProxy);dock.append(label);speed.addEventListener('input',sync);speed.addEventListener('change',sync);
  }
  const status=document.createElement('span');status.className='lab-dock-status';dock.append(status);
  const dockHint=document.createElement('p');dockHint.className='lab-dock-hint';dockHint.textContent=hintText;dock.append(dockHint);
  document.body.append(dock);document.body.classList.add('has-playback-dock');
  function sync(){
    const step=next();
    if(proxies.back)proxies.back.disabled=back.disabled;
    proxies.step.disabled=step.disabled;proxies.step.textContent=step.id==='visit'?'Visit next':'Step';
    proxies.play.disabled=play.disabled;proxies.play.textContent=play.textContent;proxies.play.setAttribute('aria-pressed',play.getAttribute('aria-pressed')||'false');
    if(speedProxy){speedProxy.value=speed.value;speedProxy.disabled=speed.disabled;}
    status.textContent=state?.textContent||'';
  }
  const mutations=new MutationObserver(sync);
  for(const node of [back,...steps,play,speed,state].filter(Boolean))mutations.observe(node,{attributes:true,attributeFilter:['disabled','aria-pressed'],childList:true,characterData:true,subtree:true});
  function reserveSpace(){if(!dock.hidden)document.body.style.setProperty('--playback-dock-space',`${Math.ceil(dock.getBoundingClientRect().height)+32}px`);}
  function visibility(){const rect=play.getBoundingClientRect();dock.hidden=!(rect.bottom<=0);if(!dock.hidden){sync();reserveSpace();}}
  const observer=new IntersectionObserver(visibility,{threshold:[0,1]});observer.observe(play);
  // A jump can move the original row from below to above the viewport without
  // changing its intersection ratio. Check the position on scroll as well.
  let visibilityFrame=0;
  function scheduleVisibility(){if(visibilityFrame)return;visibilityFrame=requestAnimationFrame(()=>{visibilityFrame=0;visibility();});}
  window.addEventListener('scroll',scheduleVisibility,{passive:true});
  window.addEventListener('resize',scheduleVisibility,{passive:true});
  const resize=new ResizeObserver(()=>{visibility();reserveSpace();});resize.observe(dock);
  document.addEventListener('keydown',event=>{
    const action=LabUI.shortcutAction(event),source=action==='step'?next():action==='back'?back:action==='play'?play:null;
    if(!source||source.disabled)return;
    event.preventDefault();source.click();sync();
  });
  sync();visibility();
}
