let calcMode='yield';
const calcPrice=document.querySelector('#calc-price'),calcSecond=document.querySelector('#calc-second');
const numberTR=(n,digits=0)=>new Intl.NumberFormat('tr-TR',{maximumFractionDigits:digits,minimumFractionDigits:digits}).format(n);
function calculate(){
  const result=PropertyMath.calculate(calcMode,Number(calcPrice.value),Number(calcSecond.value));
  if(!result){document.querySelector('#calc-main').textContent='—';document.querySelector('#calc-detail').textContent='Lütfen sıfırdan büyük iki değer girin.';document.querySelector('#calc-payback').textContent='—';return;}
  document.querySelector('#result-label').textContent=calcMode==='yield'?'Yıllık brüt kira getirisi':'Metrekare başına fiyat';
  document.querySelector('#calc-main').textContent=calcMode==='yield'?'%'+numberTR(result.yieldPercent,2):numberTR(result.unitPrice)+' ₺';
  document.querySelector('#calc-detail').textContent=calcMode==='yield'?'Yıllık kira: '+numberTR(result.annualRent)+' ₺':numberTR(Number(calcPrice.value))+' ₺ / '+numberTR(Number(calcSecond.value),1)+' m²';
  document.querySelector('#payback-result').hidden=calcMode==='sqm';
  if(calcMode==='yield')document.querySelector('#calc-payback').textContent=numberTR(result.paybackYears,1)+' yıl';
}
function populateCalculator(){const select=document.querySelector('#calc-property');select.querySelectorAll('option[data-listing]').forEach(x=>x.remove());listings.filter(x=>!x.rent).forEach(x=>{const o=document.createElement('option');o.value=x.code;o.dataset.listing='true';o.textContent=x.town+' · '+x.rooms+' · '+numberTR(x.price)+' ₺';select.append(o);});}
document.querySelector('#calculator-form').addEventListener('submit',e=>{e.preventDefault();calculate();});
[calcPrice,calcSecond].forEach(x=>x.addEventListener('input',calculate));
document.querySelectorAll('[data-tool]').forEach(b=>b.addEventListener('click',()=>{calcMode=b.dataset.tool;document.querySelectorAll('[data-tool]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});document.querySelector('#calc-heading').textContent=calcMode==='yield'?'Kira getirisi hesaplama':'Metrekare fiyatı hesaplama';document.querySelector('#calc-second-label').textContent=calcMode==='yield'?'Aylık kira (₺)':'Alan (m²)';const selected=listings.find(x=>x.code===document.querySelector('#calc-property').value);calcSecond.value=calcMode==='yield'?35000:selected?.area||100;calculate();}));
document.querySelector('#calc-property').addEventListener('change',e=>{const x=listings.find(x=>x.code===e.target.value);if(x){calcPrice.value=x.price;if(calcMode==='sqm')calcSecond.value=x.area;calculate();}});
calculate();
