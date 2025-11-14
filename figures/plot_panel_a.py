import pandas as pd
import matplotlib.pyplot as plt

# Data from analysis
data = {
    'Confidence': ['High', 'Medium', 'Low'],
    'Count': [20, 135, 393],
    'Percentage': [3.6, 24.6, 71.7],
    'Color': ['#28a745', '#fd7e14', '#dc3545']
}
df = pd.DataFrame(data)

# Create bar chart
fig, ax = plt.subplots(figsize=(7, 5))
bars = ax.bar(df['Confidence'], df['Count'], color=df['Color'], alpha=0.8, edgecolor='black', linewidth=1.5)

ax.set_xlabel('Confidence Level', fontsize=14, fontweight='bold')
ax.set_ylabel('Number of Interactions', fontsize=14, fontweight='bold')
ax.set_title('Interaction Confidence Distribution (n=548)', fontsize=16, fontweight='bold')
ax.set_ylim(0, 450)

# Add count and percentage labels on bars
for bar, count, pct in zip(bars, df['Count'], df['Percentage']):
    height = bar.get_height()
    ax.text(bar.get_x() + bar.get_width()/2., height + 10,
            f'{count}\n({pct}%)',
            ha='center', va='bottom', fontsize=12, fontweight='bold')

plt.tight_layout()
plt.savefig('figures/data/figure1_panel_a.png', dpi=300, bbox_inches='tight')
print("✅ Saved: figures/data/figure1_panel_a.png")
plt.savefig('figures/data/figure1_panel_a.pdf', bbox_inches='tight')
print("✅ Saved: figures/data/figure1_panel_a.pdf")
