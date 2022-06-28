#!/bin/bash
n_cores=1
#echo $n_cores
#cat /dev/null > exp_times.txt
for ((i=0;i<$n_cores;i++))
do
	taskset -c $i ./bodhi_micro_work_load $i $1 &
	pid=$!
	PID_LIST+=" $pid"
done
trap "kill $PID_LIST" SIGINT

wait $PID_LIST


