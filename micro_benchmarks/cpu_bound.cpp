#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <unistd.h>
#include <time.h>
#include <pthread.h>
#include <sys/syscall.h>
#include <sys/types.h>
#include <sys/time.h>
#include <vector>
using namespace std;


int main(int argc,char const *argv[])
{

	//int core_id=atoi(argv[2]);

	//time_t start, end;

	/*

	struct timeval stop, start;

	//double cpu_time_used;

	int file_id=atoi(argv[1]);


	char pid_str[6];

	//itoa(pid,pid_str,10);

	snprintf (pid_str, sizeof(pid_str), "%d",file_id);

	char object_file_name[50]={'\0'};

	char splus_command[100]={'\0'};

	char output_file_name[50]={'\0'};

	char run_command[50]={'\0'};

	char diff_command[100]={'\0'};

	char actual_output_file_name[20]="outfile.txt";

	strcat(output_file_name,"output_file_");

	strcat(output_file_name,pid_str);

	strcat(output_file_name,".txt");

	strcat(splus_command,"g++ binary.cpp helper.cpp -o ");

	strcat(object_file_name,"obj_file_");

	strcat(object_file_name,pid_str);

	strcat(object_file_name,".o");

	strcat(splus_command,object_file_name);

	strcat(run_command,"./");

	strcat(run_command,object_file_name);

	strcat(run_command," < inpfile.txt  > ");

	strcat(run_command,output_file_name);

	strcat(diff_command,"diff outfile.txt ");

	strcat(diff_command,output_file_name);

	//start=time(NULL);

	//gettimeofday(&start, NULL);
	*/		
	vector<int> arr(200,0);

	long long counter=0;


	for(auto &e:arr)
	{

		for(long long i=0;i<100000000;i++)
		{
			counter+=1;
		}

    }
    

	//int diff=(end-start);

	//cpu_time_used=((double) (end - start)) / CLOCKS_PER_SEC;

	//printf("%d\n", diff);

	return 0;
}
