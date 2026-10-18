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
// 選手名とチーム名に共通の文字色・縁取り色。
function normalizeColor(value){
  const hex=value.trim().replace(/^#/,'');
  if(/^[0-9a-f]{3}$/i.test(hex))return '#'+[...hex].map(c=>c+c).join('').toUpperCase();
  return /^[0-9a-f]{6}$/i.test(hex)?'#'+hex.toUpperCase():null;
}
const colorSetters={},lineSetters={};
for(const side of ['left','right','score']){
  const label=side==='score'?'中央スコア':(side==='left'?'L':'R')+'チーム';
  const container=$(`#${side}-colors`);
  container.className='team-color-panel';
  container.innerHTML=`<h2>${label}の文字色</h2><p class="file-caption">${side==='score'?'左右のスコアと区切り記号に共通で適用':'選手名・チーム名に共通で適用'}</p><div class="color-controls"></div><p class="color-sample" aria-label="${label}の文字色プレビュー">${side==='score'?'0 – 1':'選手名 / チーム名'}</p>`;
  if(side!=='score'){
  const lineLabel=document.createElement('label');lineLabel.className='score-line-setting';
  lineLabel.innerHTML=`スコアの${side==='left'?'左':'右'}縦線の色<select aria-label="${label} スコア縦線の色"><option value="text">文字色</option><option value="outline">アウトライン色</option></select>`;
  container.append(lineLabel);
  const lineSelect=lineLabel.querySelector('select');
  const updateLine=()=>$('#stage').style.setProperty(`--${side}-score-line-color`,`var(--${side}-${lineSelect.value}-color)`);
  lineSetters[side]=value=>{lineSelect.value=value;updateLine()};
  lineSelect.addEventListener('change',updateLine);updateLine();
  }
  for(const [key,title,initial] of [['text','文字色','#FFFFFF'],['outline','アウトライン色','#000000']]){
    const group=document.createElement('fieldset');group.className='color-control';
    group.innerHTML=`<legend>${title}</legend><div class="color-code-row"><input type="color" aria-label="${label} ${title} カラーピッカー"><label>カラーコード<input type="text" maxlength="7" spellcheck="false" autocomplete="off" aria-label="${label} ${title} カラーコード" placeholder="#FFFFFF"></label></div><div class="rgb-sliders">${['R','G','B'].map(channel=>`<label>${channel}<input type="range" min="0" max="255" step="1" aria-label="${label} ${title} ${channel}"><output></output></label>`).join('')}</div>`;
    container.querySelector('.color-controls').append(group);
    const picker=group.querySelector('input[type=color]');
    const code=group.querySelector('input[type=text]');
    const sliders=[...group.querySelectorAll('input[type=range]')];
    const outputs=[...group.querySelectorAll('output')];
    let current=initial;
    function apply(value,writeCode=true){
      current=value;picker.value=value;
      if(writeCode)code.value=value;
      code.removeAttribute('aria-invalid');
      sliders.forEach((slider,i)=>{slider.value=parseInt(value.slice(1+i*2,3+i*2),16);outputs[i].value=slider.value});
      const variable=`--${side}-${key}-color`;
      $('#stage').style.setProperty(variable,value);
      container.style.setProperty(variable,value);
    }
    picker.addEventListener('input',()=>apply(picker.value.toUpperCase()));
    sliders.forEach(slider=>slider.addEventListener('input',()=>apply('#'+sliders.map(input=>Number(input.value).toString(16).padStart(2,'0')).join('').toUpperCase())));
    code.addEventListener('input',()=>{const value=normalizeColor(code.value);if(value)apply(value,false);else code.setAttribute('aria-invalid','true')});
    code.addEventListener('change',()=>{const value=normalizeColor(code.value);if(!value)notify('カラーコードは #FFFFFF のような6桁、または #FFF のような3桁で入力してください。');apply(value||current)});
    colorSetters[`${side}-${key}`]=apply;
    apply(initial);
  }
}
// Portable name/color presets. Validate everything before changing the current roster.
function validateRosterPreset(data){
  const fail=()=>{throw new Error('設定ファイルの形式が正しくありません。')};
  const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
  if(!object(data)||data.format!=='OssanWatchRoster'||data.version!==1||!object(data.players)||!object(data.teams)||!object(data.colors)||!object(data.scoreLines))fail();
  const result={format:'OssanWatchRoster',version:1,players:{},teams:{},colors:{},scoreLines:{}};
  for(const letter of letters){const name=data.players[letter];if(typeof name!=='string'||name.length>40)fail();result.players[letter]=name}
  for(const side of ['left','right']){
    if(typeof data.teams[side]!=='string'||data.teams[side].length>60)fail();
    result.teams[side]=data.teams[side];
    if(!['text','outline'].includes(data.scoreLines[side]))fail();
    result.scoreLines[side]=data.scoreLines[side];
  }
  for(const side of ['left','right','score']){
    if(!object(data.colors[side]))fail();result.colors[side]={};
    for(const key of ['text','outline']){
      const value=data.colors[side][key];
      if(typeof value!=='string'||!/^#[0-9a-f]{6}$/i.test(value))fail();
      result.colors[side][key]=value.toUpperCase();
    }
  }
  return result;
}
function collectRosterPreset(){
  const data={format:'OssanWatchRoster',version:1,players:Object.fromEntries(state.players.map((p,i)=>[letters[i],p.name])),teams:{left:state.left.name,right:state.right.name},colors:{},scoreLines:{}};
  for(const side of ['left','right','score']){
    data.colors[side]={};
    for(const key of ['text','outline'])data.colors[side][key]=$('#stage').style.getPropertyValue(`--${side}-${key}-color`).trim().toUpperCase();
  }
  for(const side of ['left','right'])data.scoreLines[side]=$(`#${side}-colors .score-line-setting select`).value;
  return validateRosterPreset(data);
}
function applyRosterPreset(data){
  const preset=validateRosterPreset(data);
  const cards=document.querySelectorAll('.player-card');
  state.players.forEach((player,i)=>{player.name=preset.players[letters[i]];cards[i].querySelector('input[type=text]').value=player.name;const image=cards[i].querySelector('.player-preview img');if(image)image.alt=`${player.name}の画像`});
  for(const side of ['left','right']){state[side].name=preset.teams[side];$(`#${side}-team-form input[type=text]`).value=preset.teams[side];lineSetters[side](preset.scoreLines[side])}
  for(const side of ['left','right','score'])for(const key of ['text','outline'])colorSetters[`${side}-${key}`](preset.colors[side][key]);
  if(!$('#output').hidden)renderOutput();
}
$('#save-preset').addEventListener('click',()=>{
  const url=URL.createObjectURL(new Blob([JSON.stringify(collectRosterPreset(),null,2)+'\n'],{type:'application/json'}));
  const link=document.createElement('a');link.href=url;link.download='RosterMaker-settings.json';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
});
let presetRevision=0;
$('#load-preset').addEventListener('change',async event=>{
  const input=event.target,file=input.files[0];if(!file)return;const revision=++presetRevision;
  try{
    if(file.size>1024*1024)throw new Error('設定ファイルは1MB以下にしてください。');
    const text=await file.text();if(revision!==presetRevision)return;
    applyRosterPreset(JSON.parse(text.replace(/^\uFEFF/,'')));
    notify('選手名・チーム名・色の設定を読み込みました。');
  }catch(error){if(revision===presetRevision)notify(error instanceof SyntaxError?'JSONファイルを読み込めませんでした。内容を確認してください。':error.message)}
  finally{if(revision===presetRevision)input.value=''}
});
let backgroundUrl='images/white.png',backgroundRevision=0;
const backgroundFile=$('#background-file');
function updateBackground(){
  $('#stage-shell').style.backgroundImage=backgroundUrl?`url("${backgroundUrl}")`:'';
  const preview=$('#background-preview');
  preview.hidden=!backgroundUrl;
  if(backgroundUrl)preview.src=backgroundUrl;else preview.removeAttribute('src');
  $('#remove-background').hidden=!backgroundUrl;
}
backgroundFile.addEventListener('change',async()=>{
  const file=backgroundFile.files[0];if(!file)return;
  const revision=++backgroundRevision;
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024){notify('5MB以下のJPG・PNG・WebP画像を選択してください。');backgroundFile.value='';return}
  const url=URL.createObjectURL(file);
  try{
    const image=new Image();image.src=url;await image.decode();
    if(revision!==backgroundRevision){URL.revokeObjectURL(url);return}
    const previous=backgroundUrl;backgroundUrl=url;updateBackground();
    if(previous?.startsWith('blob:'))URL.revokeObjectURL(previous);
  }catch{URL.revokeObjectURL(url);if(revision===backgroundRevision)notify('画像を読み込めませんでした。別の画像を選択してください。')}
  finally{if(revision===backgroundRevision)backgroundFile.value=''}
});
$('#remove-background').addEventListener('click',()=>{
  backgroundRevision++;const previous=backgroundUrl;backgroundUrl=null;updateBackground();
  if(previous?.startsWith('blob:'))URL.revokeObjectURL(previous);backgroundFile.value='';
});
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
// Initial names and colors from OssanWatchRoster-settings1019.json.
const defaultRosterPreset={
  "format": "OssanWatchRoster",
  "version": 1,
  "players": {
    "A": "SUPREME",
    "B": "GENTLE",
    "C": "DRMIRRA",
    "D": "JINN",
    "E": "ASTAR",
    "F": "Super",
    "G": "LIP",
    "H": "選手8",
    "I": "JJoNak",
    "J": "選手10"
  },
  "teams": {
    "left": "Ossan Watch",
    "right": "team 2"
  },
  "colors": {
    "left": {
      "text": "#000000",
      "outline": "#FFFFFF"
    },
    "right": {
      "text": "#FF8A05",
      "outline": "#FFFFFF"
    },
    "score": {
      "text": "#FFFFFF",
      "outline": "#000000"
    }
  },
  "scoreLines": {
    "left": "text",
    "right": "text"
  }
};
applyRosterPreset(defaultRosterPreset);
updateBackground();
route();
