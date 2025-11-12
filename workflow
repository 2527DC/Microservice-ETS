  name: Docker image build and push to Docker Hub

  on:
    push:
      branches:
        - main
        - dev
        - testing
      paths:
        - packages/service-booking/**
        - packages/service-user/**

  jobs:
    build-and-push-to-docker-hub:
      name: Build and Push Docker Images
      runs-on: ubuntu-latest

      strategy:
        matrix:
          service: [service-booking, service-user]

      env:
        DOCKER_USERNAME: ${{ secrets.DOCKER_HUB_USERNAME }}
        DOCKER_PASSWORD: ${{ secrets.DOCKER_HUB_ACCESS_TOKEN }}

      steps:
        - name: Checkout Repository
          uses: actions/checkout@v4

        - name: Set up Docker Buildx
          uses: docker/setup-buildx-action@v3

        - name: Log in to Docker Hub
          uses: docker/login-action@v3
          with:
            username: ${{ env.DOCKER_USERNAME }}
            password: ${{ env.DOCKER_PASSWORD }}

        - name: Determine Environment Tag
          id: vars
          run: |
            echo "GITHUB_REF_NAME=${GITHUB_REF_NAME}"
            if [[ "${GITHUB_REF_NAME}" == "dev" ]]; then
              echo "ENV_TAG=dev" >> $GITHUB_ENV
              echo "BUILD_TARGET=development" >> $GITHUB_ENV
            elif [[ "${GITHUB_REF_NAME}" == "testing" ]]; then
              echo "ENV_TAG=testing" >> $GITHUB_ENV
              echo "BUILD_TARGET=development" >> $GITHUB_ENV
            else
              echo "ENV_TAG=production" >> $GITHUB_ENV
              echo "BUILD_TARGET=production" >> $GITHUB_ENV
            fi
            echo "ENV_TAG=${ENV_TAG}"
            echo "BUILD_TARGET=${BUILD_TARGET}"

        - name: Log and Verify Docker Context
          run: |
            SERVICE_DIR="./packages/${{ matrix.service }}"
            echo "🔹 Service: ${{ matrix.service }}"
            echo "🔍 Current directory: $(pwd)"
            
            echo "📁 Listing all directories under $SERVICE_DIR:"
            find $SERVICE_DIR -type d

            echo "📁 Listing all files recursively under $SERVICE_DIR:"
            ls -R $SERVICE_DIR || echo "⚠️ Directory not found!"

            echo "✅ Verifying Dockerfile exists:"
            if [ -f $SERVICE_DIR/Dockerfile ]; then
              echo "✅ Dockerfile found at $SERVICE_DIR/Dockerfile"
            else
              echo "❌ Dockerfile not found!"
              exit 1
            fi

        - name: Build and Push Docker Image
          uses: docker/build-push-action@v6
          with:
            context: ./packages/${{ matrix.service }}
            file: ./packages/${{ matrix.service }}/Dockerfile
            push: true
            target: ${{ env.BUILD_TARGET }}
            tags: ${{ secrets.DOCKER_HUB_USERNAME }}/microservice:${{ matrix.service }}-${{ env.ENV_TAG }}
            build-args: |
              ENV_TAG=${{ env.ENV_TAG }}
