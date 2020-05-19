# dcim
Cleanup Images found in old DCIM directories (Exif based).

## Install

npm -g i dcim

## Usage

````sh
dcim ~/old-junk ~/Documents ~/Pictures
````

Fetch all photo files from ````~/old-junk```` ````~/Documents```` and create a tidy directory structure in ````~/Pictures```` (copy files from junk and documents to Pictures)

## Notes

This was tested across 10 years of junk, a lot of the files had bad Exif if any, some were zero byte, and sometimes I had to parse the file-names to get a valid time-stamp.

My photos are in perfect order, but you may need to customize the script to match your uniqe phones, and naming conventions.

The code is optimized, it was proof of concept last night at 2AM, now I share.

I am calling stat many times on the same files.

Overall the program architecture should be that of functional programming, the index.mjs should be no more than 15 lines of code.

## Future

I want to simplify this program (hence the messy multiple stat calls).

I want to externalize non EXIF date guessing into a separate module: dcim-guess (perhaps)

I want to focus on valid EXIF data only.

I want this program to be tiny.
