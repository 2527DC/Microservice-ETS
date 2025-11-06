# 🧩 Microservices Shared Folder Implementation

This document explains the **shared folder** and **deployment strategy** used for the microservices-based project using **Docker**, **CI/CD (GitHub Actions)**, and **EC2**.  
It also highlights the **challenges** faced and the **limitations** of this approach.

---

## ⚙️ Architecture Overview

- Each microservice has its own **Dockerfile**, **deployment logic**, and **CI/CD pipeline**.
- Common logic such as:
  - Utility functions
  - Middlewares
  - Constants
  - Validators
  - Logging and error handling  
    resides inside a **shared folder**.
- The shared folder is mounted into containers through **Docker volumes**, allowing all services to use it without including it in each image.

---

## 🧠 Shared Folder Strategy

### ✅ **Option Implemented:**

**Using Docker Volumes to share the folder**

The shared folder code is copied from the Git repository into a **Docker volume**, which is then mounted into each service container.

This approach allows:

- Centralized management of shared logic.
- Faster service rebuilds (only rebuild changed microservice, not all).
- Independent service updates without re-publishing every image.

---

## ⚙️ Implementation Flow

1. Each microservice has its own folder and Dockerfile (e.g., `auth`, `booking`, `vendor`).
2. A shared folder is cloned separately and copied into a **Docker volume**.
3. The Docker Compose setup mounts this volume into all dependent containers.
4. During CI/CD:
   - GitHub Actions detects which service folder changed.
   - Only that service’s image is built and pushed.
   - On the EC2 server, a script pulls the latest `shared` folder and updates the shared volume.

---

### 🧩 Example Server-Side Script

```bash
# Sync the shared folder inside EC2 and update the Docker volume
git clone --depth 1 --filter=blob:none --sparse https://github.com/<repo>.git temp_repo
cd temp_repo
git sparse-checkout set shared
cp -r shared /var/lib/docker/volumes/shared_volume/_data/
rm -rf temp_repo
```
