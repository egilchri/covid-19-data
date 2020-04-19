import argparse
import matplotlib.pyplot as plt
import numpy as np
from pylab import rcParams
# import matplotlib.ticker as ticker
import csv
import sys
from datetime import datetime

countydict = {}
with open ("us-counties.csv", 'r') as csvfile:
    plots = csv.reader(csvfile, delimiter=',')
    for row in plots:
            date = row[0]
            countyName = row[1]
	    stateName = row[2]
	    code = row[3]
	    cases = row[4]
	    deaths = row[5]
            countyName = countyName.replace(" ","_")
            stateName = stateName.replace(" ","_")
            combo = "%s.%s" % (stateName, countyName)
            countydict[combo] = 1

for key in sorted (countydict):
    print key

