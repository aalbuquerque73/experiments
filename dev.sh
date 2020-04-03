#!/usr/bin/env bash

export DOTNET_CLI_TELEMETRY_OPTOUT=1
export CYPRESS_CRASH_REPORTS=0

UNAME="$(uname -s)"
case "${UNAME}" in
    Linux*)  CMD="node";;
    Darwin*) CMD="node";;
    CYGWIN*) CMD="winpty node";;
    MINGW*)  CMD="winpty node";;
esac

${CMD} tools/dashboard