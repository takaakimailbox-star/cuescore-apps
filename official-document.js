const source=document.body.dataset.source;
const output=document.querySelector("[data-document]");
const backButton=document.querySelector("[data-legal-back]");

const safeLinkUrl=value=>{
  try{
    const url=new URL(value,window.location.href);
    return ["http:","https:","mailto:"].includes(url.protocol)?url.href:null;
  }catch(_){return null}
};

const appendInlineMarkdown=(parent,text)=>{
  const pattern=/(\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g;
  let cursor=0;
  for(const match of text.matchAll(pattern)){
    parent.append(document.createTextNode(text.slice(cursor,match.index)));
    if(match[2]!=null){const strong=document.createElement("strong");strong.textContent=match[2];parent.append(strong)}
    else if(match[3]!=null){const code=document.createElement("code");code.textContent=match[3];parent.append(code)}
    else{
      const href=safeLinkUrl(match[5]);
      if(href){const link=document.createElement("a");link.href=href;link.textContent=match[4];parent.append(link)}
      else parent.append(document.createTextNode(match[0]));
    }
    cursor=match.index+match[0].length;
  }
  parent.append(document.createTextNode(text.slice(cursor)));
};

const renderOfficialMarkdown=(markdown,target)=>{
  const fragment=document.createDocumentFragment();
  const lines=String(markdown).replace(/\r\n?/g,"\n").split("\n");
  let list=null;
  const closeList=()=>{if(list){fragment.append(list);list=null}};
  for(const rawLine of lines){
    const line=rawLine.trimEnd();
    if(!line.trim()){closeList();continue}
    const heading=line.match(/^(#{1,6})\s+(.+)$/);
    if(heading){closeList();const node=document.createElement(`h${heading[1].length}`);appendInlineMarkdown(node,heading[2]);fragment.append(node);continue}
    if(/^\s*---+\s*$/.test(line)){closeList();fragment.append(document.createElement("hr"));continue}
    const item=line.match(/^\s*-\s+(.+)$/);
    if(item){if(!list)list=document.createElement("ul");const node=document.createElement("li");appendInlineMarkdown(node,item[1]);list.append(node);continue}
    closeList();
    const paragraph=document.createElement("p");
    appendInlineMarkdown(paragraph,line.trim());
    fragment.append(paragraph);
  }
  closeList();
  target.replaceChildren(fragment);
};

backButton?.addEventListener("click",()=>{
  const homeUrl=new URL("./",window.location.href).href;
  window.location.assign(homeUrl);
});

fetch(source).then(r=>{if(!r.ok)throw new Error("Document unavailable");return r.text()}).then(text=>{renderOfficialMarkdown(text,output)}).catch(()=>{output.textContent="公式文書を読み込めませんでした。しばらくしてから再度お試しください。"});
