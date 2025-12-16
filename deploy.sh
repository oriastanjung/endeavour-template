echo "Building Docker images..."
docker compose build
echo "Pushing Docker images..."
docker compose push
echo "Deployment complete."