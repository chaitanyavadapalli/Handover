#!/bin/bash
iteration=1


output1="["

output2="["

top -d 5 -n 2 | awk -F  ' ' -v counter=1 '{

if($0 ~ /PID/)
	{
		counter=counter+1
                #print $0
		n=split($0,a," ");
		printf "%d\n",n
		i=1
		k=1

		while(i<=n)
			{
				header[k]=a[i];
				k=k+1
				i=i+1
			}
			next;
	}



if($0 !~ /top -/ && $0 !~ /Tasks:/ && $0 !~ /\%Cpu\(s\):/ && $0 !~ /KiB Mem :/ && $0 !~ /KiB Swap:/ && $0 !~ /PID USER/)
	{
               #print $0
	       #printf "%d\n",counter

		n1=split($0,arr," ");
		
		

		if (n1==14)
		{
                 i1=1
                 k1=1
		 while(i1<n1)
                {
                        b1[k1]=arr[i1]
                        printf "%s\n",b1[k1]
                        i1=i1+1
                        k1=k1+1

                }

		}
		else
		{
                 i1=2
                 k1=1
		 while(i1<n1)
                {
                        b1[k1]=arr[i1]
                        printf "%s\n",b1[k1]
                        i1=i1+1
                        k1=k1+1

                }
		}
		
		printf "%d\n",n1
		

	
	for(j=1;j<=k1-2;j++)
	  	 {

	  	 	fields[j]="\""header[j+1]"\":\""b1[j+1]"\""
	  	 }

	  	  result =result"{"fields[1]
               
    	for(i =2;i <= k1-2;i++)
    	{
    	
        result = result "," fields[i]
    	} 

    	 result=result"},"
         printf "%s\n",result 
	}

}'

#echo $obj

#IFS='|'
#readarray -d "|&|" -t strarr <<< "$obj"

#objs1=`echo $obj | cut -d'|' -f1`

#echo $objs1

#objs2=`echo $obj | cut -d'|' -f2`


#output="{\"ThreadIoArr\":["

#output+=$objs1
	
#output=${output::-1}

#output+="],"

#output+="\"Aggregated\":["

#output+=$objs2

#output=${output::-1}

	
#output+="]}"

#echo $output

