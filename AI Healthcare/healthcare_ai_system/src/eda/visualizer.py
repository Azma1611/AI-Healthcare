import os
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import logging

logger = logging.getLogger(__name__)

class EDAVisualizer:
    def __init__(self, output_dir: str = "reports/figures"):
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)
        # Use a non-interactive backend to avoid issues in background execution
        plt.switch_backend('Agg')

    def plot_target_distribution(self, df: pd.DataFrame, target_col: str = 'target'):
        """Plots and saves the class distribution."""
        plt.figure(figsize=(6, 4))
        sns.countplot(data=df, x=target_col)
        plt.title('Target Class Distribution')
        path = os.path.join(self.output_dir, 'target_distribution.png')
        plt.savefig(path, bbox_inches='tight')
        plt.close()
        logger.info(f"Saved target distribution plot to {path}")

    def plot_correlation_matrix(self, df: pd.DataFrame):
        """Plots and saves the correlation matrix for top features."""
        # For large datasets, compute correlation on numeric columns only
        corr = df.corr()
        
        # If too many features, plot top 15 highly correlated features with target
        if corr.shape[0] > 15 and 'target' in corr.columns:
            top_features = corr['target'].abs().sort_values(ascending=False).head(15).index
            corr = df[top_features].corr()

        plt.figure(figsize=(10, 8))
        sns.heatmap(corr, annot=False, cmap='coolwarm', fmt=".2f")
        plt.title('Feature Correlation Matrix (Top Features)')
        path = os.path.join(self.output_dir, 'correlation_matrix.png')
        plt.savefig(path, bbox_inches='tight')
        plt.close()
        logger.info(f"Saved correlation matrix plot to {path}")

    def plot_feature_distributions(self, df: pd.DataFrame, max_features: int = 6):
        """Plots distributions for a subset of features."""
        features = [col for col in df.columns if col != 'target'][:max_features]
        df_melt = df.melt(id_vars=['target'], value_vars=features)
        
        plt.figure(figsize=(12, 6))
        sns.boxplot(data=df_melt, x='variable', y='value', hue='target')
        plt.title('Feature Distributions by Target Class')
        plt.xticks(rotation=45)
        path = os.path.join(self.output_dir, 'feature_distributions.png')
        plt.savefig(path, bbox_inches='tight')
        plt.close()
        logger.info(f"Saved feature distributions plot to {path}")

    def plot_important_relationships(self, df: pd.DataFrame):
        """Plots pairplot for the most correlated features."""
        if 'target' not in df.columns:
            return
            
        corr = df.corr()['target'].abs().sort_values(ascending=False)
        top_features = corr.index[1:4].tolist() # Top 3 features excluding target
        
        plot_df = df[top_features + ['target']]
        sns.pairplot(plot_df, hue='target')
        path = os.path.join(self.output_dir, 'feature_relationships.png')
        plt.savefig(path, bbox_inches='tight')
        plt.close()
        logger.info(f"Saved feature relationships pairplot to {path}")
