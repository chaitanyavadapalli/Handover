#!/bin/bash
users=$1
TIMESTAMP=`date +%d%m%Y_%H%M%S`
path="metrics/users_${users}_${TIMESTAMP}"
mkdir $path
snapshot_path="snapshots/users_${users}_${TIMESTAMP}"
mkdir $snapshot_path
#python3 ps_scripts/ps.py  ps_scripts/ps_output_${users}.json $path &
#p1=$!
python3 iostat_scripts/iostat.py iostat_scripts/iostat_output_${users}.json $path &
p2=$!
#python3 netstat_scripts/summary.py netstat_scripts/netstat_output_${users}.json $path &
#p3=$!
mpstat_scripts/mpstat_calculate_util.sh mpstat_scripts/mpstat_output_${users}.txt $users $path &
p4=$!
vmstat_scripts/vmstat_calculate_util.sh vmstat_scripts/vmstat_output_${users}.txt $users $path &
p5=$!

wait $p2 $p4 $p5

#mv ps_scripts/ps_output_${users}.json ${snapshot_path}
mv iostat_scripts/iostat_output_${users}.json ${snapshot_path}
#mv netstat_scripts/netstat_output_${users}.json ${snapshot_path}
mv mpstat_scripts/mpstat_output_${users}.txt ${snapshot_path}
mv vmstat_scripts/vmstat_output_${users}.txt ${snapshot_path}
