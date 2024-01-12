export interface AssetRow {
  assetType: string;
  percentage: string;
}

export interface Assets {
  LongTermGoals: AssetRow[] | null | undefined;
  MidTermGoals: AssetRow[] | null | undefined;
  ShortTermGoals: AssetRow[] | null | undefined;
}
