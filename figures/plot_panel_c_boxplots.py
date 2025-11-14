import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

# Load confidence distribution data
df = pd.read_csv('analysis/results/confidence_distribution.csv')

# Create figure with 3 subplots
fig, axes = plt.subplots(1, 3, figsize=(15, 5))

# Colors for confidence levels
colors = {'High': '#28a745', 'Medium': '#fd7e14', 'Low': '#dc3545'}

# Prepare data for box plots
conf_order = ['High', 'Medium', 'Low']

# Panel 1: Interface pLDDT
data_plddt = [df[df['Confidence'] == conf]['Interface_pLDDT'].values for conf in conf_order]
bp1 = axes[0].boxplot(data_plddt, labels=conf_order, patch_artist=True, widths=0.6)
for patch, conf in zip(bp1['boxes'], conf_order):
    patch.set_facecolor(colors[conf])
    patch.set_alpha(0.7)
for element in ['whiskers', 'fliers', 'means', 'medians', 'caps']:
    plt.setp(bp1[element], color='black', linewidth=1.5)
axes[0].set_ylabel('Interface pLDDT', fontsize=13, fontweight='bold')
axes[0].set_xlabel('Confidence Level', fontsize=13, fontweight='bold')
axes[0].set_title('A. Interface Quality', fontsize=14, fontweight='bold')
axes[0].grid(True, alpha=0.2, axis='y')

# Panel 2: PAE Contacts <3Å
data_pae = [df[df['Confidence'] == conf]['PAE_Contacts_<3A'].values for conf in conf_order]
bp2 = axes[1].boxplot(data_pae, labels=conf_order, patch_artist=True, widths=0.6)
for patch, conf in zip(bp2['boxes'], conf_order):
    patch.set_facecolor(colors[conf])
    patch.set_alpha(0.7)
for element in ['whiskers', 'fliers', 'means', 'medians', 'caps']:
    plt.setp(bp2[element], color='black', linewidth=1.5)
axes[1].set_ylabel('High-Precision Contacts (<3Å)', fontsize=13, fontweight='bold')
axes[1].set_xlabel('Confidence Level', fontsize=13, fontweight='bold')
axes[1].set_title('B. Interface Contact Density', fontsize=14, fontweight='bold')
axes[1].grid(True, alpha=0.2, axis='y')

# Panel 3: iPTM Score
data_iptm = [df[df['Confidence'] == conf]['iPTM'].values for conf in conf_order]
bp3 = axes[2].boxplot(data_iptm, labels=conf_order, patch_artist=True, widths=0.6)
for patch, conf in zip(bp3['boxes'], conf_order):
    patch.set_facecolor(colors[conf])
    patch.set_alpha(0.7)
for element in ['whiskers', 'fliers', 'means', 'medians', 'caps']:
    plt.setp(bp3[element], color='black', linewidth=1.5)
axes[2].set_ylabel('iPTM Score', fontsize=13, fontweight='bold')
axes[2].set_xlabel('Confidence Level', fontsize=13, fontweight='bold')
axes[2].set_title('C. Global Interaction Confidence', fontsize=14, fontweight='bold')
axes[2].grid(True, alpha=0.2, axis='y')

plt.suptitle('Interface Quality Metrics by Confidence Level', fontsize=16, fontweight='bold', y=1.02)
plt.tight_layout()
plt.savefig('figures/data/figure1_panel_c_boxplots.png', dpi=300, bbox_inches='tight')
print("✅ Saved: figures/data/figure1_panel_c_boxplots.png")
plt.savefig('figures/data/figure1_panel_c_boxplots.pdf', bbox_inches='tight')
print("✅ Saved: figures/data/figure1_panel_c_boxplots.pdf")
plt.close()

# Print summary statistics
print("\n=== Summary Statistics ===")
for conf in conf_order:
    subset = df[df['Confidence'] == conf]
    print(f"\n{conf} Confidence (n={len(subset)}):")
    print(f"  Interface pLDDT: {subset['Interface_pLDDT'].mean():.1f} ± {subset['Interface_pLDDT'].std():.1f}")
    print(f"  PAE contacts <3Å: {subset['PAE_Contacts_<3A'].mean():.1f} ± {subset['PAE_Contacts_<3A'].std():.1f}")
    print(f"  iPTM: {subset['iPTM'].mean():.3f} ± {subset['iPTM'].std():.3f}")
