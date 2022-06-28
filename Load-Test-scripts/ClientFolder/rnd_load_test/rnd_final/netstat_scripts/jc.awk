#!/bin/bash
BEGIN{
	n=0
	print "\t\t["
}
{
	# print nlines
	if(NR>2)
	{
		print "\t\t\t{"
		print "\t\t\t\t\"Iface\" : " "\"" $1 "\","
		print "\t\t\t\t\"MTU\" : " "\"" $2 "\","
		print "\t\t\t\t\"RX-OK\" : " "\"" $3 "\","
		print "\t\t\t\t\"RX-ERR\" : " "\"" $4 "\","
		print "\t\t\t\t\"RX-DRP\" : " "\"" $5 "\","
		print "\t\t\t\t\"RX-OVR\" : " "\"" $6 "\","
		print "\t\t\t\t\"TX-OK\" : " "\"" $7 "\","
		print "\t\t\t\t\"TX-ERR\" : " "\"" $8 "\","
		print "\t\t\t\t\"TX-DRP\" : " "\"" $9 "\","
		print "\t\t\t\t\"TX-OVR\" : " "\"" $10 "\","
		print "\t\t\t\t\"Flg\" : " "\"" $11 "\""
		n++
		if(NR!=nlines) print "\t\t\t},"
		else print "\t\t\t}"
	}
}
END{
	print "\t\t]"
	# print "count " n
}
