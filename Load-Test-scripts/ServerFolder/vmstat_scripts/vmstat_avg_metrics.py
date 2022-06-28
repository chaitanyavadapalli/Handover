import json

import pandas as pd

import sys

import csv

import matplotlib.pyplot as plt
plt.style.use("seaborn")


f= open(sys.argv[1])

data=json.load(f)

flat_list=data["VmstatSnapshots"]

df = pd.DataFrame(flat_list)


df=df.apply(pd.to_numeric,errors='coerce', axis=1)

df["user+system(%)"] = df.us + df.sy

df.rename(columns = {'sy':'sys(%)'}, inplace = True)

df.rename(columns = {'id':'Idle(%)'}, inplace = True)

df.rename(columns = {'wa':'I/O wait(%)'}, inplace = True)

df.rename(columns = {'free':'Available Memory(Kb)'}, inplace = True)

cols=["user+system(%)","I/O wait(%)","Idle(%)","sys(%)","Available Memory(Kb)"]

df=df[cols]

df=df.iloc[40:]

mean_dic=dict(df.mean(axis=0))

output_file_name=sys.argv[2]+"/vmstat_avg_metrics_"+sys.argv[1].split("_")[-1].split(".")[0]+".json"


with open(output_file_name,"w") as json_file:
	json.dump(mean_dic, json_file)
