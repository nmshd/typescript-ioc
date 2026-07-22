set -e

npm ci
npm run build
npm run lint
npx license-check
npx better-npm-audit audit --exclude 1119438,1112714,1121859,1123912,1119441,1113465,1113544,1113552
