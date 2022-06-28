

UTILIZATION=`awk '
		BEGIN {
			n = 0
			idle_time = 0
		}
		{

			if(NR==3)
			{
				next;
			}

			if ($1 != "procs" && $1 != "r") {
				idle_time += $15
				n++
			}
		}
		END {
			print (100 - (idle_time / n))
		}
	' $1`

echo "CPU Utilization : " $UTILIZATION "%" > $3/vmstat_metrics_$2.txt
