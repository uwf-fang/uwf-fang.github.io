/* State is supplied explicitly by each lab; this layer does not infer algorithm state. */
window.LabUI={
  playback({step,play,ready=true,done=false,running=false,busy=false,reason='Begin an operation first.'}){
    const next=document.getElementById(step),toggle=document.getElementById(play),state=document.getElementById('playbackState');
    if(next)next.disabled=!ready||done||running||busy;
    if(toggle){toggle.disabled=done||(!ready&&!running)||(busy&&!running);toggle.textContent=running?'Pause':'Play';toggle.setAttribute('aria-pressed',String(running));toggle.title=done?'Completed. Reset or begin another operation.':!ready?reason:running?'Pause after the current action.':'Continue automatically from the current step.'}
    if(state)state.textContent=done?'Completed':busy?(running?'Playing · action in progress':'Finishing current action'):running?'Playing':ready?'Ready to step or play':reason;
  },
  selections(){document.querySelectorAll('[data-ui-role="choice"]').forEach(button=>button.setAttribute('aria-pressed',String(button.classList.contains('active')||button.classList.contains('on'))))}
};
document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('button:not([type])').forEach(button=>button.type='button');
  const status=document.querySelector('#status,#statusText,#status-msg,#out');
  if(status){status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.setAttribute('data-lab-status','');const trace=document.getElementById('trace');if(trace&&trace!==status)trace.removeAttribute('aria-live')}
  LabUI.selections();
});
document.addEventListener('click',event=>{
  LabUI.selections();
  document.querySelectorAll('.lab-browser[open]').forEach(menu=>{if(!menu.contains(event.target))menu.removeAttribute('open')});
});
document.addEventListener('keydown',event=>{if(event.key==='Escape')document.querySelectorAll('.lab-browser[open]').forEach(menu=>{menu.removeAttribute('open');menu.querySelector('summary').focus()})});
