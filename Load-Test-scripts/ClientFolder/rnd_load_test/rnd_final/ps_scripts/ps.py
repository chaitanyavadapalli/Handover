import json

import pandas as pd

import sys

f= open(sys.argv[1])

data=json.load(f)

test=data.values()



flat_list = [item for sublist in test for item in sublist]


#print(flat_list[0])

df = pd.DataFrame(flat_list)

cols=["%CPU","%MEM","VSZ","RSS"]

df[cols]=df[cols].apply(pd.to_numeric,errors='coerce', axis=1)


test=df.groupby(["PID", "PIDNS","NETNS","MNTNS","COMMAND"])[cols].agg(["mean","min", "max"])

output_file_name=sys.argv[2]+"/pid_metrics_"+sys.argv[1].split("_")[-1].split(".")[0]+".csv"

test.to_csv(output_file_name,index=True,header=True)

