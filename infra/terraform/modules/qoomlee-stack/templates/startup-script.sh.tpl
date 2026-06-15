#!/bin/bash
# Runs once on first boot. Prepares the VM to run the docker-compose stack;
# the stack itself (docker-compose.yml, .env, images) is pushed by the
# GitLab CI deploy job over an IAP SSH tunnel.
set -euo pipefail

DEVICE=/dev/disk/by-id/google-postgres-data
MOUNT_POINT=/mnt/postgres-data

if ! blkid "$DEVICE" >/dev/null 2>&1; then
  mkfs.ext4 -m 0 -F "$DEVICE"
fi

mkdir -p "$MOUNT_POINT"
mount "$DEVICE" "$MOUNT_POINT" || true

if ! grep -q "$MOUNT_POINT" /etc/fstab; then
  echo "$DEVICE $MOUNT_POINT ext4 discard,defaults,nofail 0 2" >> /etc/fstab
fi

if ! command -v docker >/dev/null 2>&1; then
  apt-get update
  apt-get install -y ca-certificates curl gnupg
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  ARCH=$(dpkg --print-architecture)
  CODENAME=$(. /etc/os-release && echo "$VERSION_CODENAME")
  echo "deb [arch=$ARCH signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $CODENAME stable" > /etc/apt/sources.list.d/docker.list
  apt-get update
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
fi

gcloud auth configure-docker ${region}-docker.pkg.dev --quiet

mkdir -p /opt/qoomlee
