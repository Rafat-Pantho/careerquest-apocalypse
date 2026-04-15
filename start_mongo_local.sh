#!/bin/bash
echo "Starting MongoDB..."
mkdir -p local_mongo/data
# Start MongoDB in background (fork)
./local_mongo/bin/mongod --dbpath ./local_mongo/data --bind_ip 127.0.0.1 --logpath ./local_mongo/mongod.log --fork
echo "MongoDB started! Logs are at ./local_mongo/mongod.log"
