---
title: 'n8n Cluster Setup with Hetzner Load Balancer, PostgreSQL Failover, and Cloudflare SSL'
seoTitle: 'n8n Cluster Setup with Hetzner and Cloudflare SSL'
slug: 'n8n-cluster-setup-hetzner-cloudflare-ssl'
description: 'A comprehensive guide on setting up an n8n cluster with Hetzner Load Balancer, PostgreSQL failover, and Cloudflare SSL for scalability, security, and high availability.'
pubDate: '2025-02-26'
updatedDate: '2025-02-26'
tags: ['n8n', 'Hetzner', 'Cloudflare']
---

## **Introduction**

Setting up a **highly available n8n cluster** requires load balancing, database redundancy, and secure connections. This guide covers deploying **n8n on Hetzner cloud servers**, configuring a **Hetzner Load Balancer**, setting up **PostgreSQL failover**, and securing traffic with **Cloudflare SSL**.

---

## **1. Why Use a Cluster Setup for n8n?**

A clustered n8n setup ensures:

- **Scalability:** Distributes workload across multiple nodes
- **High Availability:** Prevents downtime with failover mechanisms
- **Security:** Protects traffic with Cloudflare SSL and HTTPS enforcement

---

## **2. Deploying n8n on Hetzner Cloud**

To start, deploy multiple **Hetzner cloud instances**:

- **2 VMs for n8n with Docker Compose**
- **2 VMs for PostgreSQL with automatic failover**

### **Steps:**

1. Create **four Hetzner Cloud VMs** with Ubuntu 22.04
2. Install **Docker and Docker Compose** on two VMs for n8n
3. Install **PostgreSQL with failover** on two database VMs

#### **Deploying n8n using Docker Compose**

```bash
docker run -d --name n8n -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n
```

#### **Setting up PostgreSQL with Failover**

On the first PostgreSQL VM:

```bash
sudo apt update && sudo apt install postgresql
```

Configure replication and enable failover monitoring.

On the second PostgreSQL VM:

```bash
sudo apt install postgresql
```

Sync it with the primary server for automatic failover.

---

## **3. Configuring Hetzner Load Balancer**

To distribute traffic across n8n nodes:

1. Navigate to **Hetzner Cloud Console** → **Load Balancers**
2. Create a **new Load Balancer**
3. Add both n8n instances as **backend targets**
4. Configure **health checks** to monitor service availability:

```bash
http://your-n8n-server-ip:5678/healthz
```

5. Enable **Sticky Sessions** for consistent user experience.

---

## **4. Securing Traffic with Cloudflare SSL**

### **Prerequisites:**

- A **top-level domain** (e.g., example.com)
- **Hetzner DNS zone setup**
- A **Hetzner Load Balancer**

### **Step 1 - Creating the Hetzner DNS Zone**

1. Go to [dns.hetzner.com](https://dns.hetzner.com)
2. Add your **domain name**
3. Disable **automatic scanning**
4. Delete unnecessary default records

### **Step 2 - External DNS Configuration**

To use **Let's Encrypt certificates** with an external DNS provider:

1. Add NS records at your external DNS hoster:

```bash
_acme-challenge.example.com IN NS hydrogen.ns.hetzner.com.
```

2. Repeat this for all Hetzner DNS servers.

### **Step 3 - Setting up SSL in Hetzner Load Balancer**

1. Open **Hetzner Cloud Console**
2. Navigate to **Load Balancer** → **Services**
3. Click **Add service** → **TLS Termination**
4. Select **+ Add certificates** → **Create Certificate**
5. Choose your **Hetzner DNS zone** and enable **wildcard SSL**

```bash
Type	Name	Value
A	ssl.example.com	<load-balancer-ip>
```

### **Step 4 - Enforcing HTTPS**

1. Set up **Cloudflare Full (Strict) SSL**
2. Configure **WAF rules** to block unauthorized access

Example Cloudflare WAF rule:

```json
{
	"action": "block",
	"conditions": [
		{
			"field": "http.request.uri.path",
			"operator": "contains",
			"value": "/admin"
		}
	]
}
```

---

## **5. Running n8n in Production with Load Balancing**

Once configured, verify **load balancing and SSL**:

```bash
curl -I https://your-n8n-domain.com
```

This should return a **valid HTTPS response** from Cloudflare.

---

## **Final Thoughts**

Setting up an **n8n cluster with Hetzner Load Balancer, PostgreSQL failover, and Cloudflare SSL** ensures a robust, scalable automation infrastructure. With this setup:

- **Traffic is evenly distributed** across multiple n8n nodes
- **Cloudflare SSL protects** all connections with HTTPS
- **PostgreSQL failover ensures** high availability

If you're scaling **n8n automation**, this guide provides a secure and scalable framework. Have questions? Drop them in the comments!
