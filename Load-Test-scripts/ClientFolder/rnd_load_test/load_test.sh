#!/bin/bash
declare -a timestamp_arr
TIMESTAMP1=`date +%d%m%Y_%H%M%S`
server_metrics_path="server_metrics/${TIMESTAMP1}"
perf_analysis_path="perf_analysis/${TIMESTAMP1}"
if [ ! -d $server_metrics_path ]
then
		mkdir $server_metrics_path
fi

if [ ! -d $perf_analysis_path ]
then
                mkdir $perf_analysis_path
fi

#user_vals=( 1 20 40 60 80 100 120 140 160 )

user_vals=( 75 )

for i in "${user_vals[@]}"
do
	TIMESTAMP=`date +%d%m%Y_%H%M%S`
	timestamp_arr[$i]=${TIMESTAMP}
	echo "run started"
	#sshpass -p "panda" ssh panda@10.129.131.6 "ls"
	sshpass -p "panda123" ssh panda@10.129.131.6 "cd LoadTest;./scripts.sh $i ${timestamp_arr[i]} &" &
	#bash -c "cd rnd_final;./scripts.sh $i" &
	echo "Number of users : ${i}"
	#sleep 10
	sed -i -E "s/\"ThreadGroup.num_threads\">([0-9]+)/\"ThreadGroup.num_threads\">${i}/g" evalpro_load_test.jmx
	path="test_results/users_${i}_${TIMESTAMP}"
	if [ ! -d $path ]
	then
		mkdir $path
	fi
	/home/panda/LoadTest/ClientFolder/rnd_load_test/apache-jmeter-5.3/bin/jmeter -n -t evalpro_load_test.jmx -l $path/results.csv -e -o $path/output
	#echo "before killing scripts.sh"
	sshpass -p "panda123" ssh panda@10.129.131.6 "ps -ef | grep -v grep | grep scripts.sh | awk '{print \$2}' | xargs kill"
	#ps -ef | grep -v grep | grep scripts.sh | awk '{print $2}' | xargs kill
	sleep 60
	if [ -f jmeter.log ]
	then
		mv jmeter.log $path/
	fi
done
#echo "post processing started"
#n_server_cores=`sshpass -p "panda123" ssh panda@10.129.131.6 "nproc"`
#for i in "${user_vals[@]}"
#do
#	sshpass -p "panda123" ssh panda@10.129.131.6 "cd LoadTest; ./post_processing.sh $i ${timestamp_arr[i]}"
#	sshpass -p "panda123" scp -r panda@10.129.131.6:/home/panda/LoadTest/metrics/*$i_${timestamp_arr[i]}* /home/panda/LoadTest/ClientFolder/rnd_load_test/${server_metrics_path}/
#	sshpass -p "panda123" scp -r panda@10.129.131.6:/home/panda/LoadTest/timeseries_metrics/*$i_${timestamp_arr[i]}*/* /home/panda/LoadTest/ClientFolder/rnd_load_test/${perf_analysis_path}/
#	cp test_results/users_${i}_${timestamp_arr[i]}/output/statistics.json /home/panda/LoadTest/ClientFolder/rnd_load_test/${server_metrics_path}/client_side_values_${i}.json
#	python3 server_metrics_extract_upload.py /home/panda/LoadTest/ClientFolder/rnd_load_test/${server_metrics_path} ${n_server_cores}
	#bash -c "cd rnd_final;./post_processing.sh $i"
#done 


echo "post processing completed"
