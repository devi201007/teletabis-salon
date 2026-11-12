require('dotenv').config();
const express=require('express');
const mysql=require('mysql2/promise');
const bcrypt=require('bcryptjs');
const crypto=require('crypto');
const fs=require('fs');
const path=require('path');
const helmet=require('helmet');
const rateLimit=require('express-rate-limit');
const multer=require('multer');

const app=express();
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
const pool=mysql.createPool({
  host:process.env.DB_HOST||'127.0.0.1',
  port:Number(process.env.DB_PORT||3306),
  user:process.env.DB_USER||'root',
  password:process.env.DB_PASSWORD||'',
  database:process.env.DB_NAME||'teletabis_salon',
  waitForConnections:true,
  connectionLimit:10,
  queueLimit:0,
  timezone:'Z',
  dateStrings:true
});

const keyFile=path.join(__dirname,'.datakey');
if(!fs.existsSync(keyFile))fs.writeFileSync(keyFile,crypto.randomBytes(32).toString('hex'),{flag:'wx'});
const key=Buffer.from(fs.readFileSync(keyFile,'utf8').trim(),'hex');
if(key.length!==32)throw new Error('.datakey must contain a 32-byte hexadecimal key');
const encrypt=value=>{
  const iv=crypto.randomBytes(12),cipher=crypto.createCipheriv('aes-256-gcm',key,iv);
  const data=Buffer.concat([cipher.update(value,'utf8'),cipher.final()]);
  return[iv,cipher.getAuthTag(),data].map(part=>part.toString('base64')).join('.');
};
const decrypt=value=>{
  if(!value)return'';
  try{
    const[iv,tag,data]=value.split('.').map(part=>Buffer.from(part,'base64'));
    const cipher=crypto.createDecipheriv('aes-256-gcm',key,iv);
    cipher.setAuthTag(tag);
    return Buffer.concat([cipher.update(data),cipher.final()]).toString('utf8')
  }catch{return'[gagal dekripsi]'}
};

const servicesSeed=[
  ['Potong Rambut Wanita',75000,45],['Potong Rambut Pria',50000,30],['Hair Wash',35000,30],
  ['Creambath',120000,60],['Hair Spa',150000,60],['Hair Mask',130000,45],
  ['Hair Coloring Basic',350000,120],['Hair Coloring Premium',550000,180],['Highlight Rambut',450000,180],
  ['Bleaching',600000,180],['Smoothing',450000,150],['Rebonding',500000,180],
  ['Keratin Treatment',700000,180],['Hair Extension',800000,180],['Hair Styling',100000,60],
  ['Blow Dry',80000,45],['Manicure',100000,45],['Pedicure',100000,45],
  ['Manicure Pedicure Paket',180000,75],['Nail Art Basic',150000,60],['Nail Art Premium',300000,90],
  ['Eyebrow Shaping',75000,30],['Eyelash Extension',250000,120],['Facial Basic',150000,60],
  ['Facial Acne',250000,75],['Facial Brightening',300000,75],['Totok Wajah',175000,45],
  ['Body Scrub',250000,60],['Body Spa',350000,90],['Makeup Party',500000,120]
];
const serviceDescriptions={
  'Potong Rambut Wanita':'Potongan rambut yang disesuaikan dengan bentuk wajah, tekstur rambut, dan gaya yang kamu inginkan.',
  'Potong Rambut Pria':'Potong dan rapikan rambut dengan gaya pilihanmu, dilengkapi finishing agar tampak bersih dan rapi.',
  'Hair Wash':'Keramas dan bilas rambut dengan pijatan lembut untuk membantu membersihkan kulit kepala dan menyegarkan rambut.',
  'Creambath':'Perawatan rambut dengan krim bernutrisi dan pijatan kulit kepala untuk membantu rambut terasa lebih lembut dan rileks.',
  'Hair Spa':'Perawatan intensif dengan masker rambut dan pijatan untuk membantu menjaga kelembapan serta kilau rambut.',
  'Hair Mask':'Masker rambut bernutrisi untuk membantu merawat rambut kering atau kusam agar terasa lebih halus.',
  'Hair Coloring Basic':'Pewarnaan rambut satu warna dengan pilihan warna yang dikonsultasikan terlebih dahulu bersama stylist.',
  'Hair Coloring Premium':'Pewarnaan rambut premium dengan konsultasi warna dan aplikasi lebih detail untuk hasil yang lebih personal.',
  'Highlight Rambut':'Teknik pewarnaan pada beberapa bagian rambut untuk memberi dimensi dan aksen warna.',
  'Bleaching':'Proses mencerahkan warna rambut sebagai persiapan warna tertentu, dengan konsultasi kondisi rambut sebelumnya.',
  'Smoothing':'Perawatan pelurusan untuk membantu rambut tampak lebih halus dan mudah diatur.',
  'Rebonding':'Perawatan pelurusan rambut untuk hasil yang tampak lebih lurus, rapi, dan tahan lama.',
  'Keratin Treatment':'Perawatan keratin untuk membantu menghaluskan tampilan rambut dan mengurangi kesan kusut.',
  'Hair Extension':'Penambahan rambut untuk memberi panjang atau volume sesuai gaya dan warna yang dikonsultasikan.',
  'Hair Styling':'Penataan rambut untuk acara atau aktivitas khusus sesuai inspirasi gaya pilihanmu.',
  'Blow Dry':'Pengeringan sekaligus penataan dengan blow dryer untuk hasil rambut yang lebih bervolume dan rapi.',
  'Manicure':'Perawatan kuku tangan meliputi merapikan bentuk kuku, membersihkan kutikula, dan merawat tangan.',
  'Pedicure':'Perawatan kuku kaki meliputi merapikan kuku, membersihkan area kuku, dan perawatan kaki yang menenangkan.',
  'Manicure Pedicure Paket':'Paket perawatan lengkap untuk kuku tangan dan kaki agar tampak rapi dan terawat.',
  'Nail Art Basic':'Hiasan kuku dengan desain sederhana dan pilihan warna yang dapat disesuaikan.',
  'Nail Art Premium':'Desain nail art lebih detail dengan pilihan dekorasi dan sentuhan artistik sesuai inspirasimu.',
  'Eyebrow Shaping':'Merapikan bentuk alis agar terlihat seimbang dan sesuai dengan karakter wajah.',
  'Eyelash Extension':'Aplikasi extension bulu mata untuk memberi tampilan lebih lentik dan bervolume.',
  'Facial Basic':'Perawatan wajah dasar meliputi pembersihan dan perawatan kulit agar terasa lebih segar.',
  'Facial Acne':'Perawatan wajah yang difokuskan untuk kulit berjerawat dengan tahapan yang disesuaikan kondisi kulit.',
  'Facial Brightening':'Perawatan wajah untuk membantu kulit tampak lebih cerah dan terasa lebih segar.',
  'Totok Wajah':'Pijatan lembut pada titik-titik wajah untuk membantu memberi sensasi rileks dan menyegarkan.',
  'Body Scrub':'Eksfoliasi tubuh dengan scrub untuk membantu mengangkat sel kulit mati dan membuat kulit terasa lebih halus.',
  'Body Spa':'Rangkaian perawatan tubuh yang menenangkan untuk membantu tubuh terasa rileks dan kulit terawat.',
  'Makeup Party':'Riasan untuk pesta atau acara spesial, disesuaikan dengan tema acara dan gaya yang kamu inginkan.'
};

const asyncRoute=handler=>(req,res,next)=>Promise.resolve(handler(req,res,next)).catch(next);
const execute=async(sql,params=[])=>{
  const[result]=await pool.execute(sql,params);
  return result
};
const rows=async(sql,params=[])=>{
  const[result]=await pool.execute(sql,params);
  return result
};
const row=async(sql,params=[])=>{
  const[result]=await pool.execute(sql,params);
  return result[0]||null
};
const transaction=async handler=>{
  const connection=await pool.getConnection();
  try{
    await connection.beginTransaction();
    const result=await handler(connection);
    await connection.commit();
    return result
  }catch(error){
    await connection.rollback();
    throw error
  }finally{connection.release()}
};

const audit=async(userId,action,detail,ip)=>{
  const connection=await pool.getConnection();
  let locked=false;
  try{
    const[lockRows]=await connection.query('SELECT GET_LOCK(?, 5) AS acquired',['teletabis_audit_chain']);
    if(lockRows[0].acquired!==1)throw new Error('Could not acquire audit-log lock');
    locked=true;
    await connection.beginTransaction();
    const[previousRows]=await connection.execute('SELECT hash FROM audit_log ORDER BY id DESC LIMIT 1 FOR UPDATE');
    const previous=previousRows[0]?.hash||'GENESIS';
    const timestamp=new Date().toISOString().slice(0,23).replace('T',' ');
    const safeDetail=String(detail||'').slice(0,200);
    const hash=sha(previous+timestamp+String(userId||'')+action+safeDetail);
    await connection.execute(
      'INSERT INTO audit_log(ts,user_id,action,detail,ip,prev_hash,hash) VALUES(?,?,?,?,?,?,?)',
      [timestamp,userId||null,action,safeDetail,ip||'',previous,hash]
    );
    await connection.commit()
  }catch(error){
    await connection.rollback();
    throw error
  }finally{
    if(locked)await connection.query('SELECT RELEASE_LOCK(?)',['teletabis_audit_chain']);
    connection.release()
  }
};

const permissions={customer:['booking:create','booking:own'],kasir:['booking:all','booking:update'],admin:['*']};
const can=(role,permission)=>{
  const allowed=permissions[role]||[];
  return allowed.includes('*')||allowed.includes(permission)
};
const need=permission=>asyncRoute(async(req,res,next)=>{
  if(can(req.user.role,permission))return next();
  await audit(req.user.id,'AKSES_DITOLAK',permission+' '+req.path,req.ip);
  res.status(403).json({error:'Anda tidak memiliki izin'})
});
const DAY=864e5;
const publicUser=user=>({id:user.id,name:user.name,role:user.role,mustChange:Date.now()-Number(user.pw_changed)>90*DAY});
const captchas=new Map();
const policy=/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
const policyMessage='Password minimal 8 karakter dengan huruf besar, huruf kecil, angka, dan simbol';
const loginTimeAllowed=(now=new Date())=>{
  const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Jakarta',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now);
  const hour=Number(parts.find(part=>part.type==='hour').value);
  const minute=Number(parts.find(part=>part.type==='minute').value);
  return hour*60+minute>=540&&hour*60+minute<1260
};
const jakartaDate=()=>{
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const values=Object.fromEntries(parts.map(part=>[part.type,part.value]));
  return`${values.year}-${values.month}-${values.day}`
};
const auth=asyncRoute(async(req,res,next)=>{
  const match=/^Bearer ([a-f0-9]{64})$/.exec(req.get('authorization')||'');
  if(!match)return res.status(401).json({error:'Belum login'});
  const session=await row(
    'SELECT u.*,s.expires FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=?',
    [sha(match[1])]
  );
  if(!session||Number(session.expires)<Date.now())return res.status(401).json({error:'Sesi berakhir'});
  req.user=session;
  req.token=match[1];
  next()
});

const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:5*1024*1024,files:1}});
const imageDirectory=path.join(__dirname,'public','images','services');
const imageType=buffer=>{
  if(buffer.length>=3&&buffer[0]===0xff&&buffer[1]===0xd8&&buffer[2]===0xff)return'jpg';
  if(buffer.length>=8&&buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return'png';
  if(buffer.length>=12&&buffer.toString('ascii',0,4)==='RIFF'&&buffer.toString('ascii',8,12)==='WEBP')return'webp';
  return null
};
const normalizedImageName=value=>String(value||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/(?:\.(?:jpe?g|png|webp))+$/,'').replace(/[^a-z0-9]+/g,'');
const imageSlug=value=>String(value||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const serviceImageAliases={
  'Manicure Pedicure Paket':['manicure padicure pake']
};
const serviceImageNames=name=>[name,...(serviceImageAliases[name]||[])].map(normalizedImageName);
const reconcileServiceImages=async()=>{
  fs.mkdirSync(imageDirectory,{recursive:true});
  const [services,files]=await Promise.all([
    rows('SELECT id,name,image_path FROM services'),
    fs.promises.readdir(imageDirectory,{withFileTypes:true})
  ]);
  const imageFiles=files.filter(file=>file.isFile()&&/\.(jpe?g|png|webp)$/i.test(file.name)).map(file=>file.name);
  for(const service of services){
    let filename=null;
    if(service.image_path&&service.image_path.startsWith('/images/services/')){
      const currentName=path.basename(service.image_path);
      if(imageFiles.includes(currentName)){
        const bytes=await fs.promises.readFile(path.join(imageDirectory,currentName));
        if(imageType(bytes))continue;
        await execute('UPDATE services SET image_path=NULL WHERE id=?',[service.id])
      }
    }
    if(!filename){
      const expectedNames=serviceImageNames(service.name);
      filename=imageFiles.find(file=>expectedNames.includes(normalizedImageName(path.parse(file).name)))||null
    }
    if(!filename){
      if(service.image_path)await execute('UPDATE services SET image_path=NULL WHERE id=?',[service.id]);
      continue
    }
    const sourcePath=path.join(imageDirectory,filename);
    const bytes=await fs.promises.readFile(sourcePath);
    const extension=imageType(bytes);
    if(!extension){
      if(service.image_path)await execute('UPDATE services SET image_path=NULL WHERE id=?',[service.id]);
      continue
    }
    const canonicalName=`${imageSlug(service.name)}-${service.id}.${extension}`;
    if(filename!==canonicalName){
      const canonicalPath=path.join(imageDirectory,canonicalName);
      try{
        await fs.promises.copyFile(sourcePath,canonicalPath,fs.constants.COPYFILE_EXCL)
      }catch(error){
        if(error.code!=='EEXIST')throw error
      }
    }
    const publicPath='/images/services/'+canonicalName;
    if(service.image_path!==publicPath)await execute('UPDATE services SET image_path=? WHERE id=?',[publicPath,service.id])
  }
};
const saveServiceImage=async file=>{
  if(!file)return null;
  const extension=imageType(file.buffer);
  if(!extension)throw Object.assign(new Error('File harus berupa gambar JPG, PNG, atau WebP yang valid'),{status:400});
  fs.mkdirSync(imageDirectory,{recursive:true});
  const filename=crypto.randomUUID()+'.'+extension;
  await fs.promises.writeFile(path.join(imageDirectory,filename),file.buffer,{flag:'wx'});
  return'/images/services/'+filename
};
const removeServiceImage=async imagePath=>{
  if(!imagePath||!imagePath.startsWith('/images/services/'))return;
  const filename=path.basename(imagePath);
  await fs.promises.unlink(path.join(imageDirectory,filename)).catch(error=>{
    if(error.code!=='ENOENT')throw error
  })
};
const parseService=form=>{
  const name=String(form.name||'').trim();
  const description=String(form.description||'').trim();
  const price=Number(form.price),discount=form.discount_price===''||form.discount_price==null?null:Number(form.discount_price);
  const minutes=Number(form.minutes);
  if(!name||name.length>120||!description||description.length>1500||!Number.isSafeInteger(price)||price<1||!Number.isInteger(minutes)||minutes<1||minutes>1440)
    throw Object.assign(new Error('Nama, penjelasan, harga, atau durasi layanan tidak valid'),{status:400});
  if(discount!==null&&(!Number.isSafeInteger(discount)||discount<1||discount>=price))
    throw Object.assign(new Error('Harga diskon harus lebih kecil dari harga normal'),{status:400});
  return{name,description,price,discount,minutes}
};
const ensureServiceDescriptions=async()=>{
  const columns=await rows("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='services' AND COLUMN_NAME=? ",['description']);
  if(!columns.length)await execute('ALTER TABLE services ADD COLUMN description TEXT NULL AFTER name');
  for(const[name,description]of Object.entries(serviceDescriptions))
    await execute("UPDATE services SET description=? WHERE name=? AND (description IS NULL OR TRIM(description)='')",[description,name])
};

app.set('trust proxy',process.env.TRUST_PROXY==='1'?1:false);
app.use(helmet({contentSecurityPolicy:{directives:{
  ...helmet.contentSecurityPolicy.getDefaultDirectives(),
  'style-src':["'self'",'https://fonts.googleapis.com'],
  'font-src':["'self'",'https://fonts.gstatic.com','data:'],
  'upgrade-insecure-requests':null
}}}));
app.use(express.json({limit:'10kb'}));
app.use(express.static(path.join(__dirname,'public')));
app.get(['/','/login','/layanan','/tentang-kami','/dashboard','/admin/inventory'],(req,res)=>{
  const page={'/':'index.html','/login':'login.html','/layanan':'layanan.html','/tentang-kami':'tentang-kami.html','/dashboard':'dashboard.html','/admin/inventory':'inventory.html'}[req.path];
  res.sendFile(path.join(__dirname,'public',page))
});
const limiter=rateLimit({windowMs:60000,limit:20,message:{error:'Terlalu banyak permintaan, coba lagi nanti'}});

app.post('/api/register',limiter,asyncRoute(async(req,res)=>{
  const{name,email,phone,password}=req.body||{};
  if(!name||String(name).length>60||!/^\S+@\S+\.\S+$/.test(email||'')||!/^\d{8,15}$/.test(phone||''))
    return res.status(400).json({error:'Data tidak valid (cek nama, email, dan no. HP 8-15 digit)'});
  if(!policy.test(password||''))return res.status(400).json({error:policyMessage});
  const connection=await pool.getConnection();
  let userId;
  try{
    await connection.beginTransaction();
    const passwordHash=bcrypt.hashSync(password,10);
    const[created]=await connection.execute(
      'INSERT INTO users(name,email,phone_enc,pass_hash,pw_changed) VALUES(?,?,?,?,?)',
      [String(name).trim(),String(email).toLowerCase(),encrypt(String(phone)),passwordHash,Date.now()]
    );
    userId=created.insertId;
    await connection.execute('INSERT INTO pw_history(user_id,hash) VALUES(?,?)',[userId,passwordHash]);
    await connection.commit()
  }catch(error){
    await connection.rollback();
    if(error.code==='ER_DUP_ENTRY')return res.status(409).json({error:'Email sudah terdaftar'});
    throw error
  }finally{connection.release()}
  await audit(userId,'REGISTRASI',String(email),req.ip);
  res.json({ok:true})
}));

app.get('/api/captcha',limiter,asyncRoute(async(_req,res)=>{
  const now=Date.now();
  for(const[id,captcha]of captchas)if(captcha.expires<=now)captchas.delete(id);
  if(captchas.size>=5000)return res.status(503).json({error:'CAPTCHA sedang tidak tersedia, coba lagi nanti'});
  const a=crypto.randomInt(2,10),b=crypto.randomInt(2,10),id=crypto.randomBytes(24).toString('hex');
  captchas.set(id,{answer:String(a+b),expires:now+3*60000});
  res.set('Cache-Control','no-store').json({id,question:`${a} + ${b} = ?`})
}));

app.post('/api/login',limiter,asyncRoute(async(req,res)=>{
  const{email,password,captchaId,captchaAnswer}=req.body||{};
  const key=String(captchaId||''),captcha=captchas.get(key);
  captchas.delete(key);
  if(!captcha||captcha.expires<Date.now()||String(captchaAnswer||'').trim()!==captcha.answer){
    await audit(null,'CAPTCHA_GAGAL','',req.ip);
    return res.status(400).json({error:'Jawaban CAPTCHA salah atau sudah kedaluwarsa'})
  }
  const user=await row('SELECT * FROM users WHERE email=?',[String(email||'').toLowerCase()]);
  if(user&&Number(user.locked_until)>Date.now()){
    await audit(user.id,'LOGIN_TERKUNCI','',req.ip);
    return res.status(423).json({error:'Akun terkunci 15 menit karena terlalu banyak percobaan gagal'})
  }
  if(!user||!bcrypt.compareSync(String(password||''),user.pass_hash)){
    if(user){
      const failures=Number(user.failed)+1;
      await execute('UPDATE users SET failed=?,locked_until=? WHERE id=?',[failures>=5?0:failures,failures>=5?Date.now()+15*60000:0,user.id])
    }
    await audit(user?.id||null,'LOGIN_GAGAL',String(email||'').slice(0,80),req.ip);
    return res.status(401).json({error:'Email atau password salah'})
  }
  if(process.env.LOGIN_HOURS_ENABLED==='1'&&user.role!=='customer'&&!loginTimeAllowed()){
    await audit(user.id,'LOGIN_DILUAR_JAM_KERJA','',req.ip);
    return res.status(403).json({error:'Login admin dan kasir hanya tersedia pukul 09.00–21.00 WIB setiap hari'})
  }
  await execute('UPDATE users SET failed=0,locked_until=0 WHERE id=?',[user.id]);
  const token=crypto.randomBytes(32).toString('hex');
  await execute('INSERT INTO sessions(token_hash,user_id,expires) VALUES(?,?,?)',[sha(token),user.id,Date.now()+2*3600e3]);
  await audit(user.id,'LOGIN_BERHASIL','',req.ip);
  res.set('Cache-Control','no-store').json({user:publicUser(user),token})
}));

app.post('/api/logout',auth,asyncRoute(async(req,res)=>{
  await execute('DELETE FROM sessions WHERE token_hash=?',[sha(req.token)]);
  await audit(req.user.id,'LOGOUT','',req.ip);
  res.json({ok:true})
}));
app.get('/api/me',auth,(req,res)=>res.json({user:publicUser(req.user),ip:req.ip}));
app.get('/api/services',asyncRoute(async(_req,res)=>{
  res.json(await rows('SELECT id,name,description,price,discount_price,minutes,image_path FROM services WHERE active=1 ORDER BY sort_order,id'))
}));

app.post('/api/password',auth,limiter,asyncRoute(async(req,res)=>{
  const{oldPassword,newPassword}=req.body||{};
  if(!bcrypt.compareSync(String(oldPassword||''),req.user.pass_hash))return res.status(401).json({error:'Password lama salah'});
  if(!policy.test(newPassword||''))return res.status(400).json({error:policyMessage});
  const history=await rows('SELECT hash FROM pw_history WHERE user_id=? ORDER BY id DESC LIMIT 3',[req.user.id]);
  if(history.some(item=>bcrypt.compareSync(newPassword,item.hash)))return res.status(400).json({error:'Password tidak boleh sama dengan 3 password terakhir'});
  const hash=bcrypt.hashSync(newPassword,10),changedAt=Date.now();
  await transaction(async connection=>{
    await connection.execute('UPDATE users SET pass_hash=?,pw_changed=? WHERE id=?',[hash,changedAt,req.user.id]);
    await connection.execute('INSERT INTO pw_history(user_id,hash) VALUES(?,?)',[req.user.id,hash])
  });
  await audit(req.user.id,'GANTI_PASSWORD','',req.ip);
  res.json({ok:true})
}));

app.post('/api/bookings',auth,need('booking:create'),asyncRoute(async(req,res)=>{
  const{service_id:serviceId,date,time}=req.body||{};
  if(!/^\d+$/.test(String(serviceId||''))||!/^\d{4}-\d{2}-\d{2}$/.test(date||'')||date<jakartaDate()||!/^(09|1\d|20):[0-5]\d$/.test(time||''))
    return res.status(400).json({error:'Data booking tidak valid (jam operasional 09:00-20:59)'});
  const recent=await row('SELECT COUNT(*) AS count FROM bookings WHERE user_id=? AND created>?',[req.user.id,Date.now()-36e5]);
  if(Number(recent.count)>=5){
    await audit(req.user.id,'INDIKASI_PENIPUAN','>5 booking/jam',req.ip);
    return res.status(429).json({error:'Aktivitas mencurigakan terdeteksi, booking diblokir sementara'})
  }
  const lockConnection=await pool.getConnection();
  let slotLocked=false;
  let bookingId;
  try{
    const[lockRows]=await lockConnection.query('SELECT GET_LOCK(?,5) AS acquired',['booking:'+date+':'+time]);
    if(lockRows[0].acquired!==1)return res.status(503).json({error:'Slot sedang diproses, coba lagi sebentar'});
    slotLocked=true;
    bookingId=await transaction(async connection=>{
      const[serviceRows]=await connection.execute('SELECT price,discount_price FROM services WHERE id=? AND active=1 FOR UPDATE',[serviceId]);
      const service=serviceRows[0];
      if(!service)return null;
      const[slots]=await connection.execute("SELECT COUNT(*) AS count FROM bookings WHERE booking_date=? AND booking_time=? AND status!='batal'",[date,time]);
      if(Number(slots[0].count)>=3)return null;
      const price=service.discount_price==null?service.price:service.discount_price;
      const[created]=await connection.execute('INSERT INTO bookings(user_id,service_id,booking_date,booking_time,created,price) VALUES(?,?,?,?,?,?)',[req.user.id,serviceId,date,time,Date.now(),price]);
      return created.insertId
    })
  }finally{
    try{
      if(slotLocked)await lockConnection.query('SELECT RELEASE_LOCK(?)',['booking:'+date+':'+time])
    }finally{lockConnection.release()}
  }
  if(!bookingId)return res.status(409).json({error:'Layanan tidak tersedia atau slot jam tersebut sudah penuh'});
  await audit(req.user.id,'BOOKING_DIBUAT','#'+bookingId,req.ip);
  res.json({id:bookingId})
}));

app.get('/api/bookings',auth,asyncRoute(async(req,res)=>{
  const all=can(req.user.role,'booking:all');
  const sql=`SELECT b.id,DATE_FORMAT(b.booking_date,'%Y-%m-%d') AS date,TIME_FORMAT(b.booking_time,'%H:%i') AS time,b.status,b.price,sv.name AS service,u.name AS customer
    FROM bookings b JOIN services sv ON sv.id=b.service_id JOIN users u ON u.id=b.user_id
    ${all?'':'WHERE b.user_id=?'} ORDER BY b.booking_date DESC,b.booking_time DESC`;
  res.json(await rows(sql,all?[]:[req.user.id]))
}));
app.patch('/api/bookings/:id',auth,need('booking:update'),asyncRoute(async(req,res)=>{
  const status=(req.body||{}).status;
  if(!['menunggu','dikonfirmasi','selesai','batal'].includes(status))return res.status(400).json({error:'Status tidak valid'});
  const result=await execute('UPDATE bookings SET status=? WHERE id=?',[status,req.params.id]);
  if(!result.affectedRows)return res.status(404).json({error:'Booking tidak ditemukan'});
  await audit(req.user.id,'BOOKING_STATUS','#'+req.params.id+' -> '+status,req.ip);
  res.json({ok:true})
}));

const admin=need('admin:*');
const validInventoryId=value=>/^[1-9]\d*$/.test(String(value||''));
const inventoryNumber=(value,label)=>{
  const number=Number(value);
  if(value===undefined||value===null||String(value).trim()===''||!Number.isFinite(number)||number<0||number>9999999999.99||Number(number.toFixed(2))!==number)
    throw Object.assign(new Error(label+' tidak valid (maksimal 2 angka desimal)'),{status:400});
  return number
};
const parseInventoryItem=form=>{
  const code=String(form.code||'').trim().toUpperCase();
  const name=String(form.name||'').trim();
  const category=String(form.category||'').trim();
  const unit=String(form.unit||'').trim();
  if(!/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(code)||!name||name.length>160||!category||category.length>80||!unit||unit.length>30)
    throw Object.assign(new Error('Kode, nama, kategori, atau satuan barang tidak valid'),{status:400});
  const minimum=inventoryNumber(form.low_stock_threshold,'Stok minimum');
  const purchasePrice=Number(form.purchase_price);
  if(!Number.isSafeInteger(purchasePrice)||purchasePrice<0)
    throw Object.assign(new Error('Harga beli harus bilangan bulat nol atau lebih'),{status:400});
  return{code,name,category,unit,minimum,purchasePrice}
};
app.get('/api/admin/inventory',auth,admin,asyncRoute(async(_req,res)=>{
  const items=await rows(`SELECT id,code,name,category,unit,quantity,low_stock_threshold,purchase_price
    FROM inventory_items WHERE active=1 ORDER BY category,name`);
  res.json(items.map(item=>({...item,quantity:Number(item.quantity),low_stock_threshold:Number(item.low_stock_threshold),purchase_price:Number(item.purchase_price)})))
}));
app.post('/api/admin/inventory',auth,admin,asyncRoute(async(req,res)=>{
  const item=parseInventoryItem(req.body||{});
  const stock=inventoryNumber(req.body?.quantity??0,'Stok awal');
  const itemId=await transaction(async connection=>{
    const[created]=await connection.execute(
      'INSERT INTO inventory_items(code,name,category,unit,quantity,low_stock_threshold,purchase_price) VALUES(?,?,?,?,?,?,?)',
      [item.code,item.name,item.category,item.unit,stock,item.minimum,item.purchasePrice]
    );
    if(stock>0)await connection.execute(
      "INSERT INTO inventory_movements(item_id,type,change_amount,stock_before,stock_after,note,user_id) VALUES(?,'koreksi',?,0,?,?,?)",
      [created.insertId,stock,stock,'Stok awal barang',req.user.id]
    );
    return created.insertId
  });
  await audit(req.user.id,'BARANG_DITAMBAH',item.code+' '+item.name,req.ip);
  res.status(201).json({id:itemId})
}));
app.put('/api/admin/inventory/:id',auth,admin,asyncRoute(async(req,res)=>{
  if(!validInventoryId(req.params.id))return res.status(400).json({error:'ID barang tidak valid'});
  const item=parseInventoryItem(req.body||{});
  const result=await execute(`UPDATE inventory_items SET code=?,name=?,category=?,unit=?,low_stock_threshold=?,purchase_price=?
    WHERE id=? AND active=1`,[item.code,item.name,item.category,item.unit,item.minimum,item.purchasePrice,req.params.id]);
  if(!result.affectedRows)return res.status(404).json({error:'Barang tidak ditemukan'});
  await audit(req.user.id,'BARANG_DIUBAH','#'+req.params.id+' '+item.code,req.ip);
  res.json({ok:true})
}));
app.delete('/api/admin/inventory/:id',auth,admin,asyncRoute(async(req,res)=>{
  if(!validInventoryId(req.params.id))return res.status(400).json({error:'ID barang tidak valid'});
  const result=await execute('UPDATE inventory_items SET active=0 WHERE id=? AND active=1',[req.params.id]);
  if(!result.affectedRows)return res.status(404).json({error:'Barang tidak ditemukan'});
  await audit(req.user.id,'BARANG_DIHAPUS','#'+req.params.id,req.ip);
  res.json({ok:true})
}));
app.patch('/api/admin/inventory/:id/stock',auth,admin,asyncRoute(async(req,res)=>{
  if(!validInventoryId(req.params.id))return res.status(400).json({error:'ID barang tidak valid'});
  const type=req.body?.type;
  if(!['masuk','keluar','koreksi'].includes(type))return res.status(400).json({error:'Jenis mutasi tidak valid'});
  const note=String(req.body?.note||'').trim();
  if(note.length>160)return res.status(400).json({error:'Catatan maksimal 160 karakter'});
  const amount=inventoryNumber(type==='koreksi'?req.body?.stock_actual:req.body?.quantity,type==='koreksi'?'Stok aktual':'Jumlah mutasi');
  const result=await transaction(async connection=>{
    const[items]=await connection.execute('SELECT id,name,quantity FROM inventory_items WHERE id=? AND active=1 FOR UPDATE',[req.params.id]);
    if(!items.length)throw Object.assign(new Error('Barang tidak ditemukan'),{status:404});
    const beforeCents=Math.round(Number(items[0].quantity)*100),amountCents=Math.round(amount*100);
    const afterCents=type==='masuk'?beforeCents+amountCents:type==='keluar'?beforeCents-amountCents:amountCents;
    if((type!=='koreksi'&&amountCents<=0)||afterCents<0)throw Object.assign(new Error(afterCents<0?'Stok tidak cukup untuk barang keluar':'Jumlah harus lebih besar dari nol'),{status:400});
    if(afterCents>999999999999)throw Object.assign(new Error('Stok melewati batas penyimpanan'),{status:400});
    const before=beforeCents/100,after=afterCents/100,change=(afterCents-beforeCents)/100;
    if(change===0)return{changed:false,stock:before};
    await connection.execute('UPDATE inventory_items SET quantity=? WHERE id=?',[after,req.params.id]);
    await connection.execute(
      'INSERT INTO inventory_movements(item_id,type,change_amount,stock_before,stock_after,note,user_id) VALUES(?,?,?,?,?,?,?)',
      [req.params.id,type,change,before,after,note||'Perubahan stok',req.user.id]
    );
    return{changed:true,stock:after,name:items[0].name}
  });
  if(result.changed)await audit(req.user.id,'STOK_DIUBAH',result.name+' '+type+' '+result.stock,req.ip);
  res.json({ok:true,...result})
}));
app.get('/api/admin/inventory/movements',auth,admin,asyncRoute(async(_req,res)=>{
  res.json(await rows(`SELECT m.id,m.type,m.change_amount,m.stock_before,m.stock_after,m.note,m.created_at,
      i.code,i.name,u.name AS user
    FROM inventory_movements m JOIN inventory_items i ON i.id=m.item_id
    LEFT JOIN users u ON u.id=m.user_id ORDER BY m.id DESC LIMIT 100`))
}));
app.post('/api/admin/lock-sessions',auth,admin,asyncRoute(async(req,res)=>{
  const removed=await transaction(async connection=>{
    const[result]=await connection.execute('DELETE FROM sessions');
    return result.affectedRows
  });
  await audit(req.user.id,'SEMUA_SESI_DIKUNCI',String(removed)+' sesi',req.ip);
  res.json({ok:true,revoked:removed})
}));
app.get('/api/admin/services',auth,admin,asyncRoute(async(_req,res)=>{
  res.json(await rows('SELECT id,name,description,price,discount_price,minutes,image_path FROM services WHERE active=1 ORDER BY sort_order,id'))
}));
app.post('/api/admin/services',auth,admin,upload.single('image'),asyncRoute(async(req,res)=>{
  const service=parseService(req.body||{});
  const imagePath=await saveServiceImage(req.file);
  let result;
  try{
    const position=await row('SELECT COALESCE(MAX(sort_order),0)+1 AS next FROM services');
    result=await execute(
      'INSERT INTO services(name,description,price,discount_price,minutes,image_path,active,sort_order) VALUES(?,?,?,?,?,?,1,?)',
      [service.name,service.description,service.price,service.discount,service.minutes,imagePath,position.next]
    );
  }catch(error){
    if(imagePath)await removeServiceImage(imagePath);
    throw error
  }
  await audit(req.user.id,'LAYANAN_DITAMBAH','#'+result.insertId+' '+service.name,req.ip);
  res.status(201).json({id:result.insertId})
}));
app.put('/api/admin/services/:id',auth,admin,upload.single('image'),asyncRoute(async(req,res)=>{
  const service=parseService(req.body||{});
  const current=await row('SELECT image_path FROM services WHERE id=? AND active=1',[req.params.id]);
  if(!current)return res.status(404).json({error:'Layanan tidak ditemukan'});
  const uploaded=await saveServiceImage(req.file);
  const clearImage=req.body.remove_image==='1';
  const imagePath=uploaded||(clearImage?null:current.image_path);
  try{
    await execute('UPDATE services SET name=?,description=?,price=?,discount_price=?,minutes=?,image_path=? WHERE id=? AND active=1',
      [service.name,service.description,service.price,service.discount,service.minutes,imagePath,req.params.id]);
  }catch(error){
    if(uploaded)await removeServiceImage(uploaded);
    throw error
  }
  if((uploaded||clearImage)&&current.image_path)await removeServiceImage(current.image_path);
  await audit(req.user.id,'LAYANAN_DIUBAH','#'+req.params.id+' '+service.name,req.ip);
  res.json({ok:true})
}));
app.put('/api/admin/services/:id/image',auth,admin,upload.single('image'),asyncRoute(async(req,res)=>{
  if(!req.file)return res.status(400).json({error:'Pilih foto layanan terlebih dahulu'});
  const current=await row('SELECT name,image_path FROM services WHERE id=? AND active=1',[req.params.id]);
  if(!current)return res.status(404).json({error:'Layanan tidak ditemukan'});
  const imagePath=await saveServiceImage(req.file);
  try{
    await execute('UPDATE services SET image_path=? WHERE id=? AND active=1',[imagePath,req.params.id])
  }catch(error){
    await removeServiceImage(imagePath);
    throw error
  }
  if(current.image_path)await removeServiceImage(current.image_path);
  await audit(req.user.id,'FOTO_LAYANAN_DIUNGGAH','#'+req.params.id+' '+current.name,req.ip);
  res.json({ok:true,image_path:imagePath})
}));
app.delete('/api/admin/services/:id',auth,admin,asyncRoute(async(req,res)=>{
  if(!bcrypt.compareSync(String(req.body?.password||''),req.user.pass_hash))return res.status(401).json({error:'Password admin salah'});
  const result=await execute('UPDATE services SET active=0 WHERE id=? AND active=1',[req.params.id]);
  if(!result.affectedRows)return res.status(404).json({error:'Layanan tidak ditemukan atau sudah dihapus'});
  await audit(req.user.id,'LAYANAN_DIHAPUS','#'+req.params.id,req.ip);
  res.json({ok:true})
}));
app.get('/api/admin/stats',auth,admin,asyncRoute(async(_req,res)=>{
  const counts=await rows("SELECT action,COUNT(*) AS count FROM audit_log WHERE ts>UTC_TIMESTAMP()-INTERVAL 1 DAY GROUP BY action");
  const byAction=Object.fromEntries(counts.map(item=>[item.action,Number(item.count)]));
  const users=await row('SELECT COUNT(*) AS count FROM users');
  res.json({
    'Total pengguna':Number(users.count),
    'Login gagal (24 jam)':byAction.LOGIN_GAGAL||0,
    'Akun terkunci (24 jam)':byAction.LOGIN_TERKUNCI||0,
    'Akses ditolak (24 jam)':byAction.AKSES_DITOLAK||0,
    'Indikasi penipuan (24 jam)':byAction.INDIKASI_PENIPUAN||0
  })
}));
app.get('/api/admin/users',auth,admin,asyncRoute(async(_req,res)=>{
  const users=await rows('SELECT id,name,email,role,phone_enc FROM users ORDER BY id');
  res.json(users.map(user=>({id:user.id,name:user.name,email:user.email,role:user.role,phone:decrypt(user.phone_enc),phone_cipher:user.phone_enc?user.phone_enc.slice(0,24)+'…':'Tidak tersedia'})))
}));
app.get('/api/admin/audit',auth,admin,asyncRoute(async(_req,res)=>{
  res.json(await rows('SELECT ts,user_id,action,detail,ip FROM audit_log ORDER BY id DESC LIMIT 50'))
}));
app.get('/api/admin/verify',auth,admin,asyncRoute(async(_req,res)=>{
  const log=await rows('SELECT id,ts,user_id,action,detail,prev_hash,hash FROM audit_log ORDER BY id');
  let previous='GENESIS';
  for(const entry of log){
    const timestamp=entry.ts instanceof Date?entry.ts.toISOString().slice(0,23).replace('T',' '):entry.ts;
    const expected=sha(previous+timestamp+String(entry.user_id||'')+entry.action+entry.detail);
    if(entry.prev_hash!==previous||entry.hash!==expected)return res.json({ok:false,badId:entry.id});
    previous=entry.hash
  }
  res.json({ok:true})
}));
const backupsDirectory=path.join(__dirname,'backups');
app.post('/api/admin/backup',auth,admin,asyncRoute(async(req,res)=>{
  fs.mkdirSync(backupsDirectory,{recursive:true});
  const filename=`salon-${Date.now()}.sql`;
  const filepath=path.join(backupsDirectory,filename);
  const tables=['users','pw_history','sessions','services','bookings','inventory_items','inventory_movements','audit_log'];
  const dump=[];
  const connection=await pool.getConnection();
  try{
    dump.push('SET FOREIGN_KEY_CHECKS=0;');
    for(const table of tables){
      const[definition]=await connection.query('SHOW CREATE TABLE `'+table+'`');
      dump.push('-- '+table,definition[0]['Create Table'].replace(/^CREATE TABLE /,'CREATE TABLE IF NOT EXISTS ')+';');
      const[data]=await connection.query('SELECT * FROM `'+table+'`');
      dump.push(...data.map(record=>'INSERT INTO `'+table+'` ('+Object.keys(record).map(key=>'`'+key+'`').join(',')+') VALUES ('+
        Object.values(record).map(value=>value==null?'NULL':connection.escape(value)).join(',')+');'))
    }
    dump.push('SET FOREIGN_KEY_CHECKS=1;')
  }finally{connection.release()}
  await fs.promises.writeFile(filepath,dump.join('\n')+'\n',{flag:'wx'});
  await fs.promises.writeFile(filepath+'.sha256',sha(await fs.promises.readFile(filepath)));
  await audit(req.user.id,'BACKUP_DIBUAT',filename,req.ip);
  res.json({ok:true})
}));
app.get('/api/admin/backups',auth,admin,asyncRoute(async(_req,res)=>{
  const files=fs.existsSync(backupsDirectory)?fs.readdirSync(backupsDirectory).filter(file=>file.endsWith('.sql')).sort().reverse():[];
  res.json(files.map(file=>({file,sha256:fs.existsSync(path.join(backupsDirectory,file+'.sha256'))?fs.readFileSync(path.join(backupsDirectory,file+'.sha256'),'utf8'):'Checksum tidak tersedia'})))
}));

app.use((error,_req,res,_next)=>{
  if(error instanceof multer.MulterError)return res.status(400).json({error:error.code==='LIMIT_FILE_SIZE'?'Ukuran foto maksimal 5 MB':'File foto tidak valid'});
  if(error.code==='ER_DUP_ENTRY')return res.status(409).json({error:'Data dengan kode atau nama tersebut sudah ada'});
  const status=Number(error.status)||500;
  if(status>=500)console.error(error);
  res.status(status).json({error:status>=500?'Terjadi kesalahan pada server':error.message})
});

const port=Number(process.env.PORT||3000);
const inventorySeed=require('./lib/inventory-seed-data');
const ensureInventoryTables=async()=>{
  await execute(`CREATE TABLE IF NOT EXISTS inventory_items (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    code VARCHAR(20) NOT NULL,
    name VARCHAR(160) NOT NULL,
    category VARCHAR(80) NOT NULL,
    unit VARCHAR(30) NOT NULL,
    quantity DECIMAL(12,2) UNSIGNED NOT NULL DEFAULT 0,
    low_stock_threshold DECIMAL(12,2) UNSIGNED NOT NULL DEFAULT 0,
    purchase_price BIGINT UNSIGNED NOT NULL DEFAULT 0,
    active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_inventory_code (code),
    UNIQUE KEY uq_inventory_name (name),
    KEY idx_inventory_stock (active,quantity,low_stock_threshold)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
  await execute(`CREATE TABLE IF NOT EXISTS inventory_movements (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    item_id BIGINT UNSIGNED NOT NULL,
    type ENUM('masuk','keluar','koreksi') NOT NULL,
    change_amount DECIMAL(12,2) NOT NULL,
    stock_before DECIMAL(12,2) UNSIGNED NOT NULL,
    stock_after DECIMAL(12,2) UNSIGNED NOT NULL,
    note VARCHAR(160) NOT NULL DEFAULT '',
    user_id BIGINT UNSIGNED NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_inventory_movements_item (item_id,id),
    CONSTRAINT fk_inventory_movements_item FOREIGN KEY (item_id) REFERENCES inventory_items(id) ON DELETE RESTRICT,
    CONSTRAINT fk_inventory_movements_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
  const existing=await row('SELECT COUNT(*) AS count FROM inventory_items');
  if(Number(existing.count))return;
  for(const[code,name,category,unit,quantity,minimum,purchasePrice]of inventorySeed){
    const result=await execute(
      'INSERT IGNORE INTO inventory_items(code,name,category,unit,quantity,low_stock_threshold,purchase_price) VALUES(?,?,?,?,?,?,?)',
      [code,name,category,unit,quantity,minimum,purchasePrice]
    );
    if(result.affectedRows)await execute(
      "INSERT INTO inventory_movements(item_id,type,change_amount,stock_before,stock_after,note) VALUES(?,'koreksi',?,0,?,'Stok awal dari seeder')",
      [result.insertId,quantity,quantity]
    )
  }
};
pool.query('SELECT 1').then(()=>{
  return ensureServiceDescriptions()
}).then(()=>{
  return ensureInventoryTables()
}).then(()=>{
  return reconcileServiceImages()
}).then(()=>{
  app.listen(port,()=>console.log(`Teletabis Salon berjalan di http://localhost:${port}`))
}).catch(error=>{
  console.error('Gagal terhubung ke MySQL. Periksa service MySQL, impor database.sql, dan konfigurasi .env.',error.message);
  process.exitCode=1
});
