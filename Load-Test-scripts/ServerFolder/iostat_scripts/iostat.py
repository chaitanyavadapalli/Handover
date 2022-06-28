import json

import pandas as pd

import sys

import csv

f= open(sys.argv[1])

data=json.load(f)


no_of_iterations=len(data)

data_header_row=["Device","kB_read/s","kB_wrtn/s"]

first_iteration_datas=data["1"]

last_iteration_datas=data[str(len(data))]

data_rows=[]

output_file_name=sys.argv[2]+"/iostat_metrics_"+sys.argv[1].split("_")[-1].split(".")[0]+".csv"

for i in range(len(first_iteration_datas)):
	first_iteration_data=first_iteration_datas[i]
	last_iteration_data=last_iteration_datas[i]
	device_name=first_iteration_data["Device:"]
	first_iteration_kb_read=float(first_iteration_data["kB_read"])
	first_iteration_kb_write=float(first_iteration_data["kB_wrtn"])
	#first_iteration_kb_discard=float(first_iteration_data["kB_dscd"])
	last_iteration_kb_read=float(last_iteration_data["kB_read"])
	last_iteration_kb_write=float(last_iteration_data["kB_wrtn"])
	#last_iteration_kb_discard=float(last_iteration_data["kB_dscd"])
	kb_read_per_sec=(last_iteration_kb_read-first_iteration_kb_read)/(5*(len(data)-1))
	kb_wrtn_per_sec=(last_iteration_kb_write-first_iteration_kb_write)/(5*(len(data)-1))
	#kb_dscd_per_sec=(last_iteration_kb_discard-first_iteration_kb_discard)/(5*(len(data)-1))
	data_row=[device_name,kb_read_per_sec,kb_wrtn_per_sec]
	data_rows.append(data_row)

with open(output_file_name,"a+") as csv_file:
	writer_file_obj = csv.writer(csv_file)
	writer_file_obj.writerow(data_header_row)
	writer_file_obj.writerows(data_rows)



