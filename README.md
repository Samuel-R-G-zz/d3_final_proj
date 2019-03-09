# d3_final_proj

Data is bulk data for individual contributions and political
committee details for the 2017-2018 cycle, sourced from the FEC:
https://www.fec.gov/data/browse-data/?tab=bulk-data

Files used are indivs18, cmte18

The indivs18 file is ~4gbs, loaded into a Sqlite DB.

Top ~100 donors are pulled out of a SQLite DB with get_contrib.sql (it pulls
  the top 120 since a few get consolidated in the deduping process). This data-set
  contains each donation from the top donors. In data_cleaner.py, the donor names
  are de-duped, each transaction joined with the cmte18 data to get the name of the
  receiving committee, and then the data is written to json.

Json files are hand-cleaned (removing table header and extraneous backslashes)

Currently working: Node creation, link creation, force simulation, draggability

To be implemented:
Data cleaning file needs to be updated to drop two organizational donors that are misclassified as individuals
Node/link attribute ext on mouseover
Resize / recolor nodes, links based on donation amount
Try different force configurations
Buttons for user to do the above
Visualization of donor-to-PAC links, button to toggle between the two

Issues to check / discuss at Sunday office hours:

  Tooltip code (currently commented out) throws the entire graph out of whack - why?
  Aesthetic options for assigning colors / link strength based on data
  toggling between different visualizations
