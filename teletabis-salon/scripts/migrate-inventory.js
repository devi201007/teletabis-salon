require('dotenv').config();
const mysql=require('mysql2/promise');

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

const tables=[
  `CREATE TABLE IF NOT EXISTS inventory (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nama_barang VARCHAR(160) NOT NULL,
    kategori VARCHAR(40) NOT NULL,
    jenis ENUM('habis_pakai','alat') NOT NULL,
    satuan VARCHAR(30) NOT NULL,
    stok DECIMAL(10,2) UNSIGNED NOT NULL DEFAULT 0,
    stok_minimum DECIMAL(10,2) UNSIGNED NOT NULL DEFAULT 0,
    deleted_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_inventory_nama_barang (nama_barang),
    KEY idx_inventory_kategori (kategori,deleted_at),
    KEY idx_inventory_stok (stok,stok_minimum),
    CONSTRAINT chk_inventory_kategori CHECK (kategori IN ('Rambut','Kuku','Mata & Alis','Wajah & Badan','Makeup')),
    CONSTRAINT chk_inventory_stok_minimum CHECK (stok_minimum >= 0)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS service_materials (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    service_id BIGINT UNSIGNED NOT NULL,
    inventory_id BIGINT UNSIGNED NOT NULL,
    jumlah_pakai DECIMAL(10,2) UNSIGNED NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_service_material (service_id,inventory_id),
    KEY idx_service_material_inventory (inventory_id),
    CONSTRAINT fk_service_material_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    CONSTRAINT fk_service_material_inventory FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE RESTRICT,
    CONSTRAINT chk_service_material_quantity CHECK (jumlah_pakai > 0)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS inventory_logs (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    inventory_id BIGINT UNSIGNED NULL,
    booking_id BIGINT UNSIGNED NULL,
    tipe ENUM('masuk','keluar','koreksi') NOT NULL,
    jumlah DECIMAL(10,2) NOT NULL,
    stok_sebelum DECIMAL(10,2) UNSIGNED NOT NULL,
    stok_sesudah DECIMAL(10,2) UNSIGNED NOT NULL,
    nama_barang VARCHAR(160) NOT NULL,
    keterangan VARCHAR(200) NOT NULL DEFAULT '',
    created_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_inventory_logs_inventory (inventory_id,id),
    KEY idx_inventory_logs_booking (booking_id,id),
    CONSTRAINT fk_inventory_logs_inventory FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE SET NULL,
    CONSTRAINT fk_inventory_logs_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
    CONSTRAINT fk_inventory_logs_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS booking_inventory_usage (
    booking_id BIGINT UNSIGNED NOT NULL,
    inventory_id BIGINT UNSIGNED NOT NULL,
    nama_barang VARCHAR(160) NOT NULL,
    jumlah_pakai DECIMAL(10,2) UNSIGNED NOT NULL,
    PRIMARY KEY (booking_id,inventory_id),
    CONSTRAINT fk_booking_inventory_usage_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    CONSTRAINT fk_booking_inventory_usage_inventory FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE RESTRICT
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
];

async function main(){
  let connection;
  try{
    connection=await pool.getConnection();
    const[bookings]=await connection.execute(
      "SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='bookings' AND COLUMN_NAME='stok_dipotong'"
    );
    if(!Number(bookings[0].count)){
      await connection.query('ALTER TABLE bookings ADD COLUMN stok_dipotong TINYINT(1) NOT NULL DEFAULT 0 AFTER status')
    }
    for(const sql of tables)await connection.query(sql);
    console.log('Migrasi stok berhasil diterapkan.');
  }finally{
    if(connection)connection.release();
    await pool.end()
  }
}

main().catch(error=>{
  console.error('Migrasi stok gagal:',error.message);
  process.exitCode=1
});
