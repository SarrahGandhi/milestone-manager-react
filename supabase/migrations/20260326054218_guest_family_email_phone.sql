-- Restrict anon to only safe columns
REVOKE SELECT ON guest_families FROM anon;
GRANT SELECT (id, side, created_at) ON guest_families TO anon;