#!/bin/bash
cd /home/kavia/workspace/code-generation/calendamaster-2047-7a3f049f/calendar_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

