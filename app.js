'use strict';
const $=s=>document.querySelector(s);
const letters='ABCDEFGHIJ';
const defaults=['SUPREME','GENTLE','DRMIRRA','JINN','ASTAR','Super','LIP','選手8','JJoNak','選手10'];
const roles=['tank','damage','damage','support','support'];
const roleNames={damage:'ダメージ',tank:'タンク',support:'サポート'};
const paths={damage:'M3 3h4v15H3zM10 3h4v15h-4zM17 3h4v15h-4zM3 20h4v3H3zM10 20h4v3h-4zM17 20h4v3h-4z',tank:'M12 1 22 5v9c0 5-10 10-10 10S2 19 2 14V5z',support:'M8 2h8v6h6v8h-6v6H8v-6H2V8h6z'};
const defaultLeftLogo=new Image();
defaultLeftLogo.src='images/ossanwatch.png';
defaultLeftLogo.alt='Ossan Watch チームアイコン';
const defaultGentleImage=new Image();
defaultGentleImage.src='images/gentle.png';
defaultGentleImage.alt='GENTLEの画像';
const state={players:defaults.map((name,i)=>({name,image:i===1?defaultGentleImage:null,role:roles[i%5]})),left:{name:'Ossan Watch',score:0,logo:defaultLeftLogo},right:{name:'team 2',score:1,logo:null}};
let noticeTimer;
function notify(message){$('#notice').textContent=message;$('#notice').classList.add('visible');clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>$('#notice').classList.remove('visible'),4500)}
function icon(role){return `<svg class="role-icon" viewBox="0 0 24 24" aria-label="${roleNames[role]}" role="img"><path d="${paths[role]}"></path></svg>`}
function makePlayerImage(player,cls,emptyLabel){
  if(player.image){const img=player.image.cloneNode();img.className=cls;img.alt=`${player.name||emptyLabel}の画像`;return img}
  const empty=document.createElement('div');empty.className=cls+' empty-image';empty.textContent=emptyLabel;return empty;
}
state.players.forEach((player,i)=>{
  const card=document.createElement('article');card.className='player-card';
  card.innerHTML=`<div class="card-head"><span class="slot-letter">${letters[i]}</span><span>PLAYER ${String(i+1).padStart(2,'0')}</span></div><label class="player-upload"><span class="player-preview"></span><input type="file" accept="image/jpeg,image/png,image/webp" aria-label="${letters[i]} 選手画像"></label><div class="card-fields"><p class="file-caption">JPG / PNG / WebP · 5MBまで</p><button class="remove-player-image" type="button" hidden>画像を削除</button><label>${letters[i]} name<input type="text" maxlength="40" aria-label="${letters[i]} name"></label><label>ロール<select aria-label="${letters[i]} ロール">${Object.entries(roleNames).map(([v,n])=>`<option value="${v}">${n}</option>`).join('')}</select></label></div>`;
  const preview=card.querySelector('.player-preview'),file=card.querySelector('input[type=file]'),remove=card.querySelector('.remove-player-image');
  const refresh=()=>{preview.replaceChildren(makePlayerImage(player,'mini-image','＋ 画像を選択'));remove.hidden=!player.image;if(!$('#output').hidden)renderOutput()};
  let revision=0;
  file.addEventListener('change',async()=>{
    const selected=file.files[0];if(!selected)return;
    const current=++revision;
    if(!['image/jpeg','image/png','image/webp'].includes(selected.type)||selected.size>5*1024*1024){notify('5MB以下のJPG・PNG・WebP画像を選択してください。');file.value='';return}
    const url=URL.createObjectURL(selected);
    try{
      const image=new Image();image.src=url;await image.decode();
      if(current!==revision){URL.revokeObjectURL(url);return}
      if(player.image?.src.startsWith('blob:'))URL.revokeObjectURL(player.image.src);
      player.image=image;refresh();
    }catch{URL.revokeObjectURL(url);if(current===revision)notify('画像を読み込めませんでした。別の画像を選択してください。')}
    finally{if(current===revision)file.value=''}
  });
  remove.addEventListener('click',()=>{revision++;if(player.image?.src.startsWith('blob:'))URL.revokeObjectURL(player.image.src);player.image=null;file.value='';refresh()});
  const name=card.querySelector('input[type=text]');name.value=player.name;name.addEventListener('input',()=>player.name=name.value);
  const role=card.querySelector('select');role.value=player.role;role.addEventListener('change',()=>player.role=role.value);
  refresh();$(i<5?'#top-inputs':'#bottom-inputs').append(card);
});
for(const side of ['left','right']){const letter=side==='left'?'L':'R';const container=$(`#${side}-team-form`);container.innerHTML=`<label class="upload-box"><span id="${side}-upload-preview">＋<br>アイコン</span><input type="file" accept="image/jpeg,image/png,image/webp" aria-label="${letter}チームアイコン画像"></label><div class="team-fields"><label>${letter} チーム名<input type="text" maxlength="60" aria-label="${letter} チーム名"></label><p class="file-caption">JPG / PNG / WebP · 5MBまで</p><button class="remove-logo" type="button" hidden>画像を削除</button></div>`;if(state[side].logo){$(`#${side}-upload-preview`).replaceChildren(state[side].logo.cloneNode());container.querySelector('.remove-logo').hidden=false}const input=container.querySelector('input[type=text]');input.value=state[side].name;input.addEventListener('input',()=>state[side].name=input.value);const file=container.querySelector('input[type=file]');let uploadRevision=0;file.addEventListener('change',async()=>{const f=file.files[0];if(!f)return;const revision=++uploadRevision;if(!['image/jpeg','image/png','image/webp'].includes(f.type)||f.size>5*1024*1024){notify('5MB以下のJPG・PNG・WebP画像を選択してください。');file.value='';return}const url=URL.createObjectURL(f);try{const image=new Image();image.src=url;await image.decode();if(revision!==uploadRevision)return;if(state[side].logo?.src.startsWith('blob:'))URL.revokeObjectURL(state[side].logo.src);state[side].logo=image;const preview=$(`#${side}-upload-preview`);preview.replaceChildren(image.cloneNode());container.querySelector('.remove-logo').hidden=false}catch{URL.revokeObjectURL(url);notify('画像を読み込めませんでした。別の画像を選択してください。')}finally{file.value=''}});container.querySelector('.remove-logo').addEventListener('click',()=>{uploadRevision++;if(state[side].logo?.src.startsWith('blob:'))URL.revokeObjectURL(state[side].logo.src);state[side].logo=null;$(`#${side}-upload-preview`).innerHTML='＋<br>アイコン';container.querySelector('.remove-logo').hidden=true});const score=$(`#${side}-score`);score.innerHTML=Array.from({length:11},(_,n)=>`<option value="${n}">${n}</option>`).join('');score.value=state[side].score;score.addEventListener('change',()=>state[side].score=Number(score.value))}
function renderOutput(){for(const row of ['#top-output','#bottom-output'])$(row).replaceChildren();state.players.forEach((p,i)=>{const card=document.createElement('div');card.className='output-player';const plate=document.createElement('div');plate.className='nameplate';plate.innerHTML=icon(p.role);const name=document.createElement('span');name.className='player-name';name.textContent=p.name||letters[i];plate.append(name);const picture=makePlayerImage(p,'output-image','');if(i<5)card.append(picture,plate);else card.append(plate,picture);$(i<5?'#top-output':'#bottom-output').append(card)});for(const side of ['left','right']){$(`#${side}-title`).textContent=state[side].name||`${side==='left'?'LEFT':'RIGHT'} TEAM`;$(`#${side}-result`).textContent=state[side].score;const logo=$(`#${side}-logo`);logo.replaceChildren();if(state[side].logo)logo.append(state[side].logo.cloneNode());else logo.textContent=side==='left'?'L':'R'}resizeStage()}
function resizeStage(){const shell=$('#stage-shell');const scale=Math.min(shell.clientWidth/1920,shell.clientHeight/1080);$('#stage').style.transform=`translate(-50%, -50%) scale(${scale})`}
new ResizeObserver(resizeStage).observe($('#stage-shell'));
let holdTimer,holdStart=null;
function cancelHold(){clearTimeout(holdTimer);holdTimer=null;holdStart=null}
function closeReturnMenu(){cancelHold();$('#return-menu').hidden=true}
function showReturnMenu(){cancelHold();if($('#output').hidden)return;$('#return-menu').hidden=false;$('#back').focus()}
const surface=$('#stage-shell');
surface.addEventListener('pointerdown',event=>{
  if(!event.isPrimary || event.button!==0){cancelHold();return}
  if(!$('#return-menu').hidden){closeReturnMenu();return}
  holdStart={x:event.clientX,y:event.clientY};
  surface.setPointerCapture(event.pointerId);
  holdTimer=setTimeout(showReturnMenu,650);
});
surface.addEventListener('pointermove',event=>{if(holdStart&&Math.hypot(event.clientX-holdStart.x,event.clientY-holdStart.y)>10)cancelHold()});
for(const type of ['pointerup','pointercancel','lostpointercapture'])surface.addEventListener(type,cancelHold);
surface.addEventListener('contextmenu',event=>event.preventDefault());
surface.addEventListener('dragstart',event=>event.preventDefault());
window.addEventListener('blur',closeReturnMenu);
document.addEventListener('visibilitychange',()=>{if(document.hidden)closeReturnMenu()});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!$('#output').hidden){event.preventDefault();if($('#return-menu').hidden)showReturnMenu();else{closeReturnMenu();surface.focus()}}});
function route(){const output=location.hash==='#output';closeReturnMenu();document.body.classList.toggle('output-mode',output);$('#editor').hidden=output;$('#output').hidden=!output;$('#edit-tab').classList.toggle('active',!output);$('#output-tab').classList.toggle('active',output);if(output)renderOutput();window.scrollTo(0,0)}
window.addEventListener('hashchange',route);$('#generate').addEventListener('click',()=>location.hash='output');$('#back').addEventListener('click',()=>{closeReturnMenu();location.hash='edit'});
if(document.modelContext?.registerTool){try{Promise.resolve(document.modelContext.registerTool({
  name:'configure_roster_player',description:'A〜Jの選手名とロールを変更する。アップロード済みの画像は維持する。',
  inputSchema:{type:'object',properties:{slot:{type:'string',enum:[...letters]},name:{type:'string',maxLength:40},role:{type:'string',enum:Object.keys(roleNames)}},required:['slot','name','role'],additionalProperties:false},
  annotations:{readOnlyHint:false},execute(input){
    if(!input||typeof input.slot!=='string'||input.slot.length!==1||!letters.includes(input.slot)||typeof input.name!=='string'||input.name.length>40||!Object.hasOwn(roleNames,input.role))throw new Error('Invalid player input');
    const i=letters.indexOf(input.slot);Object.assign(state.players[i],{name:input.name,role:input.role});
    const card=document.querySelectorAll('.player-card')[i];card.querySelector('input[type=text]').value=input.name;card.querySelector('select').value=input.role;
    if(!$('#output').hidden)renderOutput();return {slot:input.slot,name:input.name,role:input.role};
  }
})).catch(()=>{})}catch{}}
route();
