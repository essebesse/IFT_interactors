import pandas as pd
import matplotlib.pyplot as plt

# Validation data from BioGRID analysis
data = {
    'Confidence': ['High', 'Medium', 'Low'],
    'Total': [20, 135, 393],
    'Validated': [15, 22, 39],
    'Color': ['#28a745', '#fd7e14', '#dc3545']
}
df = pd.DataFrame(data)
df['Validation_Rate'] = df['Validated'] / df['Total'] * 100

# Create bar chart
fig, ax = plt.subplots(figsize=(7, 5))
bars = ax.bar(df['Confidence'], df['Validation_Rate'], color=df['Color'], alpha=0.8, edgecolor='black', linewidth=1.5)

ax.set_xlabel('Confidence Level', fontsize=14, fontweight='bold')
ax.set_ylabel('BioGRID Validation Rate (%)', fontsize=14, fontweight='bold')
ax.set_title('Experimental Validation by Confidence Level', fontsize=16, fontweight='bold')
ax.set_ylim(0, 85)

# Add percentages and counts on bars
for bar, val, validated, total in zip(bars, df['Validation_Rate'], df['Validated'], df['Total']):
    height = bar.get_height()
    ax.text(bar.get_x() + bar.get_width()/2., height + 2,
            f'{val:.1f}%\n({validated}/{total})',
            ha='center', va='bottom', fontsize=12, fontweight='bold')

# Add horizontal line at 75% for emphasis
ax.axhline(y=75, color='gray', linestyle='--', linewidth=1, alpha=0.5)
ax.text(2.1, 75, '75%', fontsize=10, color='gray')

plt.tight_layout()
plt.savefig('figures/data/figure2_validation.png', dpi=300, bbox_inches='tight')
print("✅ Saved: figures/data/figure2_validation.png")
plt.savefig('figures/data/figure2_validation.pdf', bbox_inches='tight')
print("✅ Saved: figures/data/figure2_validation.pdf")
