#!/bin/bash

# Create a release branch (release-x.y.z) for deploying the package
# Usage: ./createRelease.sh <version-number>

if [ -z "$1" ]
then
    echo "Usage: ./createRelease.sh <version-number>"
    exit 1
fi

if [[ "$1" =~ ^([0-9]+)(\.)([0-9]+)(\.)([0-9]+)$ ]]
then
    versionCode=$(((${BASH_REMATCH[1]} * 100 + ${BASH_REMATCH[3]}) * 1000 + ${BASH_REMATCH[5]}))
    echo "Using android version code $versionCode"
    echo ""
else
    echo "Given version number is not valid."
    echo "Version number is supposed to be x.y.z"
    echo "You entered $1"
    exit 1;
fi
version=$1


echo "This script will create a release branch from the current branch"
echo "Make sure that the current branch is clean and all changes are commited!"
read -p "Continue? [y/N]: " continue
if [ "$continue" != "y" ] 
then
    echo "Aborting..."
    exit 0
fi

git branch "release-$version"
git checkout "release-$version"

yarn config set version-git-tag false
yarn version --new-version "$version"
echo "$version" > VERSION
echo "VERSION_CODE=$versionCode" > android/app/version.properties
echo "VERSION_NAME=$version" >> android/app/version.properties
git add android/app/version.properties
git add VERSION
git add package*.json
git add yarn.lock

git commit -m "Created release branch for version $version"
git tag "$version"

read -p "Branch created successfully. Push now to origin? [y/N] " pushnow
if [ "$pushnow" == "y" ]
then
    echo "Pushing to origin..."
    git push -u origin "release-$version"
    git push --tags
fi

echo "Created new branch \"release-$version\". Make sure that all builds and tests succeed, then merge into master!"