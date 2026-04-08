# Publishing @thanh01.pmt/interactive-quiz-kit

This document explains how to handle two-factor authentication (2FA) when publishing this package to npm.

## 2FA Requirement

To ensure security, publishing to the `@thanh01.pmt` organization requires two-factor authentication. If you encounter a `403 Forbidden` error during `npm publish`, it is likely because 2FA is required and no One-Time Password (OTP) or bypass token was provided.

## Method 1: Manual Publishing with OTP (Recommended for local)

If you have 2FA enabled on your account, you can provide the OTP during the release process.

### Using the Release Script

The `publish.sh` script supports an `--otp` argument.

```bash
# From the package directory
pnpm release -- --otp=123456

# From the monorepo root
pnpm publish:kit -- --otp=123456
```

### Direct npm Command

```bash
npm publish --access public --otp=123456
```

## Method 2: Granular Access Token (Recommended for Automation/CI)

For automated publishing (e.g., via GitHub Actions), you should use a **Granular Access Token** with "bypass 2fa" enabled.

1. Go to [npmjs.com/settings/tokens/granular-access-tokens/new](https://www.npmjs.com/package/@thanh01.pmt/interactive-quiz-kit).
2. Set the following:
   - **Expires**: As long as needed.
   - **Permissions**:
     - **Organization**: `@thanh01.pmt` -> Read/Write.
     - **Packages**: Select `@thanh01.pmt/interactive-quiz-kit` -> Read/Write.
   - **Two-Factor Authentication**: Select **"Allow bypass"**.
3. Copy the token and set it in your environment (e.g., `NPM_TOKEN`).

### Using .env.local (Automated)

The `publish.sh` script automatically detects `NPM_TOKEN` from your environment or a `.env.local` file in the monorepo root or package directory.

1. Create a `.env.local` in the monorepo root:

   ```env
   NPM_TOKEN=your_granular_access_token_here
   ```

2. The script will automatically handle authentication during `pnpm publish:kit`.

> [!WARNING]
> Never commit a `.env.local` file containing your auth token to the repository. Ensure it is listed in `.gitignore`.
