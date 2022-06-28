import json

import pandas as pd

import sys

import os

import numpy as np

def get_sec(time_str):
    """Get Seconds from time."""
    h_m_s=time_str.split(':')

    h=0
    m=0
    s=0
    if len(h_m_s)==1:
    	s=h_m_s[0]
    	if s.isnumeric()==False:
    		return 0
    else:
    	h=h_m_s[0]
    	m=h_m_s[1]
    	s=h_m_s[2]
    	if h.isnumeric()==False or m.isnumeric()==False or s.isnumeric()==False:
    		return 0

    return int(h) * 3600 + int(m) * 60 + int(s)

def cal_cpu_perc(group):
	last_row=group.iloc[-1]
	first_row=group.iloc[0]
	data={}
	t2=get_sec(last_row["TIME"])
	t1=get_sec(first_row["TIME"])
	data["CPU time"]=t2-t1
	#print(last_row["ELAPSED"])
	e2=int(last_row["ELAPSED"])
	e1=int(first_row["ELAPSED"])
	if e2!=e1:
		data["%CPU"]=((t2-t1)*100)/(e2-e1)
	return pd.Series(data).to_frame()

cwd=os.getcwd()

#print(cwd)


f= open(sys.argv[1])

data=json.load(f)

test=data.values()



flat_list = [item for sublist in test for item in sublist]


#print(flat_list[0])

df = pd.DataFrame(flat_list)

df[["ELAPSED"]]=df[["ELAPSED"]].apply(pd.to_numeric,errors='coerce', axis=1)

df["ELAPSED"] = df["ELAPSED"].replace(np.nan, 0)

df = df.sort_values(["ELAPSED"])

cols=["%CPU","%MEM","VSZ","RSS","ELAPSED","TIME","THCNT"]

#df["ELAPSED"]=pd.to_numeric(df["ELAPSED"])

#print(list(df.groupby(["PID","SPID","COMMAND"])[cols]))


test=df.groupby(["PID","SPID","COMMAND"],sort=False)[cols].apply(cal_cpu_perc)



output_file_name=sys.argv[2]+"/pid_metrics_"+sys.argv[1].split("_")[-1].split(".")[0]+".csv"

test.to_csv(output_file_name,index=True,header=True)

