#!/bin/bash


	
obj=`vmstat -n 2 150 | awk -F  ' ' -v counter=1 '{


if($0 ~ /procs/)
{

	next
}


if($0 ~ /r  b   swpd/)
	{

		n=split($0,a," ");

		for(j=1;j<=n;j++)
			{
				#printf "%s\n",b[j]
				header[j]=a[j];
			}
			next;
	}


		n1=split($0,arr," ");
		
	for(j=1;j<=n1;j++)
	  	 {

	  	 	fields[j]="\""header[j]"\":\""arr[j]"\""
	  	 }

	  	  result =result"{"fields[1]
    	for(i =2;i <= n1;i++)
    	{
    	
        result = result "," fields[i]
    	} 

    	 result=result"}," 

}END {print result}'`

#echo $obj

output="{\"VmstatSnapshots\":["

output+=$obj

output=${output::-1}

output+="]}"

echo $output


