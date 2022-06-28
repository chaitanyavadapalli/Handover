import json

import pandas as pd

import sys

import csv


f= open(sys.argv[1])

data=json.load(f)

flat_list=data["ThreadIoArr"]


#print(flat_list[0])

df = pd.DataFrame(flat_list)


df.rename(columns = {'SWAPIN':'SWAPIN%'}, inplace = True)

df.rename(columns = {'IO':'IO%'}, inplace = True)
cols=["IO%","SWAPIN%"]

df["SWAPIN%"]=df["SWAPIN%"].str[:-2]

df["IO%"]=df["IO%"].str[:-2]

df[cols]=df[cols].apply(pd.to_numeric,errors='coerce', axis=1)


test=df.groupby(["TID", "USER","COMMAND"])[cols].agg(["mean","min", "max"])

output_file_name=sys.argv[2]+"/iotop_metrics_"+sys.argv[1].split("_")[-1].split(".")[0]+".csv"

test.to_csv(output_file_name,index=True,header=True)
