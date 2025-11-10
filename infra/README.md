# Infrastructure Documentation

## Overview
This directory contains infrastructure-as-code and deployment configurations for SM Automation platform.

## Production Architecture

### Services
1. **Frontend** (Next.js + Capacitor)
   - Deployed on: Vercel or AWS S3 + CloudFront
   - Static export for web
   - Capacitor bundles for iOS/Android App Stores

2. **Backend** (NestJS API)
   - Deployed on: AWS ECS/Fargate or Kubernetes
   - Auto-scaling based on load
   - Health checks and monitoring

3. **Database** (PostgreSQL)
   - Managed service: AWS RDS or DigitalOcean Managed DB
   - Automated backups
   - Multi-AZ deployment for HA

4. **Cache/Queue** (Redis)
   - Managed service: AWS ElastiCache or Redis Cloud
   - Used for BullMQ job queue
   - Session caching

5. **Storage** (S3)
   - AWS S3 for video/thumbnail storage
   - CloudFront CDN for global delivery
   - Lifecycle policies for cost optimization

## Environment Variables

### Required for Production
```
# Backend
NODE_ENV=production
PORT=3001
DB_HOST=<rds-endpoint>
DB_PORT=5432
DB_USERNAME=<db-user>
DB_PASSWORD=<secure-password>
DB_DATABASE=sm_automation
REDIS_HOST=<elasticache-endpoint>
REDIS_PORT=6379
SESSION_SECRET=<random-32-char-string>
ENCRYPTION_KEY=<random-32-char-key>

# OAuth Credentials (production apps)
FACEBOOK_CLIENT_ID=<prod-fb-client-id>
FACEBOOK_CLIENT_SECRET=<prod-fb-secret>
FACEBOOK_REDIRECT_URI=https://api.smautomation.com/oauth/facebook/complete

INSTAGRAM_CLIENT_ID=<prod-ig-client-id>
INSTAGRAM_CLIENT_SECRET=<prod-ig-secret>
INSTAGRAM_REDIRECT_URI=https://api.smautomation.com/oauth/instagram/complete

TIKTOK_CLIENT_ID=<prod-tt-client-id>
TIKTOK_CLIENT_SECRET=<prod-tt-secret>
TIKTOK_REDIRECT_URI=https://api.smautomation.com/oauth/tiktok/complete

YOUTUBE_CLIENT_ID=<prod-yt-client-id>
YOUTUBE_CLIENT_SECRET=<prod-yt-secret>
YOUTUBE_REDIRECT_URI=https://api.smautomation.com/oauth/youtube/complete
YOUTUBE_API_KEY=<yt-data-api-key>

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<aws-access-key>
AWS_SECRET_ACCESS_KEY=<aws-secret-key>
S3_BUCKET=sm-automation-videos-prod
```

## Deployment Steps

### 1. Backend Deployment

#### Using Docker + ECS
```bash
# Build image
cd backend
docker build -t sm-automation-backend:latest .

# Tag for ECR
docker tag sm-automation-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/sm-automation-backend:latest

# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/sm-automation-backend:latest

# Update ECS service
aws ecs update-service --cluster sm-automation --service backend --force-new-deployment
```

### 2. Frontend Deployment

#### Web (Vercel)
```bash
cd frontend
vercel --prod
```

#### or AWS S3 + CloudFront
```bash
cd frontend
npm run build
aws s3 sync out/ s3://sm-automation-frontend --delete
aws cloudfront create-invalidation --distribution-id <dist-id> --paths "/*"
```

#### Mobile Apps
```bash
cd frontend
npm run build
npx cap sync

# iOS
npx cap open ios
# Build in Xcode, upload to App Store Connect

# Android
npx cap open android
# Build in Android Studio, upload to Play Console
```

### 3. Database Migrations

```bash
cd backend
npm run migration:run
```

## Monitoring & Logging

### Tools
- **Application Monitoring**: Sentry, Datadog, or New Relic
- **Infrastructure Monitoring**: CloudWatch, Prometheus + Grafana
- **Logs**: CloudWatch Logs, Elasticsearch + Kibana
- **Uptime**: Pingdom, UptimeRobot

### Metrics to Track
- API response times
- Job queue length and processing time
- Error rates per endpoint
- Database connection pool usage
- Redis memory usage
- S3 storage costs

## Backup Strategy

### Database
- Automated daily backups (RDS)
- Point-in-time recovery enabled
- Retain backups for 30 days

### S3
- Versioning enabled
- Lifecycle policy: Move to Glacier after 90 days
- Cross-region replication for critical data

## Security

### Best Practices
1. All secrets stored in AWS Secrets Manager or Parameter Store
2. IAM roles with least privilege
3. VPC with private subnets for backend/database
4. WAF rules for API protection
5. SSL/TLS everywhere (HTTPS only)
6. Regular security audits and dependency updates

## Scaling

### Horizontal Scaling
- Backend: ECS tasks auto-scale based on CPU/memory
- Job workers: Scale BullMQ workers independently
- Database: Read replicas for read-heavy workloads

### Cost Optimization
- Reserved instances for predictable load
- Spot instances for job workers
- S3 Intelligent-Tiering for storage
- CloudFront caching to reduce origin load

## Disaster Recovery

### RTO/RPO Goals
- RTO (Recovery Time Objective): < 4 hours
- RPO (Recovery Point Objective): < 1 hour

### Recovery Steps
1. Switch to backup region (if multi-region)
2. Restore database from latest snapshot
3. Redeploy services from container registry
4. Update DNS to point to new infrastructure

## Future Infrastructure Enhancements

- Multi-region deployment for HA
- Kubernetes for advanced orchestration
- Service mesh (Istio) for microservices
- Dedicated AI inference cluster for video generation
- Edge computing for video processing

