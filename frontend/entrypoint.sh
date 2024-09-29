#!/bin/sh
# entrypoint.sh

# Clear the npm cache
npm cache clean --force

npm install

npm run start

# Start the application
exec "$@"