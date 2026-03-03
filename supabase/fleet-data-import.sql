-- Fleet Data Import
-- Generated from fleet_data.json
-- Run AFTER supabase/migrations/20260303000001_fleet_data_schema.sql
-- All statements are idempotent — safe to run more than once.
-- Vehicles are matched by VIN.

-- ============================================================
-- 1. UPDATE vehicles (trim, status, notes)
-- ============================================================

UPDATE vehicles SET
  trim = NULL,
  status = 'active',
  notes = '2024 Emissions on file'
WHERE vin = 'WA1VAAF71KD019689'; -- 2019 Audi Q7

UPDATE vehicles SET
  trim = 'E39',
  status = 'active',
  notes = NULL
WHERE vin = 'WBSDE93412CF91443'; -- 2002 BMW M5

UPDATE vehicles SET
  trim = 'Competition',
  status = 'active',
  notes = 'BMW Certified Warranty expired 10/1/2024'
WHERE vin = 'WBSJF0C58KB448609'; -- 2019 BMW M5 Competition

UPDATE vehicles SET
  trim = NULL,
  status = 'active',
  notes = 'Emissions not required for motorcycle class'
WHERE vin = 'ZAPM319K155003629'; -- 2005 Vespa GT200

UPDATE vehicles SET
  trim = NULL,
  status = 'active',
  notes = 'Recall on file. Head Restraint Extended Warranty on file.'
WHERE vin = '1C4RJFBG3GC328006'; -- 2016 Jeep Grand Cherokee

UPDATE vehicles SET
  trim = NULL,
  status = 'active',
  notes = 'Purchased via Car Gurus. CarFax and Experian on file. Originally registered in Kansas.'
WHERE vin = 'WP0CA2A83NS205186'; -- 2022 Porsche 718 Boxster

UPDATE vehicles SET
  trim = NULL,
  status = 'active',
  notes = 'Purchased from Rohrman Auto. Transported from Illinois. Lexus Certified Warranty on file.'
WHERE vin = 'JTHGYLGF4P5002767'; -- 2023 Lexus LS500h

UPDATE vehicles SET
  trim = 'xDrive',
  status = 'active',
  notes = 'CPO certification P21789 on file. Purchased from Open Road BMW. Recall notice issued 11/2025.'
WHERE vin = 'WBA7T4C05NCK92837'; -- 2022 BMW 740i

UPDATE vehicles SET
  trim = '90D',
  status = 'archived',
  notes = 'Archived vehicle — no longer in active fleet'
WHERE vin = '5YJSA1E29HF185488'; -- 2017 Tesla Model S

UPDATE vehicles SET
  trim = NULL,
  status = 'archived',
  notes = 'Purchased 2019. Archived vehicle — no longer in active fleet.'
WHERE vin = 'CT35866'; -- 1965 Kirkham Cobra

UPDATE vehicles SET
  trim = NULL,
  status = 'archived',
  notes = 'Archived vehicle — no longer in active fleet'
WHERE vin = 'WAUGL78E86A130994'; -- 2006 Audi S4

UPDATE vehicles SET
  trim = NULL,
  status = 'sold',
  notes = 'Sold — removed from active fleet'
WHERE vin = '4JGBF2FE2AA561622'; -- 2010 Mercedes GL-Class

UPDATE vehicles SET
  trim = NULL,
  status = 'sold',
  notes = 'Sold — transferred to Jackson, TX'
WHERE vin = 'WA1CFAFP4BA039901'; -- 2011 Audi Q5

UPDATE vehicles SET
  trim = 'Casper',
  status = 'archived',
  notes = 'Archived vehicle — nickname ''Casper''. No longer in active fleet.'
WHERE vin = 'SCA664L50CUX65611'; -- 2012 Rolls-Royce Ghost


-- ============================================================
-- 2. INSERT insurance records
--    Only insert where provider or expiry is known.
--    Skip if a record already exists for the vehicle.
-- ============================================================

-- 2019 Audi Q7 — AIG, exp 2026-09-30
INSERT INTO insurance (vehicle_id, provider, expiry_date)
SELECT v.id, 'AIG', '2026-09-30'
FROM vehicles v WHERE v.vin = 'WA1VAAF71KD019689'
  AND NOT EXISTS (SELECT 1 FROM insurance i WHERE i.vehicle_id = v.id AND i.expiry_date = '2026-09-30');

-- 2002 BMW M5 — AIG, exp 2026-09-30
INSERT INTO insurance (vehicle_id, provider, expiry_date)
SELECT v.id, 'AIG', '2026-09-30'
FROM vehicles v WHERE v.vin = 'WBSDE93412CF91443'
  AND NOT EXISTS (SELECT 1 FROM insurance i WHERE i.vehicle_id = v.id AND i.expiry_date = '2026-09-30');

-- 2019 BMW M5 Competition — exp 2026-09-30 (provider unknown)
INSERT INTO insurance (vehicle_id, provider, expiry_date)
SELECT v.id, 'Unknown', '2026-09-30'
FROM vehicles v WHERE v.vin = 'WBSJF0C58KB448609'
  AND NOT EXISTS (SELECT 1 FROM insurance i WHERE i.vehicle_id = v.id AND i.expiry_date = '2026-09-30');

-- 2005 Vespa GT200 — exp 2026-09-30 (provider unknown)
INSERT INTO insurance (vehicle_id, provider, expiry_date)
SELECT v.id, 'Unknown', '2026-09-30'
FROM vehicles v WHERE v.vin = 'ZAPM319K155003629'
  AND NOT EXISTS (SELECT 1 FROM insurance i WHERE i.vehicle_id = v.id AND i.expiry_date = '2026-09-30');

-- 2016 Jeep Grand Cherokee — AIG, exp 2026-09-30
INSERT INTO insurance (vehicle_id, provider, expiry_date)
SELECT v.id, 'AIG', '2026-09-30'
FROM vehicles v WHERE v.vin = '1C4RJFBG3GC328006'
  AND NOT EXISTS (SELECT 1 FROM insurance i WHERE i.vehicle_id = v.id AND i.expiry_date = '2026-09-30');

-- 2022 Porsche 718 Boxster — exp 2026-09-30 (provider unknown)
INSERT INTO insurance (vehicle_id, provider, expiry_date)
SELECT v.id, 'Unknown', '2026-09-30'
FROM vehicles v WHERE v.vin = 'WP0CA2A83NS205186'
  AND NOT EXISTS (SELECT 1 FROM insurance i WHERE i.vehicle_id = v.id AND i.expiry_date = '2026-09-30');

-- 2023 Lexus LS500h — Miles CT LLC, exp 2026-09-30
INSERT INTO insurance (vehicle_id, provider, expiry_date)
SELECT v.id, 'Miles CT LLC', '2026-09-30'
FROM vehicles v WHERE v.vin = 'JTHGYLGF4P5002767'
  AND NOT EXISTS (SELECT 1 FROM insurance i WHERE i.vehicle_id = v.id AND i.expiry_date = '2026-09-30');

-- 2022 BMW 740i — Miles CT LLC, exp 2026-09-30
INSERT INTO insurance (vehicle_id, provider, expiry_date)
SELECT v.id, 'Miles CT LLC', '2026-09-30'
FROM vehicles v WHERE v.vin = 'WBA7T4C05NCK92837'
  AND NOT EXISTS (SELECT 1 FROM insurance i WHERE i.vehicle_id = v.id AND i.expiry_date = '2026-09-30');


-- ============================================================
-- 3. INSERT registrations
--    State = CT for all. Only insert where expiry is known.
-- ============================================================

-- 2019 Audi Q7 — exp 2028-12-30
INSERT INTO registrations (vehicle_id, state, expiry_date)
SELECT v.id, 'CT', '2028-12-30'
FROM vehicles v WHERE v.vin = 'WA1VAAF71KD019689'
  AND NOT EXISTS (SELECT 1 FROM registrations r WHERE r.vehicle_id = v.id AND r.expiry_date = '2028-12-30');

-- 2002 BMW M5 — exp 2027-03-25
INSERT INTO registrations (vehicle_id, state, expiry_date)
SELECT v.id, 'CT', '2027-03-25'
FROM vehicles v WHERE v.vin = 'WBSDE93412CF91443'
  AND NOT EXISTS (SELECT 1 FROM registrations r WHERE r.vehicle_id = v.id AND r.expiry_date = '2027-03-25');

-- 2019 BMW M5 Competition — exp 2027-11-12
INSERT INTO registrations (vehicle_id, state, expiry_date)
SELECT v.id, 'CT', '2027-11-12'
FROM vehicles v WHERE v.vin = 'WBSJF0C58KB448609'
  AND NOT EXISTS (SELECT 1 FROM registrations r WHERE r.vehicle_id = v.id AND r.expiry_date = '2027-11-12');

-- 2005 Vespa GT200 — exp 2027-03-31
INSERT INTO registrations (vehicle_id, state, expiry_date)
SELECT v.id, 'CT', '2027-03-31'
FROM vehicles v WHERE v.vin = 'ZAPM319K155003629'
  AND NOT EXISTS (SELECT 1 FROM registrations r WHERE r.vehicle_id = v.id AND r.expiry_date = '2027-03-31');

-- 2016 Jeep Grand Cherokee — exp 2029-03-10
INSERT INTO registrations (vehicle_id, state, expiry_date)
SELECT v.id, 'CT', '2029-03-10'
FROM vehicles v WHERE v.vin = '1C4RJFBG3GC328006'
  AND NOT EXISTS (SELECT 1 FROM registrations r WHERE r.vehicle_id = v.id AND r.expiry_date = '2029-03-10');

-- 2022 Porsche 718 Boxster — exp 2027-01-26
INSERT INTO registrations (vehicle_id, state, expiry_date)
SELECT v.id, 'CT', '2027-01-26'
FROM vehicles v WHERE v.vin = 'WP0CA2A83NS205186'
  AND NOT EXISTS (SELECT 1 FROM registrations r WHERE r.vehicle_id = v.id AND r.expiry_date = '2027-01-26');

-- 2023 Lexus LS500h — exp 2028-02-04
INSERT INTO registrations (vehicle_id, state, expiry_date)
SELECT v.id, 'CT', '2028-02-04'
FROM vehicles v WHERE v.vin = 'JTHGYLGF4P5002767'
  AND NOT EXISTS (SELECT 1 FROM registrations r WHERE r.vehicle_id = v.id AND r.expiry_date = '2028-02-04');

-- 2022 BMW 740i — exp 2028-08-11
INSERT INTO registrations (vehicle_id, state, expiry_date)
SELECT v.id, 'CT', '2028-08-11'
FROM vehicles v WHERE v.vin = 'WBA7T4C05NCK92837'
  AND NOT EXISTS (SELECT 1 FROM registrations r WHERE r.vehicle_id = v.id AND r.expiry_date = '2028-08-11');

-- 2017 Tesla Model S — exp 2026-04-12
INSERT INTO registrations (vehicle_id, state, expiry_date)
SELECT v.id, 'CT', '2026-04-12'
FROM vehicles v WHERE v.vin = '5YJSA1E29HF185488'
  AND NOT EXISTS (SELECT 1 FROM registrations r WHERE r.vehicle_id = v.id AND r.expiry_date = '2026-04-12');

-- 1965 Kirkham Cobra — exp 2026-12-20
INSERT INTO registrations (vehicle_id, state, expiry_date)
SELECT v.id, 'CT', '2026-12-20'
FROM vehicles v WHERE v.vin = 'CT35866'
  AND NOT EXISTS (SELECT 1 FROM registrations r WHERE r.vehicle_id = v.id AND r.expiry_date = '2026-12-20');

-- 2006 Audi S4 — exp 2021-12-25 (expired)
INSERT INTO registrations (vehicle_id, state, expiry_date)
SELECT v.id, 'CT', '2021-12-25'
FROM vehicles v WHERE v.vin = 'WAUGL78E86A130994'
  AND NOT EXISTS (SELECT 1 FROM registrations r WHERE r.vehicle_id = v.id AND r.expiry_date = '2021-12-25');

-- 2010 Mercedes GL-Class — exp 2019-12-26 (expired/sold)
INSERT INTO registrations (vehicle_id, state, expiry_date)
SELECT v.id, 'CT', '2019-12-26'
FROM vehicles v WHERE v.vin = '4JGBF2FE2AA561622'
  AND NOT EXISTS (SELECT 1 FROM registrations r WHERE r.vehicle_id = v.id AND r.expiry_date = '2019-12-26');

-- 2011 Audi Q5 — exp 2020-11-23 (expired/sold)
INSERT INTO registrations (vehicle_id, state, expiry_date)
SELECT v.id, 'CT', '2020-11-23'
FROM vehicles v WHERE v.vin = 'WA1CFAFP4BA039901'
  AND NOT EXISTS (SELECT 1 FROM registrations r WHERE r.vehicle_id = v.id AND r.expiry_date = '2020-11-23');


-- ============================================================
-- 4. INSERT service history → maintenance_records
--    type = 'general' for standard service, 'other' for misc
-- ============================================================

-- ── 2019 Audi Q7 ──────────────────────────────────────────
INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'general', 'Service', '2021-01-26', NULL
FROM vehicles v WHERE v.vin = 'WA1VAAF71KD019689'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2021-01-26' AND m.description = 'Service' AND m.vendor IS NULL);

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'general', 'Service', '2021-12-27', NULL
FROM vehicles v WHERE v.vin = 'WA1VAAF71KD019689'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2021-12-27' AND m.description = 'Service' AND m.vendor IS NULL);

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'general', 'Service', '2022-12-13', NULL
FROM vehicles v WHERE v.vin = 'WA1VAAF71KD019689'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2022-12-13' AND m.description = 'Service' AND m.vendor IS NULL);

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'general', 'Service', '2023-11-14', NULL
FROM vehicles v WHERE v.vin = 'WA1VAAF71KD019689'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2023-11-14' AND m.description = 'Service' AND m.vendor IS NULL);

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'general', 'Service', '2024-11-20', NULL
FROM vehicles v WHERE v.vin = 'WA1VAAF71KD019689'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2024-11-20' AND m.description = 'Service' AND m.vendor IS NULL);

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'general', 'Service', '2025-04-30', NULL
FROM vehicles v WHERE v.vin = 'WA1VAAF71KD019689'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2025-04-30' AND m.description = 'Service' AND m.vendor IS NULL);

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'general', '60K Service', '2025-10-31', NULL
FROM vehicles v WHERE v.vin = 'WA1VAAF71KD019689'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2025-10-31' AND m.description = '60K Service');

-- ── 2002 BMW M5 ───────────────────────────────────────────
INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'general', 'Service', '2013-03-13', 'BMW'
FROM vehicles v WHERE v.vin = 'WBSDE93412CF91443'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2013-03-13');

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'general', 'Service', '2013-07-30', NULL
FROM vehicles v WHERE v.vin = 'WBSDE93412CF91443'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2013-07-30');

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'other', 'Bumper', '2014-01-21', NULL
FROM vehicles v WHERE v.vin = 'WBSDE93412CF91443'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2014-01-21');

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'general', 'Service', '2014-03-31', NULL
FROM vehicles v WHERE v.vin = 'WBSDE93412CF91443'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2014-03-31');

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'battery', 'Battery replacement', '2015-08-10', NULL
FROM vehicles v WHERE v.vin = 'WBSDE93412CF91443'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2015-08-10');

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'other', 'Valve cover', '2015-09-02', NULL
FROM vehicles v WHERE v.vin = 'WBSDE93412CF91443'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2015-09-02');

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'general', 'Service', '2016-03-25', NULL
FROM vehicles v WHERE v.vin = 'WBSDE93412CF91443'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2016-03-25');

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'general', 'Service', '2017-05-23', NULL
FROM vehicles v WHERE v.vin = 'WBSDE93412CF91443'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2017-05-23');

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'other', 'Vibration diagnostic', '2022-08-19', 'Roy Medile'
FROM vehicles v WHERE v.vin = 'WBSDE93412CF91443'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2022-08-19');

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'other', 'Suspension', '2023-02-20', 'Roy Medile'
FROM vehicles v WHERE v.vin = 'WBSDE93412CF91443'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2023-02-20');

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'general', 'Service', '2023-09-26', 'Ridgefield BMW'
FROM vehicles v WHERE v.vin = 'WBSDE93412CF91443'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2023-09-26');

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'general', 'Service', '2023-10-04', 'Ridgefield BMW'
FROM vehicles v WHERE v.vin = 'WBSDE93412CF91443'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2023-10-04');

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'general', 'Service', '2023-10-26', 'C & H Auto'
FROM vehicles v WHERE v.vin = 'WBSDE93412CF91443'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2023-10-26' AND m.vendor = 'C & H Auto');

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'general', 'Service', '2023-11-07', 'Ridgefield BMW'
FROM vehicles v WHERE v.vin = 'WBSDE93412CF91443'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2023-11-07');

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'general', 'Service', '2024-10-23', 'C & H Auto'
FROM vehicles v WHERE v.vin = 'WBSDE93412CF91443'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2024-10-23');

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'general', 'Service', '2025-07-01', NULL
FROM vehicles v WHERE v.vin = 'WBSDE93412CF91443'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2025-07-01');

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'general', 'Service', '2025-10-07', 'Ridgefield BMW'
FROM vehicles v WHERE v.vin = 'WBSDE93412CF91443'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2025-10-07');

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'general', 'Service', '2025-11-10', 'Ridgefield BMW'
FROM vehicles v WHERE v.vin = 'WBSDE93412CF91443'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2025-11-10');

-- ── 2019 BMW M5 Competition ───────────────────────────────
INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'general', 'Service', '2021-12-03', NULL
FROM vehicles v WHERE v.vin = 'WBSJF0C58KB448609'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2021-12-03');

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'general', 'BMW Service', '2022-01-28', 'BMW'
FROM vehicles v WHERE v.vin = 'WBSJF0C58KB448609'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2022-01-28');

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'general', 'Service', '2022-04-27', 'C & H Auto'
FROM vehicles v WHERE v.vin = 'WBSJF0C58KB448609'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2022-04-27');

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'general', 'BMW Service', '2022-08-18', 'BMW'
FROM vehicles v WHERE v.vin = 'WBSJF0C58KB448609'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2022-08-18');

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'general', 'BMW Service', '2022-12-16', 'BMW'
FROM vehicles v WHERE v.vin = 'WBSJF0C58KB448609'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2022-12-16');

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'general', 'BMW Service', '2023-01-27', 'BMW'
FROM vehicles v WHERE v.vin = 'WBSJF0C58KB448609'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2023-01-27');

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'general', 'Service', '2023-04-26', 'C & H Auto'
FROM vehicles v WHERE v.vin = 'WBSJF0C58KB448609'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2023-04-26');

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'general', 'Service', '2023-11-03', 'C & H Auto'
FROM vehicles v WHERE v.vin = 'WBSJF0C58KB448609'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2023-11-03');

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'general', 'Service', '2024-04-18', 'C & H Auto'
FROM vehicles v WHERE v.vin = 'WBSJF0C58KB448609'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2024-04-18');

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'general', 'BMW Service', '2024-08-08', 'BMW'
FROM vehicles v WHERE v.vin = 'WBSJF0C58KB448609'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2024-08-08');

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'general', 'BMW Service', '2024-08-20', 'BMW'
FROM vehicles v WHERE v.vin = 'WBSJF0C58KB448609'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2024-08-20');

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'general', 'BMW Service', '2024-09-20', 'BMW'
FROM vehicles v WHERE v.vin = 'WBSJF0C58KB448609'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2024-09-20');

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'general', 'Service', '2025-04-04', 'C & H Auto'
FROM vehicles v WHERE v.vin = 'WBSJF0C58KB448609'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2025-04-04');

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'general', 'Service', '2025-11-04', 'C & H Auto'
FROM vehicles v WHERE v.vin = 'WBSJF0C58KB448609'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2025-11-04');

-- ── 2005 Vespa GT200 ──────────────────────────────────────
INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'general', 'Service', '2023-01-01', 'Four Chase LLC'
FROM vehicles v WHERE v.vin = 'ZAPM319K155003629'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2023-01-01');

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'general', 'Service', '2025-01-01', 'Four Chase LLC'
FROM vehicles v WHERE v.vin = 'ZAPM319K155003629'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2025-01-01');

-- ── 2016 Jeep Grand Cherokee ──────────────────────────────
INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'general', 'Service', '2014-06-18', NULL
FROM vehicles v WHERE v.vin = '1C4RJFBG3GC328006'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2014-06-18');

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'other', 'Driver side door glass replacement', '2018-02-21', 'Safelite'
FROM vehicles v WHERE v.vin = '1C4RJFBG3GC328006'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2018-02-21');

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'general', 'Service', '2018-03-02', NULL
FROM vehicles v WHERE v.vin = '1C4RJFBG3GC328006'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2018-03-02');

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'other', 'Bodywork', '2018-03-09', NULL
FROM vehicles v WHERE v.vin = '1C4RJFBG3GC328006'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2018-03-09');

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'other', 'Warranty work', '2018-07-08', 'Riverhead Dodge'
FROM vehicles v WHERE v.vin = '1C4RJFBG3GC328006'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2018-07-08');

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'general', 'Service', '2018-09-11', NULL
FROM vehicles v WHERE v.vin = '1C4RJFBG3GC328006'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2018-09-11');

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'general', 'Service', '2021-02-08', NULL
FROM vehicles v WHERE v.vin = '1C4RJFBG3GC328006'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2021-02-08');

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'general', 'Service', '2023-04-15', NULL
FROM vehicles v WHERE v.vin = '1C4RJFBG3GC328006'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2023-04-15');

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'general', 'Service', '2024-02-14', NULL
FROM vehicles v WHERE v.vin = '1C4RJFBG3GC328006'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2024-02-14');

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'general', 'Service', '2025-03-13', NULL
FROM vehicles v WHERE v.vin = '1C4RJFBG3GC328006'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2025-03-13');

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'general', 'Service', '2025-03-29', NULL
FROM vehicles v WHERE v.vin = '1C4RJFBG3GC328006'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2025-03-29');

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'general', 'Service', '2025-12-04', NULL
FROM vehicles v WHERE v.vin = '1C4RJFBG3GC328006'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2025-12-04');

-- ── 2022 Porsche 718 Boxster ──────────────────────────────
INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'general', 'Service', '2024-09-26', 'Porsche Danbury'
FROM vehicles v WHERE v.vin = 'WP0CA2A83NS205186'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2024-09-26');

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'general', 'Service', '2025-11-03', 'Porsche Danbury'
FROM vehicles v WHERE v.vin = 'WP0CA2A83NS205186'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2025-11-03');

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'general', 'Service', '2025-11-14', 'Porsche North State Custom'
FROM vehicles v WHERE v.vin = 'WP0CA2A83NS205186'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2025-11-14');

-- ── 2023 Lexus LS500h ─────────────────────────────────────
INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'other', 'Vehicle transport at purchase', '2024-12-11', 'Passport Transport'
FROM vehicles v WHERE v.vin = 'JTHGYLGF4P5002767'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.vendor = 'Passport Transport');

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'general', 'Service', '2025-02-10', 'Mt. Kisco Lexus'
FROM vehicles v WHERE v.vin = 'JTHGYLGF4P5002767'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2025-02-10');

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'general', 'Service', '2025-03-10', 'Mt. Kisco Lexus'
FROM vehicles v WHERE v.vin = 'JTHGYLGF4P5002767'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2025-03-10');

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'general', 'Service', '2025-12-18', 'Mt. Kisco Lexus'
FROM vehicles v WHERE v.vin = 'JTHGYLGF4P5002767'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2025-12-18');

-- ── 2022 BMW 740i ─────────────────────────────────────────
INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'other', 'CPO repair at purchase', '2024-01-01', 'BMW'
FROM vehicles v WHERE v.vin = 'WBA7T4C05NCK92837'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.description = 'CPO repair at purchase');

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'general', 'Service', '2025-07-22', 'BMW'
FROM vehicles v WHERE v.vin = 'WBA7T4C05NCK92837'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2025-07-22');

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'general', 'Service', '2025-09-29', 'BMW'
FROM vehicles v WHERE v.vin = 'WBA7T4C05NCK92837'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2025-09-29');

INSERT INTO maintenance_records (vehicle_id, type, description, date, vendor)
SELECT v.id, 'other', 'Recall notice', '2025-11-01', 'BMW'
FROM vehicles v WHERE v.vin = 'WBA7T4C05NCK92837'
  AND NOT EXISTS (SELECT 1 FROM maintenance_records m WHERE m.vehicle_id = v.id AND m.date = '2025-11-01');


-- ============================================================
-- 5. INSERT annual tax records → vehicle_taxes
-- ============================================================

-- ── 2019 Audi Q7 ──────────────────────────────────────────
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2019, 730.68, '2020-01-14' FROM vehicles v WHERE v.vin = 'WA1VAAF71KD019689' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2019);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2020, 874.46, '2020-08-19' FROM vehicles v WHERE v.vin = 'WA1VAAF71KD019689' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2020);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2021, 696.77, '2021-07-12' FROM vehicles v WHERE v.vin = 'WA1VAAF71KD019689' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2021);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2022, 823.98, '2022-07-14' FROM vehicles v WHERE v.vin = 'WA1VAAF71KD019689' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2022);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2023, 682.41, '2023-07-05' FROM vehicles v WHERE v.vin = 'WA1VAAF71KD019689' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2023);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2024, 413.29, '2024-07-12' FROM vehicles v WHERE v.vin = 'WA1VAAF71KD019689' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2024);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2025, 481.54, '2025-07-07' FROM vehicles v WHERE v.vin = 'WA1VAAF71KD019689' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2025);

-- ── 2002 BMW M5 ───────────────────────────────────────────
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2017, 165.69, '2017-07-06' FROM vehicles v WHERE v.vin = 'WBSDE93412CF91443' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2017);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2018, 158.58, '2018-07-23' FROM vehicles v WHERE v.vin = 'WBSDE93412CF91443' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2018);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date, note) SELECT v.id, 2019, NULL, NULL, 'Mystery' FROM vehicles v WHERE v.vin = 'WBSDE93412CF91443' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2019);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date, note) SELECT v.id, 2020, NULL, NULL, 'Mystery' FROM vehicles v WHERE v.vin = 'WBSDE93412CF91443' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2020);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2021, 82.28, '2021-12-23' FROM vehicles v WHERE v.vin = 'WBSDE93412CF91443' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2021);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2022, 128.24, '2022-07-14' FROM vehicles v WHERE v.vin = 'WBSDE93412CF91443' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2022);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2023, 279.74, '2023-07-05' FROM vehicles v WHERE v.vin = 'WBSDE93412CF91443' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2023);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2024, 236.19, '2024-07-12' FROM vehicles v WHERE v.vin = 'WBSDE93412CF91443' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2024);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2025, 121.01, '2025-07-07' FROM vehicles v WHERE v.vin = 'WBSDE93412CF91443' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2025);

-- ── 2019 BMW M5 Competition ───────────────────────────────
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2022, 0.00, NULL FROM vehicles v WHERE v.vin = 'WBSJF0C58KB448609' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2022);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2023, 1008.37, '2023-07-05' FROM vehicles v WHERE v.vin = 'WBSJF0C58KB448609' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2023);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2024, 717.92, '2024-07-12' FROM vehicles v WHERE v.vin = 'WBSJF0C58KB448609' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2024);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2025, 719.88, '2025-07-07' FROM vehicles v WHERE v.vin = 'WBSJF0C58KB448609' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2025);

-- ── 2005 Vespa GT200 ──────────────────────────────────────
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2017, 21.34, '2017-07-06' FROM vehicles v WHERE v.vin = 'ZAPM319K155003629' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2017);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2018, 18.66, '2018-07-23' FROM vehicles v WHERE v.vin = 'ZAPM319K155003629' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2018);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2019, 17.69, '2019-07-29' FROM vehicles v WHERE v.vin = 'ZAPM319K155003629' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2019);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2020, 17.44, '2020-07-08' FROM vehicles v WHERE v.vin = 'ZAPM319K155003629' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2020);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2021, 18.35, '2021-07-07' FROM vehicles v WHERE v.vin = 'ZAPM319K155003629' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2021);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2022, 20.21, '2022-07-14' FROM vehicles v WHERE v.vin = 'ZAPM319K155003629' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2022);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2023, 16.67, '2023-07-05' FROM vehicles v WHERE v.vin = 'ZAPM319K155003629' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2023);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2024, 12.59, '2024-07-12' FROM vehicles v WHERE v.vin = 'ZAPM319K155003629' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2024);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2025, 8.85, '2025-07-07' FROM vehicles v WHERE v.vin = 'ZAPM319K155003629' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2025);

-- ── 2016 Jeep Grand Cherokee ──────────────────────────────
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2017, 246.59, '2017-01-12' FROM vehicles v WHERE v.vin = '1C4RJFBG3GC328006' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2017);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2018, 360.06, '2018-07-23' FROM vehicles v WHERE v.vin = '1C4RJFBG3GC328006' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2018);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2019, 351.85, '2019-07-29' FROM vehicles v WHERE v.vin = '1C4RJFBG3GC328006' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2019);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2020, 330.22, '2020-07-08' FROM vehicles v WHERE v.vin = '1C4RJFBG3GC328006' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2020);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2021, 302.25, '2021-07-07' FROM vehicles v WHERE v.vin = '1C4RJFBG3GC328006' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2021);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2022, 345.39, '2022-07-14' FROM vehicles v WHERE v.vin = '1C4RJFBG3GC328006' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2022);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2023, 305.31, '2023-07-05' FROM vehicles v WHERE v.vin = '1C4RJFBG3GC328006' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2023);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2024, 216.49, '2024-07-12' FROM vehicles v WHERE v.vin = '1C4RJFBG3GC328006' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2024);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2025, 206.97, '2025-07-07' FROM vehicles v WHERE v.vin = '1C4RJFBG3GC328006' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2025);

-- ── 2022 Porsche 718 Boxster ──────────────────────────────
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2025, 548.63, '2025-07-07' FROM vehicles v WHERE v.vin = 'WP0CA2A83NS205186' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2025);

-- ── 2023 Lexus LS500h ─────────────────────────────────────
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2025, 700.04, '2025-12-23' FROM vehicles v WHERE v.vin = 'JTHGYLGF4P5002767' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2025);

-- ── 2022 BMW 740i ─────────────────────────────────────────
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2025, 131.41, '2025-12-23' FROM vehicles v WHERE v.vin = 'WBA7T4C05NCK92837' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2025);

-- ── 2017 Tesla Model S ────────────────────────────────────
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2018, 486.90, '2018-01-03' FROM vehicles v WHERE v.vin = '5YJSA1E29HF185488' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2018);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2019, 977.66, '2019-07-29' FROM vehicles v WHERE v.vin = '5YJSA1E29HF185488' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2019);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2020, 785.77, '2020-07-08' FROM vehicles v WHERE v.vin = '5YJSA1E29HF185488' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2020);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2021, 746.36, '2021-07-07' FROM vehicles v WHERE v.vin = '5YJSA1E29HF185488' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2021);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2022, 802.86, '2022-07-14' FROM vehicles v WHERE v.vin = '5YJSA1E29HF185488' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2022);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2023, 760.44, '2023-07-05' FROM vehicles v WHERE v.vin = '5YJSA1E29HF185488' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2023);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2024, 377.12, '2024-07-12' FROM vehicles v WHERE v.vin = '5YJSA1E29HF185488' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2024);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2025, 261.46, '2025-07-07' FROM vehicles v WHERE v.vin = '5YJSA1E29HF185488' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2025);

-- ── 1965 Kirkham Cobra ────────────────────────────────────
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2020, 2109.39, '2020-07-08' FROM vehicles v WHERE v.vin = 'CT35866' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2020);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2021, 2109.39, '2021-07-07' FROM vehicles v WHERE v.vin = 'CT35866' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2021);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2022, 2133.54, '2022-07-14' FROM vehicles v WHERE v.vin = 'CT35866' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2022);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2023, 2199.50, '2023-07-05' FROM vehicles v WHERE v.vin = 'CT35866' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2023);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2024, 1347.22, '2024-07-12' FROM vehicles v WHERE v.vin = 'CT35866' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2024);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2025, 0.00, NULL FROM vehicles v WHERE v.vin = 'CT35866' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2025);

-- ── 2006 Audi S4 ──────────────────────────────────────────
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2017, 147.69, '2017-07-06' FROM vehicles v WHERE v.vin = 'WAUGL78E86A130994' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2017);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2018, 130.93, '2018-07-23' FROM vehicles v WHERE v.vin = 'WAUGL78E86A130994' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2018);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2019, 114.00, '2019-07-29' FROM vehicles v WHERE v.vin = 'WAUGL78E86A130994' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2019);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2020, 98.63, '2020-07-08' FROM vehicles v WHERE v.vin = 'WAUGL78E86A130994' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2020);

-- ── 2010 Mercedes GL-Class ────────────────────────────────
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2017, 243.87, '2017-07-06' FROM vehicles v WHERE v.vin = '4JGBF2FE2AA561622' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2017);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2018, 203.69, '2018-07-23' FROM vehicles v WHERE v.vin = '4JGBF2FE2AA561622' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2018);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2019, 66.63, '2019-07-29' FROM vehicles v WHERE v.vin = '4JGBF2FE2AA561622' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2019);

-- ── 2011 Audi Q5 ──────────────────────────────────────────
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2017, 193.36, '2017-07-06' FROM vehicles v WHERE v.vin = 'WA1CFAFP4BA039901' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2017);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2018, 160.27, '2018-07-23' FROM vehicles v WHERE v.vin = 'WA1CFAFP4BA039901' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2018);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2019, 49.63, '2019-07-29' FROM vehicles v WHERE v.vin = 'WA1CFAFP4BA039901' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2019);

-- ── 2012 Rolls-Royce Ghost ────────────────────────────────
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2017, 2355.83, '2017-07-06' FROM vehicles v WHERE v.vin = 'SCA664L50CUX65611' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2017);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2018, 2230.75, '2018-07-23' FROM vehicles v WHERE v.vin = 'SCA664L50CUX65611' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2018);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2019, 2230.75, '2018-07-23' FROM vehicles v WHERE v.vin = 'SCA664L50CUX65611' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2019);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2020, 2052.17, '2020-07-08' FROM vehicles v WHERE v.vin = 'SCA664L50CUX65611' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2020);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2021, 1891.96, '2021-07-07' FROM vehicles v WHERE v.vin = 'SCA664L50CUX65611' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2021);
INSERT INTO vehicle_taxes (vehicle_id, tax_year, amount, paid_date) SELECT v.id, 2022, 1909.77, '2022-07-14' FROM vehicles v WHERE v.vin = 'SCA664L50CUX65611' AND NOT EXISTS (SELECT 1 FROM vehicle_taxes t WHERE t.vehicle_id = v.id AND t.tax_year = 2022);
