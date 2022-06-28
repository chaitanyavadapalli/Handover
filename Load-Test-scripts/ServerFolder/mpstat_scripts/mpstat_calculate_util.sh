

UTILIZATION=`awk '
		BEGIN {
			idle_time = 0
		}
		{
			if ($1 == "Average:") {
				idle_time = $12
			}
		}
		END {
			print (100 - idle_time)
		}
	' $1`

# IFS=';' read -ra arr <<< "$1"

echo "CPU Utilization : " $UTILIZATION "%" > $3/mpstat_metrics_$2.txt
