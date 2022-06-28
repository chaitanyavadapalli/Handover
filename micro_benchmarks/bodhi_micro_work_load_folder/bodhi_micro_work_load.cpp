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
#include <errno.h>
#include<signal.h>
#include <fcntl.h>
#include<sys/wait.h>

using namespace std;


void SpawnProcess(char *inputCommand)
{

	//printf("%s\n",inputCommand);
			
			char *param=strtok(inputCommand," ");

			int paramCount=0;

			char *args[10];
	
			while(param!=NULL)
			{
				
				args[paramCount++]=param;
				param=strtok(NULL," ");
			}

			if(paramCount<1)
			{
				exit(2);
			}

			char filepath[50];

			filepath[0]='\0';

			strcat(filepath,args[0]);

			args[0]=strdup(filepath);

			int st;
			
			char **args1=NULL;

			args1 = (char **)malloc(sizeof(char *) *(paramCount+1));

			int i;

			for(i=0;i<paramCount;i++)
			{
				
				args1[i]=strtok(args[i],"\"");
				//cout<<args1[i]<<endl;
			}

			args1[paramCount]=NULL;

			execvp(args1[0],args1);

			if(errno==2)
			{
				exit(2);
			}		
}


void workload(char* compile_command,char* run_command,char* diff_command,char* inp_file,char* output_file)
{
	        int pid1;
		pid1=fork();
		if(pid1==0)
		{
		SpawnProcess(compile_command);
		}

		else if(pid1>0)
		{

			int status1;

		waitpid(pid1,&status1,0);

		if(WEXITSTATUS(status1)==2)
			{
					printf("Illegal command or arguments\n");
			}


		int pid2;
		pid2=fork();

		if(pid2==0)
		{
			//cout<<run_command<<endl;
			int rfd= open(inp_file,O_RDONLY);
			int wfd= open(output_file,O_WRONLY|O_TRUNC);
			dup2(rfd,0);
			dup2(wfd,1);
			close(rfd);
			close(wfd);
			SpawnProcess(run_command);
		}

		else if(pid2>0)
		{
			int status2;

			waitpid(pid2,&status2,0);

		if(WEXITSTATUS(status2)==2)
			{
					printf("Illegal command or arguments\n");
			}

		int pid3;
		pid3=fork();

		if(pid3==0)
		{
			//cout<<diff_command<<endl;
			SpawnProcess(diff_command);
		}

		else if(pid3>0)
		{
			int status3;
			waitpid(pid3,&status3,0);

		if(WEXITSTATUS(status3)==2)
			{
					printf("Illegal command or argument\n");
			}
		}
		}
		}


	//system(compile_command);
	//cout<<compile_command<<endl;
	//system(run_command);
	//cout<<run_command<<endl;
	//system(diff_command);
	//cout<<diff_command<<endl;
}


int main(int argc,char const *argv[])
{

	int core_id=atoi(argv[1]);

	//time_t start, end;

	

	struct timeval stop, start;

	//double cpu_time_used;

	//int file_id=atoi(argv[1]);


	char pid_str[6];

	//itoa(pid,pid_str,10);

	//pid_t pid=getpid();

	snprintf (pid_str, sizeof(pid_str), "%d",core_id);

	char object_file_name[100]={'\0'};

	char splus_command[200]={'\0'};

	char output_file_name[100]={'\0'};

	char run_command[100]={'\0'};

	char diff_command[200]={'\0'};

	char actual_output_file_name[200]="outfile.txt";

	char input_file_name[200]="inpfile.txt";

	//strcat(actual_output_file_name,pid_str);

	//strcat(actual_output_file_name,".txt");

	strcat(output_file_name,"output_file_");

	strcat(output_file_name,pid_str);

	strcat(output_file_name,".txt");

	strcat(splus_command,"g++ -O0  binary.cpp helper.cpp -o ");
	
	//strcat(splus_command,pid_str);

	//strcat(splus_command,".cpp /tmp/helper_");

	//strcat(splus_command,pid_str);

	//strcat(splus_command,".cpp -o ");

	strcat(object_file_name,"obj_file_");

	strcat(object_file_name,pid_str);

	strcat(object_file_name,".o");

	strcat(splus_command,object_file_name);

	//cout<<"splus command=";

	//cout<<splus_command<<endl;

        //strcat(run_command,"/tmp/");
	
	strcat(run_command,"./");

	strcat(run_command,object_file_name);

	//strcat(run_command," < inpfile.txt > ");

	 //strcat(run_command,pid_str);

	 //strcat(run_command,".txt  > ");

	//strcat(run_command,output_file_name);

	//cout<<run_command<<endl;

	strcat(diff_command,"diff outfile.txt ");

	//strcat(diff_command,pid_str);

	//strcat(diff_command,".txt ");

	strcat(diff_command,output_file_name);

	//start=time(NULL);

	//gettimeofday(&start, NULL);
	
	vector<int> arr(75,0);

	//long long counter=0;


	for(auto &e:arr)
	{

		//cout<<splus_command<<endl;
		workload(splus_command,run_command,diff_command,input_file_name,output_file_name);
    }
    

	//int diff=(end-start);

	//cpu_time_used=((double) (end - start)) / CLOCKS_PER_SEC;

	//printf("%d\n", diff);

	return 0;
}
