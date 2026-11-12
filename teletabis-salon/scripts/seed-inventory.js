require('dotenv').config();
const mysql=require('mysql2/promise');
const{items,relations,defaultQuantity,minimum}=require('../lib/inventory-seed-data');

const pool=mysql.createPool({
  host:process.env.DB_HOST||'127.0.0.1',
  port:Number(process.env.DB_PORT||3306),
  user:process.env.DB_USER||'root',
  password:process.env.DB_PASSWORD||'',
  database:process.env.DB_NAME||'teletabis_salon',
  waitForConnections:true,
  connectionLimit:2,
  queueLimit:0
});

async function main(){
  let connection;
  try{
    connection=await pool.getConnection();
    await connection.beginTransaction();
    const inventoryIds=new Map();
    for(const[name,kategori,jenis,satuan]of items){
      await connection.execute(
        'INSERT INTO inventory(nama_barang,kategori,jenis,satuan,stok,stok_minimum) VALUES(?,?,?,?,0,?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)',
        [name,kategori,jenis,satuan,minimum(jenis,satuan)]
      );
      const[found]=await connection.execute('SELECT id FROM inventory WHERE nama_barang=?',[name]);
      inventoryIds.set(name,Number(found[0].id))
    }
    const[services]=await connection.execute('SELECT id,name FROM services');
    const serviceByName=new Map(services.map(service=>[String(service.name).toLocaleLowerCase('id-ID'),service]));
    for(const[serviceName,materialNames]of Object.entries(relations)){
      const service=serviceByName.get(serviceName.toLocaleLowerCase('id-ID'));
      if(!service){
        console.warn(`Layanan tidak ditemukan, dilewati: ${serviceName}`);
        continue
      }
      for(const name of materialNames){
        const quantity=name==='Bleaching Powder'&&serviceName==='Highlight Rambut'?40:defaultQuantity(name);
        await connection.execute(
          'INSERT INTO service_materials(service_id,inventory_id,jumlah_pakai) VALUES(?,?,?) ON DUPLICATE KEY UPDATE jumlah_pakai=jumlah_pakai',
          [service.id,inventoryIds.get(name),quantity]
        )
      }
    }
    await connection.commit();
    console.log(`Seeder stok selesai: ${items.length} barang diperiksa.`);
  }catch(error){
    await connection.rollback();
    throw error
  }finally{
    if(connection)connection.release();
    await pool.end()
  }
}

main().catch(error=>{
  console.error('Seeder stok gagal:',error.message);
  process.exitCode=1
});
