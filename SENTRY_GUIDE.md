# Sentry Setup Guide

This guide describes how to configure Sentry for error tracking and performance monitoring in the **caramel-vibe** Next.js application.

---

## 1. Account & Project Setup
1. Go to [Sentry.io](https://sentry.io/) and sign up or log in.
2. Create a new project:
   - **Platform:** Next.js
   - **Project Name:** `caramel-vibe`
   - **Team:** Select or create your team.

---

## 2. Installation
Run the Sentry wizard to automatically configure Next.js:
```bash
npx @sentry/wizard@latest -i nextjs
```
*Note: This command will install `@sentry/nextjs`, prompt you to log into Sentry, select your project, and automatically create/modify configuration files.*

---

## 3. Manual Configuration (If Needed)
If you need to configure things manually, ensure the following environment variables are set in your `.env.local`:
```env
SENTRY_AUTH_TOKEN=your-sentry-auth-token
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

### Configuration Files Created/Updated:
- `sentry.client.config.ts`: Client-side error tracking config.
- `sentry.server.config.ts`: Server-side error tracking config.
- `sentry.edge.config.ts`: Edge/middleware error tracking config.
- `next.config.js`: Updated to wrap the configuration with `withSentryConfig`.
