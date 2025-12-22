#!/bin/bash
# Wrapper script to filter GLib-GObject errors from Electron output

# Filter out GLib-GObject and browser_main_loop errors
exec electron . 2>&1 | grep -v --line-buffered -E "(GLib-GObject|gsignal\.c|has no handler with id|browser_main_loop\.cc|ERROR:browser_main_loop)" || true

