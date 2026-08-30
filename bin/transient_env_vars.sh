#!/bin/bash

shopt -s globstar

case $1 in

  "bait")
    RVARS=$(cut -d = -f 1 .env.sample)
    for KEY in $RVARS; do
      echo "$KEY=${KEY//REACT_APP_/ORGANICE_}"
    done
    ;;

  "switch")
    SRC=$2
    DST=$3

    rm -rf "$DST"
    cp -r "$SRC" "$DST"

    OVARS=$(cut -d = -f 2 .env)

    for KEY in $OVARS; do
      VALUE=${!KEY}
      sed -i "s/$KEY/$VALUE/" "$DST"/**/*.js
    done
    ;;

  *)
    echo "Unknown command: $1"
    ;;
esac
