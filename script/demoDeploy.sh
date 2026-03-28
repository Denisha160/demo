#!/bin/bash

# 1. Rename .env to .env.disable
if [ -f .env ]; then
    mv .env .env.disable
fi

# 2. Create a new .env file with specific content
echo "
VITE_SERVER_URL=https://api.basalt.dev.topgrowth.in
" > .env

# 3. Run npm build to generate the build artifacts
npm run build

# 4. Remove existing assets folder on the server
ssh -p 65002 u371241921@147.93.101.85 "rm -rf /home/u371241921/domains/topgrowth.in/public_html/basaltdev/assets"

# 5. Upload contents of 'dist' directly into 'Business management (basalt)' directory
# remove logo.jpeg from dist folder
rm dist/logo.jpeg
scp -P 65002 -r dist/* u371241921@147.93.101.85:/home/u371241921/domains/topgrowth.in/public_html/basaltdev




# 6. Delete the newly created .env file
rm .env

# 7. Rename .env.disable back to .env
if [ -f .env.disable ]; then
    mv .env.disable .env
fi

echo "Process completed successfully."