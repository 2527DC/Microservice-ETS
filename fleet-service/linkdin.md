# Developer Insights & Life Update 🚀

I must admit — it has been tough to stay active here. Between **managing office work** and **skilling up for future projects**, I barely found time to post. I even had a close call where I almost **lost access to my previous LinkedIn posts** while experimenting with posting via the API 😅.

To avoid that in the future, I decided to **automate my posts through the LinkedIn API**, so I can focus on work and learning while still sharing my experiences.

This week, I explored **microservice architecture** and **shared resources management** in Docker.

Here’s what I worked on:

- Implemented a **shared folder strategy** for my containerized services, including the **Prisma ORM generated folder**.
- Setup **Docker volumes** to share common code (like shared utilities and ORM schema) across multiple services.
- Integrated **CI/CD pipelines** (GitHub Actions) to automatically copy shared folders to the server and manage container usage.

**Pros of this approach:**

- Centralized shared code management ✅
- Easy updates across multiple services ✅
- Keeps container images lean by mounting volumes instead of bundling everything ✅

**Cons / Challenges:**

- **Doesn’t fully follow microservice principles** ❌: My services aren’t fully independent; sharing a volume across multiple services couples them tightly.
- **Volume mounts differ between environments** ❌: What works in dev may fail in staging or production, leading to environment-specific bugs.
- **Monorepo & copy commands create bottlenecks** ❌: With the entire project in a single repo, if the CI/CD command to copy the shared folder fails on the server host, the services fail to start.
- **Startup failures** ❌: Any small issue in copying the volume or shared folder can block the entire project.

**Note / Reflection:**  
I started implementing this approach because it seemed convenient from Medium articles and tutorials. However, after hands-on trials, it became clear why this isn’t ideal for true microservice architecture. The bottlenecks and tight coupling taught me **why to avoid sharing volumes across services** and to think carefully before merging everything in a monorepo.

**Alternatives I considered:**

1. Publish the shared folder as an **npm package** and include it as a dependency in each service.
2. Copy the shared folder directly into each service’s image at build time.
3. For Prisma ORM, migrate and generate schema during **CI/CD build** instead of inside the container at runtime.

Overall, using **shared volumes vs npm packages** has trade-offs, but with proper CI/CD automation, it’s easier for me to maintain a single database with Prisma across services.

#Microservices #Docker #PrismaORM #CI_CD #BackendDevelopment #DevInsights #Automation
