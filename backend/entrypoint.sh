#!/bin/sh
# entrypoint.sh

composer install

# Start the application
exec "$@"