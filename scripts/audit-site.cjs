const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'../dist'),origin='https://burcu-onay-tunali.sudedalyann.chatgpt.site',files=[];
const out=process.argv[2]||path.resolve(root,'../../qa/seo-after.json');
function walk(p){for(const x of fs.readdirSync(p,{withFileTypes:true})){const f=path.join(p,x.name);if(x.isDirectory())walk(f);else if(x.name==='index.html')files.push(f);}}walk(root);
(async()=>{const titles=new Set(),descriptions=new Set(),results=[];for(const f of files){
 const html=fs.readFileSync(f,'utf8'),route='/'+path.relative(root,path.dirname(f)).split(path.sep).filter(Boolean).join('/')+(path.dirname(f)===root?'':'/'),errors=[];
 const check=(v,label)=>{if(!v)errors.push(label);};
 const title=html.match(/<title>(.*?)<\/title>/)?.[1],description=html.match(/<meta name="description" content="([^"]*)"/)?.[1];
 check(title&&title.length<90,'title missing or excessive');check(!titles.has(title),'duplicate title');titles.add(title);
 check(description&&description.length>50,'description missing or thin');check(!descriptions.has(description),'duplicate description');descriptions.add(description);
 check(html.includes('<html lang="tr">'),'language');check((html.match(/<h1[ >]/g)||[]).length===1,'H1');
 check((html.match(/rel="canonical"/g)||[]).length===1&&html.includes(`rel="canonical" href="${origin}${route}"`),'canonical');
 check(html.includes('property="og:image"')&&html.includes(`property="og:url" content="${origin}${route}"`),'social metadata');
 const schema=html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];try{const s=JSON.parse(schema);check(s['@context']==='https://schema.org'&&s['@graph'].some(x=>x['@type']==='WebPage'&&x.url===origin+route),'schema graph');}catch{errors.push('invalid JSON-LD');}
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);check(new Set(ids).size===ids.length,'duplicate IDs');
 for(const m of html.matchAll(/(?:href|src)="([^"?]*)(?:\?[^"#]*)?(?:#([^" ]*))?"/g)){const url=m[1],anchor=m[2];if(!url&&anchor){check(ids.includes(anchor),'anchor '+anchor);continue;}if(!url.startsWith('/'))continue;const target=path.join(root,url);check(fs.existsSync(target),'missing '+url);if(fs.existsSync(target)&&fs.statSync(target).isDirectory()&&anchor){check(fs.readFileSync(path.join(target,'index.html'),'utf8').includes('id="'+anchor+'"'),'target anchor '+url+'#'+anchor);}}
 for(const m of html.matchAll(/<img\b([^>]*)>/g)){check(/\balt="/.test(m[1]),'image alt');check(/\bwidth="/.test(m[1])&&/\bheight="/.test(m[1]),'image dimensions');}
 const response=await fetch('http://127.0.0.1:5174'+route);check(response.status===200,'HTTP '+response.status);
 const staticListings=(html.match(/href="\/ilan\//g)||[]).length;if(route==='/'||route==='/portfoy/')check(staticListings===14,'7 crawlable listing cards');
 check(!html.includes('hero-corner')&&!html.includes('hero-advisor')&&!html.includes('class="monogram"'),'removed UI elements');
 results.push({route,title,descriptionLength:description?.length,http:response.status,staticListings,errors});
 }
 const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');for(const r of results)assert(sitemap.includes('<loc>'+origin+r.route+'</loc>'),'sitemap '+r.route);
 assert(fs.readFileSync(path.join(root,'robots.txt'),'utf8').includes(origin+'/sitemap.xml'));
 const report={pages:results.length,failures:results.filter(x=>x.errors.length),results};fs.writeFileSync(out,JSON.stringify(report,null,2));console.log(JSON.stringify({pages:report.pages,failures:report.failures},null,2));if(report.failures.length)process.exitCode=1;
})();
