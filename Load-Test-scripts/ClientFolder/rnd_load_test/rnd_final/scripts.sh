#!/bin/bash
# fconfigure stdout -buffering none

cleanup()
{

	kill $p2 $p5
	kill -SIGINT $p4
	exit
}
trap cleanup SIGINT
trap cleanup SIGKILL
trap cleanup SIGTERM
# trap 'kill $(jobs -p)' EXIT
users=$1
#ps_scripts/ps.sh > ps_scripts/ps_output_${users}.json &
#p1=$!
iostat_scripts/iostat.sh > iostat_scripts/iostat_output_${users}.json &
p2=$!
#netstat_scripts/net_stat.sh > netstat_scripts/netstat_output_${users}.json &
#p3=$!
mpstat 5 > mpstat_scripts/mpstat_output_${users}.txt &
p4=$!
vmstat 5 > vmstat_scripts/vmstat_output_${users}.txt &
p5=$!

wait $p2 $p4 $p5



