const items=[
  ['Shampoo','Rambut','habis_pakai','ml'],
  ['Conditioner','Rambut','habis_pakai','ml'],
  ['Creambath Cream','Rambut','habis_pakai','gram'],
  ['Hair Spa Cream','Rambut','habis_pakai','gram'],
  ['Hair Mask','Rambut','habis_pakai','gram'],
  ['Hair Color','Rambut','habis_pakai','tube'],
  ['Developer','Rambut','habis_pakai','ml'],
  ['Toner Rambut','Rambut','habis_pakai','ml'],
  ['Bleaching Powder','Rambut','habis_pakai','gram'],
  ['Smoothing Cream','Rambut','habis_pakai','gram'],
  ['Rebonding Cream','Rambut','habis_pakai','gram'],
  ['Neutralizer','Rambut','habis_pakai','ml'],
  ['Keratin Treatment','Rambut','habis_pakai','ml'],
  ['Hair Extension','Rambut','habis_pakai','helai'],
  ['Extension Ring','Rambut','habis_pakai','pcs'],
  ['Hair Spray','Rambut','habis_pakai','kali pakai'],
  ['Hair Wax','Rambut','habis_pakai','gram'],
  ['Sisir','Rambut','alat','pcs'],
  ['Gunting','Rambut','alat','pcs'],
  ['Nail Polish','Kuku','habis_pakai','botol'],
  ['Cuticle Oil','Kuku','habis_pakai','ml'],
  ['Gel Polish','Kuku','habis_pakai','botol'],
  ['Rhinestones','Kuku','habis_pakai','pcs'],
  ['Nail File','Kuku','alat','pcs'],
  ['Nail Art Brush','Kuku','alat','pcs'],
  ['Peralatan Manicure Pedicure','Kuku','alat','set'],
  ['Eyebrow Pencil','Mata & Alis','habis_pakai','pcs'],
  ['Eyelash Extension','Mata & Alis','habis_pakai','set'],
  ['Eyelash Glue','Mata & Alis','habis_pakai','botol'],
  ['Eyebrow Razor','Mata & Alis','alat','pcs'],
  ['Cleanser','Wajah & Badan','habis_pakai','ml'],
  ['Toner Wajah','Wajah & Badan','habis_pakai','ml'],
  ['Facial Mask','Wajah & Badan','habis_pakai','sachet'],
  ['Acne Treatment','Wajah & Badan','habis_pakai','ml'],
  ['Brightening Serum','Wajah & Badan','habis_pakai','ml'],
  ['Massage Cream','Wajah & Badan','habis_pakai','gram'],
  ['Massage Oil','Wajah & Badan','habis_pakai','ml'],
  ['Body Scrub','Wajah & Badan','habis_pakai','gram'],
  ['Body Lotion','Wajah & Badan','habis_pakai','ml'],
  ['Body Mask','Wajah & Badan','habis_pakai','gram'],
  ['Foundation','Makeup','habis_pakai','gram'],
  ['Powder','Makeup','habis_pakai','gram'],
  ['Eyeshadow','Makeup','habis_pakai','palette'],
  ['Lipstick','Makeup','habis_pakai','pcs']
];

const use={
  Shampoo:20,Conditioner:15,'Creambath Cream':30,'Hair Spa Cream':30,'Hair Mask':30,
  'Hair Color':1,Developer:60,'Toner Rambut':30,'Bleaching Powder':30,
  'Smoothing Cream':60,'Rebonding Cream':60,Neutralizer:60,'Keratin Treatment':30,
  'Hair Extension':10,'Extension Ring':10,'Hair Spray':1,'Hair Wax':5,
  'Nail Polish':0.1,'Cuticle Oil':2,'Gel Polish':0.1,Rhinestones:10,
  'Eyebrow Pencil':0.05,'Eyelash Extension':1,'Eyelash Glue':0.1,
  Cleanser:5,'Toner Wajah':5,'Facial Mask':1,'Acne Treatment':3,'Brightening Serum':3,
  'Massage Cream':20,'Massage Oil':15,'Body Scrub':50,'Body Lotion':20,'Body Mask':50,
  Foundation:3,Powder:2,Eyeshadow:0.02,Lipstick:0.05
};

const relations={
  'Potong Rambut Wanita':['Shampoo','Sisir','Gunting'],
  'Potong Rambut Pria':['Shampoo','Sisir','Gunting'],
  'Hair Wash':['Shampoo','Conditioner'],
  'Blow Dry':['Shampoo','Conditioner'],
  Creambath:['Shampoo','Creambath Cream'],
  'Hair Spa':['Shampoo','Hair Spa Cream'],
  'Hair Mask':['Shampoo','Hair Mask'],
  'Hair Coloring Basic':['Hair Color','Developer'],
  'Hair Coloring Premium':['Hair Color','Developer','Toner Rambut'],
  'Highlight Rambut':['Bleaching Powder','Developer','Hair Color'],
  Bleaching:['Bleaching Powder','Developer'],
  Smoothing:['Smoothing Cream'],
  Rebonding:['Rebonding Cream','Neutralizer'],
  'Keratin Treatment':['Keratin Treatment'],
  'Hair Extension':['Hair Extension','Extension Ring'],
  'Hair Styling':['Hair Spray','Hair Wax'],
  Manicure:['Nail Polish','Nail File','Cuticle Oil'],
  Pedicure:['Nail Polish','Nail File','Cuticle Oil'],
  'Manicure Pedicure Paket':['Peralatan Manicure Pedicure','Nail Polish','Cuticle Oil'],
  'Nail Art Basic':['Gel Polish','Nail Art Brush'],
  'Nail Art Premium':['Gel Polish','Rhinestones','Nail Art Brush'],
  'Eyebrow Shaping':['Eyebrow Razor','Eyebrow Pencil'],
  'Eyelash Extension':['Eyelash Extension','Eyelash Glue'],
  'Facial Basic':['Cleanser','Toner Wajah','Facial Mask'],
  'Facial Acne':['Cleanser','Acne Treatment','Facial Mask'],
  'Facial Brightening':['Cleanser','Brightening Serum','Facial Mask'],
  'Totok Wajah':['Massage Cream','Massage Oil'],
  'Body Scrub':['Body Scrub','Body Lotion'],
  'Body Spa':['Body Scrub','Massage Oil','Body Mask'],
  'Makeup Party':['Foundation','Powder','Eyeshadow','Lipstick']
};

const defaultQuantity=name=>use[name]||1;
const minimum=(type,unit)=>{
  if(type==='alat')return 1;
  return ['botol','palette','pcs','sachet','tube','helai','set','kali pakai'].includes(unit)?1:5
};

module.exports={items,relations,defaultQuantity,minimum};
