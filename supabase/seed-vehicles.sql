-- Import vehicles from MilesCT Automobile List
-- Run this in Supabase SQL Editor after the main migrations and seed have been applied

INSERT INTO vehicles (location_id, make, model, year, vin, license_plate, notes)
SELECT 
  (SELECT id FROM locations WHERE code = '858' LIMIT 1),
  'Audi',
  'Q7',
  2019,
  'WA1VAAF71KD019689',
  'AR76937',
  NULL
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE vin = 'WA1VAAF71KD019689');

INSERT INTO vehicles (location_id, make, model, year, vin, license_plate, notes)
SELECT 
  (SELECT id FROM locations WHERE code = '858' LIMIT 1),
  'BMW',
  'M5',
  2002,
  'WBSDE93412CF91443',
  '237RXL',
  NULL
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE vin = 'WBSDE93412CF91443');

INSERT INTO vehicles (location_id, make, model, year, vin, license_plate, notes)
SELECT 
  (SELECT id FROM locations WHERE code = '858' LIMIT 1),
  'BMW',
  'M5 Competition',
  2019,
  'WBSJF0C58KB448609',
  '143ZFG',
  NULL
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE vin = 'WBSJF0C58KB448609');

INSERT INTO vehicles (location_id, make, model, year, vin, license_plate, notes)
SELECT 
  (SELECT id FROM locations WHERE code = '858' LIMIT 1),
  'Vespa',
  'Motorcycle',
  2005,
  'ZAPM319K155003629',
  '780837',
  'Emissions not necessary for motorcycle class'
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE vin = 'ZAPM319K155003629');

INSERT INTO vehicles (location_id, make, model, year, vin, license_plate, notes)
SELECT 
  (SELECT id FROM locations WHERE code = '858' LIMIT 1),
  'Jeep',
  'Grand Cherokee',
  2016,
  '1C4RJFBG3GC328006',
  '429WXJ',
  NULL
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE vin = '1C4RJFBG3GC328006');

INSERT INTO vehicles (location_id, make, model, year, vin, license_plate, notes)
SELECT 
  (SELECT id FROM locations WHERE code = '858' LIMIT 1),
  'Porsche',
  '718 Boxster',
  2022,
  'WP0CA2A83NS205186',
  'AS35080',
  NULL
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE vin = 'WP0CA2A83NS205186');

INSERT INTO vehicles (location_id, make, model, year, vin, license_plate, notes)
SELECT 
  (SELECT id FROM locations WHERE code = '858' LIMIT 1),
  'Lexus',
  'LS500h',
  2023,
  'JTHGYLGF4P5002767',
  'BT45813',
  NULL
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE vin = 'JTHGYLGF4P5002767');

INSERT INTO vehicles (location_id, make, model, year, vin, license_plate, notes)
SELECT 
  (SELECT id FROM locations WHERE code = '858' LIMIT 1),
  'BMW',
  '740i',
  2022,
  'WBA7T4C05NCK92837',
  'C433854',
  NULL
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE vin = 'WBA7T4C05NCK92837');

INSERT INTO vehicles (location_id, make, model, year, vin, license_plate, notes)
SELECT 
  (SELECT id FROM locations WHERE code = '858' LIMIT 1),
  'Tesla',
  'S90D',
  2017,
  '5YJSA1E29HF185488',
  'C107247',
  NULL
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE vin = '5YJSA1E29HF185488');

INSERT INTO vehicles (location_id, make, model, year, vin, license_plate, notes)
SELECT 
  (SELECT id FROM locations WHERE code = '858' LIMIT 1),
  'Kirkham',
  'Cobra',
  1965,
  'CT35866',
  'AS35080',
  'Purchased 2019'
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE vin = 'CT35866');

INSERT INTO vehicles (location_id, make, model, year, vin, license_plate, notes)
SELECT 
  (SELECT id FROM locations WHERE code = '858' LIMIT 1),
  'Audi',
  'S4',
  2006,
  'WAUGL78E86A130994',
  '988UKN',
  NULL
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE vin = 'WAUGL78E86A130994');

INSERT INTO vehicles (location_id, make, model, year, vin, license_plate, notes)
SELECT 
  (SELECT id FROM locations WHERE code = '858' LIMIT 1),
  'Mercedes',
  '—',
  2010,
  '4JGBF2FE2AA561622',
  '749XTD',
  NULL
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE vin = '4JGBF2FE2AA561622');

INSERT INTO vehicles (location_id, make, model, year, vin, license_plate, notes)
SELECT 
  (SELECT id FROM locations WHERE code = '858' LIMIT 1),
  'Audi',
  'Q5',
  2011,
  'WA1CFAFP4BA039901',
  '393YHH',
  'Jackson - TX'
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE vin = 'WA1CFAFP4BA039901');

INSERT INTO vehicles (location_id, make, model, year, vin, license_plate, notes)
SELECT 
  (SELECT id FROM locations WHERE code = '858' LIMIT 1),
  'Rolls Royce',
  'Casper',
  2012,
  'SCA664L50CUX65611',
  NULL,
  NULL
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE vin = 'SCA664L50CUX65611');
