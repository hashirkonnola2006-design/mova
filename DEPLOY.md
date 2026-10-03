# MOVA Deployment & Form Service Setup Guide

## Form Service Configuration (Inquiry & Feedback Delivery)

All inquiries, troubleshooting requests, bug reports, and sign suggestions sent anywhere on MOVA are routed to `hashircoet@gmail.com`. Follow these steps to connect your form delivery backend:

### 1. Create a Form Service Account
Choose a form processing provider:
- **Formspree** ([formspree.io](https://formspree.io)): Create an account and create a new form named `MOVA Inquiries`. Set the notification recipient to `hashircoet@gmail.com`. Note your Form ID (e.g., `https://formspree.io/f/xv...`).
- **Web3Forms** ([web3forms.com](https://web3forms.com)): Generate an access key for `hashircoet@gmail.com`. The endpoint is `https://api.web3forms.com/submit`.

### 2. Verify Your Destination Email
Ensure `hashircoet@gmail.com` completes the verification link sent by the provider.

### 3. Add Environment Variables
#### Locally:
In `frontend/.env` (or copy from `frontend/.env.example`):
```bash
VITE_FORM_ENDPOINT=https://formspree.io/f/YOUR_FORM_ID
# If using Web3Forms:
# VITE_FORM_ACCESS_KEY=your_access_key_here
```

#### In Vercel / Production:
1. Go to your project on Vercel Dashboard → **Settings** → **Environment Variables**.
2. Add:
   - Key: `VITE_FORM_ENDPOINT`
   - Value: `https://formspree.io/f/YOUR_FORM_ID` (or provider URL)
   - (Optional) `VITE_FORM_ACCESS_KEY` if required by provider.
3. Redeploy the application.

### 4. Send a Test Message & Verify Inbox
1. Go to `/contact` or any Help topic on your deployed site.
2. Submit a test message.
3. Verify that an email arrives at `hashircoet@gmail.com`.
4. If it arrives in Spam, mark it as "Not Spam".

### 5. Gmail Filter Recommendation
In Gmail, create a filter for incoming messages:
- **Matches subject**: `[MOVA]`
- **Action**: Star it, never send to Spam, categorize as Primary or apply a label `MOVA`.
