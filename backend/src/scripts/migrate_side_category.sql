-- 1. Add 'side' column
ALTER TABLE guests ADD COLUMN IF NOT EXISTS side VARCHAR(50);

-- 2. Migrate existing 'bride'/'groom' categories to the new 'side' column
UPDATE guests 
SET side = category 
WHERE category IN ('bride', 'groom');

-- 3. Set a default 'side' for records that didn't have bride/groom (if any)
-- Optional: UPDATE guests SET side = 'bride' WHERE side IS NULL;

-- 4. Update 'category' to a generic value for the migrated rows
-- We do this because 'bride' and 'groom' are no longer valid 'categories' in the new schema
UPDATE guests 
SET category = 'Other' 
WHERE category IN ('bride', 'groom');

-- Verification
-- SELECT id, name, side, category FROM guests LIMIT 10;
