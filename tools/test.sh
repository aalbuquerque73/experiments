#!/usr/bin/env bash

winpty node "$(npm prefix -g)/node_modules/npm/bin/npm-cli" test -- $*
