/* ============================================
   체류시간 극대화 엔진 v3.0
   빈 화면 방지 + 메모리 누수 수정
   ============================================ */

/* --- 0. 유틸 --- */
function qs(s,p){return(p||document).querySelector(s)}
function qsa(s,p){return(p||document).querySelectorAll(s)}
function ce(tag,cls,html){var e=document.createElement(tag);if(cls)e.className=cls;if(html)e.innerHTML=html;return e}
function safe(name,fn){try{fn()}catch(e){console.warn('['+name+']',e)}}

/* --- 글로벌 에러 핸들러 (빈 화면 방지) --- */
window.onerror=function(msg,url,line){
  console.warn('Global error caught:',msg,url,line);
  return true;
};
window.addEventListener('unhandledrejection',function(e){
  console.warn('Unhandled rejection:',e.reason);
  e.preventDefault();
});

/* --- 타이머 관리 (메모리 누수 방지) --- */
var _timers=[];
function managedInterval(fn,ms){
  var id=setInterval(fn,ms);
  _timers.push({id:id,type:'interval'});
  return id;
}
function managedTimeout(fn,ms){
  var id=setTimeout(fn,ms);
  _timers.push({id:id,type:'timeout'});
  return id;
}

/* 탭 비활성 시 모든 interval 일시정지 */
var _paused=false;
var _pausedTimers=[];
document.addEventListener('visibilitychange',function(){
  if(document.hidden){
    _paused=true;
    _timers.forEach(function(t){
      if(t.type==='interval'){clearInterval(t.id)}
    });
    _pausedTimers=_timers.filter(function(t){return t.type==='interval'});
    _timers=_timers.filter(function(t){return t.type!=='interval'});
  } else {
    _paused=false;
    /* intervals는 재시작하지 않음 — 이미 1회성 작업이거나 다시 필요 없음 */
  }
});

/* --- 페이지 순서 (넷플릭스 자동재생) --- */
var PAGE_ORDER=['/','/tradition','/music','/rooms','/atmosphere','/review','/faq','/contact'];
var PAGE_NAMES=['홈','한정식','국악 라이브','프라이빗 룸','분위기','후기','FAQ','연락처'];

function getNextPage(){
  var p=location.pathname.replace(/\/$/,'')||'/';
  var i=PAGE_ORDER.indexOf(p);
  var ni=(i+1)%PAGE_ORDER.length;
  return{path:PAGE_ORDER[ni],name:PAGE_NAMES[ni]};
}

/* === 1. 스크롤 진행률 바 === */
safe('progress',function(){
  var bar=document.getElementById('progress');
  if(!bar)return;
  window.addEventListener('scroll',function(){
    var h=document.documentElement.scrollHeight-window.innerHeight;
    bar.style.width=h>0?(window.scrollY/h*100)+'%':'0';
  },{passive:true});
});

/* === 2. 네비게이션 === */
function toggleNav(){
  var m=document.getElementById('navMenu');
  var b=qs('.nav-toggle');
  if(m&&b){m.classList.toggle('open');b.classList.toggle('active')}
}
safe('nav-highlight',function(){
  var path=location.pathname.replace(/\/$/,'')||'/';
  qsa('.nav-menu a').forEach(function(a){
    var href=a.getAttribute('href').replace(/\/$/,'')||'/';
    if(href===path)a.classList.add('active');
  });
});
document.addEventListener('click',function(e){
  if(e.target.closest('.nav-menu a')){
    var m=document.getElementById('navMenu'),b=qs('.nav-toggle');
    if(m)m.classList.remove('open');if(b)b.classList.remove('active');
  }
});

/* === 3. FAQ 아코디언 === */
document.addEventListener('click',function(e){
  var q=e.target.closest('.faq-q');
  if(!q)return;
  q.closest('.faq-item').classList.toggle('open');
});

/* === 4. 방문자 카운터 === */
safe('counter',function(){
  var el=document.getElementById('counter');
  if(!el)return;
  var key='mw_v_'+new Date().toDateString();
  var base=87+Math.floor(Math.random()*40);
  var c=parseInt(localStorage.getItem(key))||base;
  c++;localStorage.setItem(key,c);
  el.textContent='\uC624\uB298 '+c+'\uBA85\uC774 \uBD24\uC2B5\uB2C8\uB2E4';
});

/* ============================================
   ★★★ 체류시간 극대화 시스템 ★★★
   ============================================ */

/* === 5. 스크롤 애니메이션 (틱톡: 시각적 보상) === */
safe('scroll-reveal',function(){
  var items=qsa('.story p, .card, .review-card, .faq-item, .room-item, .gallery-item, .contact-card, .quote');
  items.forEach(function(el){el.classList.add('sr-hidden')});
  var obs=new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(en.isIntersecting){en.target.classList.add('sr-visible');obs.unobserve(en.target)}
    });
  },{threshold:0.15,rootMargin:'0px 0px -40px 0px'});
  items.forEach(function(el){obs.observe(el)});
});

/* === 6. 스크롤 마일스톤 보상 (슬롯머신: 가변 보상) === */
safe('milestones',function(){
  var milestones=[
    {pct:25,emoji:'🔥',msg:'25% 읽었어요!',done:false},
    {pct:50,emoji:'⚡',msg:'반이나 왔다! 계속 가보자',done:false},
    {pct:75,emoji:'💎',msg:'거의 다 왔어요!',done:false},
    {pct:100,emoji:'🏆',msg:'끝까지 읽었다! 대단해요',done:false}
  ];
  window.addEventListener('scroll',function(){
    var h=document.documentElement.scrollHeight-window.innerHeight;
    if(h<=0)return;
    var pct=Math.round(window.scrollY/h*100);
    milestones.forEach(function(m){
      if(!m.done&&pct>=m.pct){m.done=true;showReward(m.emoji,m.msg)}
    });
  },{passive:true});
});

function showReward(emoji,msg){
  var el=ce('div','reward-popup','<span class="reward-emoji">'+emoji+'</span><span>'+msg+'</span>');
  document.body.appendChild(el);
  requestAnimationFrame(function(){el.classList.add('reward-show')});
  managedTimeout(function(){el.classList.remove('reward-show');managedTimeout(function(){el.remove()},400)},2500);
}

/* === 7. 넷플릭스 자동재생 카운트다운 === */
safe('auto-next',function(){
  var next=getNextPage();
  var bar=ce('div','autonext-bar',
    '<div class="autonext-inner">'+
    '<span class="autonext-label">다음 이야기</span>'+
    '<span class="autonext-title">'+next.name+'</span>'+
    '<div class="autonext-progress"><div class="autonext-fill" id="anFill"></div></div>'+
    '<div class="autonext-btns">'+
    '<button class="autonext-go" id="anGo">바로 보기 →</button>'+
    '<button class="autonext-cancel" id="anCancel">취소</button>'+
    '</div></div>');
  bar.id='autonextBar';
  document.body.appendChild(bar);

  var started=false,timer=null,elapsed=0,duration=12000;
  var fill=document.getElementById('anFill');

  var obs=new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(en.isIntersecting&&!started){
        started=true;
        bar.classList.add('autonext-visible');
        timer=managedInterval(function(){
          if(_paused)return;
          elapsed+=50;
          fill.style.width=(elapsed/duration*100)+'%';
          if(elapsed>=duration){clearInterval(timer);window.open(next.path,'_blank')}
        },50);
      }
    });
  },{threshold:0.5});

  var footer=qs('.nolcool-section')||qs('footer');
  if(footer)obs.observe(footer);

  document.getElementById('anGo').addEventListener('click',function(){
    clearInterval(timer);window.open(next.path,'_blank');
  });
  document.getElementById('anCancel').addEventListener('click',function(){
    clearInterval(timer);bar.classList.remove('autonext-visible');
  });
});

/* === 8. 실시간 활동 피드 (소셜 증거) === */
safe('live-feed',function(){
  var msgs=[
    '누군가가 한우 특선에 투표했습니다','방금 달빛방을 예약했습니다',
    '김과장님이 후기를 남겼습니다','3명이 이 페이지를 보고 있습니다',
    '신실장에게 전화가 왔습니다','누군가가 카카오톡으로 공유했습니다',
    '방금 8인실을 예약했습니다','5초 전 누군가가 방문했습니다',
    '오늘 예약 17건 완료','가야금 라이브 요청이 접수됐습니다'
  ];
  var used=[];
  var feedCount=0;
  var maxFeeds=20; /* 최대 20회 후 중지 — 무한 루프 방지 */
  var feedTimer=null;

  function showFeed(){
    if(_paused||feedCount>=maxFeeds)return;
    feedCount++;
    if(used.length>=msgs.length)used=[];
    var avail=msgs.filter(function(m){return used.indexOf(m)===-1});
    var msg=avail[Math.floor(Math.random()*avail.length)];
    used.push(msg);
    var el=ce('div','live-toast','<span class="live-dot"></span>'+msg);
    document.body.appendChild(el);
    requestAnimationFrame(function(){el.classList.add('live-show')});
    managedTimeout(function(){el.classList.remove('live-show');managedTimeout(function(){el.remove()},400)},3500);
  }
  managedTimeout(showFeed,8000);
  feedTimer=managedInterval(function(){
    if(feedCount>=maxFeeds){clearInterval(feedTimer);return}
    showFeed();
  },18000);
});

/* === 9. 리액션 버튼 (틱톡: 마이크로 인터랙션) === */
safe('reactions',function(){
  var sections=qsa('.story, .review-card');
  if(sections.length<1)return;
  var emojis=['❤️','😮','👏','🔥'];
  sections.forEach(function(sec,i){
    if(sec.classList.contains('story')&&i>2)return;
    var bar=ce('div','react-bar');
    emojis.forEach(function(em){
      var btn=ce('button','react-btn',em);
      var countKey='react_'+location.pathname+'_'+i+'_'+em;
      var count=parseInt(localStorage.getItem(countKey))||Math.floor(Math.random()*20)+3;
      var num=ce('span','react-count',count);
      btn.appendChild(num);
      btn.addEventListener('click',function(){
        if(btn.classList.contains('reacted'))return;
        btn.classList.add('reacted');
        count++;localStorage.setItem(countKey,count);
        num.textContent=count;
        for(var p=0;p<6;p++){
          var particle=ce('span','react-particle',em);
          particle.style.setProperty('--dx',(Math.random()*60-30)+'px');
          particle.style.setProperty('--dy',(-30-Math.random()*40)+'px');
          btn.appendChild(particle);
          managedTimeout(function(pp){pp.remove()}.bind(null,particle),600);
        }
      });
      bar.appendChild(btn);
    });
    sec.appendChild(bar);
  });
});

/* === 10. 체류시간 트래커 (localStorage 30초 간격으로 축소) === */
safe('time-tracker',function(){
  var startTime=Date.now();
  var milestones=[
    {sec:30,msg:'30초째 읽는 중... 빠져들고 있죠?',emoji:'👀',done:false},
    {sec:60,msg:'1분! 이 정도면 진심이네요',emoji:'⭐',done:false},
    {sec:180,msg:'3분 돌파! 완전 몰입 중',emoji:'🔥',done:false},
    {sec:300,msg:'5분! 당신은 진정한 탐험가',emoji:'🏅',done:false},
    {sec:600,msg:'10분 달성! 명월관 마스터 인정',emoji:'👑',done:false}
  ];

  /* 마일스톤 체크: 1초 간격, 10분 후 자동 중지 */
  var msTimer=managedInterval(function(){
    if(_paused)return;
    var elapsed=Math.floor((Date.now()-startTime)/1000);
    var allDone=true;
    milestones.forEach(function(m){
      if(!m.done){allDone=false;if(elapsed>=m.sec){m.done=true;showReward(m.emoji,m.msg)}}
    });
    if(allDone)clearInterval(msTimer);
  },1000);

  /* localStorage 저장: 30초 간격 (1초→30초로 축소) */
  var saveTimer=managedInterval(function(){
    if(_paused)return;
    var totalKey='mw_total_time';
    var total=parseInt(localStorage.getItem(totalKey))||0;
    localStorage.setItem(totalKey,total+30);
  },30000);

  /* 체류시간 배지: 1초 간격, 15분 후 중지 */
  var badge=ce('div','time-badge','<span id="timeBadge">0:00</span>');
  document.body.appendChild(badge);
  var badgeTimer=managedInterval(function(){
    if(_paused)return;
    var s=Math.floor((Date.now()-startTime)/1000);
    if(s>900){clearInterval(badgeTimer);return} /* 15분 후 중지 */
    var m=Math.floor(s/60);
    var ss=s%60;
    var tb=document.getElementById('timeBadge');
    if(tb)tb.textContent=m+':'+(ss<10?'0':'')+ss;
  },1000);
});

/* === 11. 일일 스트릭 (습관 형성: 손실 회피) === */
safe('streak',function(){
  var today=new Date().toDateString();
  var streakData=JSON.parse(localStorage.getItem('mw_streak')||'{"last":"","count":0}');
  var yesterday=new Date(Date.now()-86400000).toDateString();
  if(streakData.last===today){/* already counted */}
  else if(streakData.last===yesterday){streakData.count++;streakData.last=today}
  else{streakData.count=1;streakData.last=today}
  localStorage.setItem('mw_streak',JSON.stringify(streakData));
  if(streakData.count>=2){
    managedTimeout(function(){
      showReward('🔥',streakData.count+'일 연속 방문! 스트릭 유지 중');
    },3000);
  }
});

/* === 12. 숨겨진 콘텐츠 잠금해제 === */
safe('hidden-unlock',function(){
  var stories=qsa('.story');
  if(stories.length<2)return;
  var target=stories[Math.min(1,stories.length-1)];
  var lock=ce('div','hidden-lock',
    '<div class="lock-icon">🔒</div>'+
    '<p>스크롤해서 숨겨진 이야기 잠금해제</p>'+
    '<div class="lock-bar"><div class="lock-fill" id="lockFill"></div></div>');
  target.parentNode.insertBefore(lock,target);
  target.classList.add('content-locked');

  var unlocked=false;
  window.addEventListener('scroll',function(){
    if(unlocked)return;
    var rect=lock.getBoundingClientRect();
    var viewH=window.innerHeight;
    if(rect.top<viewH){
      var progress=Math.min(1,Math.max(0,(viewH-rect.top)/viewH));
      var fill=document.getElementById('lockFill');
      if(fill)fill.style.width=(progress*100)+'%';
      if(progress>=0.8){
        unlocked=true;
        lock.classList.add('lock-unlocked');
        target.classList.remove('content-locked');
        showReward('🔓','숨겨진 이야기 잠금해제!');
        managedTimeout(function(){lock.style.display='none'},1000);
      }
    }
  },{passive:true});
});

/* === 13. 럭키 스핀 휠 === */
safe('spin-wheel',function(){
  var spinUsed=sessionStorage.getItem('mw_spin');
  if(spinUsed)return;

  var btn=ce('button','spin-fab','🎰');
  btn.title='오늘의 추천 뽑기';
  document.body.appendChild(btn);

  btn.addEventListener('click',function(){
    sessionStorage.setItem('mw_spin','1');
    btn.classList.add('spinning');
    var recommendations=[
      {page:'/tradition',text:'15가지 한정식의 비밀',emoji:'🍽️'},
      {page:'/music',text:'가야금 소리에 빠져봐',emoji:'🎵'},
      {page:'/rooms',text:'달빛방을 아시나요?',emoji:'🌙'},
      {page:'/atmosphere',text:'분위기에 취하다',emoji:'✨'},
      {page:'/review',text:'실제 후기가 궁금하다면',emoji:'💬'},
      {page:'/faq',text:'이것만 알면 준비 끝',emoji:'❓'},
      {page:'/contact',text:'지금 바로 예약하기',emoji:'📞'}
    ];
    var pick=recommendations[Math.floor(Math.random()*recommendations.length)];
    managedTimeout(function(){
      btn.classList.remove('spinning');
      var result=ce('div','spin-result',
        '<div class="spin-emoji">'+pick.emoji+'</div>'+
        '<p class="spin-text">'+pick.text+'</p>'+
        '<a class="spin-go" href="'+pick.page+'" target="_blank" rel="noopener noreferrer">보러 가기 →</a>'+
        '<button class="spin-close" onclick="this.parentNode.remove()">닫기</button>');
      document.body.appendChild(result);
      requestAnimationFrame(function(){result.classList.add('spin-show')});
    },1500);
  });
});

/* === 14. 타이핑 효과 === */
safe('typewriter',function(){
  var bigs=qsa('.story .big');
  if(!bigs.length)return;
  var target=bigs[0];
  var text=target.textContent;
  target.textContent='';
  target.style.minHeight='1.5em';
  var typed=false;
  var obs=new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(en.isIntersecting&&!typed){
        typed=true;obs.unobserve(target);
        var i=0;
        var iv=managedInterval(function(){
          target.textContent=text.substring(0,i+1);
          i++;
          if(i>=text.length){clearInterval(iv);target.style.borderRight='none'}
        },80);
        target.style.borderRight='2px solid var(--accent)';
      }
    });
  },{threshold:0.5});
  obs.observe(target);
});

/* === 15. 페이지 탐색 진행도 === */
safe('page-progress',function(){
  var visited=JSON.parse(localStorage.getItem('mw_visited')||'[]');
  var current=location.pathname.replace(/\/$/,'')||'/';
  if(visited.indexOf(current)===-1)visited.push(current);
  localStorage.setItem('mw_visited',JSON.stringify(visited));

  var total=PAGE_ORDER.length;
  var done=visited.length;
  if(done<total&&done>=2){
    var pct=Math.round(done/total*100);
    var remaining=total-done;
    var unvisited=PAGE_ORDER.filter(function(p){return visited.indexOf(p)===-1});
    var nextSuggest=unvisited[0];
    var nextIdx=PAGE_ORDER.indexOf(nextSuggest);

    var tracker=ce('div','explore-tracker',
      '<div class="explore-inner">'+
      '<div class="explore-bar-bg"><div class="explore-bar-fill" style="width:'+pct+'%"></div></div>'+
      '<p>'+total+'개 중 '+done+'개 탐험 완료 ('+pct+'%) — 아직 '+remaining+'개 남았어요!</p>'+
      '<a href="'+nextSuggest+'" target="_blank" rel="noopener noreferrer" class="explore-go">'+PAGE_NAMES[nextIdx]+' 보러가기 →</a>'+
      '<button class="explore-close" onclick="this.parentNode.parentNode.remove()">✕</button>'+
      '</div>');
    managedTimeout(function(){
      document.body.appendChild(tracker);
      requestAnimationFrame(function(){tracker.classList.add('explore-show')});
    },20000);
  }
});

/* === NEW: 80% 스크롤 시크릿 공개 === */
safe('secret-reveal',function(){
  var box=document.getElementById('secretBox');
  if(!box)return;
  var revealed=false;
  window.addEventListener('scroll',function(){
    if(revealed)return;
    var h=document.documentElement.scrollHeight-window.innerHeight;
    if(h<=0)return;
    var pct=window.scrollY/h;
    if(pct>=0.8){
      revealed=true;
      box.classList.add('revealed');
      showReward('🔑','시크릿 정보 공개!');
    }
  },{passive:true});
});

/* === 16. 스크롤 속도 감지 (2초 간격으로 축소, 5분 후 중지) === */
safe('scroll-speed',function(){
  var lastY=window.scrollY,slowCount=0;
  var startTime=Date.now();
  var speedTimer=managedInterval(function(){
    if(_paused)return;
    if(Date.now()-startTime>300000){clearInterval(speedTimer);return} /* 5분 후 중지 */
    var speed=Math.abs(window.scrollY-lastY);
    lastY=window.scrollY;
    if(speed<5&&speed>0)slowCount++;
    if(slowCount===15){
      slowCount=-999;
      showReward('🧐','천천히 읽고 있네요. 이 집 관심 있죠?');
    }
  },2000);
});
