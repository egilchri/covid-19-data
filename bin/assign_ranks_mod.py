#!/usr/bin/python

import re
import sys


def sortFn(line):
# field number 8 i .txt file
    return float(line.split('|')[7])


def assign_ranks(datafile,outputfile):
    outfile = open (outputfile, "w+")
    with open(datafile) as fp: 
        all_lines = fp.readlines()
        newlist = []
        counter=0

        all_lines.sort(key=sortFn,reverse=True)

        for line in all_lines:
            line=line[:-1] # chomp 
            counter+=1
            outfile.write("{}|{}\n".format(counter, line))
    outfile.close()

