#!/bin/bash
echo "Setting up MongoDB locally..."

# Clean up any existing installation attempts
rm -rf local_mongo
rm -f mongodb-macos-arm64-7.0.8.tgz

# Create data directory
mkdir -p local_mongo/data

# Download MongoDB (macOS ARM64 version)
echo "Downloading MongoDB..."
curl -L https://fastdl.mongodb.org/osx/mongodb-macos-arm64-7.0.8.tgz -o mongodb.tgz

# Extract
echo "Extracting..."
tar -zxf mongodb.tgz -C local_mongo --strip-components=1

# Clean up tarball
rm mongodb.tgz

# Fix macOS Gatekeeper quarantine if needed
echo "Fixing permissions..."
xattr -r -d com.apple.quarantine local_mongo 2>/dev/null || true

echo "MongoDB Setup Complete!"
