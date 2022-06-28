#include<iostream>
using namespace std;
void binary(long long n){
	if(n==0)
		return;
	binary(n/2);
	cout<<n%2;
	
}
