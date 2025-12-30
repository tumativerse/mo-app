# DevOps Infrastructure Plan

Complete CI/CD and monitoring infrastructure for Mo App hosted on `vault.tumati.me`.

---

## Overview

**Host:** vault.tumati.me
**Purpose:** Centralized DevOps hub for development, testing, deployment, and monitoring
**Projects:** mo-app, mo-docs, mo-arch

---

## Infrastructure Components

### 1. CI/CD Pipeline (Jenkins)

**Purpose:** Automated build, test, and deployment

**Jenkins Setup:**
- **URL:** `https://vault.tumati.me/jenkins`
- **Jobs:**
  - `mo-app-test` - Run tests on PR
  - `mo-app-build` - Build on main branch
  - `mo-app-deploy-staging` - Deploy to staging
  - `mo-app-deploy-production` - Deploy to production
  - `mo-docs-build` - Build documentation site
  - `mo-arch-build` - Build architecture docs

**Pipeline Stages:**
```
1. Checkout
2. Install Dependencies
3. Lint (ESLint + Prettier)
4. Type Check (TypeScript)
5. Unit Tests
6. Integration Tests
7. Build
8. E2E Tests (optional)
9. Deploy
10. Health Check
```

**Jenkinsfile Example:**
```groovy
pipeline {
  agent any

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install') {
      steps {
        sh 'npm ci'
      }
    }

    stage('Lint') {
      steps {
        sh 'npm run lint'
      }
    }

    stage('Type Check') {
      steps {
        sh 'npx tsc --noEmit'
      }
    }

    stage('Test') {
      parallel {
        stage('Unit Tests') {
          steps {
            sh 'npm test -- --coverage'
          }
        }
        stage('Integration Tests') {
          steps {
            sh 'npm run test:integration'
          }
        }
      }
    }

    stage('Build') {
      steps {
        sh 'npm run build'
      }
    }

    stage('Deploy to Staging') {
      when {
        branch 'main'
      }
      steps {
        sh './scripts/deploy-staging.sh'
      }
    }

    stage('E2E Tests') {
      when {
        branch 'main'
      }
      steps {
        sh 'npm run test:e2e'
      }
    }

    stage('Deploy to Production') {
      when {
        branch 'main'
      }
      input {
        message "Deploy to production?"
        ok "Deploy"
      }
      steps {
        sh './scripts/deploy-production.sh'
      }
    }
  }

  post {
    always {
      junit '**/test-results/**/*.xml'
      publishHTML([
        reportDir: 'coverage',
        reportFiles: 'index.html',
        reportName: 'Coverage Report'
      ])
    }
    failure {
      // Send notification
      sh './scripts/notify-failure.sh'
    }
  }
}
```

---

### 2. Monitoring & Observability

#### 2.1 Application Monitoring (Sentry)

**Purpose:** Error tracking and performance monitoring

- **URL:** `https://vault.tumati.me/sentry` (self-hosted) or Sentry.io
- **Features:**
  - Real-time error tracking
  - Performance monitoring
  - Release tracking
  - User feedback
  - Source maps for stack traces

**Integration:**
```typescript
// app/layout.tsx
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

#### 2.2 Metrics & Analytics (Grafana + Prometheus)

**Purpose:** System metrics and custom analytics

**Stack:**
- **Prometheus:** Time-series database for metrics
- **Grafana:** Visualization dashboards
- **Node Exporter:** System metrics
- **Custom exporters:** Application metrics

**Dashboards:**
1. **Application Health**
   - Request rate
   - Error rate
   - Response time (p50, p95, p99)
   - Active users

2. **Database Performance**
   - Query performance
   - Connection pool
   - Slow queries
   - Database size

3. **Infrastructure**
   - CPU usage
   - Memory usage
   - Disk I/O
   - Network traffic

4. **Business Metrics**
   - Daily active users
   - Workouts completed
   - API usage by endpoint
   - Feature adoption

**Custom Metrics Example:**
```typescript
// lib/metrics.ts
import { Counter, Histogram } from 'prom-client';

export const workoutCounter = new Counter({
  name: 'mo_workouts_completed_total',
  help: 'Total number of workouts completed',
  labelNames: ['day_type'],
});

export const apiDuration = new Histogram({
  name: 'mo_api_duration_seconds',
  help: 'API endpoint duration',
  labelNames: ['endpoint', 'method', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5],
});
```

#### 2.3 Logging (ELK Stack or Loki)

**Purpose:** Centralized log aggregation and search

**Option A: ELK Stack**
- **Elasticsearch:** Store logs
- **Logstash:** Process logs
- **Kibana:** Search and visualize

**Option B: Grafana Loki** (Lighter, recommended)
- **Loki:** Log aggregation
- **Promtail:** Log collector
- **Grafana:** Query and visualize

**Log Structure:**
```json
{
  "timestamp": "2024-01-01T12:00:00Z",
  "level": "error",
  "message": "Failed to fetch workout",
  "userId": "user-123",
  "endpoint": "/api/ppl/today",
  "error": {
    "message": "Database connection failed",
    "stack": "..."
  },
  "metadata": {
    "sessionId": "session-456",
    "userAgent": "..."
  }
}
```

---

### 3. Testing Infrastructure

#### 3.1 Test Database

**Purpose:** Isolated database for tests

- **PostgreSQL:** Separate test database
- **Reset:** Clear before each test run
- **Seeding:** Populate with test data

**Setup:**
```bash
# .env.test
DATABASE_URL="postgresql://test:test@localhost:5432/mo_test"
```

#### 3.2 E2E Testing (Playwright)

**Purpose:** Full user flow testing

**Setup:**
```typescript
// playwright.config.ts
export default {
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 12'] } },
  ],
};
```

**Example E2E Test:**
```typescript
// e2e/workout.spec.ts
test('complete workout flow', async ({ page }) => {
  await page.goto('/workout');
  await page.click('text=Start Workout');

  // Log first set
  await page.fill('[name="weight"]', '135');
  await page.fill('[name="reps"]', '10');
  await page.click('button:has-text("Log Set")');

  // Complete workout
  await page.click('text=Complete Workout');

  await expect(page.locator('text=Workout Complete')).toBeVisible();
});
```

#### 3.3 Visual Regression Testing (Percy or Chromatic)

**Purpose:** Catch UI regressions

- **Percy:** Visual diffing
- **Chromatic:** Storybook + visual testing

---

### 4. Code Quality Tools

#### 4.1 SonarQube

**Purpose:** Code quality and security analysis

- **URL:** `https://vault.tumati.me/sonar`
- **Metrics:**
  - Code coverage
  - Code smells
  - Bugs
  - Security vulnerabilities
  - Technical debt

#### 4.2 Dependabot

**Purpose:** Automated dependency updates

- **GitHub integration:** Auto PRs for updates
- **Security alerts:** CVE notifications

---

### 5. Deployment Infrastructure

#### 5.1 Environments

| Environment | URL | Branch | Purpose |
|-------------|-----|--------|---------|
| Development | localhost:3000 | feature/* | Local dev |
| Staging | staging.mo.app | main | Pre-production |
| Production | mo.app | main (manual) | Live users |

#### 5.2 Deployment Strategy

**Blue-Green Deployment:**
```
1. Deploy to "green" (new version)
2. Run health checks
3. Switch traffic to green
4. Keep blue as rollback
```

**Canary Deployment:**
```
1. Deploy to 10% of users
2. Monitor metrics
3. Gradually increase to 100%
4. Rollback if issues
```

---

### 6. Notification & Alerting

#### 6.1 Notification Channels

- **Slack:** `#mo-deployments`, `#mo-alerts`
- **Email:** Critical alerts
- **PagerDuty:** On-call rotation

#### 6.2 Alert Rules

**Critical:**
- Error rate > 5%
- API response time > 2s (p95)
- Database connection failures
- Deployment failures

**Warning:**
- Error rate > 1%
- API response time > 1s (p95)
- Disk usage > 80%
- Memory usage > 85%

---

## Infrastructure as Code

### Docker Compose for vault.tumati.me

```yaml
version: '3.8'

services:
  jenkins:
    image: jenkins/jenkins:lts
    ports:
      - "8080:8080"
    volumes:
      - jenkins_home:/var/jenkins_home
    environment:
      - JAVA_OPTS=-Djenkins.install.runSetupWizard=false

  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    volumes:
      - grafana_data:/var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin

  loki:
    image: grafana/loki
    ports:
      - "3100:3100"
    volumes:
      - loki_data:/loki

  promtail:
    image: grafana/promtail
    volumes:
      - /var/log:/var/log
      - ./promtail-config.yml:/etc/promtail/config.yml

  postgres-test:
    image: postgres:15
    environment:
      POSTGRES_DB: mo_test
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
    ports:
      - "5433:5432"

  sonarqube:
    image: sonarqube:community
    ports:
      - "9000:9000"
    environment:
      - SONAR_JDBC_URL=jdbc:postgresql://postgres-test:5432/sonarqube
    volumes:
      - sonarqube_data:/opt/sonarqube/data

volumes:
  jenkins_home:
  prometheus_data:
  grafana_data:
  loki_data:
  sonarqube_data:
```

---

## Access & Security

### Authentication

- **Jenkins:** LDAP or GitHub OAuth
- **Grafana:** Same as Jenkins
- **SonarQube:** Same as Jenkins

### Network Security

- **Firewall:** Only ports 80, 443, 22 open
- **SSL:** Let's Encrypt certificates
- **VPN:** Optional for internal tools

---

## Cost Estimation

| Service | Hosting | Monthly Cost |
|---------|---------|--------------|
| vault.tumati.me server | DigitalOcean 4GB | $24 |
| Sentry | Sentry.io (free tier) | $0 |
| Database backups | S3 compatible | $5 |
| Domain | Existing | $0 |
| **Total** | | **~$30/mo** |

---

## Implementation Plan

### Phase 1: Core CI/CD (Week 1)
- [ ] Set up Jenkins on vault.tumati.me
- [ ] Create Jenkinsfile for mo-app
- [ ] Set up GitHub webhooks
- [ ] Configure staging deployment

### Phase 2: Testing (Week 2)
- [ ] Set up test database
- [ ] Add E2E tests with Playwright
- [ ] Configure coverage reporting
- [ ] Add visual regression tests

### Phase 3: Monitoring (Week 3)
- [ ] Set up Prometheus + Grafana
- [ ] Configure application metrics
- [ ] Set up Loki for logs
- [ ] Create dashboards

### Phase 4: Alerting (Week 4)
- [ ] Configure Slack notifications
- [ ] Set up alert rules
- [ ] Test incident response
- [ ] Document runbooks

---

## Monitoring Dashboards

### Dashboard 1: Application Health
```
┌─────────────────────────────────────┐
│ Request Rate        Error Rate      │
│  1,234 req/min       0.3%           │
│ ────────────────────────────────── │
│ Response Time (p95)  Active Users   │
│  234ms               142            │
└─────────────────────────────────────┘

Graph: Request Rate (last 24h)
Graph: Error Rate (last 24h)
Graph: Response Time p50/p95/p99
```

### Dashboard 2: Database
```
┌─────────────────────────────────────┐
│ Connection Pool     Slow Queries    │
│  12 / 20            3 (last hour)   │
│ ────────────────────────────────── │
│ Query Time (avg)    DB Size         │
│  45ms               2.3 GB          │
└─────────────────────────────────────┘

Graph: Query duration by endpoint
Table: Top 10 slow queries
```

### Dashboard 3: Business Metrics
```
┌─────────────────────────────────────┐
│ Daily Active Users  Workouts Today  │
│  87                 42              │
│ ────────────────────────────────── │
│ New Users (week)    Retention       │
│  12                 73%             │
└─────────────────────────────────────┘

Graph: DAU trend
Graph: Feature adoption
```

---

## Runbooks

### Runbook: High Error Rate

**Alert:** Error rate > 5% for 5 minutes

**Steps:**
1. Check Sentry for recent errors
2. Check recent deployments (rollback if needed)
3. Check database status
4. Check external dependencies
5. Scale if traffic spike
6. Notify team if unresolved in 15 min

### Runbook: Database Connection Failures

**Alert:** DB connection errors detected

**Steps:**
1. Check database server status
2. Check connection pool exhaustion
3. Check for slow queries blocking connections
4. Restart connection pool if needed
5. Scale database if CPU/memory high

---

## Future Enhancements

- **A/B Testing:** Feature flags with LaunchDarkly
- **Session Replay:** LogRocket or similar
- **APM:** Application Performance Monitoring
- **Security Scanning:** Snyk or similar
- **Load Testing:** k6 or Artillery
- **Chaos Engineering:** Simulate failures
