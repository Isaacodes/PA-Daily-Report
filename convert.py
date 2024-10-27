import json

def calculate_share(part, total):
    return (part / total * 100) if total > 0 else 0.0

def convert_vbm_data_to_json():
    # Define counties in uppercase
    counties = [
        "ADAMS", "ALLEGHENY", "ARMSTRONG", "BEAVER", "BEDFORD", "BERKS", "BLAIR", "BRADFORD", "BUCKS", "BUTLER", 
        "CAMBRIA", "CAMERON", "CARBON", "CENTRE", "CHESTER", "CLARION", "CLEARFIELD", "CLINTON", "COLUMBIA", 
        "CRAWFORD", "CUMBERLAND", "DAUPHIN", "DELAWARE", "ELK", "ERIE", "FAYETTE", "FOREST", "FRANKLIN", 
        "FULTON", "GREENE", "HUNTINGDON", "INDIANA", "JEFFERSON", "JUNIATA", "LACKAWANNA", "LANCASTER", 
        "LAWRENCE", "LEBANON", "LEHIGH", "LUZERNE", "LYCOMING", "MCKEAN", "MERCER", "MIFFLIN", "MONROE", 
        "MONTGOMERY", "MONTOUR", "NORTHAMPTON", "NORTHUMBERLAND", "PERRY", "PHILADELPHIA", "PIKE", "POTTER", 
        "SCHUYLKILL", "SNYDER", "SOMERSET", "SULLIVAN", "SUSQUEHANNA", "TIOGA", "UNION", "VENANGO", "WARREN", 
        "WASHINGTON", "WAYNE", "WESTMORELAND", "WYOMING", "YORK", "TOTAL"
    ]

    # Updated data for Vote-By-Mail Requests and Returns
    requests_data = [
        (8733, 9839, 2833), (79553, 287369, 44329), (3527, 4459, 736), (8782, 22261, 3357), (3612, 2477, 569),
        (22799, 48154, 9721), (9087, 9216, 2072), (3650, 3347, 834), (53707, 110797, 27570), (15553, 19793, 4849),
        (6599, 13325, 1618), (400, 336, 74), (3445, 6241, 1268), (9276, 21670, 5194), (45834, 93717, 27710),
        (2201, 2285, 412), (3737, 5102, 867), (1904, 2799, 491), (3443, 5532, 1254), (5125, 6680, 1170),
        (20533, 30980, 8224), (17039, 39432, 8097), (36610, 95456, 18303), (1705, 2427, 359), (14005, 37362, 5417),
        (5183, 13372, 1358), (357, 424, 61), (10451, 10972, 3109), (723, 491, 122), (1473, 3295, 312),
        (2201, 2465, 464), (4460, 6631, 1232), (2485, 2255, 492), (1402, 1082, 278), (9548, 36304, 3932),
        (38924, 53622, 15021), (4633, 8998, 1316), (10753, 12443, 3394), (21386, 53589, 12353), (20558, 43891, 6080),
        (6344, 7712, 1717), (2196, 2153, 514), (6409, 10935, 1801), (2778, 2365, 515), (7880, 22560, 5868),
        (61131, 175162, 36977), (1285, 1813, 515), (20618, 49524, 12620), (4183, 5793, 1304), (3294, 2831, 694),
        (29798, 364794, 42567), (4412, 7234, 2689), (1050, 738, 167), (8251, 10223, 2019), (2329, 2210, 549),
        (4337, 4455, 796), (403, 434, 84), (2907, 3003, 666), (2838, 2021, 526), (2522, 3604, 916),
        (3189, 3708, 751), (2572, 3138, 708), (12369, 26275, 4238), (3993, 4677, 1398), (22815, 44467, 7035),
        (2105, 2202, 441), (34914, 45915, 11629), (772318, 1940836, 366556)
    ]

    returns_data = [
        (7453, 9133, 2501), (60836, 250030, 37299), (2612, 3899, 586), (6947, 19689, 2759), (2892, 2248, 490),
        (17438, 41660, 7836), (7339, 8251, 1733), (2922, 3002, 678), (43020, 98578, 23538), (12080, 17321, 3985),
        (5012, 11592, 1328), (343, 312, 67), (2696, 5589, 1014), (7986, 20165, 4745), (39687, 86523, 24985),
        (1687, 2094, 343), (3159, 4697, 729), (1395, 2483, 384), (2700, 4854, 1062), (4032, 5936, 974),
        (17486, 28512, 7257), (13672, 35154, 6887), (29992, 83392, 15477), (1353, 2200, 305), (11562, 33674, 4550),
        (3550, 11339, 1091), (301, 386, 57), (8482, 9995, 2683), (656, 467, 111), (1128, 3005, 244),
        (1945, 2301, 400), (3589, 5975, 1064), (1932, 2015, 400), (1155, 987, 236), (7424, 31703, 3256),
        (30894, 47486, 12455), (3621, 8015, 1067), (8810, 11040, 2735), (17863, 48487, 10747), (14837, 37730, 4813),
        (4813, 6816, 1413), (1675, 1908, 426), (4639, 9156, 1349), (2283, 2161, 441), (7031, 21133, 5291),
        (51917, 160037, 32690), (1124, 1679, 472), (17382, 45428, 11075), (3246, 4991, 1025), (2611, 2528, 588),
        (23114, 315711, 35016), (4087, 6857, 2454), (796, 658, 147), (5993, 8874, 1564), (1953, 2012, 465),
        (3616, 4020, 698), (361, 396, 77), (2380, 2731, 571), (2242, 1832, 452), (2008, 3305, 823),
        (2518, 3326, 621), (1998, 2787, 619), (9865, 23722, 3637), (3364, 4337, 1231), (16225, 38088, 5280),
        (1748, 2004, 387), (26761, 40310, 9415), (618238, 1718726, 311098)
    ]

    # Create JSON data structure with calculations and
    # Create JSON data structure with calculations and counties
    json_data = []
    for i, (request, returned) in enumerate(zip(requests_data, returns_data)):
        rep_request, dem_request, oth_request = request
        rep_return, dem_return, oth_return = returned

        total_approved = rep_request + dem_request + oth_request
        total_returned = rep_return + dem_return + oth_return

        record = {
            "County": counties[i] if i < len(counties) else "UNKNOWN",
            "Total_Approved": total_approved,
            "Dem_Approved": dem_request,
            "Rep_Approved": rep_request,
            "Oth_Approved": oth_request,
            "Total_Returned": total_returned,
            "Dem_Returned": dem_return,
            "Rep_Returned": rep_return,
            "Oth_Returned": oth_return,
            "Request_Share_Dem": calculate_share(dem_request, total_approved),
            "Request_Share_Rep": calculate_share(rep_request, total_approved),
            "Return_Share_Dem": calculate_share(dem_return, total_returned),
            "Return_Share_Rep": calculate_share(rep_return, total_returned),
            "Raw_Dem_Approved": dem_request,
            "Raw_Rep_Approved": rep_request,
            "Raw_Oth_Approved": oth_request,
            "Raw_Dem_Returned": dem_return,
            "Raw_Rep_Returned": rep_return,
            "Raw_Oth_Returned": oth_return
        }
        json_data.append(record)

    # Save the JSON data to a file
    output_path = 'vbm_report.json'
    with open(output_path, 'w') as f:
        json.dump(json_data, f, indent=4)

    print("Conversion completed. JSON saved to:", output_path)

convert_vbm_data_to_json()
