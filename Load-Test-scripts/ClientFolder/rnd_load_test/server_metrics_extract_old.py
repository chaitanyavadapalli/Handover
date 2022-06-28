import os

import sys

import pandas as pd

import json

import matplotlib.pyplot as plt

from matplotlib.backends.backend_pdf import PdfPages

pdf_file_name="perf_analysis/"+sys.argv[1].split("/")[-1]+"/avg_metrics.pdf"

pp = PdfPages(pdf_file_name)


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
            agg_client_metrics=data["Total"]
            total_throughput=agg_client_metrics["throughput"]
            sample_count=agg_client_metrics["sampleCount"]
            load_time=sample_count/total_throughput
            error_count=agg_client_metrics["errorCount"]
            bad_put=error_count/load_time
            good_put=total_throughput-bad_put
            res[nclients]["Throughput"]=good_put
            res[nclients]["ResponseTime"]=agg_client_metrics["meanResTime"]
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
                        continue
                    if "vmstat" in server_file_name:
                        res[nclients]["user+system(%)_vmstat"]=data["user+system(%)"]
                        res[nclients]["I/O wait(%)_vmstat"]=data["I/O wait(%)"]
                        res[nclients]["Idle(%)_vmstat"]=data["Idle(%)"]
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

#df.set_index("# users",inplace=True)

fig1 = plt.figure()


plt.plot(df["# users"],df["Throughput"],marker='.')

plt.xlabel('# users')
plt.ylabel('Throughput(req/sec)')

pp.savefig(fig1)


fig2 = plt.figure()


plt.plot(df["# users"],df["ResponseTime"],marker='.')

plt.xlabel('# users')
plt.ylabel('ResponseTime(msec)')

pp.savefig(fig2)


fig3 = plt.figure()

fig3, axs = plt.subplots(1, 2)

axs[0].plot(df["# users"],df["user+system(%)_mpstat"],marker='.')
axs[0].set_xlabel("# users")
axs[0].set_ylabel("CPU Utilization(mpstat)")
axs[1].plot(df["# users"],df["user+system(%)_vmstat"],marker='.')
axs[1].set_xlabel("# users")
axs[1].set_ylabel("CPU Utilization(vmstat)")

fig3.tight_layout()

pp.savefig(fig3)


fig4 = plt.figure()

fig4, axs = plt.subplots(1, 2)

axs[0].plot(df["# users"],df["%iowait_mpstat"],marker='.')
axs[0].set_xlabel("# users")
axs[0].set_ylabel("I/O Wait %(mpstat)")
axs[1].plot(df["# users"],df["I/O wait(%)_vmstat"],marker='.')
axs[1].set_xlabel("# users")
axs[1].set_ylabel("I/O Wait %(vmstat)")

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
