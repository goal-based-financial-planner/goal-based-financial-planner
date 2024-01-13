export interface AssetRow {
  assetType: string;
  percentage: string;
}

export interface Assets {
  longTermGoals: AssetRow[];
  midTermGoals: AssetRow[];
  shortTermGoals: AssetRow[];
}
