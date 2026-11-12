const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),rp=n=>'Rp '+Number(n).toLocaleString('id-ID');
const localToday=()=>{const now=new Date();now.setMinutes(now.getMinutes()-now.getTimezoneOffset());return now.toISOString().slice(0,10)};
async function api(p,m='GET',b){
  const isForm=b instanceof FormData;
  const headers={};
  if(b&&!isForm)headers['Content-Type']='application/json';
  const token=sessionStorage.getItem('teletabisSessionToken');
  if(token)headers.Authorization=`Bearer ${token}`;
  const r=await fetch('/api'+p,{method:m,credentials:'omit',headers:Object.keys(headers).length?headers:undefined,body:b?(isForm?b:JSON.stringify(b)):undefined}),d=await r.json().catch(()=>({}));
  if(!r.ok){const e=new Error(d.error||'Terjadi kesalahan');e.status=r.status;throw e}
  return d
}
const toast=(m,ok=true)=>{const t=$('#toast');t.textContent=m;t.className=ok?'ok':'err';t.hidden=false;setTimeout(()=>t.hidden=true,3500)};
const tbl=(h,r)=>`<div class="tw"><table><tr>${h.map(x=>`<th>${x}</th>`).join('')}</tr>${r.map(x=>`<tr>${x.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')||'<tr><td colspan="'+h.length+'">Belum ada data</td></tr>'}</table></div>`;
let me=null,services=[],adminServices=[],inventoryItems=[],currentIp='';

function setupPasswordVisibility(){
  document.querySelectorAll('input[type="password"]').forEach(input=>{
    const wrapper=document.createElement('div');
    wrapper.className='password-field';
    input.parentNode.insertBefore(wrapper,input);
    wrapper.append(input);
    const button=document.createElement('button');
    button.type='button';
    button.className='password-toggle';
    button.dataset.act='toggle-password';
    button.setAttribute('aria-label','Lihat password');
    button.setAttribute('aria-pressed','false');
    button.textContent='Lihat';
    wrapper.append(button)
  })
}

async function init(){
  const page=document.body.dataset.page;
  setupPasswordVisibility();
  try{const session=await api('/me');me=session.user;currentIp=session.ip}catch(e){if(e.status===401)sessionStorage.removeItem('teletabisSessionToken');else throw e}
  const staff=me&&me.role!=='customer';
  if(me&&(page==='login'||staff&&page!=='dashboard'&&!(page==='inventory'&&me.role==='admin'))){location.replace('/dashboard');return}
  if(page==='dashboard'&&!me){location.replace('/login');return}
  if(page==='inventory'&&(!me||me.role!=='admin')){location.replace(me?'/dashboard':'/login');return}
  if(page==='home'||page==='services'||page==='dashboard'&&me.role==='customer')services=await api('/services');
  renderNav(page);
  if(page==='home')renderHomeServices();
  if(page==='services')renderServices();
  if(page==='login')refreshCaptcha($('#f-login')).catch(e=>toast(e.message,false));
  if(page==='dashboard')initDashboard();
  if(page==='inventory')initInventory();
  setupServiceImages();
  if(me)window.setInterval(async()=>{
    if(document.visibilityState!=='visible')return;
    try{await api('/me')}catch(e){if(e.status===401){sessionStorage.removeItem('teletabisSessionToken');location.replace('/login')}}
  },5000);
}

function renderNav(page){
  const staff=me&&me.role!=='customer';
  $('.brand').href=staff?'/dashboard':'/';
  const links=staff?me.role==='admin'&&page==='inventory'?'<a href="/dashboard">Kategori admin</a>':'':`<a href="/"${page==='home'?' aria-current="page"':''}>Beranda</a><a href="/layanan"${page==='services'?' aria-current="page"':''}>Layanan</a><a href="/tentang-kami"${page==='about'?' aria-current="page"':''}>Tentang kami</a>`;
  const account=me?`${!staff?'<a href="/dashboard">Dashboard</a>':''}<a href="/login" target="_blank" rel="noopener">Masuk di tab baru</a><span class="nav-user">${esc(me.name)} · <b>${esc(me.role)}</b></span><button class="nav-cta" data-act="out">Keluar</button>`:`<a class="nav-cta" href="/login"${page==='login'?' aria-current="page"':''}>Masuk</a>`;
  $('#nav').innerHTML=links+account;
}

async function refreshCaptcha(form){
  const c=await api('/captcha');
  form.elements.captchaId.value=c.id;
  form.elements.captchaAnswer.value='';
  $('#captcha-question').textContent=c.question
}

const servicePhoto=s=>{
  const image=s.image_path?`<img src="${esc(s.image_path)}" alt="${esc(s.name)}" loading="lazy">`:'';
  return `<div class="service-photo"><span class="photo-placeholder" aria-hidden="true"><img src="/logo.png" alt=""></span>${image}</div>`
};
const servicePrice=s=>s.discount_price==null?`<b>${rp(s.price)}</b>`:`<span class="sale-price"><b>${rp(s.discount_price)}</b><del>${rp(s.price)}</del></span>`;
const serviceCard=s=>`<article class="service-card">${servicePhoto(s)}<div class="service-card-body"><h2>${esc(s.name)}</h2><p>${esc(s.description||'Tanyakan detail perawatan ini kepada tim Teletabis Salon.')}</p><div class="service-meta">${servicePrice(s)}<span>${s.minutes} menit</span></div><button class="service-detail-button" type="button" data-act="service-details" data-id="${s.id}">Lihat detail <span aria-hidden="true">→</span></button></div></article>`;
function setupServiceImages(){
  $('#app').querySelectorAll('.service-photo img,.service-admin-photo img,.salon-photo-frame img,.team-photo-frame img').forEach(img=>{
    const frame=img.parentElement;
    img.addEventListener('load',()=>frame.classList.add('photo-ready'),{once:true});
    img.addEventListener('error',()=>img.remove(),{once:true});
    if(img.complete&&img.naturalWidth)frame.classList.add('photo-ready')
  })
}
function renderHomeServices(){
  $('#home-service-list').innerHTML=services.slice(0,3).map((s,i)=>`<article class="home-service">${servicePhoto(s)}<div class="home-service-body"><span class="service-number">0${i+1}</span><h3>${esc(s.name)}</h3><p>${esc(s.description||'Tanyakan detail perawatan ini kepada tim Teletabis Salon.')}</p><div class="service-meta">${servicePrice(s)}<span>${s.minutes} menit</span></div><button class="service-detail-button" type="button" data-act="service-details" data-id="${s.id}">Lihat detail <span aria-hidden="true">→</span></button></div></article>`).join('');
  setupServiceImages()
}
function renderServices(){
  $('#service-list').innerHTML=services.map(serviceCard).join('');
  setupServiceImages()
}

function initDashboard(){
  document.querySelectorAll('[data-role]').forEach(el=>{el.hidden=el.dataset.role!==me.role});
  const identity=`${me.role==='admin'?'Admin':me.role==='kasir'?'Kasir':'Pelanggan'} - ${me.name}`;
  const watermark=$('#dashboard-watermark');
  $('#watermark-identity').textContent=identity;
  $('#watermark-ip').textContent=currentIp||'Tidak tersedia';
  watermark.hidden=false;
  $('#booking-title').textContent=me.role==='customer'?'Booking Saya':'Booking Kasir';
  $('#booking-panel').hidden=me.role==='admin';
  $('#password-warning').hidden=!me.mustChange;
  if(me.role==='customer'){
    $('#booking-service').innerHTML=services.map(s=>`<option value="${s.id}">${esc(s.name)} — ${rp(s.discount_price??s.price)}</option>`).join('');
    $('#booking-date').min=localToday()
  }
  if(me.role==='admin'){
    $('#f-pw').hidden=true;
    initAdminCategories()
  }else load().catch(e=>toast(e.message,false))
}

async function load(){
  const staff=me.role!=='customer',b=await api('/bookings');
  $('#bk').innerHTML=tbl(['Tanggal','Jam','Layanan','Nominal','Pelanggan','Status'],b.map(x=>[
    esc(x.date),esc(x.time),esc(x.service),rp(x.price),esc(x.customer),
    staff?`<select data-sel data-id="${x.id}">${['menunggu','dikonfirmasi','selesai','batal'].map(o=>`<option${o===x.status?' selected':''}>${o}</option>`).join('')}</select>`:esc(x.status)
  ]))
}

async function loadAdminSecurity(){
  const[st,us,au,bk]=await Promise.all([api('/admin/stats'),api('/admin/users'),api('/admin/audit'),api('/admin/backups')]);
  $('#st').innerHTML=Object.entries(st).map(([k,v])=>`<div class="svc"><b>${v}</b><span>${esc(k)}</span></div>`).join('');
  $('#us').innerHTML=tbl(['Nama','Email','Role','HP (dekripsi)','Tersimpan di DB'],us.map(u=>[esc(u.name),esc(u.email),esc(u.role),esc(u.phone),`<code>${esc(u.phone_cipher)}</code>`]));
  $('#au').innerHTML=tbl(['Waktu','User','Aksi','Detail','IP'],au.map(x=>[esc(x.ts.slice(0,19).replace('T',' ')),esc(x.user_id??'-'),esc(x.action),esc(x.detail),esc(x.ip)]));
  $('#bkp').innerHTML=bk.map(f=>`<li>${esc(f.file)}<br><code>SHA-256: ${esc(f.sha256)}</code></li>`).join('')||'<li>Belum ada backup</li>';
}
async function loadAdminServices(){
  const serviceList=await api('/admin/services');
  adminServices=serviceList;
  $('#admin-services').innerHTML=tbl(['Foto','Layanan','Harga','Aksi'],serviceList.map(s=>[
    `<div class="service-admin-photo"><span class="service-no-image">${s.image_path?'Foto tidak ditemukan':'Belum ada foto'}</span>${s.image_path?`<img class="service-admin-thumb" src="${esc(s.image_path)}" alt="Foto ${esc(s.name)}" loading="lazy">`:''}</div>`,
    `${esc(s.name)}<br><small>${esc(s.description||'')}</small>`,servicePrice(s),`<div class="service-actions"><button class="secondary-button" type="button" data-act="service-image-picker" data-id="${s.id}">Ganti foto</button><input class="service-row-upload" type="file" accept="image/jpeg,image/png,image/webp" data-service-upload="${s.id}" aria-label="Pilih foto ${esc(s.name)}"><button class="secondary-button" type="button" data-act="edit-service" data-id="${s.id}">Edit</button><button class="danger-button" type="button" data-act="delete-service" data-id="${s.id}" data-name="${esc(s.name)}">Hapus</button></div>`
  ]));
  setupServiceImages()
}
function initAdminCategories(){
  const show=()=>{
    const category=location.hash.slice(1);
    const security=category==='security',servicesPage=category==='services';
    $('#admin-categories').hidden=security||servicesPage;
    $('#admin-security').hidden=!security;
    $('#admin-services-page').hidden=!servicesPage;
    $('#f-pw').hidden=!security;
    $('#password-warning').hidden=!me.mustChange||!security;
    if(security)loadAdminSecurity().catch(e=>toast(e.message,false));
    if(servicesPage)loadAdminServices().catch(e=>toast(e.message,false))
  };
  window.addEventListener('hashchange',show);
  show()
}
const stockNumber=value=>Number(value).toLocaleString('id-ID',{maximumFractionDigits:2});
async function loadInventory(){
  const[items,movements]=await Promise.all([api('/admin/inventory'),api('/admin/inventory/movements')]);
  inventoryItems=items;
  $('#inventory-list').innerHTML=tbl(['Kode','Barang','Kategori','Stok','Minimum','Status','Aksi'],items.map(item=>[
    esc(item.code),`${esc(item.name)}<br><small>${esc(item.unit)} · ${rp(item.purchase_price)}/satuan</small>`,esc(item.category),
    `${stockNumber(item.quantity)} ${esc(item.unit)}`,`${stockNumber(item.low_stock_threshold)} ${esc(item.unit)}`,
    item.quantity<=item.low_stock_threshold?'<span class="inventory-low">Stok rendah</span>':'<span class="inventory-good">Aman</span>',
    `<div class="service-actions"><button class="secondary-button" type="button" data-act="edit-inventory" data-id="${item.id}">Edit</button><button class="danger-button" type="button" data-act="delete-inventory" data-id="${item.id}" data-name="${esc(item.name)}">Hapus</button></div>`
  ]));
  $('#stock-item').innerHTML=items.map(item=>`<option value="${item.id}">${esc(item.code)} · ${esc(item.name)} (${stockNumber(item.quantity)} ${esc(item.unit)})</option>`).join('');
  $('#inventory-movements').innerHTML=tbl(['Waktu','Barang','Jenis','Perubahan','Stok sebelum → sesudah','Catatan','User'],movements.map(item=>[
    esc(String(item.created_at).slice(0,19).replace('T',' ')),`${esc(item.code)} · ${esc(item.name)}`,esc(item.type),
    `${Number(item.change_amount)>0?'+':''}${stockNumber(item.change_amount)}`,
    `${stockNumber(item.stock_before)} → ${stockNumber(item.stock_after)}`,esc(item.note),esc(item.user||'—')
  ]))
}
function initInventory(){
  loadInventory().catch(e=>toast(e.message,false))
}

const fd=f=>Object.fromEntries(new FormData(f));
const resetServiceForm=()=>{
  const form=$('#f-service'),preview=$('#service-image-preview');
  form.reset();form.elements.id.value='';
  $('#service-form-title').textContent='Tambah layanan';
  $('#service-submit').textContent='Tambah layanan';
  form.querySelector('[data-act="cancel-service-edit"]').hidden=true;
  preview.hidden=true;
  $('#service-image-preview-img').removeAttribute('src');
  $('#service-image-preview-name').textContent=''
};
const resetInventoryForm=()=>{
  const form=$('#f-inventory');
  form.reset();
  form.elements.id.value='';
  $('#inventory-initial-stock').hidden=false;
  form.elements.quantity.required=true;
  $('#inventory-form-title').textContent='Tambah Barang';
  $('#inventory-submit').textContent='Tambah Barang';
  form.querySelector('[data-act="cancel-inventory-edit"]').hidden=true
};
document.addEventListener('submit',async e=>{
  const f=e.target,id=f.id,d=fd(f);
  if(!['f-login','f-reg','f-book','f-pw','f-delete-service','f-service','f-inventory','f-stock'].includes(id))return;
  e.preventDefault();
  try{
    if(id==='f-login'){
      const session=await api('/login','POST',d);
      if(/^[a-f0-9]{64}$/.test(session.token||''))sessionStorage.setItem('teletabisSessionToken',session.token);
      else throw new Error('Server masih memakai versi login lama. Restart server dengan Ctrl+C, lalu jalankan npm start lagi.');
      location.assign('/dashboard')
    }
    else if(id==='f-reg'){await api('/register','POST',d);toast('Pendaftaran berhasil, silakan masuk');f.reset()}
    else if(id==='f-book'){d.service_id=+d.service_id;await api('/bookings','POST',d);toast('Booking berhasil dibuat');f.reset();load()}
    else if(id==='f-pw'){await api('/password','POST',d);toast('Password berhasil diganti');f.reset();me.mustChange=false;$('#password-warning').hidden=true}
    else if(id==='f-delete-service'){await api('/admin/services/'+encodeURIComponent(d.serviceId),'DELETE',{password:d.password});$('#delete-service-dialog').close();f.reset();toast('Layanan dihapus dari katalog');await loadAdminServices()}
    else if(id==='f-service'){
      const serviceId=d.id,body=new FormData(f);
      body.delete('id');
      await api('/admin/services'+(serviceId?'/'+encodeURIComponent(serviceId):''),serviceId?'PUT':'POST',body);
      resetServiceForm();
      toast(serviceId?'Layanan berhasil diperbarui':'Layanan berhasil ditambahkan');
      await loadAdminServices()
    }
    else if(id==='f-inventory'){
      const itemId=d.id;
      delete d.id;
      await api('/admin/inventory'+(itemId?'/'+encodeURIComponent(itemId):''),itemId?'PUT':'POST',d);
      resetInventoryForm();
      toast(itemId?'Barang berhasil diperbarui':'Barang berhasil ditambahkan');
      await loadInventory()
    }
    else if(id==='f-stock'){
      const itemId=d.item_id,type=d.type,body={type,note:d.note};
      if(type==='koreksi')body.stock_actual=d.quantity;
      else body.quantity=d.quantity;
      await api('/admin/inventory/'+encodeURIComponent(itemId)+'/stock','PATCH',body);
      f.reset();
      toast('Mutasi stok berhasil disimpan');
      await loadInventory()
    }
  }catch(x){
    if(id==='f-login')try{await refreshCaptcha(f)}catch(c){toast(c.message,false)}
    if(id==='f-delete-service')f.elements.password.value='';
    toast(x.message,false)
  }
});

document.addEventListener('click',async e=>{
  const button=e.target.closest('[data-act]'),a=button&&button.dataset.act;
  if(!a)return;
  try{
    if(a==='captcha'){await refreshCaptcha($('#f-login'));return}
    if(a==='toggle-password'){
      const input=button.parentElement.querySelector('input');
      const visible=input.type==='password';
      input.type=visible?'text':'password';
      button.textContent=visible?'Sembunyikan':'Lihat';
      button.setAttribute('aria-label',visible?'Sembunyikan password':'Lihat password');
      button.setAttribute('aria-pressed',String(visible));
      return
    }
    if(a==='out'){await api('/logout','POST');sessionStorage.removeItem('teletabisSessionToken');location.assign('/');return}
    if(a==='verify'){const r=await api('/admin/verify');toast(r.ok?'Log audit utuh: tidak ada manipulasi ✔':'Log dimanipulasi! Entri #'+r.badId,r.ok)}
    if(a==='backup'){await api('/admin/backup','POST');toast('Backup dibuat');await loadAdminSecurity()}
    if(a==='edit-inventory'){
      const item=inventoryItems.find(entry=>String(entry.id)===button.dataset.id);
      if(!item)throw new Error('Barang tidak ditemukan; muat ulang halaman');
      const form=$('#f-inventory');
      form.reset();
      form.elements.id.value=item.id;
      form.elements.code.value=item.code;
      form.elements.name.value=item.name;
      form.elements.category.value=item.category;
      form.elements.unit.value=item.unit;
      form.elements.low_stock_threshold.value=item.low_stock_threshold;
      form.elements.purchase_price.value=item.purchase_price;
      form.elements.quantity.required=false;
      $('#inventory-initial-stock').hidden=true;
      $('#inventory-form-title').textContent='Edit Barang';
      $('#inventory-submit').textContent='Simpan Perubahan';
      form.querySelector('[data-act="cancel-inventory-edit"]').hidden=false;
      form.scrollIntoView({behavior:'smooth',block:'center'});
      form.elements.name.focus()
    }
    if(a==='cancel-inventory-edit')resetInventoryForm();
    if(a==='delete-inventory'){
      if(!window.confirm('Hapus '+button.dataset.name+' dari daftar barang? Riwayat stok tetap tersimpan.'))return;
      await api('/admin/inventory/'+encodeURIComponent(button.dataset.id),'DELETE');
      toast('Barang dihapus dari daftar');
      await loadInventory()
    }
    if(a==='delete-service'){
      const form=$('#f-delete-service');
      form.reset();
      form.elements.serviceId.value=button.dataset.id;
      $('#delete-service-name').textContent=button.dataset.name;
      $('#delete-service-dialog').showModal();
      form.elements.password.focus()
    }
    if(a==='service-image-picker'){
      const input=button.parentElement.querySelector(`[data-service-upload="${CSS.escape(button.dataset.id)}"]`);
      if(!input)throw new Error('Kolom unggah foto tidak ditemukan');
      input.click()
    }
    if(a==='close-delete')$('#delete-service-dialog').close();
    if(a==='service-details'){
      const service=services.find(item=>String(item.id)===button.dataset.id);
      if(!service)throw new Error('Detail layanan tidak tersedia; muat ulang halaman');
      const dialog=$('#service-details-dialog');
      $('#service-details-title').textContent=service.name;
      $('#service-details-description').textContent=service.description||'Tanyakan detail perawatan ini kepada tim Teletabis Salon.';
      $('#service-details-meta').innerHTML=`${servicePrice(service)}<span>${service.minutes} menit</span>`;
      $('#service-details-photo').innerHTML=service.image_path
        ?`<img src="${esc(service.image_path)}" alt="${esc(service.name)}">`
        :'<img src="/logo.png" alt="Logo Teletabis Salon">';
      dialog.showModal();
      return
    }
    if(a==='close-service-details')$('#service-details-dialog').close();
    if(a==='edit-service'){
      const service=adminServices.find(item=>String(item.id)===button.dataset.id);
      if(!service)throw new Error('Data layanan tidak ditemukan; muat ulang halaman');
      const form=$('#f-service');
      form.reset();
      form.elements.id.value=service.id;
      form.elements.name.value=service.name;
      form.elements.description.value=service.description||'';
      form.elements.price.value=service.price;
      form.elements.discount_price.value=service.discount_price??'';
      form.elements.minutes.value=service.minutes;
      const preview=$('#service-image-preview');
      if(service.image_path){
        $('#service-image-preview-img').src=service.image_path;
        $('#service-image-preview-name').textContent='Foto tersimpan · pilih file baru untuk menggantinya';
        preview.hidden=false
      }else{
        preview.hidden=true;
        $('#service-image-preview-img').removeAttribute('src');
        $('#service-image-preview-name').textContent='Belum ada foto tersimpan'
      }
      $('#service-form-title').textContent='Edit layanan';
      $('#service-submit').textContent='Simpan perubahan';
      form.querySelector('[data-act="cancel-service-edit"]').hidden=false;
      form.scrollIntoView({behavior:'smooth',block:'center'});
      form.elements.name.focus()
    }
    if(a==='cancel-service-edit'){
      resetServiceForm()
    }
    if(a==='panic'){
      if(!window.confirm('Kunci semua sesi login di semua perangkat? Semua pengguna harus login ulang.'))return;
      const result=await api('/admin/lock-sessions','POST',{});
      toast(`${result.revoked} sesi berhasil dikunci`);
      window.setTimeout(()=>location.replace('/login'),1200)
    }
  }catch(x){toast(x.message,false)}
});

document.addEventListener('change',async e=>{
  if(e.target.matches('#stock-type')){
    $('#stock-quantity-label').textContent=e.target.value==='koreksi'?'Stok aktual':'Jumlah';
    $('#f-stock').elements.quantity.min=e.target.value==='koreksi'?'0':'0.01';
    return
  }
  if(e.target.matches('[data-service-upload]')){
    const input=e.target,file=input.files[0],serviceId=input.dataset.serviceUpload;
    if(!file)return;
    const form=new FormData();
    form.set('image',file);
    input.disabled=true;
    try{
      await api('/admin/services/'+encodeURIComponent(serviceId)+'/image','PUT',form);
      toast('Foto layanan berhasil diunggah dan ditampilkan di website');
      await loadAdminServices()
    }catch(error){toast(error.message,false)}
    finally{input.value='';input.disabled=false}
    return
  }
  if(e.target.matches('#f-service input[name="image"]')){
    const input=e.target,file=input.files[0],preview=$('#service-image-preview');
    if(!file){
      if(!$('#f-service').elements.id.value)preview.hidden=true;
      return
    }
    const objectUrl=URL.createObjectURL(file);
    const image=$('#service-image-preview-img');
    image.onload=()=>URL.revokeObjectURL(objectUrl);
    image.onerror=()=>{URL.revokeObjectURL(objectUrl);toast('Foto tidak dapat dibuka; pilih JPG, PNG, atau WebP yang valid',false)};
    image.src=objectUrl;
    $('#service-image-preview-name').textContent=file.name;
    preview.hidden=false;
    return
  }
  if(!e.target.matches('[data-sel]'))return;
  try{await api('/bookings/'+e.target.dataset.id,'PATCH',{status:e.target.value});toast('Status diperbarui')}
  catch(x){toast(x.message,false)}
});

init().catch(e=>toast(e.message,false));
