#!/bin/bash

# Define list of Python model files (without .py extension)
models=(
  cutoff
  iam
  route
  tenant
  vendor_user
  admin
  driver
  route_booking
  shift
  vehicle_type
  vendor
  booking
  employee
  route_management
  team
  vehicle
  weekoff_config
)

# Define the target directory - YOU NEED TO SET THIS PATH
TARGET_DIR="./prisma/"

# Create the target folder if it doesn't exist
mkdir -p "$TARGET_DIR"

# Loop through each name and create a .prisma file
for model in "${models[@]}"; do
  # Capitalize first letter (works across bash versions)
  model_name="$(tr '[:lower:]' '[:upper:]' <<< "${model:0:1}")${model:1}"
  
  filename="$TARGET_DIR/${model}.prisma"
  echo "Creating $filename ..."
  
  cat <<EOF > "$filename"
// ==============================================
// Prisma Schema for: ${model}.prisma
// Generated on $(date)
// ==============================================

model ${model_name} {
  id         Int      @id @default(autoincrement())
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
}
EOF
done

echo "✅ All .prisma files have been created inside the '$TARGET_DIR' directory!"