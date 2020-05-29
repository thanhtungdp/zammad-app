#!/bin/bash
echo "{\"version\": \"$(cat VERSION)\", \"build\": \"$TRAVIS_BUILD_ID\", \"git\": \"$(git rev-parse HEAD)\"}" > ./src/meta/version.json