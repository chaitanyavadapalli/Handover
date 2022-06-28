#!/bin/bash

#trap cleanup SIGTERM
#trap cleanup SIGKILL
declare -a pids
pids=(`ps -eaf --no-headers | grep -v grep | awk '{print $2}'`)
comm='sudo -u root strace -c'
#echo 1 > file_1.txt
for pid in "${pids[@]}"
do
     comm+=" -p "
     comm+=$pid
done
#echo $comm
comm+=" -o "
comm+=$1
eval $comm
