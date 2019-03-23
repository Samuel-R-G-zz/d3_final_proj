# d3_final_proj

Data is bulk data for individual contributions and political
committee details for the 2017-2018 cycle, sourced from the FEC:
https://www.fec.gov/data/browse-data/?tab=bulk-data

Files used are indivs18, cmte18

The indivs18 file is ~4gbs, loaded into a Sqlite DB.

Top ~100 donors are pulled out of a SQLite DB with get_contrib.sql (it pulls
  the top 128 since a few get consolidated in the deduping process). This data-set
  contains each donation from the top donors. In data_cleaner.py, the donor names
  are de-duped; since top donors tend to list different occupations or employers on different
  donations, the mode of their employer / occupation fields is applied across all donations,
  each transaction joined with the cmte18 data to get the name of the
  receiving committee, and then the data is written to json.

Json files are cleaned by hand by 'sed' (removing table header and extraneous backslashes)

Nodes represent individual donors and links represent in-common donations, i.e. the in-common amount of money the two donors
donated to the same recipient (so if Donor A donated $100 to Candidate C and Donor B donated $75, the link has a value of $75).
The strength of the link is also scaled according to the thickness (in-common donations) of the link. Some thought was given to scaling the strength of the links by the number of recipient committees in common, but I decided that pure monetary investment
was a better measure of the importance of a given link. Similarly, some thought was given to encoding the links or the nodes
with CF-Score data from Stanford's DIME project, but this data (which itself is derived from an analysis of donor's campaign
contributions) is only current until 2014.
