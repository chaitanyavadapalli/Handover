#!/bin/bash

# BEGIN '{header=() -v data=()}'


# processinfo= `ps S -ao  pid,%cpu,%mem,vsz,rss,comm,pidns,netns,mntns,time`

iteration=1



output="{"

obj=""

trap cleanup SIGKILL

trap cleanup SIGINT

trap cleanup SIGTERM

cleanup()
{

	output=${output::-1}
	output+="}"
	echo $output
	exit

}

while :
do
	output+="\""
	output+=$iteration
	output+="\""
	output+=":["
	obj=`ps S -eTo  pid,spid,%cpu,%mem,vsz,rss,comm,etimes,cputime,thcount | awk -F ' ' -v counter=1  '{

    	if(NR==1)
		{
			# printf "%d",NF
			for(j=1;j<=NF;j++)
			{
				header[j]=$j;

				# printf "%s ", header[j]
			}
		}

	  else
	  {
	  	 for(k=1;k<=NF;k++)
	  	 {
	  	 	fields[k]="\""header[k]"\":\""$k"\""
	  	 }

	  	
	  	 result =result"{"fields[1]
    	for(i =2;i <= k-1;i++)
    	{
    	
        result = result "," fields[i]
    	} 
    	
	  	 result=result"}," 
	  
	  }

	}
	  END {print result}'`

	
	output+=$obj
	
	output=${output::-1}
	
	output+="],"
	
	# echo $output
	iteration=$((iteration+1))
	sleep 20
done







