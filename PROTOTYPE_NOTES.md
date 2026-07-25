# Smart PDS — Academic Prototype & Viva Defense Notes

## Overview for Viva Defense

Smart PDS enhances the existing government Public Distribution System by unifying Administrators, Fair Price Shop Distributors, and Consumers into a single web application.

---

## 1. Prototype Simulation Boundaries

| Module | Real Production Behavior | Prototype Implementation | Viva Explanation Rationale |
|---|---|---|---|
| **Aadhaar & Ration Card Verification** | Real-time UIDAI API & Government PDS database integration | Format regex validation + mock lookup against local seeded databases (`MockGovtDistributorRegistry`, `MockRationCardRegistry`). Unmatched entries route to Admin KYC Queue. | External government database access requires official government API tokens and biometrics SDK credentials not available for academic projects. |
| **Fingerprint Biometric Check** | Optical Fingerprint Sensor Hardware SDK | Software template match simulation comparing sample hash against stored `fingerprintTemplateHash`. | Demonstrates hardware verification workflow without requiring physical USB fingerprint scanner hardware. |
| **e-POS Hardware Machine** | Dedicated Android/Linux e-POS POS Terminal Device | Guided 5-step interactive state machine (`scan` -> `verify` -> `dispense` -> `pay` -> `receipt`). | Built as an isolated service layer (`epos.service.js`) so it can be swapped for a physical device SDK without modifying the UI. |
| **Payment Gateway** | Live Razorpay Production Keys | Razorpay Sandbox (Test Mode) API with test order creation and signature verification. | Protects against real monetary charges during project demonstrations. |
| **SMS / WhatsApp OTP** | Twilio / MSG91 SMS Gateway | In-memory OTP store (`otp.service.js`) with server console logging and automatic demo fallback (`123456`). | Prevents SMS credit exhaustion during testing. |
| **Complaint Assistant** | OpenAI GPT-4 / LLM API | Rule & keyword engine (`complaintSuggestion.service.js`) with optional LLM plugin point. | Guarantees 100% demo stability without requiring external paid API keys. |

---

## 2. Security Architecture Highlights

1. **AES-256 Field-Level Encryption**: All 12-digit Aadhaar numbers are encrypted at rest in MongoDB using AES-256-CBC with an initialization vector (IV).
2. **Data Masking**: API controllers and UI templates only ever expose masked numbers (`XXXX XXXX 1234`). Plaintext Aadhaar numbers are never logged or returned.
3. **Atomic Capacity Guard**: Time slot bookings execute atomic `$expr: { $lt: ['$bookedCount', '$capacity'] }` updates in MongoDB to prevent race conditions during high-concurrency booking requests.
