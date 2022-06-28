#!/bin/bash
iteration=1


output1="["

output2="["

	
obj=`iotop -b -o -k -q -d 5 -n 60 | awk -F  ' ' -v counter=1 '{


if(NR==3)
	{
                #echo $0
		n=split($0,a," ");
		i=1
		k=1
		while(i<=n)
		{
			if(i==4 || i==6)
				{
					b[k]=a[i]" "a[i+1]
					i=i+2
				}

			else
				{
					b[k]=a[i]
					i=i+1
				}
				k=k+1
		}

	           #printf "%d\n",k


		for(j=1;j<=k-1;j++)
			{
				#printf "%s\n",b[j]
				header[j]=b[j];
			}
			next;
	}



if($0 !~ /Total DISK READ/ && $0 !~ /Actual DISK READ/ && $0 !~ /TID  PRIO  USER     DISK READ  DISK WRITE  SWAPIN      IO    COMMAND/)
	{
               #print $0

		n1=split($0,arr," ");


		i1=1
		k1=1

		while(i1<=n1)
		{
			if(i1==4 || i1==6 ||i1==8 || i1==10)
				{
					b1[k1]=arr[i1]" "arr[i1+1]
					i1=i1+2
				}

			else
				{
					b1[k1]=arr[i1]
					i1=i1+1
				}

				

				k1=k1+1

				if(i1==13)
					{
						break
					}
		}

	
	for(j=1;j<=k1-1;j++)
	  	 {

	  	 	fields[j]="\""header[j]"\":\""b1[j]"\""
	  	 }

	  	  result =result"{"fields[1]
               
    	for(i =2;i <= k1-1;i++)
    	{
    	
        result = result "," fields[i]
    	} 

    	 result=result"},"
        #printf "%s\n",result 
	}

else if($0 ~ /Total DISK READ/)
	{
		n2=split($0,arr2," ");

		t1="Total DISK READ"

		t2=arr2[5]" "arr2[6]

		k1="\""t1"\":\""t2"\""

		t3="Total DISK WRITE"

		t4=arr2[12]" "arr2[13]

		k2="\""t3"\":\""t4"\""

		result2=result2"{"k1

		result2=result2","k2

	}
else
	{
		n3=split($0,arr3," ");

		t1="Current DISK READD"

		t2=arr3[4]" "arr3[5]

		k1="\""t1"\":\""t2"\""

		t3="Current DISK WRITE"

		t4=arr3[10]" "arr3[11]

		k2="\""t3"\":\""t4"\""

		result2=result2","k1

		result2=result2","k2"},"
	}



}END {print result"|"result2}'`

#echo $obj

#IFS='|'
#readarray -d "|&|" -t strarr <<< "$obj"

objs1=`echo $obj | cut -d'|' -f1`

#echo $objs1

objs2=`echo $obj | cut -d'|' -f2`


output="{\"ThreadIoArr\":["

output+=$objs1
	
output=${output::-1}

output+="],"

output+="\"Aggregated\":["

output+=$objs2

output=${output::-1}

	
output+="]}"

echo $output

