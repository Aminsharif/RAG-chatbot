# RAG-chatbot

# generate docker file:  
langgraph dockerfile -c langgraph.json Dockerfile

# Clean build cache
docker builder prune

# Clean everything including build cache
docker system prune -a --volumes --filter "label!=keep"

# Remove all containers
docker rm -f $(docker ps -aq)

# Remove all images
docker rmi -f $(docker images -aq)

# Build and up 
docker compose up --build

