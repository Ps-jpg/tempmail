#!/bin/bash

# Deploy Express server to Cloud Run
# Make sure you have gcloud CLI installed and authenticated

PROJECT_ID="tempmail-8f1e2"
SERVICE_NAME="tempmail-api"
REGION="asia-southeast1"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "Building Docker image..."
gcloud builds submit --tag ${IMAGE_NAME} --project ${PROJECT_ID}

echo "Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME} \
  --platform managed \
  --region ${REGION} \
  --project ${PROJECT_ID} \
  --allow-unauthenticated \
  --set-env-vars "NOTION_KEY=${NOTION_KEY},NOTION_PAGE_ID=${NOTION_PAGE_ID},FRONTEND_URL=https://tempmail--tempmail-8f1e2.asia-southeast1.hosted.app" \
  --port 8080 \
  --memory 512Mi \
  --cpu 1

echo "Getting service URL..."
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region ${REGION} --project ${PROJECT_ID} --format 'value(status.url)')

echo "Service deployed at: ${SERVICE_URL}"
echo "Update NEXT_PUBLIC_API_URL in your Next.js app to: ${SERVICE_URL}"

