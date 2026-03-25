-- Compatibility fix:
-- Drivers may have assignments in either:
-- - driver_assignments (vehicle_id based; used by the admin "Assign driver" UI)
-- - driver_locations (location_id based; used by earlier setup instructions)
--
-- Ensure driver visibility works with BOTH assignment mechanisms by allowing
-- driver_can_access_location() to return true for either source.

CREATE OR REPLACE FUNCTION driver_can_access_location(loc_id UUID)
RETURNS BOOLEAN AS $$
  SELECT
    -- Vehicle assignments (via app UI)
    EXISTS (
      SELECT 1
      FROM driver_assignments da
      JOIN vehicles v ON v.id = da.vehicle_id
      WHERE da.user_id = auth.uid()
        AND v.location_id = loc_id
    )
    OR
    -- Location assignments (legacy / seed method)
    EXISTS (
      SELECT 1
      FROM driver_locations dl
      WHERE dl.user_id = auth.uid()
        AND dl.location_id = loc_id
    )
    OR
    get_user_role() IN ('employee', 'controller');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Update locations policy so drivers can see locations assigned via either mechanism.
DROP POLICY IF EXISTS "Locations: drivers see assigned" ON locations;

CREATE POLICY "Locations: drivers see assigned" ON locations
  FOR SELECT USING (
    get_user_role() = 'driver' AND
    id IN (
      -- Direct location assignments
      SELECT dl.location_id
      FROM driver_locations dl
      WHERE dl.user_id = auth.uid()

      UNION

      -- Vehicle assignments derived into locations
      SELECT v.location_id
      FROM vehicles v
      WHERE v.location_id IS NOT NULL
        AND v.id IN (
          SELECT vehicle_id
          FROM driver_assignments
          WHERE user_id = auth.uid()
        )
    )
  );

