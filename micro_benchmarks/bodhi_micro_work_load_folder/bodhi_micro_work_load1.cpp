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
#include<iostream>
#include <thread>
#include <random>
#include <chrono>
using namespace std;


void workload(char* compile_command,char* run_command,char* diff_command)
{
//	cout<<compile_command<<endl;
        system(compile_command);
	system(run_command);
	system(diff_command);
}


int main(int argc,char const *argv[])
{

	int core_id=atoi(argv[1]);

	//time_t start, end;

        int process_id=atoi(argv[2]);

	//mt19937_64 eng{std::random_device{}()};  // or seed however you want
    	//uniform_int_distribution<> dist{200, 1000};	

	struct timeval stop, start;

	//double cpu_time_used;

	//int file_id=atoi(argv[1]);


	char pid_str[6];

	//itoa(pid,pid_str,10);

	//pid_t pid=getpid();
	
	char pid_str1[6];

	snprintf (pid_str, sizeof(pid_str), "%d",core_id);

	snprintf (pid_str1,sizeof(pid_str1),  "%d",process_id);

	char object_file_name[100]={'\0'};

	char splus_command[200]={'\0'};

	char output_file_name[100]={'\0'};

	char run_command[100]={'\0'};

	char diff_command[200]={'\0'};

	char actual_output_file_name[50]="outfile.txt";

	strcat(output_file_name,"output_file_");

	strcat(output_file_name,pid_str);

	strcat(output_file_name,"_");

	strcat(output_file_name,pid_str1);

	strcat(output_file_name,".txt");

	strcat(splus_command,"g++ binary.cpp helper.cpp -o ");

	strcat(object_file_name,"obj_file_");

	strcat(object_file_name,pid_str);

	strcat(object_file_name,"_");

	strcat(object_file_name,pid_str1);

	strcat(object_file_name,".o");

	strcat(splus_command,object_file_name);

	strcat(run_command,"./");

	strcat(run_command,object_file_name);

	strcat(run_command," < inpfile.txt  > ");

	strcat(run_command,output_file_name);

//	cout<<run_command<<endl;

	strcat(diff_command,"diff outfile.txt ");

	//output_file_name = "outfile.txt";

	strcat(diff_command,output_file_name);

	//start=time(NULL);

	//gettimeofday(&start, NULL);
	
	vector<int> arr(75,0);

	//long long counter=0;


	for(auto &e:arr)
	{
		workload(splus_command,run_command,diff_command);
		//this_thread::sleep_for(std::chrono::milliseconds{dist(eng)});
    }
    

	//int diff=(end-start);

	//cpu_time_used=((double) (end - start)) / CLOCKS_PER_SEC;

	//printf("%d\n", diff);

	return 0;
}
