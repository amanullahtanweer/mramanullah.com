---
title: 'Building a Custom Slack Bot for Task Management and Team Notifications'
seoTitle: 'How to Build a Slack Bot for Task Management and Notifications'
slug: 'slack-bot-task-management'
description: 'Step-by-step guide on building a Slack bot for automating task tracking and notifications using Node.js and Slack API.'
pubDate: '2024-07-12'
updatedDate: '2024-07-12'
tags: ['Slack', 'Automation', 'Node.js']
---

## **Introduction**

Managing team communication and tracking tasks across multiple Slack channels can be overwhelming. To solve this, I built a **custom Slack bot** that:

- **Tracks task-related messages** from Slack channels
- **Summarizes and sends daily updates**
- **Notifies team members** when tasks are pending
- **Detects unacknowledged messages** and reminds users

In this guide, I'll walk you through how I built a **Slack bot** for task management using **Node.js and Slack API**.

---

## **1. Setting Up a Slack Bot**

First, we need to create a Slack App and get API credentials:

### **Steps to Create a Slack App:**

1. Go to [Slack API Console](https://api.slack.com/apps)
2. Click **"Create New App"** → **From Scratch**
3. Select a workspace and name your bot
4. Navigate to **OAuth & Permissions** and add the following **Bot Token Scopes**:
   - `channels:history` (Read messages)
   - `chat:write` (Send messages)
   - `reactions:read` (Check reactions)
5. Install the app in your workspace and **copy the Bot User OAuth Token**

---

## **2. Setting Up the Node.js Slack Bot**

Install the required dependencies:

```bash
mkdir slack-bot && cd slack-bot
npm init -y
npm install @slack/web-api dotenv express
```

Create a `.env` file to store Slack API credentials:

```env
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret
```

---

## **3. Listening to Slack Messages**

Create `bot.js` and initialize the Slack Web API:

```javascript
require('dotenv').config();
const { WebClient } = require('@slack/web-api');
const express = require('express');

const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);
const app = express();
app.use(express.json());

// Listen for messages in Slack
app.post('/slack/events', async (req, res) => {
	const event = req.body.event;

	if (event && event.type === 'message' && !event.bot_id) {
		console.log(`Message received: ${event.text}`);

		// Reply to the message
		await slackClient.chat.postMessage({
			channel: event.channel,
			text: `Got it! I'll track this task: "${event.text}"`
		});
	}

	res.status(200).send();
});

// Start the server
app.listen(3000, () => console.log('Slack bot is running on port 3000'));
```

### **How It Works:**

- Listens for **new messages** in Slack
- Checks if the message is **task-related**
- Sends a **confirmation message** in the channel

---

## **4. Summarizing Tasks and Sending Daily Reports**

To send **daily task summaries**, we use **cron jobs**:

### **Installing Node Cron**

```bash
npm install node-cron
```

### **Scheduling Daily Task Reports**

Modify `bot.js` to send a summary every day at 9 AM:

```javascript
const cron = require('node-cron');

cron.schedule('0 9 * * *', async () => {
    await slackClient.chat.postMessage({
        channel: 'your-channel-id',
        text: "📌 *Daily Task Summary*:
- Task 1
- Task 2
- Task 3"
    });
    console.log('Sent daily summary to Slack');
});
```

This **automatically sends task summaries** to Slack every morning.

---

## **5. Reminding Users About Unanswered Messages**

If a message doesn’t get a response within 3 hours, the bot sends a **reminder**.

### **Checking Message Replies**

```javascript
async function checkUnansweredMessages() {
	const result = await slackClient.conversations.history({
		channel: 'your-channel-id',
		limit: 10
	});

	const now = Math.floor(Date.now() / 1000);
	for (const message of result.messages) {
		if (!message.replies && now - message.ts > 10800) {
			// 3 hours
			await slackClient.chat.postMessage({
				channel: 'your-channel-id',
				text: `⏳ Reminder: This message needs attention! "${message.text}"`
			});
		}
	}
}

cron.schedule('0 * * * *', checkUnansweredMessages);
```

### **How It Works:**

- Scans recent messages **every hour**
- If a message has **no replies** after 3 hours, it sends a reminder

---

## **6. Deploying the Slack Bot**

Once everything is tested locally, deploy the bot on a **cloud server** using **PM2**:

### **Installing and Running PM2**

```bash
npm install -g pm2
pm2 start bot.js --name slack-bot
pm2 save
pm2 startup
```

Now the bot **runs continuously** in the background, even after server reboots.

---

## **Final Thoughts**

By building this **Slack bot**, I automated **task tracking, notifications, and reminders**, making Slack a more efficient workspace.

- Messages are **tracked automatically**
- Daily **task summaries** keep teams aligned
- Unanswered messages **get flagged for follow-ups**

If your team struggles with **managing Slack tasks**, consider **building a custom bot** to automate it.

Let me know in the comments if you want more features added to this bot! 🚀
