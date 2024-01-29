export type AssetRow = Record<string, number>;

export interface Assets {
  longTermGoals: AssetRow;
  midTermGoals: AssetRow;
  shortTermGoals: AssetRow;
}
