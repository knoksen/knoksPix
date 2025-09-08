# KnoksPix Distribution Strategy

## Windows Distribution

### Auto-Update System
- Auto-updates are enabled through GitHub releases
- Updates are checked on app startup
- Users are prompted before download and installation
- Updates can be manually checked through Help > Check for Updates

### Release Process
1. Update version in `package.json`
2. Build the app: `npm run build:win`
3. Create a GitHub release with the following:
   - Tag: v1.0.0 (matching package.json version)
   - Release title: KnoksPix v1.0.0
   - Description: Release notes
   - Files to upload:
     - `releases/KnoksPix Setup 1.0.0.exe`
     - `releases/latest.yml`

### Distribution Channels
1. GitHub Releases
   - Primary distribution channel
   - Supports auto-updates
   - Version tracking
   - Release notes

2. Direct Download (Optional)
   - Host installer on your website
   - Provide download links
   - Still supports auto-updates

## Android Distribution

### Release Types
1. Debug APK
   - For testing purposes
   - Location: `android/app/build/outputs/apk/debug/`
   - Command: Build > Build Bundle(s) / APK(s) > Build APK(s)

2. Release APK
   - For distribution
   - Location: `android/app/build/outputs/apk/release/`
   - Requires signing with release keystore

### Release Process
1. Update version in:
   - `package.json`
   - `android/app/build.gradle` (versionCode and versionName)
2. Run `npm run build` and `npx cap sync android`
3. In Android Studio:
   - Build > Generate Signed Bundle / APK
   - Choose APK
   - Use release keystore
   - Select release build variant
   - Sign with v1 and v2 signatures

### Distribution Options
1. Google Play Store (Recommended)
   - Most secure and trusted
   - Automatic updates
   - Requirements:
     - One-time $25 developer fee
     - Privacy policy
     - Store listing assets

2. Direct APK Distribution
   - Host APK on your website
   - Provide installation instructions
   - Users need to enable "Unknown sources"

## Version Management

### Version Numbering
- Follow Semantic Versioning (MAJOR.MINOR.PATCH)
- Example: 1.0.0, 1.0.1, 1.1.0

### Release Checklist
1. Update version numbers
2. Test on both platforms
3. Generate release builds
4. Create release notes
5. Deploy to distribution channels
6. Monitor for issues

## Support
- Provide installation guides
- Document update process
- Create FAQ section
- Offer support contact

## Future Improvements
1. Add crash reporting
2. Implement analytics
3. Add feedback system
4. Create auto-update for Android (Firebase/Custom)
