#!/bin/bash
# fconfigure stdout -buffering none

cleanup()
{

	kill $p1 $p2 $p3
	#strace_pids=$(ps -eaf | grep -v grep | grep "strace -c")
	#sudo kill -SIGINT $strace_pids
	exit
}
trap cleanup SIGINT
trap cleanup SIGKILL
trap cleanup SIGTERM
# trap 'kill $(jobs -p)' EXIT
# timeseries_metrics_path="timeseries_metrics/users_${users}_${TIMESTAMP}"

users=$1
TIMESTAMP=$2
snapshot_path="snapshots/users_${users}_${TIMESTAMP}"
mkdir $snapshot_path
ps_scripts/ps.sh > ${snapshot_path}/ps_output_${users}.json &
p1=$!
iostat_scripts/iostat.sh > ${snapshot_path}/iostat_output_${users}.json &
p2=$!
netstat_scripts/net_stat.sh > ${snapshot_path}/netstat_output_${users}.json &
p3=$!
mpstat_scripts/mpstat.sh > ${snapshot_path}/mpstat_output_${users}.json &
p4=$!
vmstat_scripts/vmstat.sh > ${snapshot_path}/vmstat_output_${users}.json &
p5=$!
sudo -u root iotop_scripts/iotop.sh > ${snapshot_path}/iotop_output_${users}.json &
p6=$!
#echo 1 > ${snapshot_path}/strace_output_100.txt
#strace_scripts/strace.sh > ${snapshot_path}/strace_output_${users}.txt &
#p7=$!

wait $p1 $p2 $p3 $p4 $p5 $p6



