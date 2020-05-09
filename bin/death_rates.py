import matplotlib.pyplot as plt
import numpy as np
from pylab import rcParams
# import matplotlib.ticker as ticker
import csv
import sys
from datetime import datetime


def get_population(state, county):
    with open ("all_pops.csv", 'r') as csvfile:
        plots = csv.reader(csvfile, delimiter=',')
        for row in plots:
            stateName = row[0]
            countyName = row[1]
            population = row[2]
            if (matches (stateName, state) and
                matches (countyName, county)):
                return population

def get_deaths (state, county):
    myStateCSVFile = "%s.%s" % (state, county)
    myStateCSVFile = myStateCSVFile.replace(' ', '_')
    myStateCSVFile = myStateCSVFile.lower()
    myStateCSVFile = "county_data/%s.csv" % (myStateCSVFile)

    latest_deaths = 0
    with open (myStateCSVFile, 'r') as csvfile:
        plots = csv.reader(csvfile, delimiter=',')
        for row in plots:
            date = row[0]
            countyName = row[1]
	    stateName = row[2]
	    code = row[3]
	    cases = row[4]
	    latest_deaths = row[5]
    return latest_deaths



            
def matches (sot, candidate):

    if (sot == candidate):
        # print "True: %s vs %s" % (sot, candidate)
        return True
    elif (sot == "%s County" % (candidate)):
        # print "True: %s vs %s" % (sot, candidate)
        return True

    # print "False: %s vs %s" % (sot, candidate)
    return False

    
def death_rate(state, county):
    pop = get_population (state, county)
    # print "population: %s" % (pop)
    deaths = get_deaths (state, county)
    # print "deaths: %s" % (deaths)
    rate = float(deaths) / float(pop)
    return rate

