# 🧩 Microservices Shared Folder Implementation

This document explains the **shared folder** and **deployment strategy** used for the microservices-based project using **Docker**, **CI/CD (GitHub Actions)**, and **EC2**.

---

## ⚙️ Architecture Overview

- Each microservice has its own Dockerfile and deployment logic.
- Common logic (e.g., utilities, middlewares, constants, validators) resides in a **shared folder**.
- The shared folder is **mounted via Docker volumes**, allowing multiple services to use shared code without bundling it inside each service image.

---

## 🧠 Shared Folder Strategy

### ✅ **Option Implemented:**

**Using Docker Volumes to share the folder**

The shared folder code from the host is **copied into a Docker volume** and mounted inside each container that needs it.

This approach allows:

- Centralized updates to shared code.
- Containers to read shared modules at runtime.

### ⚠️ Disadvantage:

- The shared folder is **not bundled into each service image**, so:
  - Any change in the shared code requires a volume sync or manual update.
  - The shared folder must be copied or synced properly before container startup.

---

## 🚀 CI/CD Implementation (GitHub Actions)

### 🎯 Objective:

Only rebuild and deploy services whose code has changed.

### ⚙️ Workflow:

1. **Change Detection**

   - GitHub Actions detects which folder(s) changed.
   - If a specific service folder (e.g., `/auth`, `/booking`) changes → only that service is built and pushed.

2. **Docker Build & Push**

   - The pipeline builds the image for the changed service.
   - Pushes the image to the configured **Docker registry** (e.g., Docker Hub or ECR).

3. **Shared Folder Sync**

   - In the CI/CD pipeline or on the EC2 server:
     - Clone or pull only the **`shared` folder** from GitHub.
     - Copy the folder into the **Docker volume** that is mounted across containers.

   ```bash
   # Example Script (server side)
   git clone --depth 1 --filter=blob:none --sparse https://github.com/<repo>.git temp_repo
   cd temp_repo
   git sparse-checkout set shared
   cp -r shared /var/lib/docker/volumes/shared_volume/_data/
   rm -rf temp_repo
   ```
