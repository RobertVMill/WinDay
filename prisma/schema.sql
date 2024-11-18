-- Create Users table
CREATE TABLE "User" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Create unique index on User email
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- Create Templates table
CREATE TABLE "Template" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Template_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Template_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create unique index on Template userId and name
CREATE UNIQUE INDEX "Template_userId_name_key" ON "Template"("userId", "name");

-- Create TemplateFields table
CREATE TABLE "TemplateField" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "default" TEXT,
    "placeholder" TEXT,
    "order" INTEGER NOT NULL,
    "templateId" TEXT NOT NULL,
    CONSTRAINT "TemplateField_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "TemplateField_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create unique index on TemplateField templateId and name
CREATE UNIQUE INDEX "TemplateField_templateId_name_key" ON "TemplateField"("templateId", "name");

-- Create Entries table
CREATE TABLE "Entry" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" JSONB NOT NULL,
    "userId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    CONSTRAINT "Entry_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Entry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Entry_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create trigger to automatically update updatedAt
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_user
    BEFORE UPDATE ON "User"
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_template
    BEFORE UPDATE ON "Template"
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_template_field
    BEFORE UPDATE ON "TemplateField"
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_entry
    BEFORE UPDATE ON "Entry"
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();
