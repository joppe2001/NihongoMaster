# Deployment Guide

Instructions for building and distributing NihongoMaster.

---

## Prerequisites

- macOS 11+ (Big Sur or later)
- Rust toolchain 1.70+ (`rustup update stable`)
- Node.js 20+ (`node --version`)
- Xcode Command Line Tools (`xcode-select --install`)

## Development Setup

```bash
# Clone the project
cd nihongo-master

# Install frontend dependencies
npm install

# Run in development mode (starts Vite + Tauri)
npm run tauri dev
```

## Building for Production

### macOS (Universal Binary)

```bash
# Build the app
npm run tauri build

# Output locations:
# - DMG:     src-tauri/target/release/bundle/dmg/NihongoMaster_0.1.0_aarch64.dmg
# - App:     src-tauri/target/release/bundle/macos/NihongoMaster.app
```

### Build for specific architecture

```bash
# Apple Silicon only
npm run tauri build -- --target aarch64-apple-darwin

# Intel only
npm run tauri build -- --target x86_64-apple-darwin

# Universal (both architectures)
npm run tauri build -- --target universal-apple-darwin
```

## App Signing & Notarization

### Code Signing (required for distribution)

1. Get an Apple Developer certificate
2. Set environment variables:

```bash
export APPLE_CERTIFICATE="<base64-encoded .p12 file>"
export APPLE_CERTIFICATE_PASSWORD="<certificate password>"
export APPLE_SIGNING_IDENTITY="Developer ID Application: Your Name (TEAM_ID)"
```

3. Tauri handles signing automatically during `npm run tauri build`

### Notarization (required for macOS Gatekeeper)

```bash
export APPLE_ID="your@apple.id"
export APPLE_PASSWORD="<app-specific password>"
export APPLE_TEAM_ID="TEAM_ID"
```

Tauri automatically notarizes when these environment variables are set.

## Distribution Channels

### Direct Download (DMG)
- Host the DMG on GitHub Releases
- Link from project website

### GitHub Releases (Recommended)
```bash
# Tag the release
git tag -a v0.1.0 -m "Initial release"
git push origin v0.1.0

# GitHub Actions will build and create a release
# (requires CI workflow setup)
```

### Homebrew Cask (Future)
```ruby
cask "nihongo-master" do
  version "0.1.0"
  sha256 "<sha256>"
  url "https://github.com/your-org/nihongo-master/releases/download/v#{version}/NihongoMaster_#{version}_aarch64.dmg"
  name "NihongoMaster"
  homepage "https://github.com/your-org/nihongo-master"
  app "NihongoMaster.app"
end
```

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    tags: ['v*']

jobs:
  build:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - uses: dtolnay/rust-toolchain@stable
      - run: npm ci
      - uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          APPLE_CERTIFICATE: ${{ secrets.APPLE_CERTIFICATE }}
          APPLE_CERTIFICATE_PASSWORD: ${{ secrets.APPLE_CERTIFICATE_PASSWORD }}
          APPLE_SIGNING_IDENTITY: ${{ secrets.APPLE_SIGNING_IDENTITY }}
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_PASSWORD: ${{ secrets.APPLE_PASSWORD }}
          APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
```

## Auto-Updates (Future)

Tauri supports auto-updates via the updater plugin:

```json
// tauri.conf.json
{
  "plugins": {
    "updater": {
      "endpoints": [
        "https://releases.nihongomaster.app/{{target}}/{{arch}}/{{current_version}}"
      ],
      "dialog": true,
      "pubkey": "<your public key>"
    }
  }
}
```

## Database Location

User data (SQLite database) is stored at:
```
~/Library/Application Support/com.nihongomaster.app/nihongo-master.db
```

To backup:
```bash
cp ~/Library/Application\ Support/com.nihongomaster.app/nihongo-master.db ~/Desktop/nihongo-backup.db
```

## Troubleshooting

### Build fails with "framework not found"
```bash
xcode-select --install
```

### Rust compilation errors
```bash
rustup update stable
cargo clean
npm run tauri build
```

### App won't open (Gatekeeper)
- Right-click the app → Open → Open
- Or: System Preferences → Security & Privacy → Open Anyway

### Database corruption
- Delete the database file and restart the app (data will be re-initialized)
- Or restore from a backup

---

Last updated: 2026-03-15
