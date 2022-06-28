import json

import pandas as pd

import sys

import csv

import matplotlib.pyplot as plt
plt.style.use("seaborn")


f= open(sys.argv[1])

data=json.load(f)

flat_list=data["MpstatSnapshots"]

df = pd.DataFrame(flat_list)

df=df.apply(pd.to_numeric,errors='coerce', axis=1)

n=len(df);

df=df.iloc[40:]

#df=df.iloc[:int(n*(10/100))]

df["user+system(%)"] = df["%usr"] + df["%sys"]

cols=["user+system(%)","%iowait","%idle","%sys","%guest"]

df=df[cols]

mean_dic=dict(df.mean(axis=0))

output_file_name=sys.argv[2]+"/mpstat_avg_metrics_"+sys.argv[1].split("_")[-1].split(".")[0]+".json"


with open(output_file_name,"w") as json_file:
	json.dump(mean_dic, json_file)
