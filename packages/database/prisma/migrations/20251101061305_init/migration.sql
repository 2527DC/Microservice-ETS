-- CreateEnum
CREATE TYPE "GenderEnum" AS ENUM ('Male', 'Female', 'Other');

-- CreateEnum
CREATE TYPE "VerificationStatusEnum" AS ENUM ('Pending', 'Approved', 'Rejected');

-- CreateEnum
CREATE TYPE "BookingStatusEnum" AS ENUM ('Pending', 'Confirmed', 'Ongoing', 'Completed', 'Cancelled', 'No-Show');

-- CreateEnum
CREATE TYPE "ShiftLogTypeEnum" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "PickupTypeEnum" AS ENUM ('Pickup', 'Nodal');

-- CreateEnum
CREATE TYPE "RouteManagementStatusEnum" AS ENUM ('Planned', 'Assigned', 'InProgress', 'Completed', 'Cancelled');

-- CreateTable
CREATE TABLE "admin" (
    "admin_id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_pkey" PRIMARY KEY ("admin_id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "booking_id" SERIAL NOT NULL,
    "tenant_id" VARCHAR(50) NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "employee_code" VARCHAR(50) NOT NULL,
    "shift_id" INTEGER,
    "team_id" INTEGER,
    "booking_date" DATE NOT NULL,
    "pickup_latitude" DOUBLE PRECISION,
    "pickup_longitude" DOUBLE PRECISION,
    "pickup_location" VARCHAR(255),
    "drop_latitude" DOUBLE PRECISION,
    "drop_longitude" DOUBLE PRECISION,
    "drop_location" VARCHAR(255),
    "status" "BookingStatusEnum" NOT NULL DEFAULT 'Pending',
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("booking_id")
);

-- CreateTable
CREATE TABLE "cutoffs" (
    "tenant_id" VARCHAR(50) NOT NULL,
    "booking_cutoff" INTEGER NOT NULL DEFAULT 0,
    "cancel_cutoff" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "cutoffs_pkey" PRIMARY KEY ("tenant_id")
);

-- CreateTable
CREATE TABLE "drivers" (
    "driver_id" SERIAL NOT NULL,
    "vendor_id" INTEGER NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "gender" "GenderEnum",
    "password" VARCHAR(255) NOT NULL,
    "date_of_birth" DATE,
    "date_of_joining" DATE,
    "permanent_address" TEXT,
    "current_address" TEXT,
    "photo_url" TEXT,
    "bg_verify_status" "VerificationStatusEnum",
    "bg_expiry_date" DATE,
    "bg_verify_url" TEXT,
    "police_verify_status" "VerificationStatusEnum",
    "police_expiry_date" DATE,
    "police_verify_url" TEXT,
    "medical_verify_status" "VerificationStatusEnum",
    "medical_expiry_date" DATE,
    "medical_verify_url" TEXT,
    "training_verify_status" "VerificationStatusEnum",
    "training_expiry_date" DATE,
    "training_verify_url" TEXT,
    "eye_verify_status" "VerificationStatusEnum",
    "eye_expiry_date" DATE,
    "eye_verify_url" TEXT,
    "license_number" VARCHAR(100),
    "license_expiry_date" DATE,
    "license_url" TEXT,
    "badge_number" VARCHAR(100),
    "badge_expiry_date" DATE,
    "badge_url" TEXT,
    "alt_govt_id_number" VARCHAR(20),
    "alt_govt_id_type" VARCHAR(50),
    "alt_govt_id_url" TEXT,
    "induction_date" DATE,
    "induction_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drivers_pkey" PRIMARY KEY ("driver_id")
);

-- CreateTable
CREATE TABLE "employees" (
    "employee_id" SERIAL NOT NULL,
    "tenant_id" VARCHAR(50) NOT NULL,
    "role_id" INTEGER NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "employee_code" VARCHAR(50) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "team_id" INTEGER,
    "phone" VARCHAR(20) NOT NULL,
    "alternate_phone" VARCHAR(20),
    "special_needs" TEXT,
    "special_needs_start_date" DATE,
    "special_needs_end_date" DATE,
    "address" TEXT,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "gender" "GenderEnum",
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("employee_id")
);

-- CreateTable
CREATE TABLE "iam_permissions" (
    "permission_id" SERIAL NOT NULL,
    "module" VARCHAR(100) NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "iam_permissions_pkey" PRIMARY KEY ("permission_id")
);

-- CreateTable
CREATE TABLE "iam_policies" (
    "policy_id" SERIAL NOT NULL,
    "tenant_id" VARCHAR(50),
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_system_policy" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "iam_policies_pkey" PRIMARY KEY ("policy_id")
);

-- CreateTable
CREATE TABLE "iam_policy_permission" (
    "policy_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,

    CONSTRAINT "iam_policy_permission_pkey" PRIMARY KEY ("policy_id","permission_id")
);

-- CreateTable
CREATE TABLE "iam_roles" (
    "role_id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "tenant_id" VARCHAR(50),
    "is_system_role" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "iam_roles_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "iam_role_policy" (
    "role_id" INTEGER NOT NULL,
    "policy_id" INTEGER NOT NULL,

    CONSTRAINT "iam_role_policy_pkey" PRIMARY KEY ("role_id","policy_id")
);

-- CreateTable
CREATE TABLE "Route" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route_management_bookings" (
    "id" SERIAL NOT NULL,
    "route_id" VARCHAR(100) NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "stop_order" INTEGER NOT NULL,
    "estimated_pickup_time" VARCHAR(10),
    "estimated_drop_time" VARCHAR(10),
    "distance_from_previous" DOUBLE PRECISION,
    "cumulative_distance" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "route_management_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route_management" (
    "route_id" VARCHAR(100) NOT NULL,
    "tenant_id" VARCHAR(50) NOT NULL,
    "shift_id" INTEGER,
    "route_code" VARCHAR(100) NOT NULL,
    "status" "RouteManagementStatusEnum" NOT NULL DEFAULT 'Planned',
    "planned_distance_km" DOUBLE PRECISION,
    "planned_duration_minutes" INTEGER,
    "actual_distance_km" DOUBLE PRECISION,
    "actual_duration_minutes" INTEGER,
    "actual_start_time" TIMESTAMP(3),
    "actual_end_time" TIMESTAMP(3),
    "optimized_polyline" TEXT,
    "assigned_vendor_id" INTEGER,
    "assigned_vehicle_id" INTEGER,
    "assigned_driver_id" INTEGER,
    "total_distance_km" DOUBLE PRECISION,
    "total_time_minutes" DOUBLE PRECISION,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "route_management_pkey" PRIMARY KEY ("route_id")
);

-- CreateTable
CREATE TABLE "shifts" (
    "shift_id" SERIAL NOT NULL,
    "tenant_id" VARCHAR(50) NOT NULL,
    "shift_code" VARCHAR(50) NOT NULL,
    "log_type" "ShiftLogTypeEnum" NOT NULL,
    "shift_time" TIME(6) NOT NULL,
    "pickup_type" "PickupTypeEnum",
    "gender" "GenderEnum",
    "waiting_time_minutes" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shifts_pkey" PRIMARY KEY ("shift_id")
);

-- CreateTable
CREATE TABLE "teams" (
    "team_id" SERIAL NOT NULL,
    "tenant_id" VARCHAR(50) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("team_id")
);

-- CreateTable
CREATE TABLE "tenants" (
    "tenant_id" VARCHAR(50) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "address" VARCHAR(255),
    "longitude" DECIMAL(9,6),
    "latitude" DECIMAL(9,6),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("tenant_id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "vehicle_id" SERIAL NOT NULL,
    "vehicle_type_id" INTEGER NOT NULL,
    "vendor_id" INTEGER NOT NULL,
    "driver_id" INTEGER,
    "rc_number" VARCHAR(100) NOT NULL,
    "rc_expiry_date" DATE,
    "description" TEXT,
    "puc_number" VARCHAR(100),
    "puc_expiry_date" DATE,
    "puc_url" TEXT,
    "fitness_number" VARCHAR(100),
    "fitness_expiry_date" DATE,
    "fitness_url" TEXT,
    "tax_receipt_number" VARCHAR(100),
    "tax_receipt_date" DATE,
    "tax_receipt_url" TEXT,
    "insurance_number" VARCHAR(100),
    "insurance_expiry_date" DATE,
    "insurance_url" TEXT,
    "permit_number" VARCHAR(100),
    "permit_expiry_date" DATE,
    "permit_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("vehicle_id")
);

-- CreateTable
CREATE TABLE "vehicle_types" (
    "vehicle_type_id" SERIAL NOT NULL,
    "vendor_id" INTEGER NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "seats" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_types_pkey" PRIMARY KEY ("vehicle_type_id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "vendor_id" SERIAL NOT NULL,
    "tenant_id" VARCHAR(50) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "vendor_code" VARCHAR(50) NOT NULL,
    "email" VARCHAR(150),
    "phone" VARCHAR(20),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("vendor_id")
);

-- CreateTable
CREATE TABLE "vendor_users" (
    "vendor_user_id" SERIAL NOT NULL,
    "tenant_id" VARCHAR(50) NOT NULL,
    "vendor_id" INTEGER NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_users_pkey" PRIMARY KEY ("vendor_user_id")
);

-- CreateTable
CREATE TABLE "weekoff_configs" (
    "weekoff_id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "monday" BOOLEAN NOT NULL DEFAULT false,
    "tuesday" BOOLEAN NOT NULL DEFAULT false,
    "wednesday" BOOLEAN NOT NULL DEFAULT false,
    "thursday" BOOLEAN NOT NULL DEFAULT false,
    "friday" BOOLEAN NOT NULL DEFAULT false,
    "saturday" BOOLEAN NOT NULL DEFAULT false,
    "sunday" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weekoff_configs_pkey" PRIMARY KEY ("weekoff_id")
);

-- CreateIndex
CREATE INDEX "admin_admin_id_idx" ON "admin"("admin_id");

-- CreateIndex
CREATE INDEX "bookings_booking_id_idx" ON "bookings"("booking_id");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE INDEX "drivers_driver_id_idx" ON "drivers"("driver_id");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_vendor_id_email_key" ON "drivers"("vendor_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_vendor_id_phone_key" ON "drivers"("vendor_id", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_vendor_id_badge_number_key" ON "drivers"("vendor_id", "badge_number");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_vendor_id_license_number_key" ON "drivers"("vendor_id", "license_number");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_vendor_id_code_key" ON "drivers"("vendor_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_vendor_id_alt_govt_id_number_key" ON "drivers"("vendor_id", "alt_govt_id_number");

-- CreateIndex
CREATE UNIQUE INDEX "employees_tenant_id_employee_code_key" ON "employees"("tenant_id", "employee_code");

-- CreateIndex
CREATE UNIQUE INDEX "employees_tenant_id_email_key" ON "employees"("tenant_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "employees_tenant_id_phone_key" ON "employees"("tenant_id", "phone");

-- CreateIndex
CREATE INDEX "iam_permissions_permission_id_idx" ON "iam_permissions"("permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "iam_permissions_module_action_key" ON "iam_permissions"("module", "action");

-- CreateIndex
CREATE INDEX "iam_policies_tenant_id_idx" ON "iam_policies"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "iam_policies_tenant_id_name_key" ON "iam_policies"("tenant_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "iam_roles_tenant_id_name_key" ON "iam_roles"("tenant_id", "name");

-- CreateIndex
CREATE INDEX "route_management_bookings_id_idx" ON "route_management_bookings"("id");

-- CreateIndex
CREATE UNIQUE INDEX "route_management_bookings_route_id_booking_id_key" ON "route_management_bookings"("route_id", "booking_id");

-- CreateIndex
CREATE INDEX "route_management_route_id_idx" ON "route_management"("route_id");

-- CreateIndex
CREATE INDEX "ix_route_management_tenant_status" ON "route_management"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "route_management_tenant_id_route_code_key" ON "route_management"("tenant_id", "route_code");

-- CreateIndex
CREATE INDEX "shifts_shift_id_idx" ON "shifts"("shift_id");

-- CreateIndex
CREATE UNIQUE INDEX "shifts_tenant_id_shift_code_key" ON "shifts"("tenant_id", "shift_code");

-- CreateIndex
CREATE INDEX "teams_team_id_idx" ON "teams"("team_id");

-- CreateIndex
CREATE UNIQUE INDEX "teams_tenant_id_name_key" ON "teams"("tenant_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_name_key" ON "tenants"("name");

-- CreateIndex
CREATE INDEX "vehicles_vehicle_id_idx" ON "vehicles"("vehicle_id");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_vendor_id_rc_number_key" ON "vehicles"("vendor_id", "rc_number");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_vendor_id_puc_number_key" ON "vehicles"("vendor_id", "puc_number");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_vendor_id_fitness_number_key" ON "vehicles"("vendor_id", "fitness_number");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_vendor_id_tax_receipt_number_key" ON "vehicles"("vendor_id", "tax_receipt_number");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_vendor_id_insurance_number_key" ON "vehicles"("vendor_id", "insurance_number");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_vendor_id_permit_number_key" ON "vehicles"("vendor_id", "permit_number");

-- CreateIndex
CREATE INDEX "vehicle_types_vehicle_type_id_idx" ON "vehicle_types"("vehicle_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_types_vendor_id_name_key" ON "vehicle_types"("vendor_id", "name");

-- CreateIndex
CREATE INDEX "vendors_vendor_id_idx" ON "vendors"("vendor_id");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_tenant_id_name_key" ON "vendors"("tenant_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_tenant_id_vendor_code_key" ON "vendors"("tenant_id", "vendor_code");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_tenant_id_email_key" ON "vendors"("tenant_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_tenant_id_phone_key" ON "vendors"("tenant_id", "phone");

-- CreateIndex
CREATE INDEX "vendor_users_vendor_user_id_idx" ON "vendor_users"("vendor_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_users_tenant_id_email_key" ON "vendor_users"("tenant_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_users_tenant_id_phone_key" ON "vendor_users"("tenant_id", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "weekoff_configs_employee_id_key" ON "weekoff_configs"("employee_id");

-- CreateIndex
CREATE INDEX "weekoff_configs_weekoff_id_idx" ON "weekoff_configs"("weekoff_id");

-- AddForeignKey
ALTER TABLE "admin" ADD CONSTRAINT "admin_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "iam_roles"("role_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("employee_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "shifts"("shift_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("team_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cutoffs" ADD CONSTRAINT "cutoffs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("vendor_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("team_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "iam_roles"("role_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iam_policies" ADD CONSTRAINT "iam_policies_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iam_policy_permission" ADD CONSTRAINT "iam_policy_permission_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "iam_policies"("policy_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iam_policy_permission" ADD CONSTRAINT "iam_policy_permission_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "iam_permissions"("permission_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iam_roles" ADD CONSTRAINT "iam_roles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iam_role_policy" ADD CONSTRAINT "iam_role_policy_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "iam_roles"("role_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iam_role_policy" ADD CONSTRAINT "iam_role_policy_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "iam_policies"("policy_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_management_bookings" ADD CONSTRAINT "route_management_bookings_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "route_management"("route_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_vehicle_type_id_fkey" FOREIGN KEY ("vehicle_type_id") REFERENCES "vehicle_types"("vehicle_type_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("vendor_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("driver_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_types" ADD CONSTRAINT "vehicle_types_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("vendor_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_users" ADD CONSTRAINT "vendor_users_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("vendor_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_users" ADD CONSTRAINT "vendor_users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "iam_roles"("role_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekoff_configs" ADD CONSTRAINT "weekoff_configs_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("employee_id") ON DELETE CASCADE ON UPDATE CASCADE;
