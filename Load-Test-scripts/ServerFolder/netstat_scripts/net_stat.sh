#!/bin/bash
data="{"
# json_file_name=$1
ctrl_c() {
	data=${data::-1}
	data+="}"
	echo $data
	exit
}

i=1
trap ctrl_c INT
trap ctrl_c SIGKILL
trap ctrl_c SIGTERM
while :
do
	data+="\""
	data+=$i
	data+="\""
	data+=":"
	lines=$(netstat -i | wc -l)
	obj=`netstat -i | awk -v nlines=$lines -f netstat_scripts/jc.awk`
	data+=$obj
	data+=","
	i=$((i+1))
	sleep 5
done


#bash net_stat.sh >> stats.json 
#python3 summary.py stats.json results.json