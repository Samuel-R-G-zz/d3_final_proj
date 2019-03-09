import pandas as pd
import json

name_dict = {
    "ADELSON, MIRIAM DR.": "ADELSON, MIRIAM",
    "ADELSON, SHELDON G": "ADELSON, SHELDON",
    "ADELSON, SHELDON G.": "ADELSON, SHELDON",
    "BEAL, ANDY": "BEAL, ANDREW",
    "BLOOMBERG, MICHAEL R": "BLOOMBERG, MICHAEL",
    "BLOOMBERG, MICHAEL R.": "BLOOMBERG, MICHAEL",
    "CAMERON, RONALD M.": "CAMERON, RONALD",
    "COHEN, STEVEN A. MR.": "COHEN, STEVEN A.",
    "GRIFFIN, KENNETH C. MR.": "GRIFFIN, KEN",
    "HOFFMAN, REID G": "HOFFMAN, REID",
    "HOFFMAN, REID G.": "HOFFMAN, REID",
    "HUMPHREYS, DAVID CRAIG": "HUMPHREYS, DAVID",
    "MARCUS, BERNARD MR.": "MARCUS, BERNARD",
    "MARCUS, GEORGE M.": "MARCUS, GEORGE",
    "RICKETTS, MARLENE M.": "RICKETTS, MARLENE",
    "SANDLER, HERBERT M.": "SANDLER, HERBERT M",
    "SCHWAB, HELEN O'NEILL": "SCHWAB, HELEN",
    "SIMON, DEBORAH J": "SIMON, DEBORAH",
    "SIMON, DEBORAH J.": "SIMON, DEBORAH",
    "SIMONS, JAMES H.": "SIMONS, JAMES",
    "SINGER, PAUL ELLIOTT": "SINGER, PAUL",
    "SUSSMAN, S. DONALD": "SUSSMAN, DONALD",
    "SUSSMAN, SELWYN DONALD": "SUSSMAN, DONALD",
    "TIERNEY, DANIEL V.": "TIERNEY, DANIEL",
    "UIHLEIN, RICHARD E.": "UIHLEIN, RICHARD",
    "UIHLEIN, RICHARD E. MR.": "UIHLEIN, RICHARD"
    }

to_drop = ["NATIONAL ASSOCIATION OF REALTO, .",
           "NATIONAL EDUCATION, ASSOCIATION"]


def replace_name(name):
    for key, value in name_dict.items():
        if name == key:
            name = value
    return name


def generate_json():
    cm = pd.read_csv("cm.txt", sep="|", header=None)
    cm.columns = pd.read_csv("cm_header_file.csv").columns

    contributions = pd.read_csv("contributions.csv")
    contributions["NAME"] = contributions["NAME"].map(replace_name)  # dedupe donors

    # join donors with committee description file
    contributors = contributions.set_index('CMTE_ID').join(cm.set_index('CMTE_ID'), on="CMTE_ID", how="inner")
    # names = contributors.NAME.unique()

    nodes = contributors.groupby("NAME").sum().to_json(orient="table")

    links = contributors.join(contributors, on="CMTE_ID", rsuffix="_2", how="left")
    links = links[links["NAME"] != links["NAME_2"]]
    links = links[["NAME", "pac_contribs", "CMTE_NM", "NAME_2", "pac_contribs_2"]]
    links["common_contrib"] = links.loc[:, ["pac_contribs", "pac_contribs_2"]].min(axis=1)
    links = links.loc[(links.NAME < links.NAME_2)]

    final_links = links.groupby(["NAME", "NAME_2"]).sum().reset_index()
    final_links = final_links[["NAME", "NAME_2", "common_contrib"]]
    final_links.columns = ["source", "target", "common_contributions"]
    final_links = final_links.to_json(orient="table", index=False)

    with open("links.json", "w") as file:
        json.dump(final_links, file)

    with open("nodes.json", "w") as file:
        json.dump(nodes, file)


if __name__ == "__main__":
    generate_json()
