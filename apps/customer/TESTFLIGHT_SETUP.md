# AgentCare Customer App - TestFlight Setup Guide

This guide covers setting up and deploying the AgentCare customer mobile app to Apple TestFlight.

## Prerequisites

1. **Apple Developer Account** ($99/year)
   - Enroll at: https://developer.apple.com/programs/enroll/
   - Required for TestFlight distribution

2. **Expo Account** (Free)
   - Sign up at: https://expo.dev/signup

3. **EAS CLI** (Already installed)
   ```bash
   eas --version  # Should show 16.x+
   ```

## Step 1: Configure Expo/EAS

### 1.1 Login to Expo

```bash
cd /Users/raja/work/agentcare/ac-mobile/apps/customer
eas login
```

### 1.2 Initialize EAS Project

```bash
eas init
```

This will:
- Create a project on Expo servers
- Generate a unique `projectId`
- Update `app.json` with the project ID

### 1.3 Update Configuration

After `eas init`, update these placeholders in `app.json`:
- Replace `YOUR_EAS_PROJECT_ID` with the generated project ID

Update these placeholders in `eas.json`:
- `APPLE_ID_EMAIL` - Your Apple ID email
- `APP_STORE_CONNECT_APP_ID` - From App Store Connect (created later)
- `APPLE_TEAM_ID` - Your Apple Developer Team ID

## Step 2: Apple Developer Setup

### 2.1 Create App ID (Bundle Identifier)

1. Go to [Apple Developer Portal](https://developer.apple.com/account/resources/identifiers/list)
2. Click "+" to register a new identifier
3. Select "App IDs" → Continue
4. Select "App" → Continue
5. Fill in:
   - **Description**: AgentCare Customer
   - **Bundle ID**: `com.agentcare.customer` (Explicit)
6. Enable capabilities:
   - Push Notifications (for future use)
   - Sign in with Apple (optional)
7. Click "Register"

### 2.2 Create App in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com/apps)
2. Click "+" → "New App"
3. Fill in:
   - **Platform**: iOS
   - **Name**: AgentCare
   - **Primary Language**: English (U.S.)
   - **Bundle ID**: Select `com.agentcare.customer`
   - **SKU**: `agentcare-customer-001`
   - **User Access**: Full Access
4. Click "Create"
5. Note the **Apple ID** (App Store Connect App ID) - needed for `eas.json`

### 2.3 Get Apple Team ID

1. Go to [Apple Developer Membership](https://developer.apple.com/account/#/membership)
2. Copy your **Team ID** (10-character string)

## Step 3: Configure Apple Credentials

### 3.1 Option A: Let EAS Handle Credentials (Recommended)

EAS can automatically manage signing certificates and provisioning profiles:

```bash
eas credentials
```

Select:
- Platform: iOS
- Profile: production
- Let EAS manage your credentials

### 3.2 Option B: Manual Credential Setup

If you prefer manual control:

1. **Create Distribution Certificate**
   - Go to [Certificates](https://developer.apple.com/account/resources/certificates/list)
   - Create "Apple Distribution" certificate
   - Download and install in Keychain

2. **Create Provisioning Profile**
   - Go to [Profiles](https://developer.apple.com/account/resources/profiles/list)
   - Create "App Store Connect" profile
   - Select your App ID and certificate

## Step 4: Build for TestFlight

### 4.1 Update Version (if needed)

In `app.json`:
```json
{
  "expo": {
    "version": "1.0.0",
    "ios": {
      "buildNumber": "1"
    }
  }
}
```

### 4.2 Create Production Build

```bash
cd /Users/raja/work/agentcare/ac-mobile/apps/customer

# Build for iOS production (App Store/TestFlight)
eas build --platform ios --profile production
```

This will:
- Bundle your JavaScript
- Create a native iOS build
- Sign the app with your credentials
- Upload to EAS Build servers

**Build typically takes 15-30 minutes.**

### 4.3 Monitor Build

```bash
# Check build status
eas build:list

# View build logs
eas build:view
```

## Step 5: Submit to TestFlight

### 5.1 Automatic Submission

```bash
# Submit the latest build
eas submit --platform ios --latest
```

Or submit a specific build:
```bash
eas submit --platform ios --id BUILD_ID
```

### 5.2 Manual Submission (Alternative)

1. Download the `.ipa` file from EAS dashboard
2. Open **Transporter** app on Mac
3. Sign in with Apple ID
4. Drag and drop the `.ipa` file
5. Click "Deliver"

## Step 6: TestFlight Configuration

### 6.1 App Information

In App Store Connect → Your App → TestFlight:

1. **Test Information**
   - Beta App Description: "AgentCare customer app for managing service requests"
   - Beta App Review Information:
     - Email: your-email@company.com
     - Phone: Your contact number
   - What to Test: "Login, view service requests, create new requests, chat with support"

2. **Export Compliance**
   - Answer "No" to encryption (we set `usesNonExemptEncryption: false`)

### 6.2 Add Internal Testers

1. Go to TestFlight → Internal Testing
2. Click "+" next to "App Store Connect Users"
3. Add team members with App Store Connect access

### 6.3 Add External Testers

1. Go to TestFlight → External Testing
2. Create a new group (e.g., "Beta Testers")
3. Add testers by email
4. Submit build for review (required for external testers)

**Note**: First external build requires Apple review (1-2 days)

## Step 7: Distribute TestFlight Link

Once approved, share the TestFlight link:

```
https://testflight.apple.com/join/XXXXXXXX
```

Testers need to:
1. Install TestFlight app from App Store
2. Open the link or enter the code
3. Install the beta app

## Quick Commands Reference

```bash
# Login to EAS
eas login

# Initialize project
eas init

# Configure credentials
eas credentials

# Build for TestFlight
eas build --platform ios --profile production

# Submit to TestFlight
eas submit --platform ios --latest

# Check build status
eas build:list

# View build details
eas build:view

# Update OTA (after initial release)
eas update --branch production --message "Bug fixes"
```

## Environment Variables

For CI/CD, set these environment variables:

```bash
EXPO_TOKEN=your_expo_token
APPLE_ID=your_apple_id@email.com
APPLE_TEAM_ID=XXXXXXXXXX
ASC_APP_ID=1234567890
```

## Troubleshooting

### Build Fails

1. Check EAS build logs: `eas build:view`
2. Verify bundle identifier matches App Store Connect
3. Ensure credentials are valid: `eas credentials`

### Submission Fails

1. Verify version/build number is unique
2. Check App Store Connect for error messages
3. Ensure export compliance is answered

### TestFlight Not Showing Build

1. Wait 5-10 minutes for processing
2. Check "Activity" tab in App Store Connect
3. Look for processing errors

## Production Checklist

Before submitting to production:

- [ ] Replace placeholder assets (icon.png, splash.png)
- [ ] Update app name and description
- [ ] Configure push notifications
- [ ] Test all features on physical device
- [ ] Review privacy policy URL
- [ ] Add app screenshots for App Store
- [ ] Complete App Store listing metadata

## Support

- Expo Documentation: https://docs.expo.dev/
- EAS Build: https://docs.expo.dev/build/introduction/
- EAS Submit: https://docs.expo.dev/submit/introduction/
- Apple Developer: https://developer.apple.com/support/
