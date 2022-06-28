import os

import sys

import pandas as pd

import json

import matplotlib.pyplot as plt

from matplotlib.backends.backend_pdf import PdfPages

from statistics import mean

import numpy as np


pdf_file_name="perf_analysis/"+sys.argv[1].split("/")[-1]+"/avg_metrics.pdf"

pp = PdfPages(pdf_file_name)

csv_file_name="perf_analysis/"+sys.argv[1].split("/")[-1]+"/avg_metrics.csv"

ncores=sys.argv[2]

res={};



def scan_folder(parent):
    # iterate over all the files in directory 'parent'
    for file_name in os.listdir(parent):
        if file_name.endswith(".json"):
            nclients=file_name.split("_")[3].split(".")[0]
            if nclients not in res.keys():
                res[nclients]={}
            f= open("".join((parent, "/", file_name)))
            data=json.load(f)
            test_case_results_throughput_arr=[]
            test_case_results_res_time_arr=[]
            test_case_results_count_arr=[]
            upload_throughput_arr=[]
            upload_res_time_arr=[]
            upload_count_arr=[]
            for req_name in data:
            	if req_name.startswith("TestcasesResults") is True:
            		res[nclients]["TestCaseResultsThroughput"]=data[req_name]["throughput"]*(1-(data[req_name]["errorPct"]/100))
            		res[nclients]["TestCaseResultsResponseTime"]=data[req_name]["meanResTime"]
            		#res[nclients]["TestCaseResultsResponseTimeSlope"]=
            			#print(str(data[req_name]["throughput"])+"\t"+str(data[req_name]["meanResTime"]))
            	if req_name.startswith("Upload") is True:
            		res[nclients]["UploadThroughput"]=data[req_name]["throughput"]*(1-(data[req_name]["errorPct"]/100))
            		res[nclients]["UploadResponseTime"]=data[req_name]["meanResTime"]

        else:
            current_path = "".join((parent, "/", file_name))
            nclients=file_name.split("_")[1]
            if nclients not in res.keys():
                res[nclients]={}
            for server_file_name in os.listdir(current_path):
                if ".json" in server_file_name and ("mpstat" in server_file_name or "vmstat" in server_file_name or "iotop" in server_file_name):
                    f= open("".join((parent, "/", file_name,"/",server_file_name)))
                    #print(server_file_name)
                    data=json.load(f)
                    if "mpstat" in server_file_name:
                        res[nclients]["user+system(%)_mpstat"]=data["user+system(%)"]
                        res[nclients]["%iowait_mpstat"]=data["%iowait"]
                        res[nclients]["%idle_mpstat"]=data["%idle"]
                        res[nclients]["%sys_mpstat"]=data["%sys"]
                        res[nclients]["%guest_mpstat"]=data["%guest"]
                        continue
                    if "vmstat" in server_file_name:
                        res[nclients]["user+system(%)_vmstat"]=data["user+system(%)"]
                        res[nclients]["I/O wait(%)_vmstat"]=data["I/O wait(%)"]
                        res[nclients]["Idle(%)_vmstat"]=data["Idle(%)"]
                        res[nclients]["sys(%)_vmstat"]=data["sys(%)"]
                        continue
                    if "iotop" in server_file_name:
                        res[nclients]["Disk Read(KB/s)"]=data["Disk Read(KB/s)"]
                        res[nclients]["Disk Write(KB/s)"]=data["Disk Write(KB/s)"]

scan_folder(sys.argv[1])

res_list=[]

for no_of_users in res:
	res[no_of_users]["# users"]=no_of_users
	res_list.append(res[no_of_users])

df = pd.DataFrame(res_list)

df = df.apply(pd.to_numeric,errors='coerce', axis=1)

df.sort_values("# users",inplace=True)


res_time_keys=list(df['TestCaseResultsResponseTime'].index)

# print(res_time_keys)

res_time_vals = df['TestCaseResultsResponseTime'].values

diff_res_time_vals= res_time_vals[1:] - res_time_vals[:-1]

user_vals=df['# users'].values

diff_user_vals=user_vals[1:]-user_vals[:-1]

slope_vals={}


slope_vals[res_time_keys[0]]=0


for item in zip(diff_res_time_vals,diff_user_vals,range(1,len(res_time_keys))):
	slope_vals[res_time_keys[item[2]]]=item[0]/item[1]


df["ResponseTimeSlope"]= pd.Series(slope_vals)

df["CPUServiceTime"]=(df["user+system(%)_vmstat"]*int(ncores)*1000)/(df["TestCaseResultsThroughput"]*100)


df["CalcThinkTime"]=((df["# users"]*1000)/df["TestCaseResultsThroughput"])-df["TestCaseResultsResponseTime"]

df["RequestRate_Upperbound_Calc"]=((df["# users"]*1000)/df["CalcThinkTime"])

df["RequestRate_Upperbound_Config"]=((df["# users"]*1000)/15000)




df=df.round(2)

df.to_csv(csv_file_name)


fig1 = plt.figure()

fig1, axs = plt.subplots(1, 1)

axs.plot(df["# users"],df["TestCaseResultsThroughput"],marker='.')
axs.set_xlabel("# users")
x_axis_tick_size=(df["# users"].max()-df["# users"].min())//len(df.index)
axs.set_xticks(np.arange(df["# users"].min(),df["# users"].max(),x_axis_tick_size))
axs.set_ylabel("Results Throughput(req/sec)")
axs.set_xticklabels(axs.get_xticks(), rotation = 45)
#print(df["TestCaseResultsThroughput"].max())
#print(df["TestCaseResultsThroughput"].min())
y_axis_tick_size= round((df["TestCaseResultsThroughput"].max()-df["TestCaseResultsThroughput"].min())/len(df.index),2)
#print(y_axis_tick_size)
axs.set_yticks(np.arange(df["TestCaseResultsThroughput"].min(),df["TestCaseResultsThroughput"].max(),y_axis_tick_size))
"""
axs[1].plot(df["# users"],df["UploadThroughput"],marker='.')
axs[1].set_xlabel("# users")
axs[1].set_xticks(np.arange(df["# users"].min(),df["# users"].max(),x_axis_tick_size))
axs[1].set_xticklabels(axs[1].get_xticks(), rotation = 45)
axs[1].set_ylabel("Upload Throughput(req/sec)")
y_axis_tick_size= round((df["UploadThroughput"].max()-df["UploadThroughput"].min())/len(df.index),2)
axs[1].set_yticks(np.arange(df["UploadThroughput"].min(),df["UploadThroughput"].max(),y_axis_tick_size))
"""
fig1.tight_layout()


pp.savefig(fig1)


fig2 = plt.figure()


fig2, axs = plt.subplots(1, 1)

axs.plot(df["# users"],df["TestCaseResultsResponseTime"],marker='.')
axs.set_xlabel("# users")
axs.set_xticks(np.arange(df["# users"].min(),df["# users"].max(),x_axis_tick_size))
axs.set_ylabel("Results Response time(msec)")
y_axis_tick_size= round((df["TestCaseResultsResponseTime"].max()-df["TestCaseResultsResponseTime"].min())/len(df.index),2)
axs.set_yticks(np.arange(df["TestCaseResultsResponseTime"].min(),df["TestCaseResultsResponseTime"].max(),y_axis_tick_size))
axs.set_xticklabels(axs.get_xticks(), rotation = 45)
"""
axs[1].plot(df["# users"],df["UploadResponseTime"],marker='.')
axs[1].set_xlabel("# users")
axs[1].set_xticks(np.arange(df["# users"].min(),df["# users"].max(),x_axis_tick_size))
axs[1].set_ylabel("Upload Response time(msec)")
y_axis_tick_size= round((df["UploadResponseTime"].max()-df["UploadResponseTime"].min())/len(df.index),2)
axs[1].set_yticks(np.arange(df["UploadResponseTime"].min(),df["UploadResponseTime"].max(),y_axis_tick_size))
axs[1].set_xticklabels(axs[1].get_xticks(), rotation = 45)
"""
fig2.tight_layout()

pp.savefig(fig2)


fig3 = plt.figure()

fig3, axs = plt.subplots(1, 2)

axs[0].plot(df["# users"],df["user+system(%)_mpstat"],marker='.')
axs[0].set_xlabel("# users")
axs[0].set_xticks(np.arange(df["# users"].min(),df["# users"].max(),x_axis_tick_size))
axs[0].set_ylabel("CPU Utilization(mpstat)")
y_axis_tick_size= round((df["user+system(%)_mpstat"].max()-df["user+system(%)_mpstat"].min())/len(df.index),2)
axs[0].set_xticklabels(axs[0].get_xticks(), rotation = 45)
axs[0].set_yticks(np.arange(df["user+system(%)_mpstat"].min(),df["user+system(%)_mpstat"].max(),y_axis_tick_size))
axs[1].plot(df["# users"],df["user+system(%)_vmstat"],marker='.')
axs[1].set_xlabel("# users")
axs[1].set_xticks(np.arange(df["# users"].min(),df["# users"].max(),x_axis_tick_size))
axs[1].set_ylabel("CPU Utilization(vmstat)")
y_axis_tick_size= round((df["user+system(%)_vmstat"].max()-df["user+system(%)_vmstat"].min())/len(df.index),2)
axs[1].set_yticks(np.arange(df["user+system(%)_vmstat"].min(),df["user+system(%)_vmstat"].max(),y_axis_tick_size))
axs[1].set_xticklabels(axs[1].get_xticks(), rotation = 45)
fig3.tight_layout()

pp.savefig(fig3)


fig7 = plt.figure()

fig7, axs = plt.subplots(1, 2)

axs[0].plot(df["# users"],df["ResponseTimeSlope"],marker='.')
axs[0].set_xlabel("# users")
axs[0].set_xticks(np.arange(df["# users"].min(),df["# users"].max(),x_axis_tick_size))
axs[0].set_xticklabels(axs[0].get_xticks(), rotation = 45)
axs[0].set_ylabel("Response Time Slope(msec)")
y_axis_tick_size= round((df["ResponseTimeSlope"].max()-df["ResponseTimeSlope"].min())/len(df.index),2)
axs[0].set_yticks(np.arange(df["ResponseTimeSlope"].min(),df["ResponseTimeSlope"].max(),y_axis_tick_size))
axs[1].plot(df["# users"],df["CPUServiceTime"],marker='.')
axs[1].set_xlabel("# users")
axs[1].set_xticks(np.arange(df["# users"].min(),df["# users"].max(),x_axis_tick_size))
axs[1].set_ylabel("CPU service time(msec)")
y_axis_tick_size= round((df["CPUServiceTime"].max()-df["CPUServiceTime"].min())/len(df.index),2)
axs[1].set_yticks(np.arange(df["CPUServiceTime"].min(),df["CPUServiceTime"].max(),y_axis_tick_size))
axs[1].set_xticklabels(axs[1].get_xticks(), rotation = 45)



fig7.tight_layout()

pp.savefig(fig7)




fig8=plt.figure()
fig8, axs = plt.subplots()

axs.plot(df["# users"], df["RequestRate_Upperbound_Calc"], color='r', label='ReqRate_Upbound_Calc',marker='.')
axs.plot(df["# users"], df["RequestRate_Upperbound_Config"], color='g', label='ReqRate_Upbound_Config',marker='.')
axs.plot(df["# users"], df["TestCaseResultsThroughput"], color='b', label='Throughput',marker='.')
axs.set_xticks(np.arange(df["# users"].min(),df["# users"].max(),x_axis_tick_size))
#y_axis_tick_size= round((df["TestCaseResultsThroughput"].max()-df["TestCaseResultsThroughput"].min())/len(df.index),2)
#axs.set_yticks(np.arange(df["TestCaseResultsThroughput"].min(),df["TestCaseResultsThroughput"].max(),y_axis_tick_size))
# Naming the x-axis, y-axis and the whole graph
axs.set_xlabel("# users")
axs.set_ylabel("Rate(req/sec)")
#plt.title("Sine and Cosine functions")
# Adding legend, which helps us recognize the curve according to it's color
axs.legend()

fig8.tight_layout()

pp.savefig(fig8)




fig4 = plt.figure()

fig4, axs = plt.subplots(1, 2)

axs[0].plot(df["# users"],df["%iowait_mpstat"],marker='.')
#axs[0].set_xticklabels(axs[0].get_xticks(), rotation = 45)
axs[0].set_xlabel("# users")
axs[0].set_ylabel("I/O Wait %(mpstat)")
axs[1].plot(df["# users"],df["I/O wait(%)_vmstat"],marker='.')
axs[1].set_xlabel("# users")
axs[1].set_ylabel("I/O Wait %(vmstat)")
#axs[1].set_xticklabels(axs[1].get_xticks(), rotation = 45)

fig4.tight_layout()

pp.savefig(fig4)


fig5 = plt.figure()

fig5, axs = plt.subplots(1, 2)

axs[0].plot(df["# users"],df["%idle_mpstat"],marker='.')
axs[0].set_xlabel("# users")
axs[0].set_ylabel("CPU Idle %(mpstat)")
axs[1].plot(df["# users"],df["Idle(%)_vmstat"],marker='.')
axs[1].set_xlabel("# users")
axs[1].set_ylabel("CPU Idle %(vmstat)")

fig5.tight_layout()

pp.savefig(fig5)



fig6, axs = plt.subplots(1, 2)

axs[0].plot(df["# users"],df["Disk Read(KB/s)"],marker='.')
axs[0].set_xlabel("# users")
axs[0].set_ylabel("Disk Read(KB/s)")
axs[1].plot(df["# users"],df["Disk Write(KB/s)"],marker='.')
axs[1].set_xlabel("# users")
axs[1].set_ylabel("Disk Write(KB/s)")

fig6.tight_layout()

pp.savefig(fig6)

pp.close()
