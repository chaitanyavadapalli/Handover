#!/bin/bash


	
obj=`mpstat 2 150 | awk -F  ' ' -v counter=1 '{


if(NR==1|| NR==2)
{
	next
}


if(NR==3)
	{
		#print $0
		n=split($0,a," ");

		for(j=4;j<=n;j++)
			{
				#printf "%s\n",b[j]
				header[j]=a[j];
			}
			next;
	}


		n1=split($0,arr," ");
		
	for(j=4;j<=n1;j++)
	  	 {

	  	 	fields[j]="\""header[j]"\":\""arr[j]"\""
	  	 }

	  	  result =result"{"fields[4]
    	for(i =5;i <= n1;i++)
    	{
    	
        result = result "," fields[i]
    	} 

    	 result=result"}," 

}END {print result}'`

#echo $obj

output="{\"MpstatSnapshots\":["

output+=$obj

output=${output::-1}

output+="]}"

echo $output


