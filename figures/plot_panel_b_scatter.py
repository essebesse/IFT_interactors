import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
from scipy import stats

# Load confidence distribution data
df = pd.read_csv('analysis/results/confidence_distribution.csv')

# Create scatter plot: ipSAE vs PAE contacts
fig, ax = plt.subplots(figsize=(8, 6))

# Color by confidence level
colors = {'High': '#28a745', 'Medium': '#fd7e14', 'Low': '#dc3545'}
for conf in ['High', 'Medium', 'Low']:
    subset = df[df['Confidence'] == conf]
    ax.scatter(subset['ipSAE'], subset['PAE_Contacts_<3A'],
               c=colors[conf], label=conf, alpha=0.6, s=50, edgecolors='black', linewidth=0.5)

# Calculate and plot correlation
correlation = stats.pearsonr(df['ipSAE'], df['PAE_Contacts_<3A'])
print(f"Pearson correlation: r = {correlation[0]:.3f}, p = {correlation[1]:.2e}")

# Add trend line
z = np.polyfit(df['ipSAE'], df['PAE_Contacts_<3A'], 1)
p = np.poly1d(z)
x_line = np.linspace(df['ipSAE'].min(), df['ipSAE'].max(), 100)
ax.plot(x_line, p(x_line), "k--", alpha=0.5, linewidth=2,
        label=f'r = {correlation[0]:.2f}, p < 0.001')

# Add vertical lines for confidence thresholds
ax.axvline(x=0.7, color='gray', linestyle='--', linewidth=1, alpha=0.3)
ax.axvline(x=0.5, color='gray', linestyle='--', linewidth=1, alpha=0.3)

ax.set_xlabel('ipSAE Score', fontsize=14, fontweight='bold')
ax.set_ylabel('High-Precision PAE Contacts (<3Å)', fontsize=14, fontweight='bold')
ax.set_title('Correlation Between ipSAE and Interface Quality', fontsize=16, fontweight='bold')
ax.legend(loc='upper left', fontsize=11, framealpha=0.9)
ax.grid(True, alpha=0.2)

plt.tight_layout()
plt.savefig('figures/data/figure1_panel_b_scatter.png', dpi=300, bbox_inches='tight')
print("✅ Saved: figures/data/figure1_panel_b_scatter.png")
plt.savefig('figures/data/figure1_panel_b_scatter.pdf', bbox_inches='tight')
print("✅ Saved: figures/data/figure1_panel_b_scatter.pdf")
plt.close()

# Calculate statistics by confidence level
print("\n=== Statistics by Confidence Level ===")
for conf in ['High', 'Medium', 'Low']:
    subset = df[df['Confidence'] == conf]
    print(f"\n{conf} Confidence (n={len(subset)}):")
    print(f"  Average ipSAE: {subset['ipSAE'].mean():.3f}")
    print(f"  Average PAE contacts <3Å: {subset['PAE_Contacts_<3A'].mean():.1f}")
    print(f"  Average interface pLDDT: {subset['Interface_pLDDT'].mean():.1f}")
    print(f"  Average iPTM: {subset['iPTM'].mean():.3f}")
