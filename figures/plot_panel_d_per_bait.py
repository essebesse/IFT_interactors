import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

# Load bait summary data
df = pd.read_csv('analysis/results/bait_summary.csv')

# Sort by total interactions
df_sorted = df.sort_values('Total_Interactions', ascending=True)

# Take top 20 baits
top_20 = df_sorted.tail(20)

# Create horizontal bar chart
fig, ax = plt.subplots(figsize=(10, 8))

# Create stacked bars
y_pos = np.arange(len(top_20))
p1 = ax.barh(y_pos, top_20['High_Confidence'], color='#28a745', alpha=0.8, label='High')
p2 = ax.barh(y_pos, top_20['Medium_Confidence'], left=top_20['High_Confidence'],
             color='#fd7e14', alpha=0.8, label='Medium')
p3 = ax.barh(y_pos, top_20['Low_Confidence'],
             left=top_20['High_Confidence'] + top_20['Medium_Confidence'],
             color='#dc3545', alpha=0.8, label='Low')

# Add labels
ax.set_yticks(y_pos)
ax.set_yticklabels(top_20['Gene_Name'], fontsize=11)
ax.set_xlabel('Number of Interactions', fontsize=13, fontweight='bold')
ax.set_ylabel('Bait Protein', fontsize=13, fontweight='bold')
ax.set_title('Interactions per Bait Protein (Top 20)', fontsize=15, fontweight='bold')
ax.legend(loc='lower right', fontsize=11, title='Confidence', title_fontsize=12)
ax.grid(True, alpha=0.2, axis='x')

# Add total counts at end of bars
for i, (idx, row) in enumerate(top_20.iterrows()):
    total = row['Total_Interactions']
    ax.text(total + 1, i, f'{int(total)}', va='center', fontsize=9, fontweight='bold')

plt.tight_layout()
plt.savefig('figures/data/figure_supp_per_bait.png', dpi=300, bbox_inches='tight')
print("✅ Saved: figures/data/figure_supp_per_bait.png")
plt.savefig('figures/data/figure_supp_per_bait.pdf', bbox_inches='tight')
print("✅ Saved: figures/data/figure_supp_per_bait.pdf")
plt.close()

# Print statistics
print(f"\n=== Per-Bait Statistics ===")
print(f"Total baits: {len(df)}")
print(f"Median interactions per bait: {df['Total_Interactions'].median():.0f}")
print(f"Mean interactions per bait: {df['Total_Interactions'].mean():.1f}")
print(f"\nTop 5 baits:")
for idx, row in df_sorted.tail(5).iterrows():
    print(f"  {row['Gene_Name']}: {int(row['Total_Interactions'])} interactions")
