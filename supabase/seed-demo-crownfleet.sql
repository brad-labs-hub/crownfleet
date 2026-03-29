-- =============================================================================
-- Crown Fleet — Demo Seed Data
-- =============================================================================
-- Prerequisites : All migrations applied (npm run db:push / supabase db push)
-- Target        : DEMO Supabase project only — do NOT run on production
-- Run           : Paste into Supabase SQL Editor and execute
--
-- Reset (wipes only demo rows):
--   DELETE FROM receipts           WHERE notes LIKE '[DEMO]%';
--   DELETE FROM maintenance_alerts WHERE alert_type LIKE 'demo_%' OR notes LIKE '[DEMO]%';
--   DELETE FROM maintenance_records WHERE notes LIKE '[DEMO]%';
--   DELETE FROM vehicle_warranties  WHERE notes LIKE '[DEMO]%';
--   DELETE FROM vehicle_documents   WHERE notes LIKE '[DEMO]%';
--   DELETE FROM insurance           WHERE notes LIKE '[DEMO]%';
--   DELETE FROM registrations       WHERE notes LIKE '[DEMO]%';
--   DELETE FROM vehicles            WHERE vin LIKE '1DEMFLEET%';
--   DELETE FROM locations           WHERE code LIKE 'CROWN-%';
-- =============================================================================

-- =============================================================================
-- SECTION 1: Locations (5 multi-state hubs)
-- =============================================================================

INSERT INTO locations (code, name, address) VALUES
  ('CROWN-CT',  'Greenwich, CT',        '1 Round Hill Rd, Greenwich, CT 06831'),
  ('CROWN-NYC', '432 Park Avenue, NYC', '432 Park Ave, New York, NY 10022'),
  ('CROWN-FL',  'Palm Beach, FL',       '100 Worth Ave, Palm Beach, FL 33480'),
  ('CROWN-CA',  'Beverly Hills, CA',    '9500 Wilshire Blvd, Beverly Hills, CA 90212'),
  ('CROWN-SC',  'Kiawah Island, SC',    '1 Sanctuary Beach Dr, Kiawah Island, SC 29455')
ON CONFLICT (code) DO NOTHING;

-- =============================================================================
-- SECTION 2: Vehicles (10 luxury vehicles, synthetic VINs prefix 1DEMFLEET)
-- =============================================================================

-- 1. Mercedes-Benz G 63 AMG — Greenwich, CT
INSERT INTO vehicles (location_id, make, model, year, vin, license_plate, color, trim, status, notes)
SELECT
  (SELECT id FROM locations WHERE code = 'CROWN-CT'),
  'Mercedes-Benz', 'G 63 AMG', 2023, '1DEMFLEET00000001', 'CROWN-001', 'Obsidian Black Metallic',
  'AMG G 63', 'active', '[DEMO] Crown Fleet demo vehicle'
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE vin = '1DEMFLEET00000001');

-- 2. Porsche Cayenne Turbo GT — Greenwich, CT
INSERT INTO vehicles (location_id, make, model, year, vin, license_plate, color, trim, status, notes)
SELECT
  (SELECT id FROM locations WHERE code = 'CROWN-CT'),
  'Porsche', 'Cayenne Turbo GT', 2023, '1DEMFLEET00000002', 'CROWN-002', 'Carrara White Metallic',
  'Turbo GT', 'active', '[DEMO] Crown Fleet demo vehicle'
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE vin = '1DEMFLEET00000002');

-- 3. Mercedes-Benz S 580 4MATIC — New York, NY
INSERT INTO vehicles (location_id, make, model, year, vin, license_plate, color, trim, status, notes)
SELECT
  (SELECT id FROM locations WHERE code = 'CROWN-NYC'),
  'Mercedes-Benz', 'S 580 4MATIC', 2022, '1DEMFLEET00000003', 'CROWN-003', 'Selenite Grey Metallic',
  'S 580 4MATIC', 'active', '[DEMO] Crown Fleet demo vehicle'
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE vin = '1DEMFLEET00000003');

-- 4. BMW X7 xDrive50i — New York, NY
INSERT INTO vehicles (location_id, make, model, year, vin, license_plate, color, trim, status, notes)
SELECT
  (SELECT id FROM locations WHERE code = 'CROWN-NYC'),
  'BMW', 'X7 xDrive50i', 2023, '1DEMFLEET00000004', 'CROWN-004', 'Alpine White',
  'xDrive50i', 'active', '[DEMO] Crown Fleet demo vehicle'
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE vin = '1DEMFLEET00000004');

-- 5. BMW M5 Competition — Palm Beach, FL
INSERT INTO vehicles (location_id, make, model, year, vin, license_plate, color, trim, status, notes)
SELECT
  (SELECT id FROM locations WHERE code = 'CROWN-FL'),
  'BMW', 'M5 Competition', 2022, '1DEMFLEET00000005', 'CROWN-005', 'Marina Bay Blue Metallic',
  'Competition', 'active', '[DEMO] Crown Fleet demo vehicle'
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE vin = '1DEMFLEET00000005');

-- 6. Range Rover Autobiography LWB — Palm Beach, FL
INSERT INTO vehicles (location_id, make, model, year, vin, license_plate, color, trim, status, notes)
SELECT
  (SELECT id FROM locations WHERE code = 'CROWN-FL'),
  'Land Rover', 'Range Rover Autobiography LWB', 2023, '1DEMFLEET00000006', 'CROWN-006', 'Santorini Black Premium Metallic',
  'Autobiography LWB', 'active', '[DEMO] Crown Fleet demo vehicle'
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE vin = '1DEMFLEET00000006');

-- 7. Bentley Bentayga EWB — Beverly Hills, CA
INSERT INTO vehicles (location_id, make, model, year, vin, license_plate, color, trim, status, notes)
SELECT
  (SELECT id FROM locations WHERE code = 'CROWN-CA'),
  'Bentley', 'Bentayga EWB', 2022, '1DEMFLEET00000007', 'CROWN-007', 'Beluga Black',
  'Azure', 'active', '[DEMO] Crown Fleet demo vehicle'
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE vin = '1DEMFLEET00000007');

-- 8. Rolls-Royce Ghost Black Badge — Beverly Hills, CA
INSERT INTO vehicles (location_id, make, model, year, vin, license_plate, color, trim, status, notes)
SELECT
  (SELECT id FROM locations WHERE code = 'CROWN-CA'),
  'Rolls-Royce', 'Ghost Black Badge', 2023, '1DEMFLEET00000008', 'CROWN-008', 'Black Diamond',
  'Black Badge', 'active', '[DEMO] Crown Fleet demo vehicle'
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE vin = '1DEMFLEET00000008');

-- 9. Lamborghini Urus Performante — Kiawah Island, SC
INSERT INTO vehicles (location_id, make, model, year, vin, license_plate, color, trim, status, notes)
SELECT
  (SELECT id FROM locations WHERE code = 'CROWN-SC'),
  'Lamborghini', 'Urus Performante', 2023, '1DEMFLEET00000009', 'CROWN-009', 'Giallo Orion',
  'Performante', 'active', '[DEMO] Crown Fleet demo vehicle'
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE vin = '1DEMFLEET00000009');

-- 10. Ferrari Purosangue — Kiawah Island, SC
INSERT INTO vehicles (location_id, make, model, year, vin, license_plate, color, trim, status, notes)
SELECT
  (SELECT id FROM locations WHERE code = 'CROWN-SC'),
  'Ferrari', 'Purosangue', 2024, '1DEMFLEET0000000A', 'CROWN-010', 'Rosso Corsa',
  'V12', 'active', '[DEMO] Crown Fleet demo vehicle'
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE vin = '1DEMFLEET0000000A');

-- =============================================================================
-- SECTION 3: Registrations (varied states, mix of near-term and long-dated)
-- =============================================================================
-- Near-term expiries (within 90 days) on vehicles 1, 3, 5, 9
-- Long-dated on all others

-- Vehicle 1 — CT (expires in 38 days — near-term)
INSERT INTO registrations (vehicle_id, state, expiry_date, notes)
SELECT v.id, 'CT', NOW()::date + 38, '[DEMO]'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000001'
AND NOT EXISTS (SELECT 1 FROM registrations r WHERE r.vehicle_id = v.id AND r.state = 'CT' AND r.notes = '[DEMO]');

-- Vehicle 2 — CT (expires in 14 months)
INSERT INTO registrations (vehicle_id, state, expiry_date, notes)
SELECT v.id, 'CT', NOW()::date + 420, '[DEMO]'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000002'
AND NOT EXISTS (SELECT 1 FROM registrations r WHERE r.vehicle_id = v.id AND r.state = 'CT' AND r.notes = '[DEMO]');

-- Vehicle 3 — NY (expires in 55 days — near-term)
INSERT INTO registrations (vehicle_id, state, expiry_date, notes)
SELECT v.id, 'NY', NOW()::date + 55, '[DEMO]'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000003'
AND NOT EXISTS (SELECT 1 FROM registrations r WHERE r.vehicle_id = v.id AND r.state = 'NY' AND r.notes = '[DEMO]');

-- Vehicle 4 — NY (expires in 18 months)
INSERT INTO registrations (vehicle_id, state, expiry_date, notes)
SELECT v.id, 'NY', NOW()::date + 548, '[DEMO]'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000004'
AND NOT EXISTS (SELECT 1 FROM registrations r WHERE r.vehicle_id = v.id AND r.state = 'NY' AND r.notes = '[DEMO]');

-- Vehicle 5 — FL (expires in 72 days — near-term)
INSERT INTO registrations (vehicle_id, state, expiry_date, notes)
SELECT v.id, 'FL', NOW()::date + 72, '[DEMO]'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000005'
AND NOT EXISTS (SELECT 1 FROM registrations r WHERE r.vehicle_id = v.id AND r.state = 'FL' AND r.notes = '[DEMO]');

-- Vehicle 6 — FL (expires in 20 months)
INSERT INTO registrations (vehicle_id, state, expiry_date, notes)
SELECT v.id, 'FL', NOW()::date + 608, '[DEMO]'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000006'
AND NOT EXISTS (SELECT 1 FROM registrations r WHERE r.vehicle_id = v.id AND r.state = 'FL' AND r.notes = '[DEMO]');

-- Vehicle 7 — CA (expires in 22 months)
INSERT INTO registrations (vehicle_id, state, expiry_date, notes)
SELECT v.id, 'CA', NOW()::date + 670, '[DEMO]'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000007'
AND NOT EXISTS (SELECT 1 FROM registrations r WHERE r.vehicle_id = v.id AND r.state = 'CA' AND r.notes = '[DEMO]');

-- Vehicle 8 — CA (expires in 10 months)
INSERT INTO registrations (vehicle_id, state, expiry_date, notes)
SELECT v.id, 'CA', NOW()::date + 305, '[DEMO]'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000008'
AND NOT EXISTS (SELECT 1 FROM registrations r WHERE r.vehicle_id = v.id AND r.state = 'CA' AND r.notes = '[DEMO]');

-- Vehicle 9 — SC (expires in 25 days — near-term)
INSERT INTO registrations (vehicle_id, state, expiry_date, notes)
SELECT v.id, 'SC', NOW()::date + 25, '[DEMO]'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000009'
AND NOT EXISTS (SELECT 1 FROM registrations r WHERE r.vehicle_id = v.id AND r.state = 'SC' AND r.notes = '[DEMO]');

-- Vehicle 10 — SC (expires in 16 months)
INSERT INTO registrations (vehicle_id, state, expiry_date, notes)
SELECT v.id, 'SC', NOW()::date + 487, '[DEMO]'
FROM vehicles v WHERE v.vin = '1DEMFLEET0000000A'
AND NOT EXISTS (SELECT 1 FROM registrations r WHERE r.vehicle_id = v.id AND r.state = 'SC' AND r.notes = '[DEMO]');

-- =============================================================================
-- SECTION 4: Insurance (1 per vehicle, mixed near/far expiries)
-- =============================================================================
-- Vehicles 2, 6, 8 expire within 60 days — will show in expiring-soon

-- Vehicle 1 — Chubb (15 months out)
INSERT INTO insurance (vehicle_id, provider, policy_number, expiry_date, notes)
SELECT v.id, 'Chubb Personal Risk Services', 'CHB-2023-CROWN-001', NOW()::date + 456, '[DEMO]'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000001'
AND NOT EXISTS (SELECT 1 FROM insurance i WHERE i.vehicle_id = v.id AND i.notes = '[DEMO]');

-- Vehicle 2 — Pure Insurance (48 days — near-term)
INSERT INTO insurance (vehicle_id, provider, policy_number, expiry_date, notes)
SELECT v.id, 'Pure Insurance', 'PURE-2024-CROWN-002', NOW()::date + 48, '[DEMO]'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000002'
AND NOT EXISTS (SELECT 1 FROM insurance i WHERE i.vehicle_id = v.id AND i.notes = '[DEMO]');

-- Vehicle 3 — AIG Private Client (20 months out)
INSERT INTO insurance (vehicle_id, provider, policy_number, expiry_date, notes)
SELECT v.id, 'AIG Private Client Group', 'AIG-2023-CROWN-003', NOW()::date + 608, '[DEMO]'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000003'
AND NOT EXISTS (SELECT 1 FROM insurance i WHERE i.vehicle_id = v.id AND i.notes = '[DEMO]');

-- Vehicle 4 — Berkley One (12 months out)
INSERT INTO insurance (vehicle_id, provider, policy_number, expiry_date, notes)
SELECT v.id, 'Berkley One', 'BKLY-2024-CROWN-004', NOW()::date + 365, '[DEMO]'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000004'
AND NOT EXISTS (SELECT 1 FROM insurance i WHERE i.vehicle_id = v.id AND i.notes = '[DEMO]');

-- Vehicle 5 — Chubb (18 months out)
INSERT INTO insurance (vehicle_id, provider, policy_number, expiry_date, notes)
SELECT v.id, 'Chubb Personal Risk Services', 'CHB-2024-CROWN-005', NOW()::date + 548, '[DEMO]'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000005'
AND NOT EXISTS (SELECT 1 FROM insurance i WHERE i.vehicle_id = v.id AND i.notes = '[DEMO]');

-- Vehicle 6 — Pure Insurance (31 days — near-term)
INSERT INTO insurance (vehicle_id, provider, policy_number, expiry_date, notes)
SELECT v.id, 'Pure Insurance', 'PURE-2023-CROWN-006', NOW()::date + 31, '[DEMO]'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000006'
AND NOT EXISTS (SELECT 1 FROM insurance i WHERE i.vehicle_id = v.id AND i.notes = '[DEMO]');

-- Vehicle 7 — AIG Private Client (24 months out)
INSERT INTO insurance (vehicle_id, provider, policy_number, expiry_date, notes)
SELECT v.id, 'AIG Private Client Group', 'AIG-2024-CROWN-007', NOW()::date + 730, '[DEMO]'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000007'
AND NOT EXISTS (SELECT 1 FROM insurance i WHERE i.vehicle_id = v.id AND i.notes = '[DEMO]');

-- Vehicle 8 — Berkley One (57 days — near-term)
INSERT INTO insurance (vehicle_id, provider, policy_number, expiry_date, notes)
SELECT v.id, 'Berkley One', 'BKLY-2023-CROWN-008', NOW()::date + 57, '[DEMO]'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000008'
AND NOT EXISTS (SELECT 1 FROM insurance i WHERE i.vehicle_id = v.id AND i.notes = '[DEMO]');

-- Vehicle 9 — Chubb (14 months out)
INSERT INTO insurance (vehicle_id, provider, policy_number, expiry_date, notes)
SELECT v.id, 'Chubb Personal Risk Services', 'CHB-2024-CROWN-009', NOW()::date + 426, '[DEMO]'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000009'
AND NOT EXISTS (SELECT 1 FROM insurance i WHERE i.vehicle_id = v.id AND i.notes = '[DEMO]');

-- Vehicle 10 — Pure Insurance (22 months out)
INSERT INTO insurance (vehicle_id, provider, policy_number, expiry_date, notes)
SELECT v.id, 'Pure Insurance', 'PURE-2024-CROWN-010', NOW()::date + 670, '[DEMO]'
FROM vehicles v WHERE v.vin = '1DEMFLEET0000000A'
AND NOT EXISTS (SELECT 1 FROM insurance i WHERE i.vehicle_id = v.id AND i.notes = '[DEMO]');

-- =============================================================================
-- SECTION 5: Vehicle Warranties (2 per vehicle = 20 rows)
-- bumper_to_bumper: some near-expiry; powertrain_warranty: 3-5 years out
-- =============================================================================

-- Vehicle 1
INSERT INTO vehicle_warranties (vehicle_id, warranty_type, expiry_date, expiry_miles, notes)
SELECT v.id, 'bumper_to_bumper', NOW()::date + 180, 52000, '[DEMO] expires ~6 months'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000001'
AND NOT EXISTS (SELECT 1 FROM vehicle_warranties w WHERE w.vehicle_id = v.id AND w.warranty_type = 'bumper_to_bumper' AND w.notes LIKE '[DEMO]%');

INSERT INTO vehicle_warranties (vehicle_id, warranty_type, expiry_date, expiry_miles, notes)
SELECT v.id, 'powertrain_warranty', NOW()::date + 1460, 100000, '[DEMO] 4 years out'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000001'
AND NOT EXISTS (SELECT 1 FROM vehicle_warranties w WHERE w.vehicle_id = v.id AND w.warranty_type = 'powertrain_warranty' AND w.notes LIKE '[DEMO]%');

-- Vehicle 2
INSERT INTO vehicle_warranties (vehicle_id, warranty_type, expiry_date, expiry_miles, notes)
SELECT v.id, 'bumper_to_bumper', NOW()::date + 90, 48000, '[DEMO] expires ~3 months'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000002'
AND NOT EXISTS (SELECT 1 FROM vehicle_warranties w WHERE w.vehicle_id = v.id AND w.warranty_type = 'bumper_to_bumper' AND w.notes LIKE '[DEMO]%');

INSERT INTO vehicle_warranties (vehicle_id, warranty_type, expiry_date, expiry_miles, notes)
SELECT v.id, 'powertrain_warranty', NOW()::date + 1825, 120000, '[DEMO] 5 years out'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000002'
AND NOT EXISTS (SELECT 1 FROM vehicle_warranties w WHERE w.vehicle_id = v.id AND w.warranty_type = 'powertrain_warranty' AND w.notes LIKE '[DEMO]%');

-- Vehicle 3
INSERT INTO vehicle_warranties (vehicle_id, warranty_type, expiry_date, expiry_miles, notes)
SELECT v.id, 'bumper_to_bumper', NOW()::date + 548, 36000, '[DEMO] 18 months out'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000003'
AND NOT EXISTS (SELECT 1 FROM vehicle_warranties w WHERE w.vehicle_id = v.id AND w.warranty_type = 'bumper_to_bumper' AND w.notes LIKE '[DEMO]%');

INSERT INTO vehicle_warranties (vehicle_id, warranty_type, expiry_date, expiry_miles, notes)
SELECT v.id, 'powertrain_warranty', NOW()::date + 1277, 80000, '[DEMO] 3.5 years out'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000003'
AND NOT EXISTS (SELECT 1 FROM vehicle_warranties w WHERE w.vehicle_id = v.id AND w.warranty_type = 'powertrain_warranty' AND w.notes LIKE '[DEMO]%');

-- Vehicle 4
INSERT INTO vehicle_warranties (vehicle_id, warranty_type, expiry_date, expiry_miles, notes)
SELECT v.id, 'bumper_to_bumper', NOW()::date + 365, 50000, '[DEMO] 12 months out'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000004'
AND NOT EXISTS (SELECT 1 FROM vehicle_warranties w WHERE w.vehicle_id = v.id AND w.warranty_type = 'bumper_to_bumper' AND w.notes LIKE '[DEMO]%');

INSERT INTO vehicle_warranties (vehicle_id, warranty_type, expiry_date, expiry_miles, notes)
SELECT v.id, 'powertrain_warranty', NOW()::date + 1642, 100000, '[DEMO] 4.5 years out'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000004'
AND NOT EXISTS (SELECT 1 FROM vehicle_warranties w WHERE w.vehicle_id = v.id AND w.warranty_type = 'powertrain_warranty' AND w.notes LIKE '[DEMO]%');

-- Vehicle 5
INSERT INTO vehicle_warranties (vehicle_id, warranty_type, expiry_date, expiry_miles, notes)
SELECT v.id, 'bumper_to_bumper', NOW()::date + 45, 60000, '[DEMO] expires ~6 weeks'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000005'
AND NOT EXISTS (SELECT 1 FROM vehicle_warranties w WHERE w.vehicle_id = v.id AND w.warranty_type = 'bumper_to_bumper' AND w.notes LIKE '[DEMO]%');

INSERT INTO vehicle_warranties (vehicle_id, warranty_type, expiry_date, expiry_miles, notes)
SELECT v.id, 'powertrain_warranty', NOW()::date + 1095, 75000, '[DEMO] 3 years out'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000005'
AND NOT EXISTS (SELECT 1 FROM vehicle_warranties w WHERE w.vehicle_id = v.id AND w.warranty_type = 'powertrain_warranty' AND w.notes LIKE '[DEMO]%');

-- Vehicle 6
INSERT INTO vehicle_warranties (vehicle_id, warranty_type, expiry_date, expiry_miles, notes)
SELECT v.id, 'bumper_to_bumper', NOW()::date + 730, 36000, '[DEMO] 2 years out'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000006'
AND NOT EXISTS (SELECT 1 FROM vehicle_warranties w WHERE w.vehicle_id = v.id AND w.warranty_type = 'bumper_to_bumper' AND w.notes LIKE '[DEMO]%');

INSERT INTO vehicle_warranties (vehicle_id, warranty_type, expiry_date, expiry_miles, notes)
SELECT v.id, 'powertrain_warranty', NOW()::date + 1825, 100000, '[DEMO] 5 years out'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000006'
AND NOT EXISTS (SELECT 1 FROM vehicle_warranties w WHERE w.vehicle_id = v.id AND w.warranty_type = 'powertrain_warranty' AND w.notes LIKE '[DEMO]%');

-- Vehicle 7
INSERT INTO vehicle_warranties (vehicle_id, warranty_type, expiry_date, expiry_miles, notes)
SELECT v.id, 'bumper_to_bumper', NOW()::date + 425, 30000, '[DEMO] 14 months out'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000007'
AND NOT EXISTS (SELECT 1 FROM vehicle_warranties w WHERE w.vehicle_id = v.id AND w.warranty_type = 'bumper_to_bumper' AND w.notes LIKE '[DEMO]%');

INSERT INTO vehicle_warranties (vehicle_id, warranty_type, expiry_date, expiry_miles, notes)
SELECT v.id, 'powertrain_warranty', NOW()::date + 1460, 60000, '[DEMO] 4 years out'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000007'
AND NOT EXISTS (SELECT 1 FROM vehicle_warranties w WHERE w.vehicle_id = v.id AND w.warranty_type = 'powertrain_warranty' AND w.notes LIKE '[DEMO]%');

-- Vehicle 8
INSERT INTO vehicle_warranties (vehicle_id, warranty_type, expiry_date, expiry_miles, notes)
SELECT v.id, 'bumper_to_bumper', NOW()::date + 60, 40000, '[DEMO] expires ~2 months'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000008'
AND NOT EXISTS (SELECT 1 FROM vehicle_warranties w WHERE w.vehicle_id = v.id AND w.warranty_type = 'bumper_to_bumper' AND w.notes LIKE '[DEMO]%');

INSERT INTO vehicle_warranties (vehicle_id, warranty_type, expiry_date, expiry_miles, notes)
SELECT v.id, 'powertrain_warranty', NOW()::date + 1277, 80000, '[DEMO] 3.5 years out'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000008'
AND NOT EXISTS (SELECT 1 FROM vehicle_warranties w WHERE w.vehicle_id = v.id AND w.warranty_type = 'powertrain_warranty' AND w.notes LIKE '[DEMO]%');

-- Vehicle 9
INSERT INTO vehicle_warranties (vehicle_id, warranty_type, expiry_date, expiry_miles, notes)
SELECT v.id, 'bumper_to_bumper', NOW()::date + 300, 36000, '[DEMO] ~10 months out'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000009'
AND NOT EXISTS (SELECT 1 FROM vehicle_warranties w WHERE w.vehicle_id = v.id AND w.warranty_type = 'bumper_to_bumper' AND w.notes LIKE '[DEMO]%');

INSERT INTO vehicle_warranties (vehicle_id, warranty_type, expiry_date, expiry_miles, notes)
SELECT v.id, 'powertrain_warranty', NOW()::date + 1642, 100000, '[DEMO] 4.5 years out'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000009'
AND NOT EXISTS (SELECT 1 FROM vehicle_warranties w WHERE w.vehicle_id = v.id AND w.warranty_type = 'powertrain_warranty' AND w.notes LIKE '[DEMO]%');

-- Vehicle 10
INSERT INTO vehicle_warranties (vehicle_id, warranty_type, expiry_date, expiry_miles, notes)
SELECT v.id, 'bumper_to_bumper', NOW()::date + 910, 25000, '[DEMO] 2.5 years out'
FROM vehicles v WHERE v.vin = '1DEMFLEET0000000A'
AND NOT EXISTS (SELECT 1 FROM vehicle_warranties w WHERE w.vehicle_id = v.id AND w.warranty_type = 'bumper_to_bumper' AND w.notes LIKE '[DEMO]%');

INSERT INTO vehicle_warranties (vehicle_id, warranty_type, expiry_date, expiry_miles, notes)
SELECT v.id, 'powertrain_warranty', NOW()::date + 1825, 80000, '[DEMO] 5 years out'
FROM vehicles v WHERE v.vin = '1DEMFLEET0000000A'
AND NOT EXISTS (SELECT 1 FROM vehicle_warranties w WHERE w.vehicle_id = v.id AND w.warranty_type = 'powertrain_warranty' AND w.notes LIKE '[DEMO]%');

-- =============================================================================
-- SECTION 6: Receipts (32 rows, all 8 receipt_category values)
-- Notes prefixed [DEMO] for easy identification and cleanup
-- Dates span from 18 months ago to 1 month ago
-- =============================================================================

-- GAS (5 rows)
INSERT INTO receipts (vehicle_id, location_id, category, amount, date, vendor, notes)
SELECT v.id, v.location_id, 'gas', 187.42, NOW()::date - 540, 'Mobil', '[DEMO] G 63 fill-up Greenwich'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000001'
AND NOT EXISTS (SELECT 1 FROM receipts r WHERE r.vehicle_id = v.id AND r.vendor = 'Mobil' AND r.notes = '[DEMO] G 63 fill-up Greenwich');

INSERT INTO receipts (vehicle_id, location_id, category, amount, date, vendor, notes)
SELECT v.id, v.location_id, 'gas', 203.11, NOW()::date - 390, 'Shell', '[DEMO] Cayenne fill-up I-95'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000002'
AND NOT EXISTS (SELECT 1 FROM receipts r WHERE r.vehicle_id = v.id AND r.vendor = 'Shell' AND r.notes = '[DEMO] Cayenne fill-up I-95');

INSERT INTO receipts (vehicle_id, location_id, category, amount, date, vendor, notes)
SELECT v.id, v.location_id, 'gas', 148.75, NOW()::date - 280, 'Sunoco', '[DEMO] M5 fill-up Palm Beach'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000005'
AND NOT EXISTS (SELECT 1 FROM receipts r WHERE r.vehicle_id = v.id AND r.vendor = 'Sunoco' AND r.notes = '[DEMO] M5 fill-up Palm Beach');

INSERT INTO receipts (vehicle_id, location_id, category, amount, date, vendor, notes)
SELECT v.id, v.location_id, 'gas', 312.90, NOW()::date - 150, 'Chevron', '[DEMO] Urus fill-up SC'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000009'
AND NOT EXISTS (SELECT 1 FROM receipts r WHERE r.vehicle_id = v.id AND r.vendor = 'Chevron' AND r.notes = '[DEMO] Urus fill-up SC');

INSERT INTO receipts (vehicle_id, location_id, category, amount, date, vendor, notes)
SELECT v.id, v.location_id, 'gas', 425.00, NOW()::date - 45, 'Arco', '[DEMO] Bentayga fill-up Beverly Hills'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000007'
AND NOT EXISTS (SELECT 1 FROM receipts r WHERE r.vehicle_id = v.id AND r.vendor = 'Arco' AND r.notes = '[DEMO] Bentayga fill-up Beverly Hills');

-- DETAILING (4 rows)
INSERT INTO receipts (vehicle_id, location_id, category, amount, date, vendor, notes)
SELECT v.id, v.location_id, 'detailing', 850.00, NOW()::date - 480, 'Auto Detailing Pros', '[DEMO] Full detail G 63'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000001'
AND NOT EXISTS (SELECT 1 FROM receipts r WHERE r.vehicle_id = v.id AND r.vendor = 'Auto Detailing Pros' AND r.notes = '[DEMO] Full detail G 63');

INSERT INTO receipts (vehicle_id, location_id, category, amount, date, vendor, notes)
SELECT v.id, v.location_id, 'detailing', 1200.00, NOW()::date - 320, 'Beverly Hills Auto Spa', '[DEMO] Interior ceramic coat Ghost'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000008'
AND NOT EXISTS (SELECT 1 FROM receipts r WHERE r.vehicle_id = v.id AND r.vendor = 'Beverly Hills Auto Spa' AND r.notes = '[DEMO] Interior ceramic coat Ghost');

INSERT INTO receipts (vehicle_id, location_id, category, amount, date, vendor, notes)
SELECT v.id, v.location_id, 'detailing', 675.00, NOW()::date - 200, 'Palm Beach Detail Studio', '[DEMO] Range Rover exterior detail'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000006'
AND NOT EXISTS (SELECT 1 FROM receipts r WHERE r.vehicle_id = v.id AND r.vendor = 'Palm Beach Detail Studio' AND r.notes = '[DEMO] Range Rover exterior detail');

INSERT INTO receipts (vehicle_id, location_id, category, amount, date, vendor, notes)
SELECT v.id, v.location_id, 'detailing', 950.00, NOW()::date - 90, 'Ferrari of Beverly Hills', '[DEMO] Purosangue showroom prep'
FROM vehicles v WHERE v.vin = '1DEMFLEET0000000A'
AND NOT EXISTS (SELECT 1 FROM receipts r WHERE r.vehicle_id = v.id AND r.vendor = 'Ferrari of Beverly Hills' AND r.notes = '[DEMO] Purosangue showroom prep');

-- PARKING (4 rows)
INSERT INTO receipts (vehicle_id, location_id, category, amount, date, vendor, notes)
SELECT v.id, v.location_id, 'parking', 145.00, NOW()::date - 510, 'Icon Parking NYC', '[DEMO] Monthly garage S 580'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000003'
AND NOT EXISTS (SELECT 1 FROM receipts r WHERE r.vehicle_id = v.id AND r.vendor = 'Icon Parking NYC' AND r.notes = '[DEMO] Monthly garage S 580');

INSERT INTO receipts (vehicle_id, location_id, category, amount, date, vendor, notes)
SELECT v.id, v.location_id, 'parking', 145.00, NOW()::date - 360, 'Icon Parking NYC', '[DEMO] Monthly garage X7'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000004'
AND NOT EXISTS (SELECT 1 FROM receipts r WHERE r.vehicle_id = v.id AND r.vendor = 'Icon Parking NYC' AND r.notes = '[DEMO] Monthly garage X7');

INSERT INTO receipts (vehicle_id, location_id, category, amount, date, vendor, notes)
SELECT v.id, v.location_id, 'parking', 75.00, NOW()::date - 240, 'Palm Beach Valet', '[DEMO] Event valet M5'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000005'
AND NOT EXISTS (SELECT 1 FROM receipts r WHERE r.vehicle_id = v.id AND r.vendor = 'Palm Beach Valet' AND r.notes = '[DEMO] Event valet M5');

INSERT INTO receipts (vehicle_id, location_id, category, amount, date, vendor, notes)
SELECT v.id, v.location_id, 'parking', 95.00, NOW()::date - 60, 'The Colony Hotel Valet', '[DEMO] Overnight valet Bentayga'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000007'
AND NOT EXISTS (SELECT 1 FROM receipts r WHERE r.vehicle_id = v.id AND r.vendor = 'The Colony Hotel Valet' AND r.notes = '[DEMO] Overnight valet Bentayga');

-- EZ_PASS (3 rows)
INSERT INTO receipts (vehicle_id, location_id, category, amount, date, vendor, notes)
SELECT v.id, v.location_id, 'ez_pass', 125.00, NOW()::date - 450, 'E-ZPass', '[DEMO] Replenishment G 63'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000001'
AND NOT EXISTS (SELECT 1 FROM receipts r WHERE r.vehicle_id = v.id AND r.vendor = 'E-ZPass' AND r.notes = '[DEMO] Replenishment G 63');

INSERT INTO receipts (vehicle_id, location_id, category, amount, date, vendor, notes)
SELECT v.id, v.location_id, 'ez_pass', 125.00, NOW()::date - 300, 'E-ZPass', '[DEMO] Replenishment S 580'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000003'
AND NOT EXISTS (SELECT 1 FROM receipts r WHERE r.vehicle_id = v.id AND r.vendor = 'E-ZPass' AND r.notes = '[DEMO] Replenishment S 580');

INSERT INTO receipts (vehicle_id, location_id, category, amount, date, vendor, notes)
SELECT v.id, v.location_id, 'ez_pass', 100.00, NOW()::date - 120, 'SunPass', '[DEMO] Replenishment M5 FL'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000005'
AND NOT EXISTS (SELECT 1 FROM receipts r WHERE r.vehicle_id = v.id AND r.vendor = 'SunPass' AND r.notes = '[DEMO] Replenishment M5 FL');

-- MAINTENANCE category receipts (5 rows)
INSERT INTO receipts (vehicle_id, location_id, category, amount, date, vendor, notes)
SELECT v.id, v.location_id, 'maintenance', 2850.00, NOW()::date - 520, 'Mercedes-Benz of Greenwich', '[DEMO] Annual service G 63'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000001'
AND NOT EXISTS (SELECT 1 FROM receipts r WHERE r.vehicle_id = v.id AND r.vendor = 'Mercedes-Benz of Greenwich' AND r.notes = '[DEMO] Annual service G 63');

INSERT INTO receipts (vehicle_id, location_id, category, amount, date, vendor, notes)
SELECT v.id, v.location_id, 'maintenance', 3400.00, NOW()::date - 400, 'Porsche of Greenwich', '[DEMO] Cayenne Turbo GT annual service'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000002'
AND NOT EXISTS (SELECT 1 FROM receipts r WHERE r.vehicle_id = v.id AND r.vendor = 'Porsche of Greenwich' AND r.notes = '[DEMO] Cayenne Turbo GT annual service');

INSERT INTO receipts (vehicle_id, location_id, category, amount, date, vendor, notes)
SELECT v.id, v.location_id, 'maintenance', 5200.00, NOW()::date - 250, 'Rolls-Royce Motor Cars Beverly Hills', '[DEMO] Ghost annual service'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000008'
AND NOT EXISTS (SELECT 1 FROM receipts r WHERE r.vehicle_id = v.id AND r.vendor = 'Rolls-Royce Motor Cars Beverly Hills' AND r.notes = '[DEMO] Ghost annual service');

INSERT INTO receipts (vehicle_id, location_id, category, amount, date, vendor, notes)
SELECT v.id, v.location_id, 'maintenance', 4100.00, NOW()::date - 130, 'Lamborghini Palm Beach', '[DEMO] Urus Performante brake service'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000009'
AND NOT EXISTS (SELECT 1 FROM receipts r WHERE r.vehicle_id = v.id AND r.vendor = 'Lamborghini Palm Beach' AND r.notes = '[DEMO] Urus Performante brake service');

INSERT INTO receipts (vehicle_id, location_id, category, amount, date, vendor, notes)
SELECT v.id, v.location_id, 'maintenance', 1950.00, NOW()::date - 35, 'BMW of Palm Beach', '[DEMO] M5 oil service + inspection'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000005'
AND NOT EXISTS (SELECT 1 FROM receipts r WHERE r.vehicle_id = v.id AND r.vendor = 'BMW of Palm Beach' AND r.notes = '[DEMO] M5 oil service + inspection');

-- FOOD (3 rows)
INSERT INTO receipts (vehicle_id, location_id, category, amount, date, vendor, notes)
SELECT v.id, v.location_id, 'food', 485.00, NOW()::date - 430, 'Café Boulud Palm Beach', '[DEMO] Client lunch — Range Rover trip'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000006'
AND NOT EXISTS (SELECT 1 FROM receipts r WHERE r.vehicle_id = v.id AND r.vendor = 'Café Boulud Palm Beach' AND r.notes = '[DEMO] Client lunch — Range Rover trip');

INSERT INTO receipts (vehicle_id, location_id, category, amount, date, vendor, notes)
SELECT v.id, v.location_id, 'food', 310.00, NOW()::date - 290, 'The Capital Grille NYC', '[DEMO] Business dinner — S 580 trip'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000003'
AND NOT EXISTS (SELECT 1 FROM receipts r WHERE r.vehicle_id = v.id AND r.vendor = 'The Capital Grille NYC' AND r.notes = '[DEMO] Business dinner — S 580 trip');

INSERT INTO receipts (vehicle_id, location_id, category, amount, date, vendor, notes)
SELECT v.id, v.location_id, 'food', 220.00, NOW()::date - 85, 'Kiawah Island Golf Resort', '[DEMO] Lunch — Purosangue trip'
FROM vehicles v WHERE v.vin = '1DEMFLEET0000000A'
AND NOT EXISTS (SELECT 1 FROM receipts r WHERE r.vehicle_id = v.id AND r.vendor = 'Kiawah Island Golf Resort' AND r.notes = '[DEMO] Lunch — Purosangue trip');

-- AUTO_SUPPLIES (4 rows)
INSERT INTO receipts (vehicle_id, location_id, category, amount, date, vendor, notes)
SELECT v.id, v.location_id, 'auto_supplies', 380.00, NOW()::date - 470, 'Colourlock USA', '[DEMO] Leather care kit G 63'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000001'
AND NOT EXISTS (SELECT 1 FROM receipts r WHERE r.vehicle_id = v.id AND r.vendor = 'Colourlock USA' AND r.notes = '[DEMO] Leather care kit G 63');

INSERT INTO receipts (vehicle_id, location_id, category, amount, date, vendor, notes)
SELECT v.id, v.location_id, 'auto_supplies', 520.00, NOW()::date - 330, 'Chemical Guys', '[DEMO] Detailing supply kit Bentayga'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000007'
AND NOT EXISTS (SELECT 1 FROM receipts r WHERE r.vehicle_id = v.id AND r.vendor = 'Chemical Guys' AND r.notes = '[DEMO] Detailing supply kit Bentayga');

INSERT INTO receipts (vehicle_id, location_id, category, amount, date, vendor, notes)
SELECT v.id, v.location_id, 'auto_supplies', 295.00, NOW()::date - 185, 'WeatherTech', '[DEMO] Floor mats X7'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000004'
AND NOT EXISTS (SELECT 1 FROM receipts r WHERE r.vehicle_id = v.id AND r.vendor = 'WeatherTech' AND r.notes = '[DEMO] Floor mats X7');

INSERT INTO receipts (vehicle_id, location_id, category, amount, date, vendor, notes)
SELECT v.id, v.location_id, 'auto_supplies', 175.00, NOW()::date - 50, 'AutoZone', '[DEMO] Wiper blades Cayenne'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000002'
AND NOT EXISTS (SELECT 1 FROM receipts r WHERE r.vehicle_id = v.id AND r.vendor = 'AutoZone' AND r.notes = '[DEMO] Wiper blades Cayenne');

-- MISCELLANEOUS (4 rows)
INSERT INTO receipts (vehicle_id, location_id, category, amount, date, vendor, notes)
SELECT v.id, v.location_id, 'miscellaneous', 650.00, NOW()::date - 500, 'Hagerty', '[DEMO] Agreed value appraisal Ghost'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000008'
AND NOT EXISTS (SELECT 1 FROM receipts r WHERE r.vehicle_id = v.id AND r.vendor = 'Hagerty' AND r.notes = '[DEMO] Agreed value appraisal Ghost');

INSERT INTO receipts (vehicle_id, location_id, category, amount, date, vendor, notes)
SELECT v.id, v.location_id, 'miscellaneous', 185.00, NOW()::date - 350, 'AAA', '[DEMO] Emergency roadside Urus'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000009'
AND NOT EXISTS (SELECT 1 FROM receipts r WHERE r.vehicle_id = v.id AND r.vendor = 'AAA' AND r.notes = '[DEMO] Emergency roadside Urus');

INSERT INTO receipts (vehicle_id, location_id, category, amount, date, vendor, notes)
SELECT v.id, v.location_id, 'miscellaneous', 1200.00, NOW()::date - 210, 'Scuderia Transport', '[DEMO] Enclosed transport Purosangue CT to SC'
FROM vehicles v WHERE v.vin = '1DEMFLEET0000000A'
AND NOT EXISTS (SELECT 1 FROM receipts r WHERE r.vehicle_id = v.id AND r.vendor = 'Scuderia Transport' AND r.notes = '[DEMO] Enclosed transport Purosangue CT to SC');

INSERT INTO receipts (vehicle_id, location_id, category, amount, date, vendor, notes)
SELECT v.id, v.location_id, 'miscellaneous', 450.00, NOW()::date - 30, 'State of CT DMV', '[DEMO] Title transfer fee G 63'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000001'
AND NOT EXISTS (SELECT 1 FROM receipts r WHERE r.vehicle_id = v.id AND r.vendor = 'State of CT DMV' AND r.notes = '[DEMO] Title transfer fee G 63');

-- =============================================================================
-- SECTION 7: Maintenance Records (15 rows across all vehicles)
-- =============================================================================

INSERT INTO maintenance_records (vehicle_id, type, description, odometer, cost, date, vendor, next_due_date, notes)
SELECT v.id, 'oil', 'AMG full synthetic oil service', 12480, 685.00, NOW()::date - 180, 'Mercedes-Benz of Greenwich', NOW()::date + 185, '[DEMO]'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000001'
AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.type = 'oil' AND m.notes = '[DEMO]');

INSERT INTO maintenance_records (vehicle_id, type, description, odometer, cost, date, vendor, next_due_date, notes)
SELECT v.id, 'tire_rotation', 'Seasonal tire rotation + balancing', 12480, 280.00, NOW()::date - 180, 'Mercedes-Benz of Greenwich', NOW()::date + 365, '[DEMO]'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000001'
AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.type = 'tire_rotation' AND m.notes = '[DEMO]');

INSERT INTO maintenance_records (vehicle_id, type, description, odometer, cost, date, vendor, next_due_date, notes)
SELECT v.id, 'oil', 'Porsche Mobil 1 oil service', 8920, 720.00, NOW()::date - 210, 'Porsche of Greenwich', NOW()::date + 155, '[DEMO]'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000002'
AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.type = 'oil' AND m.notes = '[DEMO]');

INSERT INTO maintenance_records (vehicle_id, type, description, odometer, cost, date, vendor, next_due_date, notes)
SELECT v.id, 'inspection', 'Annual state inspection', 21300, 95.00, NOW()::date - 290, 'Mercedes-Benz Manhattan', NOW()::date + 75, '[DEMO]'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000003'
AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.type = 'inspection' AND m.notes = '[DEMO]');

INSERT INTO maintenance_records (vehicle_id, type, description, odometer, cost, date, vendor, next_due_date, notes)
SELECT v.id, 'oil', 'BMW TwinPower Turbo oil service', 14750, 780.00, NOW()::date - 150, 'BMW of Manhattan', NOW()::date + 215, '[DEMO]'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000004'
AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.type = 'oil' AND m.notes = '[DEMO]');

INSERT INTO maintenance_records (vehicle_id, type, description, odometer, cost, date, vendor, next_due_date, notes)
SELECT v.id, 'brakes', 'Front brake pads + rotors M5', 18200, 1850.00, NOW()::date - 35, 'BMW of Palm Beach', NOW()::date + 730, '[DEMO]'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000005'
AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.type = 'brakes' AND m.notes = '[DEMO]');

INSERT INTO maintenance_records (vehicle_id, type, description, odometer, cost, date, vendor, next_due_date, notes)
SELECT v.id, 'oil', 'Range Rover full service oil change', 9400, 680.00, NOW()::date - 120, 'Land Rover Palm Beach', NOW()::date + 245, '[DEMO]'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000006'
AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.type = 'oil' AND m.notes = '[DEMO]');

INSERT INTO maintenance_records (vehicle_id, type, description, odometer, cost, date, vendor, next_due_date, notes)
SELECT v.id, 'inspection', 'Bentayga pre-season inspection', 7620, 450.00, NOW()::date - 95, 'Bentley Beverly Hills', NOW()::date + 270, '[DEMO]'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000007'
AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.type = 'inspection' AND m.notes = '[DEMO]');

INSERT INTO maintenance_records (vehicle_id, type, description, odometer, cost, date, vendor, next_due_date, notes)
SELECT v.id, 'oil', 'Ghost Black Badge oil service', 5300, 1200.00, NOW()::date - 250, 'Rolls-Royce Motor Cars Beverly Hills', NOW()::date + 115, '[DEMO]'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000008'
AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.type = 'oil' AND m.notes = '[DEMO]');

INSERT INTO maintenance_records (vehicle_id, type, description, odometer, cost, date, vendor, next_due_date, notes)
SELECT v.id, 'brakes', 'Urus carbon-ceramic brake inspection', 11800, 2400.00, NOW()::date - 130, 'Lamborghini Palm Beach', NOW()::date + 600, '[DEMO]'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000009'
AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.type = 'brakes' AND m.notes = '[DEMO]');

INSERT INTO maintenance_records (vehicle_id, type, description, odometer, cost, date, vendor, next_due_date, notes)
SELECT v.id, 'oil', 'Purosangue V12 first oil service', 3200, 1450.00, NOW()::date - 60, 'Ferrari of Beverly Hills', NOW()::date + 305, '[DEMO]'
FROM vehicles v WHERE v.vin = '1DEMFLEET0000000A'
AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.type = 'oil' AND m.notes = '[DEMO]');

INSERT INTO maintenance_records (vehicle_id, type, description, odometer, cost, date, vendor, next_due_date, notes)
SELECT v.id, 'tire_rotation', 'Summer tire install + rotation', 8920, 320.00, NOW()::date - 45, 'Porsche of Greenwich', NOW()::date + 320, '[DEMO]'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000002'
AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.type = 'tire_rotation' AND m.notes = '[DEMO]');

INSERT INTO maintenance_records (vehicle_id, type, description, odometer, cost, date, vendor, next_due_date, notes)
SELECT v.id, 'general', 'Battery tender install + check', 21300, 185.00, NOW()::date - 50, 'Mercedes-Benz Manhattan', NOW()::date + 315, '[DEMO]'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000003'
AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.type = 'general' AND m.notes = '[DEMO]');

INSERT INTO maintenance_records (vehicle_id, type, description, odometer, cost, date, vendor, next_due_date, notes)
SELECT v.id, 'tire_rotation', 'All-season tire rotation Bentayga', 7620, 275.00, NOW()::date - 30, 'Bentley Beverly Hills', NOW()::date + 335, '[DEMO]'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000007'
AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.type = 'tire_rotation' AND m.notes LIKE '[DEMO]' AND m.date = NOW()::date - 30);

INSERT INTO maintenance_records (vehicle_id, type, description, odometer, cost, date, vendor, next_due_date, notes)
SELECT v.id, 'battery', 'Ghost AGM battery replacement', 5300, 890.00, NOW()::date - 20, 'Rolls-Royce Motor Cars Beverly Hills', NOW()::date + 1460, '[DEMO]'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000008'
AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.type = 'battery' AND m.notes = '[DEMO]');

-- =============================================================================
-- SECTION 8: Maintenance Alerts (mixed severity, some due within 30 days)
-- =============================================================================

INSERT INTO maintenance_alerts (vehicle_id, alert_type, due_date, severity, dismissed, notes)
SELECT v.id, 'oil_change', NOW()::date + 15, 'high', false, '[DEMO] G 63 oil overdue'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000001'
AND NOT EXISTS (SELECT 1 FROM maintenance_alerts a WHERE a.vehicle_id = v.id AND a.alert_type = 'oil_change' AND a.notes = '[DEMO] G 63 oil overdue');

INSERT INTO maintenance_alerts (vehicle_id, alert_type, due_date, severity, dismissed, notes)
SELECT v.id, 'registration_renewal', NOW()::date + 25, 'high', false, '[DEMO] SC registration expiring'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000009'
AND NOT EXISTS (SELECT 1 FROM maintenance_alerts a WHERE a.vehicle_id = v.id AND a.alert_type = 'registration_renewal' AND a.notes = '[DEMO] SC registration expiring');

INSERT INTO maintenance_alerts (vehicle_id, alert_type, due_date, severity, dismissed, notes)
SELECT v.id, 'registration_renewal', NOW()::date + 38, 'medium', false, '[DEMO] CT registration expiring'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000001'
AND NOT EXISTS (SELECT 1 FROM maintenance_alerts a WHERE a.vehicle_id = v.id AND a.alert_type = 'registration_renewal' AND a.notes = '[DEMO] CT registration expiring');

INSERT INTO maintenance_alerts (vehicle_id, alert_type, due_date, severity, dismissed, notes)
SELECT v.id, 'brake_inspection', NOW()::date + 30, 'high', false, '[DEMO] Cayenne brake check due'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000002'
AND NOT EXISTS (SELECT 1 FROM maintenance_alerts a WHERE a.vehicle_id = v.id AND a.alert_type = 'brake_inspection' AND a.notes = '[DEMO] Cayenne brake check due');

INSERT INTO maintenance_alerts (vehicle_id, alert_type, due_date, severity, dismissed, notes)
SELECT v.id, 'tire_rotation', NOW()::date + 60, 'medium', false, '[DEMO] S 580 tire rotation due'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000003'
AND NOT EXISTS (SELECT 1 FROM maintenance_alerts a WHERE a.vehicle_id = v.id AND a.alert_type = 'tire_rotation' AND a.notes = '[DEMO] S 580 tire rotation due');

INSERT INTO maintenance_alerts (vehicle_id, alert_type, due_date, severity, dismissed, notes)
SELECT v.id, 'oil_change', NOW()::date + 50, 'medium', false, '[DEMO] Ghost oil service reminder'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000008'
AND NOT EXISTS (SELECT 1 FROM maintenance_alerts a WHERE a.vehicle_id = v.id AND a.alert_type = 'oil_change' AND a.notes = '[DEMO] Ghost oil service reminder');

INSERT INTO maintenance_alerts (vehicle_id, alert_type, due_date, severity, dismissed, notes)
SELECT v.id, 'inspection', NOW()::date + 75, 'low', false, '[DEMO] M5 annual inspection'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000005'
AND NOT EXISTS (SELECT 1 FROM maintenance_alerts a WHERE a.vehicle_id = v.id AND a.alert_type = 'inspection' AND a.notes = '[DEMO] M5 annual inspection');

INSERT INTO maintenance_alerts (vehicle_id, alert_type, due_date, severity, dismissed, notes)
SELECT v.id, 'tire_rotation', NOW()::date + 90, 'low', false, '[DEMO] Bentayga seasonal tire swap'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000007'
AND NOT EXISTS (SELECT 1 FROM maintenance_alerts a WHERE a.vehicle_id = v.id AND a.alert_type = 'tire_rotation' AND a.notes = '[DEMO] Bentayga seasonal tire swap');

INSERT INTO maintenance_alerts (vehicle_id, alert_type, due_date, severity, dismissed, notes)
SELECT v.id, 'oil_change', NOW()::date + 20, 'high', false, '[DEMO] Urus oil change overdue'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000009'
AND NOT EXISTS (SELECT 1 FROM maintenance_alerts a WHERE a.vehicle_id = v.id AND a.alert_type = 'oil_change' AND a.notes = '[DEMO] Urus oil change overdue');

INSERT INTO maintenance_alerts (vehicle_id, alert_type, due_date, severity, dismissed, notes)
SELECT v.id, 'inspection', NOW()::date + 45, 'medium', false, '[DEMO] Purosangue first PDI'
FROM vehicles v WHERE v.vin = '1DEMFLEET0000000A'
AND NOT EXISTS (SELECT 1 FROM maintenance_alerts a WHERE a.vehicle_id = v.id AND a.alert_type = 'inspection' AND a.notes = '[DEMO] Purosangue first PDI');

-- =============================================================================
-- SECTION 9: Vehicle Documents (2 vehicles, 2 docs each)
-- =============================================================================

INSERT INTO vehicle_documents (vehicle_id, doc_type, title, document_url, notes)
SELECT v.id, 'title', 'Certificate of Title — G 63 AMG', 'https://placeholder.crownfleet.app/docs/title-v1.pdf', '[DEMO] placeholder PDF'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000001'
AND NOT EXISTS (SELECT 1 FROM vehicle_documents d WHERE d.vehicle_id = v.id AND d.doc_type = 'title' AND d.notes = '[DEMO] placeholder PDF');

INSERT INTO vehicle_documents (vehicle_id, doc_type, title, document_url, notes)
SELECT v.id, 'insurance', 'Chubb Insurance Declaration Page', 'https://placeholder.crownfleet.app/docs/insurance-v1.pdf', '[DEMO] placeholder PDF'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000001'
AND NOT EXISTS (SELECT 1 FROM vehicle_documents d WHERE d.vehicle_id = v.id AND d.doc_type = 'insurance' AND d.notes = '[DEMO] placeholder PDF');

INSERT INTO vehicle_documents (vehicle_id, doc_type, title, document_url, notes)
SELECT v.id, 'title', 'Certificate of Title — Ghost Black Badge', 'https://placeholder.crownfleet.app/docs/title-v8.pdf', '[DEMO] placeholder PDF'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000008'
AND NOT EXISTS (SELECT 1 FROM vehicle_documents d WHERE d.vehicle_id = v.id AND d.doc_type = 'title' AND d.notes = '[DEMO] placeholder PDF');

INSERT INTO vehicle_documents (vehicle_id, doc_type, title, document_url, notes)
SELECT v.id, 'maintenance', 'Rolls-Royce Ghost Warranty Card', 'https://placeholder.crownfleet.app/docs/warranty-v8.pdf', '[DEMO] placeholder PDF'
FROM vehicles v WHERE v.vin = '1DEMFLEET00000008'
AND NOT EXISTS (SELECT 1 FROM vehicle_documents d WHERE d.vehicle_id = v.id AND d.doc_type = 'maintenance' AND d.notes = '[DEMO] placeholder PDF');

-- =============================================================================
-- END OF CROWN FLEET DEMO SEED
-- =============================================================================
-- To verify after running:
--   SELECT count(*) FROM vehicles  WHERE vin LIKE '1DEMFLEET%';          -- expect 10
--   SELECT count(*) FROM locations WHERE code LIKE 'CROWN-%';            -- expect 5
--   SELECT count(*) FROM receipts  WHERE notes LIKE '[DEMO]%';           -- expect 32
--   SELECT count(*) FROM maintenance_alerts WHERE notes LIKE '[DEMO]%';  -- expect 10
-- =============================================================================
