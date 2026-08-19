/* =========================
   1. APP STATE
========================= */
const KEY="battleRushData";
let data=null;
let state={page:"home",tournamentTab:"ALL",selected:null,leaderTab:"WEEKLY",admin:false};
const seedTournaments=[
 {id:"br1",name:"Battle Rush Night Cup",banner:"https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=70",mode:"SQUAD",entry:20,prize:5000,slots:48,joined:31,date:futureDate(0,20),time:"8:30 PM",status:"LIVE",releaseMinutes:15,rules:"Standard Battle Royale rules. No hacks, teaming or abusive behavior. Players must join the room before the match starts.",prizes:[2000,1200,700,1100]},
 {id:"br2",name:"Rush Solo Championship",banner:"https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=70",mode:"SOLO",entry:10,prize:2500,slots:50,joined:27,date:futureDate(1,0),time:"7:00 PM",status:"UPCOMING",releaseMinutes:10,rules:"Solo match. Fair play required. Registration closes before room creation.",prizes:[1000,600,350,550]},
 {id:"br3",name:"Duo Thunder League",banner:"https://images.unsplash.com/photo-1560253023-3ec5d502959f?auto=format&fit=crop&w=900&q=70",mode:"DUO",entry:30,prize:8000,slots:40,joined:39,date:futureDate(2,0),time:"9:00 PM",status:"UPCOMING",releaseMinutes:20,rules:"Duo format. Both players must use registered accounts. Room details release shortly before match.",prizes:[3200,1800,1000,2000]},
 {id:"br4",name:"Pro Squad Clash",banner:"https://images.unsplash.com/photo-1603481546238-487240415921?auto=format&fit=crop&w=900&q=70",mode:"SQUAD",entry:50,prize:12000,slots:48,joined:48,date:futureDate(4,0),time:"8:00 PM",status:"UPCOMING",releaseMinutes:15,rules:"Squad tournament. Match officials may remove players for rule violations.",prizes:[5000,3000,1600,2400]}
];
function futureDate(days,extraHours){let d=new Date();d.setDate(d.getDate()+days);d.setHours(d.getHours()+extraHours);return d.toISOString().slice(0,10)}
function init(){
 const raw=localStorage.getItem(KEY);
 if(raw){data=JSON.parse(raw)}else{
  data={users:[],currentUser:null,tournaments:seedTournaments,joined:{},wallet:{},transactions:[],notifications:[
   {id:1,text:"Welcome to Battle Rush! Your demo account is ready.",time:Date.now(),read:false}
  ],results:[
   {player:"ShadowX",rank:1,kills:9,points:120,prize:2000},
   {player:"RushBoy",rank:2,kills:7,points:95,prize:1200},
   {player:"Viper",rank:3,kills:6,points:82,prize:700},
   {player:"Nova",rank:4,kills:5,points:70,prize:500},
   {player:"Rex",rank:5,kills:4,points:61,prize:300}
  ]};
  save();
 }
}
function save(){localStorage.setItem(KEY,JSON.stringify(data))}
function user(){return data.users.find(u=>u.id===data.currentUser)}
function userKey(){return data.currentUser||"guest"}
function ensureUserData(){if(!data.joined[userKey()])data.joined[userKey()]=[];if(!data.wallet[userKey()])data.wallet[userKey()]={balance:250,transactions:[]};save()}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function money(n){return "₹"+Number(n||0).toLocaleString("en-IN")}
function toast(t){const x=document.getElementById("toast");x.textContent=t;x.classList.add("show");clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>x.classList.remove("show"),2500)}
function modal(html){document.getElementById("modal").innerHTML=html;document.getElementById("modalBg").classList.remove("hidden")}
function closeModal(){document.getElementById("modalBg").classList.add("hidden")}
function addNotification(text){data.notifications.unshift({id:Date.now(),text,time:Date.now(),read:false});save();renderDot()}
function renderDot(){const n=document.getElementById("notifyDot");if(n)n.classList.toggle("hidden",!data.notifications.some(x=>!x.read))}
function fmtDate(d){return new Date(d+"T00:00:00").toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}
function countdown(t){let end=new Date(t.date+" "+t.time);let diff=end-new Date();if(diff<=0)return"Starting soon";let s=Math.floor(diff/1000),d=Math.floor(s/86400);s%=86400;let h=Math.floor(s/3600);s%=3600;let m=Math.floor(s/60);return `${d?d+"d ":""}${String(h).padStart(2,"0")}h ${String(m).padStart(2,"0")}m`}
setInterval(()=>{document.querySelectorAll("[data-countdown]").forEach(e=>{const t=data.tournaments.find(x=>x.id===e.dataset.countdown);if(t)e.textContent=countdown(t)});},1000);

/* =========================
   2. AUTHENTICATION
========================= */
function showLogin(){document.getElementById("loginForm").classList.remove("hidden");document.getElementById("signupForm").classList.add("hidden")}
function showSignup(){document.getElementById("loginForm").classList.add("hidden");document.getElementById("signupForm").classList.remove("hidden")}
function signup(){
 const name=sName.value.trim(),un=sUser.value.trim(),id=sId.value.trim(),p=sPass.value,c=sConfirm.value;
 if(!name||!un||!id||!p||!c)return signupErr.textContent="Please fill all fields.";
 if(p.length<4)return signupErr.textContent="Password must be at least 4 characters.";
 if(p!==c)return signupErr.textContent="Passwords do not match.";
 if(data.users.some(u=>u.id===id||u.username.toLowerCase()===un.toLowerCase()))return signupErr.textContent="Account or username already exists.";
 const u={id:"u"+Date.now(),name,username:un,loginId:id,password:p,playerId:"BR"+Math.floor(100000+Math.random()*899999),avatar:un.slice(0,2).toUpperCase(),stats:{matches:0,wins:0,kills:0,winnings:0}};
 data.users.push(u);data.currentUser=u.id;ensureUserData();save();openApp();toast("Account created successfully!");addNotification("Welcome to Battle Rush, "+un+"!");
}
function login(){
 const id=loginId.value.trim(),p=loginPass.value;
 const u=data.users.find(x=>x.loginId===id&&x.password===p);
 if(!u)return loginErr.textContent="Invalid demo login details.";
 data.currentUser=u.id;ensureUserData();save();openApp();toast("Welcome back, "+u.username+"!");
}
function demoForgot(){toast("Demo only: use your saved account password.")}
function logout(){data.currentUser=null;save();document.getElementById("app").classList.add("hidden");document.getElementById("auth").classList.remove("hidden");showLogin();toast("Logged out")}
function openApp(){document.getElementById("auth").classList.add("hidden");document.getElementById("app").classList.remove("hidden");ensureUserData();updateAvatar();navigate(state.page||"home")}
function updateAvatar(){const u=user();if(u){document.getElementById("topAvatar").textContent=u.avatar||u.username.slice(0,2).toUpperCase()}}

/* =========================
   3. NAVIGATION
========================= */
function navigate(page){
 state.page=page;
 document.querySelectorAll(".nav").forEach(n=>n.classList.toggle("active",n.dataset.nav===page));
 if(["notifications","admin"].includes(page))document.querySelectorAll(".nav").forEach(n=>n.classList.remove("active"));
 render();
 window.scrollTo({top:0,behavior:"smooth"});
}
function render(){
 const v=document.getElementById("view");
 if(state.page==="home")v.innerHTML=homeHTML();
 else if(state.page==="tournaments")v.innerHTML=tournamentsHTML();
 else if(state.page==="mygames")v.innerHTML=myGamesHTML();
 else if(state.page==="leaderboard")v.innerHTML=leaderboardHTML();
 else if(state.page==="profile")v.innerHTML=profileHTML();
 else if(state.page==="notifications")v.innerHTML=notificationsHTML();
 else if(state.page==="admin")v.innerHTML=adminHTML();
 else if(state.page==="detail")v.innerHTML=detailHTML();
}

/* =========================
   4. TOURNAMENTS
========================= */
function tournamentCard(t){
 return `<div class="card">
  <div class="banner">${t.banner?`<img src="${esc(t.banner)}" onerror="this.style.display='none'">`:""}<span class="badge ${t.status.toLowerCase()}">${t.status}</span></div>
  <div class="row"><div class="card-title">${esc(t.name)}</div><span class="badge">${t.mode}</span></div>
  <div class="meta">
   <div><small>ENTRY</small><b>${money(t.entry)}</b></div><div><small>PRIZE POOL</small><b class="gold">${money(t.prize)}</b></div>
   <div><small>SLOTS</small><b>${t.joined}/${t.slots}</b></div><div><small>MATCH</small><b>${esc(t.time)}</b></div>
  </div>
  <div class="row"><small class="muted">${fmtDate(t.date)}</small><button class="btn primary small" onclick="openTournament('${t.id}')">VIEW / JOIN</button></div>
 </div>`
}
function homeHTML(){
 const live=data.tournaments.filter(t=>t.status==="LIVE").slice(0,3),up=data.tournaments.filter(t=>t.status==="UPCOMING").slice(0,3);
 return `<div class="page">
 <section class="hero"><div class="eyebrow">BATTLE RUSH ESPORTS</div><h1>DOMINATE THE<br>BATTLEFIELD.</h1><p>Compete in Free Fire tournaments, climb the leaderboard and become the next Battle Rush champion.</p><div class="actions"><button class="btn primary" onclick="navigate('tournaments')">JOIN TOURNAMENT</button><button class="btn outline" onclick="navigate('tournaments')">VIEW TOURNAMENTS</button></div></section>
 <section class="section"><div class="section-head"><h2>🔴 Live Tournaments</h2><button class="btn outline small" onclick="navigate('tournaments')">View All</button></div><div class="grid">${live.length?live.map(tournamentCard).join(""):`<div class="empty">No live tournaments right now.</div>`}</div></section>
 <section class="section"><div class="section-head"><h2>⚡ Upcoming Tournaments</h2><button class="btn outline small" onclick="navigate('tournaments')">View All</button></div><div class="grid">${up.map(tournamentCard).join("")}</div></section>
 <section class="section"><div class="section-head"><h2>🏆 Recent Winners</h2></div><div class="card table-wrap"><table class="table"><thead><tr><th>RANK</th><th>PLAYER</th><th>PRIZE</th><th>TOURNAMENT</th></tr></thead><tbody>${data.results.slice(0,5).map(r=>`<tr><td>#${r.rank}</td><td><b>${esc(r.player)}</b></td><td class="gold">${money(r.prize)}</td><td>Battle Rush Cup</td></tr>`).join("")}</tbody></table></div></section>
 </div>`
}
function tournamentsHTML(){
 let ts=data.tournaments.filter(t=>state.tournamentTab==="ALL"||t.mode===state.tournamentTab);
 return `<div class="page"><div class="section-head"><h2>⚔ Tournaments</h2></div>
 <div class="tabs">${["ALL","SOLO","DUO","SQUAD"].map(x=>`<button class="tab ${state.tournamentTab===x?"active":""}" onclick="state.tournamentTab='${x}';render()">${x}</button>`).join("")}</div>
 <div class="search"><input id="tSearch" placeholder="Search tournament..." oninput="filterTournamentCards(this.value)"></div>
 <div id="tGrid" class="grid">${ts.map(tournamentCard).join("")||`<div class="empty">No tournaments found.</div>`}</div></div>`
}
function filterTournamentCards(q){
 q=q.toLowerCase();document.querySelectorAll("#tGrid .card").forEach(c=>c.style.display=c.textContent.toLowerCase().includes(q)?"":"none")
}
function openTournament(id){state.selected=id;state.page="detail";render()}
function detailHTML(){
 const t=data.tournaments.find(x=>x.id===state.selected);if(!t)return`<div class="empty">Tournament not found.</div>`;
 const joined=data.joined[userKey()]?.includes(t.id), releaseAt=new Date(new Date(t.date+"T"+convert12(t.time)).getTime()-t.releaseMinutes*60000), roomReady=Date.now()>=releaseAt.getTime()&&t.roomId&&t.roomPass;
 return `<div class="page">
 <button class="btn outline small" onclick="navigate('tournaments')">← Back</button>
 <section class="detail section"><span class="badge ${t.status.toLowerCase()}">${t.status}</span><h1>${esc(t.name)}</h1><p class="muted">${t.mode} • ${fmtDate(t.date)} • ${esc(t.time)}</p>
 <div class="detail-stats"><div class="detail-stat"><small>PRIZE POOL</small><b class="gold">${money(t.prize)}</b></div><div class="detail-stat"><small>ENTRY FEE</small><b>${money(t.entry)}</b></div><div class="detail-stat"><small>SLOTS</small><b>${t.joined}/${t.slots}</b></div><div class="detail-stat"><small>COUNTDOWN</small><b data-countdown="${t.id}">${countdown(t)}</b></div></div></section>
 <section class="section"><h2>Prize Distribution</h2><div class="prizes">${["1st Place","2nd Place","3rd Place","4th–10th"].map((x,i)=>`<div class="prize"><small>${x}</small><b>${money(t.prizes[i]||0)}</b></div>`).join("")}</div></section>
 <section class="section"><h2>Rules</h2><div class="card"><ul class="rules"><li>${esc(t.rules)}</li><li>No hacks, scripts, teaming or unfair play.</li><li>Use only the registered player/team.</li><li>Room rules must be followed by all participants.</li></ul></div></section>
 <section class="section"><h2>Match Information</h2>${roomReady?`<div class="room"><small class="muted">ROOM ID</small><div class="room-code">${esc(t.roomId)}</div><small class="muted">ROOM PASSWORD</small><div class="room-code">${esc(t.roomPass)}</div></div>`:`<div class="room"><b>ROOM DETAILS WILL APPEAR BEFORE MATCH</b><p class="muted">Admin releases room information ${t.releaseMinutes} minutes before match.</p></div>`}</section>
 <section class="section"><button class="btn ${joined?"success":"primary"}" style="width:100%" onclick="${joined?"toast('You are already registered.')":`joinTournament('${t.id}')`}">${joined?"✓ YOU ARE REGISTERED":"JOIN TOURNAMENT"}</button></section>
 </div>`
}
function convert12(str){
 const m=str.match(/(\d+):(\d+)\s*(AM|PM)/i);if(!m)return"20:00";let h=+m[1],mi=m[2],ap=m[3].toUpperCase();if(ap==="PM"&&h<12)h+=12;if(ap==="AM"&&h===12)h=0;return String(h).padStart(2,"0")+":"+mi
}
function joinTournament(id){
 ensureUserData();const t=data.tournaments.find(x=>x.id===id),arr=data.joined[userKey()];
 if(arr.includes(id))return toast("Already registered.");
 if(t.joined>=t.slots)return toast("Tournament is full.");
 if(data.wallet[userKey()].balance<t.entry)return toast("Insufficient demo balance.");
 data.wallet[userKey()].balance-=t.entry;data.wallet[userKey()].transactions.unshift({type:"Tournament Entry",amount:-t.entry,time:Date.now()});
 arr.push(id);t.joined++;save();addNotification("You successfully joined "+t.name+".");toast("Tournament joined successfully!");render();
}

/* =========================
   5. MY GAMES
========================= */
function myGamesHTML(){
 ensureUserData();let arr=data.joined[userKey()]||[],ts=data.tournaments.filter(t=>arr.includes(t.id));
 const filter=state.myTab||"UPCOMING";let shown=ts.filter(t=>filter==="UPCOMING"?t.status==="UPCOMING":filter==="LIVE"?t.status==="LIVE":t.status==="COMPLETED");
 return `<div class="page"><div class="section-head"><h2>🎮 My Tournaments</h2></div><div class="tabs">${["UPCOMING","LIVE","COMPLETED"].map(x=>`<button class="tab ${filter===x?"active":""}" onclick="state.myTab='${x}';render()">${x}</button>`).join("")}</div><div class="section grid">${shown.map(tournamentCard).join("")||`<div class="empty">No ${filter.toLowerCase()} tournaments.</div>`}</div></div>`
}

/* =========================
   6. LEADERBOARD
========================= */
function leaderboardHTML(){
 const r=[...data.results].sort((a,b)=>b.points-a.points),top=r.slice(0,3);
 return `<div class="page"><div class="section-head"><h2>🏆 Leaderboard</h2></div><div class="tabs">${["WEEKLY","MONTHLY","ALL-TIME"].map(x=>`<button class="tab ${state.leaderTab===x?"active":""}" onclick="state.leaderTab='${x}';render()">${x}</button>`).join("")}</div>
 <div class="section leader-grid">${top.map((x,i)=>`<div class="podium ${i===0?"first":""}"><div class="rank">#${i+1}</div><h3>${esc(x.player)}</h3><p class="muted">${x.kills} Kills • ${x.points} Points</p><b class="gold">${money(x.prize)}</b></div>`).join("")}</div>
 <div class="section card table-wrap"><table class="table"><thead><tr><th>RANK</th><th>PLAYER</th><th>KILLS</th><th>WINS</th><th>POINTS</th><th>PRIZE</th></tr></thead><tbody>${r.map((x,i)=>`<tr><td>#${i+1}</td><td><b>${esc(x.player)}</b></td><td>${x.kills}</td><td>${x.rank===1?1:0}</td><td><b>${x.points}</b></td><td class="gold">${money(x.prize)}</td></tr>`).join("")}</tbody></table></div></div>`
}

/* =========================
   7. PROFILE
========================= */
function profileHTML(){
 const u=user();ensureUserData();const w=data.wallet[userKey()];
 return `<div class="page"><div class="card" style="text-align:center;padding:28px"><div class="avatar" style="width:78px;height:78px;margin:auto;font-size:25px">${esc(u.avatar||"BR")}</div><h2>${esc(u.username)}</h2><p class="muted">${esc(u.name)} • Player ID: ${esc(u.playerId)}</p><div class="stat-grid section"><div class="stat"><small>MATCHES</small><b>${u.stats.matches}</b></div><div class="stat"><small>WINS</small><b>${u.stats.wins}</b></div><div class="stat"><small>KILLS</small><b>${u.stats.kills}</b></div><div class="stat"><small>WINNINGS</small><b class="gold">${money(u.stats.winnings)}</b></div></div></div>
 <div class="section actions"><button class="btn primary" onclick="editProfile()">EDIT PROFILE</button><button class="btn outline" onclick="changeAvatar()">CHANGE AVATAR</button><button class="btn outline" onclick="navigate('admin')">DEMO ADMIN</button><button class="btn danger" onclick="logout()">LOGOUT</button></div>
 <section class="section card"><div class="section-head"><h2>Demo Wallet</h2><b class="gold">${money(w.balance)}</b></div><p class="muted">Demo balance only. No real money or payments.</p><div class="actions"><button class="btn primary small" onclick="walletAction('deposit')">ADD DEMO BALANCE</button><button class="btn outline small" onclick="walletAction('withdraw')">WITHDRAW DEMO BALANCE</button></div></section>
 </div>`
}
function editProfile(){const u=user();modal(`<button class="close" onclick="closeModal()">×</button><h2>Edit Profile</h2><div class="field"><label>Full Name</label><input id="eName" value="${esc(u.name)}"></div><div class="field"><label>Username</label><input id="eUser" value="${esc(u.username)}"></div><button class="btn primary" style="width:100%" onclick="saveProfile()">SAVE PROFILE</button>`)}
function saveProfile(){const u=user();u.name=eName.value.trim()||u.name;u.username=eUser.value.trim()||u.username;u.avatar=u.username.slice(0,2).toUpperCase();save();updateAvatar();closeModal();render();toast("Profile updated")}
function changeAvatar(){const u=user();modal(`<button class="close" onclick="closeModal()">×</button><h2>Change Avatar</h2><div class="field"><label>Avatar initials / emoji</label><input id="newAvatar" maxlength="4" value="${esc(u.avatar)}"></div><button class="btn primary" style="width:100%" onclick="saveAvatar()">SAVE AVATAR</button>`)}
function saveAvatar(){user().avatar=newAvatar.value.trim().slice(0,4).toUpperCase()||"BR";save();updateAvatar();closeModal();render();toast("Avatar updated")}
function walletAction(type){
 ensureUserData();let w=data.wallet[userKey()];let amount=type==="deposit"?500:Math.min(100,w.balance);
 if(type==="withdraw"&&w.balance<=0)return toast("Demo balance is empty.");
 w.balance+=type==="deposit"?amount:-amount;w.transactions.unshift({type:type==="deposit"?"Demo Deposit":"Demo Withdrawal",amount:type==="deposit"?amount:-amount,time:Date.now()});save();render();toast(type==="deposit"?"₹500 demo balance added":"Demo withdrawal completed")
}

/* =========================
   8. NOTIFICATIONS
========================= */
function notificationsHTML(){
 data.notifications.forEach(n=>n.read=true);save();renderDot();
 return `<div class="page"><div class="section-head"><h2>🔔 Notifications</h2><button class="btn outline small" onclick="clearNotifications()">Clear</button></div><div class="section">${data.notifications.map(n=>`<div class="card" style="margin-bottom:9px"><b>${esc(n.text)}</b><small class="muted" style="display:block;margin-top:6px">${new Date(n.time).toLocaleString("en-IN")}</small></div>`).join("")||`<div class="empty">No notifications.</div>`}</div></div>`
}
function clearNotifications(){data.notifications=[];save();renderDot();render()}

/* =========================
   9. DEMO ADMIN PANEL
========================= */
function adminHTML(){
 if(!state.admin)return `<div class="page"><div class="card" style="max-width:450px;margin:50px auto"><h2>⚙ Demo Admin Login</h2><p class="muted">Frontend admin simulation only.</p><div class="field"><label>Admin Username</label><input id="aUser" value="admin"></div><div class="field"><label>Admin Password</label><input id="aPass" type="password" placeholder="Enter demo password"></div><div id="adminErr" class="error"></div><button class="btn primary" style="width:100%" onclick="adminLogin()">ADMIN LOGIN</button><p class="muted" style="font-size:10px;margin-top:10px">Demo credentials: admin / battle123</p></div></div>`;
 return `<div class="page"><div class="row"><h2>⚙ Admin Dashboard</h2><button class="btn danger small" onclick="state.admin=false;render()">EXIT ADMIN</button></div>
 <p class="muted">Frontend demo/admin simulation. Changes persist in localStorage.</p>
 <div class="stat-grid section"><div class="stat"><small>TOTAL USERS</small><b>${data.users.length}</b></div><div class="stat"><small>TOTAL TOURNAMENTS</small><b>${data.tournaments.length}</b></div><div class="stat"><small>LIVE TOURNAMENTS</small><b>${data.tournaments.filter(t=>t.status==="LIVE").length}</b></div><div class="stat"><small>TOTAL ENTRIES</small><b>${data.tournaments.reduce((a,t)=>a+t.joined,0)}</b></div></div>
 <section class="section"><div class="section-head"><h2>Manage Tournaments</h2><button class="btn primary small" onclick="createTournamentModal()">+ CREATE</button></div><div class="grid">${data.tournaments.map(t=>`<div class="card"><div class="row"><b>${esc(t.name)}</b><span class="badge ${t.status.toLowerCase()}">${t.status}</span></div><p class="muted">${t.mode} • ${money(t.prize)} • ${t.joined}/${t.slots}</p><div class="actions"><button class="btn outline small" onclick="editTournament('${t.id}')">EDIT</button><button class="btn success small" onclick="setTournamentStatus('${t.id}','LIVE')">LIVE</button><button class="btn outline small" onclick="setTournamentStatus('${t.id}','COMPLETED')">COMPLETE</button><button class="btn danger small" onclick="deleteTournament('${t.id}')">DELETE</button></div></div>`).join("")}</div></section>
 <section class="section"><div class="section-head"><h2>Publish Room Details</h2></div><div class="grid">${data.tournaments.map(t=>`<div class="card"><b>${esc(t.name)}</b><div class="field"><label>Room ID</label><input id="rid_${t.id}" value="${esc(t.roomId||"")}"></div><div class="field"><label>Room Password</label><input id="rp_${t.id}" value="${esc(t.roomPass||"")}"></div><button class="btn primary small" onclick="publishRoom('${t.id}')">PUBLISH ROOM</button></div>`).join("")}</div></section>
 <section class="section"><div class="section-head"><h2>Manage Results</h2><button class="btn primary small" onclick="resultModal()">+ ADD RESULT</button></div><div class="card table-wrap"><table class="table"><thead><tr><th>PLAYER</th><th>RANK</th><th>KILLS</th><th>POINTS</th><th>PRIZE</th><th></th></tr></thead><tbody>${data.results.map((r,i)=>`<tr><td>${esc(r.player)}</td><td>${r.rank}</td><td>${r.kills}</td><td>${r.points}</td><td class="gold">${money(r.prize)}</td><td><button class="btn danger small" onclick="deleteResult(${i})">×</button></td></tr>`).join("")}</tbody></table></div></section>
 </div>`
}
function adminLogin(){if(aUser.value==="admin"&&aPass.value==="battle123"){state.admin=true;render();toast("Admin demo logged in")}else adminErr.textContent="Invalid demo admin credentials."}
function createTournamentModal(t=null){
 const x=t||{name:"",banner:"",mode:"SQUAD",entry:10,prize:1000,slots:50,date:futureDate(1,0),time:"8:00 PM",rules:"Standard tournament rules.",prizes:[500,250,100,150]};
 modal(`<button class="close" onclick="closeModal()">×</button><h2>${t?"Update":"Create"} Tournament</h2>
 <div class="field"><label>Tournament Name</label><input id="fName" value="${esc(x.name)}"></div><div class="field"><label>Banner Image URL</label><input id="fBanner" value="${esc(x.banner)}"></div>
 <div class="field"><label>Game Mode</label><select id="fMode">${["SOLO","DUO","SQUAD"].map(m=>`<option ${x.mode===m?"selected":""}>${m}</option>`).join("")}</select></div>
 <div class="field"><label>Entry Fee</label><input id="fEntry" type="number" value="${x.entry}"></div><div class="field"><label>Prize Pool</label><input id="fPrize" type="number" value="${x.prize}"></div>
 <div class="field"><label>Total Slots</label><input id="fSlots" type="number" value="${x.slots}"></div><div class="field"><label>Match Date</label><input id="fDate" type="date" value="${x.date}"></div><div class="field"><label>Match Time</label><input id="fTime" value="${esc(x.time)}"></div>
 <div class="field"><label>Rules</label><textarea id="fRules">${esc(x.rules)}</textarea></div>
 <div class="field"><label>Prize Distribution (1st, 2nd, 3rd, 4th–10th)</label><input id="fPrizes" value="${(x.prizes||[]).join(",")}"></div>
 <button class="btn primary" style="width:100%" onclick="saveTournamentForm('${t?t.id:""}')">${t?"UPDATE TOURNAMENT":"CREATE TOURNAMENT"}</button>`)
}
function saveTournamentForm(id){
 const t={id:id||"t"+Date.now(),name:fName.value.trim(),banner:fBanner.value.trim(),mode:fMode.value,entry:+fEntry.value||0,prize:+fPrize.value||0,slots:+fSlots.value||1,joined:id?(data.tournaments.find(x=>x.id===id)?.joined||0):0,date:fDate.value,time:fTime.value,rules:fRules.value,prizes:fPrizes.value.split(",").map(Number),status:id?(data.tournaments.find(x=>x.id===id)?.status||"UPCOMING"):"UPCOMING",releaseMinutes:15};
 if(!t.name||!t.date)return toast("Name and date are required.");
 const i=data.tournaments.findIndex(x=>x.id===id);if(i>=0)data.tournaments[i]=t;else data.tournaments.push(t);save();closeModal();render();toast(id?"Tournament updated":"Tournament created");addNotification((id?"Tournament updated: ":"New tournament created: ")+t.name)
}
function editTournament(id){createTournamentModal(data.tournaments.find(x=>x.id===id))}
function deleteTournament(id){if(confirm("Delete this demo tournament?")){data.tournaments=data.tournaments.filter(t=>t.id!==id);save();render();toast("Tournament deleted")}}
function setTournamentStatus(id,status){const t=data.tournaments.find(x=>x.id===id);if(t){t.status=status;save();render();toast("Status updated to "+status);if(status==="LIVE")addNotification(t.name+" is now LIVE.")}}
function publishRoom(id){const t=data.tournaments.find(x=>x.id===id);t.roomId=document.getElementById("rid_"+id).value.trim();t.roomPass=document.getElementById("rp_"+id).value.trim();save();addNotification("Room details are now available for "+t.name+".");toast("Room details published");render()}
function resultModal(){modal(`<button class="close" onclick="closeModal()">×</button><h2>Add Demo Result</h2><div class="field"><label>Player</label><input id="rPlayer"></div><div class="field"><label>Rank</label><input id="rRank" type="number"></div><div class="field"><label>Kills</label><input id="rKills" type="number"></div><div class="field"><label>Points</label><input id="rPoints" type="number"></div><div class="field"><label>Prize</label><input id="rPrize" type="number"></div><button class="btn primary" style="width:100%" onclick="saveResult()">SAVE RESULT</button>`)}
function saveResult(){if(!rPlayer.value.trim())return toast("Enter player name.");data.results.push({player:rPlayer.value.trim(),rank:+rRank.value||99,kills:+rKills.value||0,points:+rPoints.value||0,prize:+rPrize.value||0});data.results.sort((a,b)=>a.rank-b.rank);save();closeModal();render();toast("Result added and leaderboard updated")}
function deleteResult(i){data.results.splice(i,1);save();render();toast("Result removed")}

/* =========================
   10. STARTUP
========================= */
init();
setTimeout(()=>{
 document.getElementById("splash").classList.add("hide");
 setTimeout(()=>{
  document.getElementById("splash").remove();
  if(data.currentUser){openApp()}else{document.getElementById("auth").classList.remove("hidden")}
 },500);
},1400);