import pandas as pd
import json
import os

def calculate_share(part, total):
    return (part / total * 100) if total > 0 else 0.0

def convert_xls_to_json(file_path):
    # Extract folder and file name
    folder = os.path.dirname(file_path)
    file_name = os.path.basename(file_path)
    json_name = file_name.replace('.xlsx', '.json')
    output_path = os.path.join(folder, json_name)

    # Load the Excel file
    xls = pd.ExcelFile(file_path)
    df = xls.parse(xls.sheet_names[0])

    # Rename columns for easier mapping to JSON format
    df.columns = [
        "County", "Total_Approved", "Dem_Approved", "Rep_Approved", "Oth_Approved",
        "Total_Returned", "Dem_Returned", "Rep_Returned", "Oth_Returned"
    ]

    # Drop the first row as it's a header row
    df = df.drop(0)

    # Convert columns to appropriate types
    for col in df.columns[1:]:
        df[col] = pd.to_numeric(df[col], errors='coerce')

    # Create JSON data with shares and raw values
    json_data = []
    for _, row in df.iterrows():
        # Calculate shares
        total_approved = row["Total_Approved"]
        total_returned = row["Total_Returned"]
        request_share_dem = calculate_share(row["Dem_Approved"], total_approved)
        request_share_rep = calculate_share(row["Rep_Approved"], total_approved)
        return_share_dem = calculate_share(row["Dem_Returned"], total_returned)
        return_share_rep = calculate_share(row["Rep_Returned"], total_returned)

        # Add data to dictionary
        record = {
            "County": row["County"],
            "Total_Approved": row["Total_Approved"],
            "Dem_Approved": row["Dem_Approved"],
            "Rep_Approved": row["Rep_Approved"],
            "Oth_Approved": row["Oth_Approved"],
            "Total_Returned": row["Total_Returned"],
            "Dem_Returned": row["Dem_Returned"],
            "Rep_Returned": row["Rep_Returned"],
            "Oth_Returned": row["Oth_Returned"],
            "Request_Share_Dem": request_share_dem,
            "Request_Share_Rep": request_share_rep,
            "Return_Share_Dem": return_share_dem,
            "Return_Share_Rep": return_share_rep,
            "Raw_Dem_Approved": row["Dem_Approved"],
            "Raw_Rep_Approved": row["Rep_Approved"],
            "Raw_Oth_Approved": row["Oth_Approved"],
            "Raw_Dem_Returned": row["Dem_Returned"],
            "Raw_Rep_Returned": row["Rep_Returned"],
            "Raw_Oth_Returned": row["Oth_Returned"]
        }
        json_data.append(record)

    # Save JSON data to output file
    with open(output_path, 'w') as f:
        json.dump(json_data, f, indent=4)

    print("Conversion completed. JSON saved to:", output_path)

# Run the conversion with your file path
input_file = r"C:\Users\Isaac's PC\Desktop\Programming\PA Daily Report\data-10-22-2024.xlsx"
convert_xls_to_json(input_file)
