#include<iostream>
using namespace std;
long long fact(long long n)
{
	if(n==1 || n==0)
	{
		return 1;
	}

	return n*fact(n-1);
}
