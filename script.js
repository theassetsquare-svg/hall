/* Progress bar */
(function(){
  var bar=document.getElementById('progress');
  if(!bar)return;
  window.addEventListener('scroll',function(){
    var h=document.documentElement.scrollHeight-window.innerHeight;
    bar.style.width=h>0?(window.scrollY/h*100)+'%':'0';
  },{passive:true});
})();

/* Nav toggle */
function toggleNav(){
  var m=document.getElementById('navMenu');
  var b=document.querySelector('.nav-toggle');
  if(m&&b){m.classList.toggle('open');b.classList.toggle('active')}
}

/* Highlight current nav */
(function(){
  var path=location.pathname.replace(/\/$/,'');
  document.querySelectorAll('.nav-menu a').forEach(function(a){
    var href=a.getAttribute('href').replace(/\/$/,'');
    if(href===path||(path===''&&href==='/'))a.classList.add('active');
  });
})();

/* FAQ accordion */
document.addEventListener('click',function(e){
  var q=e.target.closest('.faq-q');
  if(!q)return;
  q.closest('.faq-item').classList.toggle('open');
});

/* Visitor counter */
(function(){
  var el=document.getElementById('counter');
  if(!el)return;
  var key='mw_v_'+new Date().toDateString();
  var base=87+Math.floor(Math.random()*40);
  var c=parseInt(localStorage.getItem(key))||base;
  c++;
  localStorage.setItem(key,c);
  el.textContent='\uC624\uB298 '+c+'\uBA85\uC774 \uBD24\uC2B5\uB2C8\uB2E4';
})();

/* Close nav on link click (mobile) */
document.addEventListener('click',function(e){
  if(e.target.closest('.nav-menu a')){
    var m=document.getElementById('navMenu');
    var b=document.querySelector('.nav-toggle');
    if(m)m.classList.remove('open');
    if(b)b.classList.remove('active');
  }
});
