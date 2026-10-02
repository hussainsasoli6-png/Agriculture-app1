const TODAY=new Date().toISOString().slice(0,10);
const STATUSES=["Booked","Checked In","Waiting","Weighing","Quality Check","Unloading","Payment Pending","Completed","Cancelled","Missed","Rejected","Delayed"];
const CROPS=["Wheat","Rice","Cotton","Maize","Sugarcane"];
const SLOTS=[["08:00","10:00"],["10:00","12:00"],["12:00","14:00"],["14:00","16:00"]];
const users=[
{user_id:1,name:"Ali Farmer",phone:"03001111111",role:"farmer",location:"Sahiwal"},
{user_id:2,name:"Bilal Farmer",phone:"03001111112",role:"farmer",location:"Okara"},
{user_id:3,name:"Staff Ahmed",phone:"03003333333",role:"staff",location:"Lahore"},
{user_id:4,name:"Inspector Sana",phone:"03004444444",role:"inspector",location:"Lahore"},
{user_id:5,name:"Admin Zara",phone:"03005555555",role:"admin",location:"Lahore"}];
const centers=[{center_id:1,center_name:"Lahore Grain Center",location:"Lahore",daily_capacity:80},{center_id:2,center_name:"Multan Procurement Center",location:"Multan",daily_capacity:60}];
let bookings=[],tokenN=0,me=null,page="",flash={},sel={center_id:1,date:TODAY,slot:null,crop:"Wheat",qty:""};
function mk(f,name,crop,qty,slot,status,x){tokenN++;bookings.push(Object.assign({booking_id:tokenN,farmer_id:f,farmer_name:name,center_id:1,slot_date:TODAY,slot_index:slot,crop_type:crop,estimated_quantity:qty,token_number:"TKN-"+String(tokenN).padStart(3,"0"),status},x||{}))}
mk(2,"Bilal Farmer","Rice",6,0,"Completed",{net_weight:5800,quality_grade:"A",moisture:12.5,price_per_kg:95,total_amount:551000,payment_status:"Paid"});
mk(1,"Ali Farmer","Maize",4,0,"Rejected",{net_weight:3900,quality_grade:"C",moisture:19.2});
mk(2,"Bilal Farmer","Wheat",8,1,"Quality Check",{gross_weight:12400,empty_weight:4300,net_weight:8100});
mk(1,"Ali Farmer","Cotton",3,1,"Waiting");mk(2,"Bilal Farmer","Wheat",5,2,"Checked In");mk(1,"Ali Farmer","Wheat",7,3,"Booked");
const $=s=>document.querySelector(s),v=id=>{const e=document.getElementById(id);return e?e.value:""};
const bc=s=>s.toLowerCase().replace(/ /g,"-"),badge=s=>`<span class="badge ${bc(s)}">${s}</span>`;
const nav={farmer:[["book","Book a Slot"],["bookings","My Bookings"]],staff:[["queue","Today's Queue"]],inspector:[["quality","Quality Check"]],admin:[["dash","Dashboard"]]};
const head=(e,t,s)=>`<div class="page-head"><div class="eyebrow">${e}</div><h1 class="page-title">${t}</h1><p class="page-sub">${s}</p></div>`;
function go(p){page=p;flash={};render()}
function login(){const u=users.find(x=>x.phone===v("ph")&&x.password===v("pw"));if(!u){flash.err="Invalid phone number or password. Please try again.";return render()}me=u;go(nav[u.role][0][0])}
function logout(){me=null;page="";render()}
function slotsFor(c,d){return SLOTS.map((t,i)=>{const used=bookings.filter(b=>b.center_id==c&&b.slot_date===d&&b.slot_index===i&&!["Cancelled","Missed"].includes(b.status)).reduce((s,b)=>s+b.estimated_quantity,0);const cap=20;return{i,start_time:t[0],end_time:t[1],capacity_tons:cap,booked_tons:used,remaining_tons:cap-used}})}
function book(){const q=parseFloat(sel.qty),s=slotsFor(sel.center_id,sel.date)[sel.slot];flash={};
if(sel.slot===null)flash.err="Please select a time slot to continue.";else if(!(q>0))flash.err="Please enter a valid estimated quantity in tons.";else if(q>s.remaining_tons)flash.err="This slot has only "+s.remaining_tons+" tons of capacity remaining.";
else if(bookings.some(b=>b.farmer_id===me.user_id&&b.slot_date===sel.date&&b.slot_index===sel.slot&&b.center_id==sel.center_id&&b.status!=="Cancelled"))flash.err="You already have a booking for this time slot.";
if(flash.err)return render();
mk(me.user_id,me.name,sel.crop,q,sel.slot,"Booked",{center_id:+sel.center_id,slot_date:sel.date});flash.token=bookings[bookings.length-1];sel.slot=null;sel.qty="";render()}
function setSt(id,s){bookings.find(b=>b.booking_id===id).status=s;render()}
function weigh(id){const g=+v("g"+id),e=+v("e"+id);if(!(g>e&&e>=0))return alert("Gross weight must be greater than empty weight.");Object.assign(bookings.find(b=>b.booking_id===id),{gross_weight:g,empty_weight:e,net_weight:g-e,status:"Quality Check"});render()}
function check(id,ok){const m=+v("m"+id);if(!(m>0))return alert("Please enter the moisture percentage.");Object.assign(bookings.find(b=>b.booking_id===id),{quality_grade:v("gr"+id),moisture:m,status:ok?"Unloading":"Rejected"});render()}
function receipt(id){const p=+v("p"+id);if(!(p>0))return alert("Please enter the rate per kg.");const b=bookings.find(x=>x.booking_id===id);Object.assign(b,{price_per_kg:p,total_amount:b.net_weight*p,payment_status:"Pending",status:"Payment Pending"});render()}
function pay(id){const b=bookings.find(x=>x.booking_id===id);b.payment_status="Paid";b.status="Completed";render()}
const money=n=>"Rs "+Number(n).toLocaleString();
const cname=id=>centers.find(c=>c.center_id==id).center_name,tm=b=>SLOTS[b.slot_index].join("-");

/* ---------- Login ---------- */
function vLogin(){return`<div class="container" style="max-width:480px"><div class="card login-card"><div class="login-logo"></div><h1 class="brand-text">AgriQueue</h1><p class="page-sub" style="text-align:center">Agricultural Procurement &amp; Digital Queue System</p>
<label class="label">Phone Number</label><input class="input" id="ph" value=""><label class="label">Password</label><input class="input" id="pw" type="password" value="">
<div class="msg-error">${flash.err||""}</div><button class="btn btn-primary" style="width:100%" onclick="login()">Sign In</button></div>
<div class="card demo"><b>Sample Accounts</b> <span class="hint">Use the password configured during setup.</span><div style="margin-top:12px">${[["03001111111","Farmer"],["03003333333","Staff"],["03004444444","Inspector"],["03005555555","Admin"]].map(d=>`<button onclick="document.getElementById('ph').value='${d[0]}'">${d[1]}</button>`).join("")}</div></div></div>`}

/* ---------- Farmer: book a slot ---------- */
function vBook(){const sl=slotsFor(sel.center_id,sel.date);const rec=sl.filter(s=>s.remaining_tons>0).sort((a,b)=>b.remaining_tons-a.remaining_tons)[0];
const t=flash.token;return`<div class="container">${t?`<div class="token-card" style="margin-bottom:20px"><div>Your Digital Token</div><h1>${t.token_number}</h1><div>${cname(t.center_id)} &middot; ${t.slot_date} &middot; ${tm(t)}</div><div>${t.crop_type}, ${t.estimated_quantity} tons</div></div>`:""}
<div class="card">${head("Farmer Portal","Book a Procurement Slot","Choose a center, date, crop and available time slot.")}
<div class="grid grid-3"><div><label class="label">Procurement Center</label><select class="input" onchange="sel.center_id=+this.value;sel.slot=null;render()">${centers.map(c=>`<option value="${c.center_id}" ${c.center_id==sel.center_id?"selected":""}>${c.center_name}</option>`).join("")}</select></div>
<div><label class="label">Date</label><input class="input" type="date" min="${TODAY}" value="${sel.date}" onchange="sel.date=this.value||TODAY;sel.slot=null;render()"></div>
<div><label class="label">Crop</label><select class="input" onchange="sel.crop=this.value">${CROPS.map(c=>`<option ${c==sel.crop?"selected":""}>${c}</option>`).join("")}</select></div></div>
<div class="grid grid-3"><div><label class="label">Estimated Quantity (tons)</label><input class="input" type="number" min="1" placeholder="e.g. 10" value="${sel.qty}" oninput="sel.qty=this.value"></div></div>
<label class="label" style="margin-top:20px">Select a Time Slot</label><div class="grid grid-4">${sl.map(s=>{const full=s.remaining_tons<=0;return`<div class="slot ${sel.slot===s.i?"sel":""} ${full?"off":""}" onclick="${full?"":`sel.slot=${s.i};render()`}"><b>${s.start_time} - ${s.end_time}</b><div class="hint">${s.remaining_tons} tons remaining</div><div style="margin-top:6px">${full?badge("Full"):badge("Available")} ${rec&&rec.i===s.i?badge("Recommended"):""}</div></div>`}).join("")}</div>
<div class="msg-error">${flash.err||""}</div><button class="btn btn-primary" onclick="book()">Confirm Booking</button></div></div>`}

/* ---------- Farmer: my bookings ---------- */
function vMine(){const l=bookings.filter(b=>b.farmer_id===me.user_id).reverse();return`<div class="container">${head("Farmer Portal","My Bookings","Track your tokens, status and payments.")}<div class="card scroll"><table class="table"><tr><th>Token</th><th>Center</th><th>Date / Time</th><th>Crop</th><th>Status</th><th>Final Amount</th><th></th></tr>${l.map(b=>`<tr><td>${b.token_number}</td><td>${cname(b.center_id)}</td><td>${b.slot_date} ${tm(b)}</td><td>${b.crop_type} (${b.estimated_quantity}t)</td><td>${badge(b.status)}</td><td>${b.total_amount?money(b.total_amount):"-"}</td><td>${b.status==="Booked"?`<button class="btn btn-sm btn-danger" onclick="setSt(${b.booking_id},'Cancelled')">Cancel</button>`:""}</td></tr>`).join("")||"<tr><td colspan=7>You have no bookings yet. Use \"Book a Slot\" to reserve a time.</td></tr>"}</table></div></div>`}

/* ---------- Staff ---------- */
function act(b){const i=b.booking_id,B=(l,s,c)=>`<button class="btn btn-sm ${c||"btn-primary"}" onclick="setSt(${i},'${s}')">${l}</button> `;
switch(b.status){case"Booked":return B("Check In","Checked In")+B("Missed","Missed","btn-danger");case"Checked In":return B("Add to Queue","Waiting")+B("Missed","Missed","btn-danger");
case"Waiting":return B("Call to Weighing","Weighing")+B("Delayed","Delayed","btn-accent");case"Delayed":return B("Add to Queue","Waiting");
case"Weighing":return`<input class="input" style="width:100px" id="g${i}" type="number" placeholder="gross kg"> <input class="input" style="width:100px" id="e${i}" type="number" placeholder="empty kg"> <button class="btn btn-sm btn-primary" onclick="weigh(${i})">Save</button>`;
case"Quality Check":return`<span class="hint">Net ${b.net_weight} kg &middot; awaiting inspection</span>`;
case"Unloading":return`<input class="input" style="width:100px" id="p${i}" type="number" placeholder="Rs/kg"> <button class="btn btn-sm btn-accent" onclick="receipt(${i})">Create Receipt</button>`;
case"Payment Pending":return`<span class="hint">${money(b.total_amount)}</span> <button class="btn btn-sm btn-primary" onclick="pay(${i})">Payment Received</button>`;default:return""}}
function vQueue(){const l=bookings.filter(b=>b.slot_date===TODAY);return`<div class="container">${head("Staff Portal","Today's Queue","Live queue for "+TODAY+".")}<div class="card scroll"><table class="table"><tr><th>Token</th><th>Farmer</th><th>Crop</th><th>Time</th><th>Status</th><th>Action</th></tr>${l.map(b=>`<tr><td>${b.token_number}</td><td>${b.farmer_name}</td><td>${b.crop_type} (${b.estimated_quantity}t)</td><td>${tm(b)}</td><td>${badge(b.status)}</td><td>${act(b)}</td></tr>`).join("")||"<tr><td colspan=6>No bookings are scheduled for today.</td></tr>"}</table></div></div>`}

/* ---------- Inspector ---------- */
function vQual(){const l=bookings.filter(b=>b.status==="Quality Check");return`<div class="container">${head("Inspector Portal","Quality Check",l.length+" awaiting inspection.")}${l.map(b=>`<div class="card"><b>${b.token_number}</b> ${b.farmer_name}, ${b.crop_type}, net ${b.net_weight} kg<div class="grid grid-4"><div><label class="label">Grade</label><select class="input" id="gr${b.booking_id}"><option>A</option><option>B</option><option>C</option></select></div><div><label class="label">Moisture %</label><input class="input" id="m${b.booking_id}" type="number" step="0.1"></div></div><div class="row" style="margin-top:14px"><button class="btn btn-primary" onclick="check(${b.booking_id},true)">Accept</button><button class="btn btn-danger" onclick="check(${b.booking_id},false)">Reject</button></div></div>`).join("")||`<div class="card">No items are awaiting quality inspection. New items appear here once weighing is completed.</div>`}</div>`}

/* ---------- Admin dashboard ---------- */
function vDash(){const t=bookings.filter(b=>b.slot_date===TODAY),by=f=>t.filter(f).length,cap=centers.reduce((s,c)=>s+c.daily_capacity,0),used=t.filter(b=>!["Cancelled","Missed"].includes(b.status)).reduce((s,b)=>s+b.estimated_quantity,0);
const crop=CROPS.map(c=>[c,bookings.filter(b=>b.crop_type===c&&b.net_weight&&b.status!=="Rejected").reduce((s,b)=>s+b.net_weight,0)]),mx=Math.max(1,...crop.map(c=>c[1]));
const gr=["A","B","C"].map(g=>[g,bookings.filter(b=>b.quality_grade===g).length]),gm=Math.max(1,...gr.map(g=>g[1]));
const S=(n,l)=>`<div class="card"><div class="stat">${n}</div><div class="stat-l">${l}</div></div>`;
const R=(l,n,w)=>`<div class="bar-row"><div>${l} <b>${n}</b></div><div class="bar-track"><div class="bar" style="width:${w}%"></div></div></div>`;
return`<div class="container">${head("Administration","Procurement Dashboard","Live overview of today's procurement operations.")}<div class="grid grid-6">${S(users.filter(u=>u.role==="farmer").length,"Registered Farmers")}${S(t.length,"Today's Bookings")}${S(by(b=>b.status==="Waiting"),"Waiting in Queue")}${S(Math.round(used/cap*100)+"%","Capacity Used ("+used+"/"+cap+" tons)")}${S(by(b=>b.status==="Completed"),"Completed")}${S(by(b=>b.status==="Rejected"),"Rejected")}</div>
<div class="grid grid-2"><div class="card"><div class="card-head"><h3>Crop Received</h3><span>(kg)</span></div>${crop.map(c=>R(c[0],c[1].toLocaleString(),c[1]/mx*100)).join("")}</div>
<div class="card"><div class="card-head"><h3>Quality Grades</h3></div>${gr.map(g=>R("Grade "+g[0],g[1],g[1]/gm*100)).join("")}</div></div></div>`}

function render(){const V={book:vBook,bookings:vMine,queue:vQueue,quality:vQual,dash:vDash};
$("#app").innerHTML=me?`<div class="nav"><b>AgriQueue</b>${nav[me.role].map(n=>`<a class="${page===n[0]?"on":""}" onclick="go('${n[0]}')">${n[1]}</a>`).join("")}<span class="nav-user">${me.name}</span><span class="badge ${me.role}">${me.role}</span><a onclick="logout()">Logout</a></div>${V[page]()}`:`<div class="nav"><b>AgriQueue</b></div>`+vLogin()}
render();