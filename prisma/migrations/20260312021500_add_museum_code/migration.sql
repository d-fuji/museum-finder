-- Step 1: Add code column as nullable
ALTER TABLE "Museum" ADD COLUMN "code" VARCHAR(36);

-- Step 2: Populate existing rows with unique cuid-like values
UPDATE "Museum" SET "code" = gen_random_uuid()::VARCHAR(36) WHERE "code" IS NULL;

-- Step 3: Make it NOT NULL
ALTER TABLE "Museum" ALTER COLUMN "code" SET NOT NULL;

-- Step 4: Set default for new rows
ALTER TABLE "Museum" ALTER COLUMN "code" SET DEFAULT gen_random_uuid()::VARCHAR(36);

-- Step 5: Add unique constraint
CREATE UNIQUE INDEX "Museum_code_key" ON "Museum"("code");
