#!/bin/bash
users=$1
TIMESTAMP=$2
path="metrics/users_${users}_${TIMESTAMP}"
mkdir $path
snapshot_path="snapshots/users_${users}_${TIMESTAMP}"
#mkdir $snapshot_path
timeseries_metrics_path="timeseries_metrics/users_${users}_${TIMESTAMP}"
mkdir $timeseries_metrics_path
python3 ps_scripts/ps.py  ${snapshot_path}/ps_output_${users}.json $path &
p1=$!
python3 iostat_scripts/iostat.py ${snapshot_path}/iostat_output_${users}.json $path &
p2=$!
python3 netstat_scripts/summary.py ${snapshot_path}/netstat_output_${users}.json $path &
p3=$!
python3 mpstat_scripts/mpstat_metrics_avg.py ${snapshot_path}/mpstat_output_${users}.json $path &
p4=$!
python3 vmstat_scripts/vmstat_avg_metrics.py ${snapshot_path}/vmstat_output_${users}.json $path &
p5=$!
python3 iotop_scripts/iotop.py ${snapshot_path}/iotop_output_${users}.json $path &
p6=$!
python3 iotop_scripts/iotop_avg_metrics.py ${snapshot_path}/iotop_output_${users}.json $path &
p7=$!
python3 vmstat_scripts/vmstat_time_series.py ${snapshot_path}/vmstat_output_${users}.json  $timeseries_metrics_path &
p8=$!
python3 mpstat_scripts/mpstat_time_series.py ${snapshot_path}/mpstat_output_${users}.json  $timeseries_metrics_path &
p9=$!
python3 iotop_scripts/iotop_time_series.py ${snapshot_path}/iotop_output_${users}.json $timeseries_metrics_path &
p10=$!

wait $p1 $p2 $p3 $p4 $p5 $p6 $p7 $p8 $p9 $p10
