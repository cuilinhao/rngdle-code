import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {patterns} from '../src/engine.mjs';
const runFile=promisify(execFile);
const networkRetries=[];
// Optional curl transport uses the operator's existing HTTPS_PROXY settings.
const httpFetch=async url=>{
  for(let attempt=1;attempt<=3;attempt++){
    try{
      if(process.env.HTTP_TRANSPORT!=='curl') return await fetch(url,{signal:AbortSignal.timeout(30000)});
      const {stdout}=await runFile('curl',['--silent','--show-error','--location','--max-time','30','--write-out','\n%{http_code}',url],{encoding:'buffer',maxBuffer:20*1024*1024});
      return new Response(stdout.subarray(0,-4),{status:Number(stdout.subarray(-3).toString())});
    }catch(error){
      if(attempt===3) throw error;
      networkRetries.push({url,attempt,error:error.message});
    }
  }
};
const base=process.env.BASE_URL||'http://127.0.0.1:4173';
const locales=['en','zh','ja','ko','de','fr'],langs=['en-US','zh-CN','ja','ko','de','fr'];
const routes=['','infinite','daily','compare','explore','sandbox','patterns','guides','methodology','badges','ep','leaderboard','about','privacy','terms','contact',...patterns.map(p=>'patterns/'+p.id)];
const results=[],queue=locales.flatMap((locale,i)=>routes.map(route=>({path:'/'+locale+(route?'/'+route:''),lang:langs[i]})));
const fetchPage=async path=>{const r=await httpFetch(base+path);return {r,text:await r.text()};};
await Promise.all(Array.from({length:6},async()=>{while(queue.length){const {path,lang}=queue.shift();try{const {r,text}=await fetchPage(path);const valid=r.status===200&&text.includes(`lang="${lang}"`)&&text.includes('<h1')&&text.includes('rel="canonical"')&&(text.match(/rel="alternate"/g)||[]).length===7;results.push({path,status:r.status,pass:valid});}catch(e){results.push({path,pass:false,error:e.message});}}}));
for(const path of ['/robots.txt','/sitemap.xml','/favicon.svg']){try{const {r,text}=await fetchPage(path);results.push({path,status:r.status,pass:r.ok&&text.length>20});}catch(e){results.push({path,pass:false,error:e.message});}}
const missing=await fetchPage('/en/not-a-route');results.push({path:'/en/not-a-route',status:missing.r.status,pass:missing.r.status===404&&missing.text.includes('noindex')});
for(const file of ['scores.bin','patterns.bin','stats.json']){const r=await httpFetch(base+'/data/'+file);const remote=Buffer.from(await r.arrayBuffer()),local=readFileSync('public/data/'+file);const hash=b=>createHash('sha256').update(b).digest('hex');results.push({path:'/data/'+file,status:r.status,bytes:remote.length,pass:r.ok&&hash(remote)===hash(local)});}
const root=await fetchPage('/en');const assets=[...root.text.matchAll(/(?:src|href)="(\/assets\/[^\"]+)"/g)].map(x=>x[1]);for(const path of assets){const r=await httpFetch(base+path);results.push({path,status:r.status,pass:r.ok});}
const output={base,checkedAt:new Date().toISOString(),passed:results.filter(r=>r.pass).length,failed:results.filter(r=>!r.pass),networkRetries,results:results.sort((a,b)=>a.path.localeCompare(b.path))};mkdirSync('verification',{recursive:true});writeFileSync('verification/'+(base.includes('127.0.0.1')?'local':'production')+'-http-results.json',JSON.stringify(output,null,2));console.log(JSON.stringify({base,passed:output.passed,failed:output.failed,networkRetries:networkRetries.length},null,2));if(output.failed.length)process.exitCode=1;
