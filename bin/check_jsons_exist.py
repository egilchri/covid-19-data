#!/usr/bin/python

import boto3
from botocore.errorfactory import ClientError
import datetime
import os

s3 = boto3.client('s3')

bucket_name = "covid-counties"
# https://covid-counties.s3.amazonaws.com/output/all_counties.txt.200620.deaths.sorted.json
#                                         output/my_counties.txt.200626.deaths.sorted.json

# day_array = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27"]

# day_array = ["19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30"]
day_array = ["01", "02"]

day_array = []
end_date = datetime.date.today()
delta = datetime.timedelta(days = 8) 
start_date = end_date -delta

for i in range(delta.days + 1):
    day = start_date + datetime.timedelta(days=i)
    pretty_day = day.strftime("%y%m%d")
    day_array.append(pretty_day)


for day in (day_array):
#    cases_path = "output/all_counties.txt.2007{}.cases.sorted.json".format(day)
#    deaths_path = "output/all_counties.txt.2007{}.deaths.sorted.json".format(day)
    cases_path = "output/all_counties.txt.{}.cases.sorted.json".format(day)
    deaths_path = "output/all_counties.txt.{}.deaths.sorted.json".format(day)
    # print ("Looking for {}".format (cases_path))
    # print ("Also Looking for {}".format (deaths_path))
    try:
        s3.head_object(Bucket=bucket_name, Key=cases_path)
    except ClientError:
        # Not found
        print ("Re-Execute: ./starter.sh all_counties cases {}".format(day))
        os.system ("./starter.sh all_counties cases {}".format(day))
    try:
        s3.head_object(Bucket=bucket_name, Key=deaths_path)
    except ClientError:
        # Not found
        print ("Re-Execute: ./starter.sh all_counties deaths {}".format(day))
        os.system ("./starter.sh all_counties deaths {}".format(day))

