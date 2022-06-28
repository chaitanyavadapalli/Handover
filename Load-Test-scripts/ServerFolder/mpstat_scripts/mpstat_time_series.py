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

df["user+system(%)"] = df["%usr"] + df["%sys"]

cols=["user+system(%)","%iowait","%idle"]

df=df[cols]

#print(df.dtypes)


df.plot(subplots= True, figsize=(15, 12), sharex= False, sharey=False)
output_file_name=sys.argv[2]+"/mpstat_time_series_metrics_"+sys.argv[1].split("_")[-1].split(".")[0]+".png"
plt.savefig(output_file_name)
#print(df)