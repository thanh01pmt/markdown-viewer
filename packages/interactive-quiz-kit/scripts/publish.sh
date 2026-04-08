#!/bin/bash

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting publish process for @thanh01.pmt/interactive-quiz-kit...${NC}"

# Parse arguments
OTP=""
while [[ "$#" -gt 0 ]]; do
  case $1 in
    --otp) OTP="$2"; shift ;;
    --otp=*) OTP="${1#*=}" ;;
    -h|--help)
      echo "Usage: $0 [options]"
      echo "Options:"
      echo "  --otp=123456  Provide npm 2FA one-time password"
      echo "  -h, --help    Show this help message"
      exit 0
      ;;
  esac
  shift
done

# Fallback to environment variable
OTP=${OTP:-$NPM_CONFIG_OTP}

# Load environment variables from .env.local if present and NPM_TOKEN not set
if [ -z "$NPM_TOKEN" ]; then
  # Root .env.local
  if [ -f "../../.env.local" ]; then
    export $(grep -v '^#' ../../.env.local | xargs)
  # Package .env.local
  elif [ -f ".env.local" ]; then
    export $(grep -v '^#' .env.local | xargs)
  fi
fi

# Handle NPM_TOKEN for automated authentication
NPMRC_CREATED=false
if [ -n "$NPM_TOKEN" ] && [ ! -f ".npmrc" ]; then
  echo -e "${YELLOW}NPM_TOKEN found, creating temporary .npmrc...${NC}"
  echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > .npmrc
  NPMRC_CREATED=true
fi

function cleanup() {
  if [ "$NPMRC_CREATED" = true ]; then
    echo -e "${YELLOW}Cleaning up temporary .npmrc...${NC}"
    rm -f .npmrc
  fi
}
trap cleanup EXIT

# 1. Check for uncommitted changes
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo -e "${YELLOW}Warning: You have uncommitted changes.${NC}"
  git status -s
  echo -e "${BLUE}Proceeding with publish anyway... (ensure this is intended)${NC}"
fi

# 2. Run Lint & Tests
echo -e "${BLUE}Running lint...${NC}"
npm run lint

echo -e "${BLUE}Running tests...${NC}"
if ! command -v jest &> /dev/null && ! [ -f "./node_modules/.bin/jest" ]; then
  echo -e "${RED}Error: jest not found. Please install dependencies or fix the test script.${NC}"
  echo -e "Do you want to skip tests and continue? [y/N]"
  read -r SKIP_TESTS
  if [[ ! "$SKIP_TESTS" =~ ^[yY]$ ]]; then
    exit 1
  fi
else
  npm test
fi

# 3. Build package
echo -e "${BLUE}Building package and SCORM bundle...${NC}"
npm run build || { echo -e "${RED}Build failed. Exiting.${NC}"; exit 1; }
npm run build:scorm || { echo -e "${RED}SCORM build failed. Exiting.${NC}"; exit 1; }

# 4. Bump version
VERSION=$(node -p "require('./package.json').version")
echo -e "Current version: ${VERSION}"

# Check if BUMP is provided as an environment variable or default to patch
BUMP=${BUMP:-patch}
echo -e "${BLUE}Bumping version as: ${BUMP}...${NC}"

if [[ ! "$BUMP" =~ ^(patch|minor|major)$ ]]; then
  echo -e "${RED}Invalid bump type: '$BUMP'. Exiting.${NC}"
  exit 1
fi

npm version "$BUMP" -m "chore(release): %s"

# 5. Publish
echo -e "${BLUE}Publishing to npm...${NC}"
if [ -n "$OTP" ]; then
  npm publish --access public --otp="$OTP"
else
  npm publish --access public
fi

echo -e "${GREEN}Successfully published!${NC}"
