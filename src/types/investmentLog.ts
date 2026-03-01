export type SIPEntry = {
  id: string;
  name: string;          // e.g., "Axis Bank Liquid Fund"
  type: string;          // e.g., "Liquid Funds" — matches a suggestion instrument name
  monthlyAmount: number;
};

export type SIPComparison = {
  type: string;
  suggestedAmount: number;
  actualAmount: number;
  difference: number;
  sips: SIPEntry[];
};

export type AddSIPEntryPayload    = { entry: SIPEntry };
export type EditSIPEntryPayload   = { entryId: string; name: string; type: string; monthlyAmount: number };
export type DeleteSIPEntryPayload = { entryId: string };
