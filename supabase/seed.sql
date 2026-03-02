-- Seed locations
INSERT INTO locations (code, name, address) VALUES
  ('858', 'New Canaan, CT', 'New Canaan, CT'),
  ('432', '432 Park Avenue', '432 Park Ave, NYC'),
  ('Four Chaise', 'Four Chaise', '163 S Main St, Southampton, NY'),
  ('Pink Chimneys', 'Pink Chimneys', 'Bermuda'),
  ('Chipper', 'Chipper', 'New Canaan, CT')
ON CONFLICT (code) DO NOTHING;
