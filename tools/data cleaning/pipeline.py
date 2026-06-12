import pandas as pd
df = pd.read_csv('../data/clinic_data_example.csv')

df.loc[df['Medical Condition'] == 'Cancer'].to_csv('../cleaned-data/cancer_patients.csv')