---
title: 'Setting Up Speech-to-Text in Asterisk 21: Comparing AEAP, Google, and Vosk'
seoTitle: 'Asterisk 21 Speech-to-Text: AEAP vs Google vs Vosk'
slug: 'asterisk-speech-to-text'
description: 'A comparison of AEAP, Google Speech-to-Text, and Vosk for transcribing calls in Asterisk 21.'
pubDate: '2024-08-20'
updatedDate: '2024-08-20'
tags: ['Asterisk', 'Speech-to-Text', 'VoIP', 'AEAP', 'Vosk']
---

## **Introduction**

With Asterisk 21, real-time speech-to-text (STT) is more accessible than ever, allowing seamless call transcriptions, IVR automation, and AI-driven call routing. I've tested three STT solutions—AEAP, Google Speech-to-Text, and Vosk—each with unique strengths and trade-offs.

In this guide, I’ll compare installation, latency, cost, and accuracy to help you choose the best option.

---

## **1. AEAP (Asterisk External Application Protocol) Speech-to-Text**

AEAP is Asterisk’s built-in module that enables speech recognition by connecting to external services.

### **Installation**

AEAP is already included in Asterisk 21, but you need to enable it:

```bash
cd /usr/src/asterisk-21
make menuselect
```

- Navigate to **"Resource Modules"**
- Enable **res_aeap.so**
- Recompile and restart Asterisk

```bash
make && make install && systemctl restart asterisk
```

### **Configuring AEAP in Dialplan**

Add this to your **extensions.conf**:

```plaintext
exten => 100,1,Answer()
 same => n,SpeechCreate()
 same => n,SpeechStart()
 same => n,SpeechBackground(beep,10)
 same => n,Set(SPEECH_TEXT_RESULT=${SPEECH_TEXT(0)})
 same => n,Verbose(1, "Recognized: ${SPEECH_TEXT_RESULT}")
 same => n,Hangup()
```

### **Pros & Cons**

- No external API costs
- Native support in Asterisk 21
- Limited accuracy compared to AI-powered solutions
- No built-in support for custom language models

---

## **2. Google Speech-to-Text with Asterisk**

Google’s Speech-to-Text API offers high accuracy and multilingual support but comes with usage-based pricing.

### **Installation**

1. Create a Google Cloud project and enable Speech-to-Text API
2. Generate a Service Account JSON Key
3. Install Google’s SDK:

```bash
pip install google-cloud-speech
```

### **Configuring Google STT with Asterisk**

Modify your **extensions.conf** to send audio to Google via an AGI script:

```plaintext
exten => 200,1,Answer()
 same => n,Record(/tmp/audio.wav,5,30)
 same => n,AGI(google-stt.agi,/tmp/audio.wav)
 same => n,Verbose(1, "Google Response: ${STT_RESULT}")
 same => n,Hangup()
```

### **google-stt.agi (Python Script for Google STT)**

```python
from google.cloud import speech
import sys

client = speech.SpeechClient()
audio = speech.RecognitionAudio(uri=sys.argv[1])
config = speech.RecognitionConfig(encoding="LINEAR16", language_code="en-US")

response = client.recognize(config=config, audio=audio)
print(f"STT_RESULT={response.results[0].alternatives[0].transcript}")
```

### **Pros & Cons**

- Highly accurate
- Supports multiple languages
- Speaker diarization & noise filtering
- Expensive for high call volumes
- Requires stable internet connection

---

## **3. Vosk (Offline Speech-to-Text for Asterisk)**

Vosk is an open-source, offline STT engine, making it a great option for self-hosted and low-latency applications.

### **Installation**

```bash
git clone https://github.com/alphacep/vosk-api.git
cd vosk-api/python
pip install -r requirements.txt
```

### **Configuring Asterisk with Vosk**

Use an AGI script to send audio to Vosk:

```plaintext
exten => 300,1,Answer()
 same => n,Record(/tmp/vosk_audio.wav,5,30)
 same => n,AGI(vosk-stt.agi,/tmp/vosk_audio.wav)
 same => n,Verbose(1, "Vosk Response: ${STT_RESULT}")
 same => n,Hangup()
```

### **vosk-stt.agi (Python Script for Vosk STT)**

```python
from vosk import Model, KaldiRecognizer
import wave
import sys

model = Model("model-en")
rec = KaldiRecognizer(model, 16000)

with wave.open(sys.argv[1], "rb") as wf:
    rec.AcceptWaveform(wf.readframes(wf.getnframes()))

print(f"STT_RESULT={rec.Result()}")
```

### **Pros & Cons**

- Runs offline (no API costs)
- Lower latency than Google
- Customizable models
- Less accurate than Google STT
- Limited language support

---

## **4. Comparing Performance: AEAP vs Google vs Vosk**

| Feature               | AEAP         | Google STT     | Vosk    |
| --------------------- | ------------ | -------------- | ------- |
| **Cost**              | Free         | Paid (per min) | Free    |
| **Latency**           | Low          | Medium         | Low     |
| **Accuracy**          | Basic        | High           | Medium  |
| **Language Support**  | English only | 120+ languages | Limited |
| **Internet Required** | No           | Yes            | No      |

---

## **Final Thoughts: Which One to Choose?**

- Use AEAP if you want free, built-in recognition and don’t need high accuracy.
- Use Google STT if you need enterprise-level accuracy & multi-language support.
- Use Vosk if you want offline speech recognition without API costs.

For my projects, I’ve found that Google STT works best for customer service calls, while Vosk is great for VoIP-based AI assistants where cost matters.

Which STT engine are you using with Asterisk? Let me know in the comments!
