#!/usr/bin/python

import re
import sys

datafile = sys.argv[1]

with open(datafile) as fp: 
    all_lines = fp.readlines()

newlist = []

counter=0

# def sortFn(line):
#    return float(line.split('|')[0])
def sortFn(line):
    return float(line.split('|')[4])



all_lines.sort(key=sortFn,reverse=True)

for line in all_lines:
    line=line[:-1] # chomp 
    counter+=1
    print "%s|%s" % (counter, line)


# my_list = [3,2,1]
# my_list.sort()

# for line in my_list:
#     print "%s" % (line)
