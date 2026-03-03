## Nova No-Code Virtual Agents

### Local build

```bash
npm install
npm run build
npm run start
```

### Required environment variables

Set these before deploying:

- `NEXT_PUBLIC_CONVEX_URL`
- `OPENAI_API_KEY`
- `CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `ARCJET_KEY`

### Deploy notes

- Deploy this app from the `nova-no-code-virtual-agents` folder (not the parent folder).
- The build output directory is configured to `.dist/next` to avoid `.next` cache/link issues in synced folders.
- `.dist/` is ignored in git and should not be committed.
