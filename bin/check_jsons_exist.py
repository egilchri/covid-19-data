#!/usr/bin/python

import boto3
from botocore.errorfactory import ClientError
import datetime
import os
import sys

thisd = os.getcwd()
os.chdir("../covid-19-data")
os.system("git pull")
os.chdir (thisd)

COVID_ENV = sys.argv[1]

print ("COVID_ENV: {}".format (COVID_ENV))

s3 = boto3.client('s3')


bucket_name = "covid-counties"

days_to_look_back = 8
day_array = []
end_date = datetime.date.today()
delta = datetime.timedelta(days = days_to_look_back) 
start_date = end_date -delta

for i in range(delta.days + 1):
    day = start_date + datetime.timedelta(days=i)
    pretty_day = day.strftime("%y%m%d")
    day_array.append(pretty_day)


count = 0
for day in (day_array):
    count += 1
    # if (os.environ.get('DO_PROFILING')):
    #    if (count > 2):
    #        exit()
    print ("count: {}".format (count))    
#    cases_path = "output/all_counties.txt.2007{}.cases.sorted.json".format(day)
#    deaths_path = "output/all_counties.txt.2007{}.deaths.sorted.json".format(day)
    cases_path = "output/all_counties.txt.{}.cases.sorted.json".format(day)
    deaths_path = "output/all_counties.txt.{}.deaths.sorted.json".format(day)
    print ("Looking for {}".format (cases_path))
    print ("Also Looking for {}".format (deaths_path))
    try:
        s3.head_object(Bucket=bucket_name, Key=cases_path)
    except ClientError:
        # Not found
        print ("Re-Execute: ./starter.sh  cases {}".format(day))
        os.system ("./starter.sh {}  cases {}".format(COVID_ENV, day))
    try:
        s3.head_object(Bucket=bucket_name, Key=deaths_path)
    except ClientError:
        # Not found
        print ("Re-Execute: ./starter.sh  deaths {}".format(day))
        os.system ("./starter.sh {} deaths {}".format(COVID_ENV, day))
    # this exist is just for debugging
    # exit()    
