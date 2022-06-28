import json

import pandas as pd

import sys

import csv

import matplotlib.pyplot as plt
plt.style.use("seaborn")


f= open(sys.argv[1])

data=json.load(f)

flat_list=data["Aggregated"]

df = pd.DataFrame(flat_list)

df.rename(columns = {'Current DISK READD':'Disk Read(KB/s)'}, inplace = True)

df.rename(columns = {'Current DISK WRITE':'Disk Write(KB/s)'}, inplace = True)

df.drop(columns = ["Total DISK READ", "Total DISK WRITE"], inplace=True)

df["Disk Read(KB/s)"]=df["Disk Read(KB/s)"].str[:-4]

df["Disk Write(KB/s)"]=df["Disk Write(KB/s)"].str[:-4]

cols=["Disk Read(KB/s)","Disk Write(KB/s)"]

df[cols]=df[cols].apply(pd.to_numeric,errors='coerce', axis=1)

df.plot(subplots= True, figsize=(15, 12), sharex= False, sharey=False)
output_file_name=sys.argv[2]+"/iotop_time_series_metrics_"+sys.argv[1].split("_")[-1].split(".")[0]+".png"
plt.savefig(output_file_name)
	
#print(df)