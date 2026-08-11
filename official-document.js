const source=document.body.dataset.source;
const output=document.querySelector("[data-document]");
const backButton=document.querySelector("[data-legal-back]");
const settingsReturnKey="cuescore.returnToSettings.v1";

backButton?.addEventListener("click",()=>{
  const homeUrl=new URL("./",window.location.href).href;
  const openedFromSettings=sessionStorage.getItem(settingsReturnKey)==="1";
  if(!openedFromSettings||window.history.length<=1){
    window.location.replace(homeUrl);
    return;
  }
  let navigationStarted=false;
  window.addEventListener("pagehide",()=>{navigationStarted=true},{once:true});
  window.history.back();
  window.setTimeout(()=>{
    if(!navigationStarted)window.location.replace(homeUrl);
  },800);
});

fetch(source).then(r=>{if(!r.ok)throw new Error("Document unavailable");return r.text()}).then(text=>{output.textContent=text}).catch(()=>{output.textContent="公式文書を読み込めませんでした。公開前に配置を確認してください。"});
