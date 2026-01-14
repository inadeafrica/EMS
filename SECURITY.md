# Security Guide

Security best practices for the Energy Management System.

## Overview

This guide covers security considerations for deploying and operating the Energy Management System in both development and production environments.

## Pre-Deployment Security

### 1. Change Default Credentials

**Critical**: Never use default credentials in production!

```bash
# Copy example environment file
cp .env.example .env

# Edit .env and change ALL default values
nano .env
```

Change these critical values:

```bash
# PostgreSQL
POSTGRES_PASSWORD=<generate_strong_password>

# InfluxDB  
INFLUXDB_ADMIN_PASSWORD=<generate_strong_password>
INFLUXDB_TOKEN=<generate_strong_token>
```

### 2. Generate Strong Credentials

Use secure random generation:

```bash
# Generate strong password (20 characters)
openssl rand -base64 20

# Generate strong token (32 characters)
openssl rand -base64 32

# Generate hex token (64 characters)
openssl rand -hex 32
```

### 3. Environment File Security

Protect your `.env` file:

```bash
# Set restrictive permissions
chmod 600 .env

# Verify .env is in .gitignore
grep -q "^\.env$" .gitignore || echo ".env" >> .gitignore

# Never commit .env to version control
```

## Network Security

### 1. Firewall Configuration

Allow only necessary ports:

```bash
# Ubuntu/Debian with UFW
sudo ufw allow 8080/tcp comment 'OpenEMS UI'
sudo ufw allow 8086/tcp comment 'InfluxDB'
sudo ufw enable

# Restrict to specific IP/network
sudo ufw allow from 192.168.1.0/24 to any port 8080
```

### 2. Bind to Specific Interface

Edit `docker-compose.yml` to bind to specific interface:

```yaml
services:
  openems-ui:
    ports:
      - "127.0.0.1:8080:80"  # Only localhost
      # OR
      - "192.168.1.10:8080:80"  # Specific IP
```

### 3. Use Reverse Proxy

Production setup with nginx:

```nginx
server {
    listen 443 ssl http2;
    server_name energy.example.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 4. Internal Network Only

Keep backend services private:

```yaml
services:
  postgres:
    # Remove ports section - no external access
    networks:
      - openems-network
```

## Access Control

### 1. Restrict API Access

Use API tokens or authentication:

```bash
# Example: Add API key validation in reverse proxy
# nginx configuration
location /api/ {
    if ($http_x_api_key != "your-secret-api-key") {
        return 403;
    }
    proxy_pass http://localhost:8084;
}
```

### 2. Database Access

Secure database access:

```yaml
postgres:
  environment:
    - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
  # No exposed ports for production
  networks:
    - openems-network
```

### 3. InfluxDB Access Control

Use token-based authentication:

```bash
# Create read-only token for applications
docker compose exec influxdb influx auth create \
  --org openems \
  --read-bucket energy_data \
  --description "Read-only for apps"
```

## Data Security

### 1. Encryption at Rest

Use encrypted volumes:

```bash
# Example with LUKS
sudo cryptsetup luksFormat /dev/sdb1
sudo cryptsetup open /dev/sdb1 encrypted_volume
sudo mkfs.ext4 /dev/mapper/encrypted_volume
```

### 2. Encryption in Transit

Enable TLS for all connections:

**For InfluxDB:**
```yaml
influxdb:
  environment:
    - INFLUXD_TLS_CERT=/etc/ssl/influxdb.crt
    - INFLUXD_TLS_KEY=/etc/ssl/influxdb.key
  volumes:
    - ./ssl:/etc/ssl:ro
```

**For PostgreSQL:**
```yaml
postgres:
  environment:
    - POSTGRES_SSL=on
  volumes:
    - ./ssl/server.crt:/var/lib/postgresql/server.crt:ro
    - ./ssl/server.key:/var/lib/postgresql/server.key:ro
```

### 3. Backup Security

Encrypt backups:

```bash
# Backup with encryption
docker compose exec postgres pg_dump -U openems openems | \
  gpg --encrypt --recipient your@email.com > backup_encrypted.sql.gpg

# Restore
gpg --decrypt backup_encrypted.sql.gpg | \
  docker compose exec -T postgres psql -U openems -d openems
```

## Container Security

### 1. Run as Non-Root User

Add to services in `docker-compose.yml`:

```yaml
services:
  openems-edge:
    user: "1000:1000"  # non-root user
```

### 2. Read-Only Root Filesystem

```yaml
services:
  openems-ui:
    read_only: true
    tmpfs:
      - /tmp
      - /var/run
```

### 3. Limit Resources

Prevent resource exhaustion:

```yaml
services:
  openems-backend:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G
```

### 4. Security Scanning

Scan images regularly:

```bash
# Scan for vulnerabilities
docker scan openems/openems-edge:latest
docker scan openems/openems-backend:latest
docker scan postgres:15-alpine
docker scan influxdb:2.7-alpine
```

## Monitoring and Logging

### 1. Enable Audit Logging

```yaml
services:
  postgres:
    environment:
      - POSTGRES_LOG_STATEMENT=all
```

### 2. Centralized Logging

Ship logs to secure location:

```yaml
services:
  openems-edge:
    logging:
      driver: syslog
      options:
        syslog-address: "tcp://logs.example.com:514"
        tag: "openems-edge"
```

### 3. Monitor Access Logs

```bash
# Monitor failed login attempts
docker compose logs postgres | grep "authentication failed"

# Monitor unusual activity
docker compose logs influxdb | grep "unauthorized"
```

## Secrets Management

### 1. Use Docker Secrets (Swarm)

For Docker Swarm deployments:

```yaml
services:
  postgres:
    secrets:
      - postgres_password
    environment:
      - POSTGRES_PASSWORD_FILE=/run/secrets/postgres_password

secrets:
  postgres_password:
    external: true
```

### 2. Use External Secret Management

Integrate with HashiCorp Vault, AWS Secrets Manager, etc.

### 3. Avoid Environment Variables for Secrets

Use files or secret managers instead:

```bash
# Bad
POSTGRES_PASSWORD=secret123

# Better
POSTGRES_PASSWORD_FILE=/run/secrets/postgres_password
```

## Regular Maintenance

### 1. Update Regularly

```bash
# Pull latest secure images
docker compose pull

# Restart with new images
docker compose up -d
```

### 2. Security Patches

Monitor for security updates:
- Subscribe to security mailing lists
- Watch CVE databases
- Follow OpenEMS security advisories

### 3. Audit Configuration

Regular security audits:

```bash
# Check file permissions
ls -la .env
ls -la config/

# Review exposed ports
docker compose ps
netstat -tuln | grep LISTEN

# Check running processes
docker stats
```

## Incident Response

### 1. Suspicious Activity

If you detect suspicious activity:

```bash
# Immediately stop services
docker compose down

# Review logs
docker compose logs > incident_logs.txt

# Check for unauthorized access
grep -i "failed\|unauthorized\|denied" incident_logs.txt
```

### 2. Compromise Response

If compromised:

1. Disconnect from network
2. Preserve logs and evidence
3. Restore from clean backup
4. Change ALL credentials
5. Investigate root cause
6. Apply security patches
7. Monitor for recurrence

## Compliance

### Data Protection

- **GDPR**: Implement data minimization, user consent
- **HIPAA**: If health data involved, use encryption
- **ISO 27001**: Follow information security management

### Audit Trail

Maintain logs for:
- All administrative actions
- Configuration changes
- Access attempts (successful and failed)
- Data exports

## Security Checklist

### Pre-Production

- [ ] Changed all default passwords
- [ ] Generated strong tokens
- [ ] Configured firewall rules
- [ ] Enabled SSL/TLS
- [ ] Restricted database access
- [ ] Set up backup encryption
- [ ] Configured audit logging
- [ ] Limited container resources
- [ ] Scanned images for vulnerabilities
- [ ] Tested disaster recovery

### Post-Production

- [ ] Monitor logs regularly
- [ ] Apply security updates monthly
- [ ] Rotate credentials quarterly
- [ ] Test backups monthly
- [ ] Review access logs weekly
- [ ] Audit configurations quarterly
- [ ] Scan for vulnerabilities weekly
- [ ] Update documentation as needed

## Security Resources

- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/security.html)
- [InfluxDB Security](https://docs.influxdata.com/influxdb/v2/security/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CIS Docker Benchmark](https://www.cisecurity.org/benchmark/docker)

## Report Security Issues

If you discover a security vulnerability:

1. **Do NOT** open a public issue
2. Email security concerns to maintainers
3. Allow time for patch development
4. Follow responsible disclosure

## Disclaimer

This guide provides general security recommendations. Your specific deployment may require additional security measures based on:
- Regulatory requirements
- Threat model
- Data sensitivity
- Network architecture
- Organizational policies

Always consult with security professionals for production deployments handling sensitive data.
