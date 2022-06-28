import json
import sys
import csv

if(len(sys.argv)<3):
	print("Please give input file name as command line argument")
	exit()

f= open(sys.argv[1])

data=json.load(f)

start=str(1)
end=str(len(data))
result=data[start]
# print(result)
# print(data[start])
# print(data[end])
for i in range (0,len(data[start])):
	for key in data[start][i]:
		if(key!="Iface" and key!="Flg" and key!="MTU"):
			result[i][key]=str(int(data[end][i][key])-int(data[start][i][key]))
# with open(sys.argv[2], "w") as outfile:
# 	json.dump(result,outfile,indent=5)
output_file_name=sys.argv[2]+"/netstat_metrics_"+sys.argv[1].split("_")[-1].split(".")[0]+".csv"
stats_file = open(output_file_name, 'w')
csv_writer = csv.writer(stats_file)
count=0
for i in range(0,len(result)):
	if count == 0:
		header = result[i].keys()
		csv_writer.writerow(header)
		count += 1
	csv_writer.writerow(result[i].values())
stats_file.close()
		
