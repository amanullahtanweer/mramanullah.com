---
title: 'Scaling Rails Applications on High-Performance Servers: My Lessons Learned'
seoTitle: 'Scaling Rails Apps on High-Performance Servers'
slug: 'scaling-rails-applications'
description: 'Lessons from scaling Rails apps on high-performance servers for AI, VoIP, and large-scale API workloads.'
pubDate: '2025-02-16'
updatedDate: '2025-02-16'
tags: ['Rails', 'Scaling', 'Performance', 'DevOps']
---

Scaling a Ruby on Rails application isn't just about adding more resources—it’s about **optimizing queries, caching efficiently, handling background jobs, and managing WebSockets for AI & VoIP applications.**

I've scaled multiple Rails applications on high-performance servers, including a **Hetzner machine with 31 cores, 128GB RAM, and an NVIDIA GPU**. Here's what worked and what didn't.

---

## **1. Optimizing Database Queries in PostgreSQL & MariaDB**

Your database can easily become a bottleneck if not optimized properly. I’ve tackled issues like slow API responses, high read loads, and redundant queries.

### **What Worked for Me**

- **Using Bullet to detect N+1 queries**
- **Adding proper indexes** to foreign keys
- **Using read replicas** to distribute query loads
- **Batching inserts** to avoid performance dips

#### Example: Finding slow queries using `EXPLAIN ANALYZE`

```sql
EXPLAIN ANALYZE SELECT * FROM calls WHERE customer_id = 123;
```

**Lesson:** Always analyze your queries—small tweaks in indexing can lead to huge performance gains.

---

## **2. Redis for Caching and Background Jobs**

I use **Redis extensively** across multiple projects:

- **Caching AI chatbot responses** instead of hitting the LLM every time
- **Using Sidekiq** for API integrations, like Slack bot task management
- **Efficient phone number lookups** using `SADD` and `SMISMEMBER`

#### Example: Checking if a number exists in Redis before inserting

```ruby
# Using Redis to check and insert unique values
if redis.sismember("sixhundredx", phone_number)
  puts "Number already exists!"
else
  redis.sadd("sixhundredx", phone_number)
end
```

**Lesson:** Redis is more than a cache—it’s a fast in-memory data store that can save tons of processing time.

---

## **3. HAProxy & Nginx for Load Balancing APIs**

Handling **100,000+ API requests daily** required me to set up efficient request management.

### **What I Did**

- **HAProxy** for distributing API requests
- **Nginx caching** to speed up frequently requested data
- **Rate limiting** abusive API calls

#### Example: Rate limiting in Nginx

```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=5r/s;
server {
  location /api/ {
    limit_req zone=api_limit burst=10 nodelay;
  }
}
```

**Lesson:** Load balancing is essential once your API scales—it prevents request spikes from taking down your app.

---

## **4. AI & VoIP Workloads in Rails**

Rails isn't usually the first choice for real-time processing, but I’ve successfully used it in **AI transcription** and **VoIP call processing.**

### **Challenges I Faced & Solutions**

✅ **Streaming AI Responses**: Used **Deepgram**, **Google STT**, and **Mello TTS** for speech-to-text  
✅ **WebSockets in Rails**: Optimized **ActionCable** for real-time AI interactions  
✅ **Call routing with Asterisk & OpenSIPS**: Managed **1M+ DID numbers & trunks**

#### Example: Processing VoIP call logs in batches

```ruby
CallLog.insert_all([
  { caller_id: "1234567890", duration: 300, call_status: "Completed" },
  { caller_id: "9876543210", duration: 150, call_status: "Missed" }
])
```

**Lesson:** Combining Rails with Redis, WebSockets, and AI models can make it a powerful tool for real-time applications.

---

## **5. Managing Large-Scale Call Logs Efficiently**

With **millions of VoIP call records**, a standard approach wasn’t going to work.

### **Optimizations I Implemented**

- **Logging calls in Redis before writing to PostgreSQL**
- **Using HAProxy to track hit counts from IPs**
- **Batching logs for 6x6 billing processing**

#### Example: HAProxy logging call request counts

```bash
tail -f /var/log/haproxy.log | grep "call_api"
```

**Lesson:** High-volume logging needs batching, Redis buffering, and proper monitoring.

---

## **6. Reducing Rails Memory Usage**

Rails apps can be memory-hungry, but optimizations help:

- **Enabled Jemalloc for better memory allocation**
- **Used Puma with optimized worker threads**
- **Dockerized deployments with memory limits**

#### Example: Configuring Puma for optimal memory usage

```ruby
workers ENV.fetch("WEB_CONCURRENCY") { 2 }
threads_count = ENV.fetch("RAILS_MAX_THREADS") { 5 }
threads threads_count, threads_count
preload_app!
```

**Lesson:** Optimizing Puma, enabling Jemalloc, and limiting memory in Docker improved overall stability.

---

## **Final Thoughts**

Scaling Rails is not just about adding bigger servers—it’s about **smart optimizations in database queries, caching, API request handling, and background job processing.**

Through my experience working on **VoIP, AI, Slack bots, and high-traffic APIs**, I’ve learned that:

✅ **Redis is a game-changer** for caching and job processing  
✅ **HAProxy + Nginx can handle massive API traffic efficiently**  
✅ **Rails can power real-time AI & VoIP apps with WebSockets**  
✅ **Database optimizations (indexing, read replicas) make a huge impact**

If you’re working on scaling a Rails app, **start with query optimizations, add caching, and implement efficient background processing.**

Have scaling challenges? Drop a comment below—always happy to discuss! 🚀
