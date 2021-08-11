#!/usr/bin/env bash

echo $(objdump --syms --demangle /Applications/Firefox\ Nightly.app/Contents/MacOS/XUL | grep $1'(' | awk '{ print $1 }')

