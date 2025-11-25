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

1-> which is the best way to implement of using the shared folder in the container services in microservice where of using the orm (prism ) generated folder for all the services the implementation is the database service container will run and by running some commands like I will copy that to the docker volume so that all the container use it and even same for the shared folder implementation is done like on cicd from the git action what I do is copy the file to the server host where the containers run and I run an command that that shared folder has to be copied to the docker volume and that can be used by the containers

1 -> Or instead of using the shared folder like the above implementation what about pushing it as a package npm package and adding those as dependencies  
 Or just copy the shared folder for each image of services
But how can I use the prism orm generated thing for all the services as I am using single database for all the services

Crons -> using this implimentation of the using the shared folder in volume insted of that lets build docker image by copying that in the
image at the build time and insted of migrating and generateing the prisma in the server host in the container we will make to migrate at the cicd time

In development set up -> lets create a docker image file where the docker has to have multistaging as of now lets use dev and production
