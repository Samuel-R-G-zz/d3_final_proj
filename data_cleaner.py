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

# deduping
def replace_name(name):
    for key, value in name_dict.items():
        if name == key:
            name = value
    return name


def generate_json():
    cm = pd.read_csv("cm.txt", sep="|", header=None)
    cm.columns = pd.read_csv("cm_header_file.csv").columns

    contributions = pd.read_csv("contributions.csv")
    contributions = contributions[contributions["NAME"] != "NATIONAL EDUCATION, ASSOCIATION"]
    contributions = contributions[contributions["NAME"] != "NATIONAL ASSOCIATION OF REALTO, ."]
    contributions["NAME"] = contributions["NAME"].map(replace_name)
    names = contributions["NAME"].unique()
    for name in names:
        try:
            contributions.loc[contributions["NAME"] == name, "EMPLOYER"] = contributions.loc[contributions["NAME"] == name, "EMPLOYER"].mode()[0]
            contributions.loc[contributions["NAME"] == name, "OCCUPATION"] = contributions.loc[contributions["NAME"] == name, "OCCUPATION"].mode()[0]
        except:
            contributions.loc[contributions["NAME"] == name, "EMPLOYER"] = "NONE"
            contributions.loc[contributions["NAME"] == name, "OCCUPATION"] = "NONE"

    # join donors with committee description file
    contributors = contributions.set_index('CMTE_ID').join(cm.set_index('CMTE_ID'), on="CMTE_ID", how="inner")
    contributors = contributors.sort_values(by=["NAME", "pac_contribs"], ascending=False)
    contributors["recipients"] = list(zip(contributors.CMTE_NM, " $" + contributors.pac_contribs.map(str))) ## provisional
    recipient_list = contributors.groupby("NAME")["recipients"].apply(list)
    #amount_list = contributors.groupby("NAME")["pac_contribs"].apply(list)
    #amount_list.name = "amounts"
    #for i in range(len(pac_list)):
        #pac_list[i] = pac_list[i][0:10]

    nodes = contributors.groupby(["NAME", "EMPLOYER", "OCCUPATION"]).sum()
    nodes = nodes.join(recipient_list, on="NAME", how="inner")
    #nodes = nodes.join(amount_list, on="NAME", how="inner")

    #nodes["scale"] = (nodes["pac_contribs"] / nodes["pac_contribs"].max()) * 100
    nodes = nodes.to_json(orient="table")

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
