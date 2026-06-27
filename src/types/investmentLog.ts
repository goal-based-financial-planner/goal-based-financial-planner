export type SIPEntry = {
  id: string;
  name: string;          // e.g., "Axis Bank Liquid Fund"
  type: string;          // e.g., "Liquid Funds" — matches a suggestion instrument name
  monthlyAmount: number;
  expectedReturnPct?: number; // only set for custom (off-plan) types
  startDate?: string;    // YYYY-MM-DD — when this SIP was actually started
};

export type SIPComparison = {
  type: string;
  suggestedAmount: number;
  actualAmount: number;
  difference: number;
  sips: SIPEntry[];
};

export type AddSIPEntryPayload    = { entry: SIPEntry };
export type EditSIPEntryPayload   = { entryId: string; name: string; type: string; monthlyAmount: number; expectedReturnPct?: number; startDate?: string };
export type DeleteSIPEntryPayload = { entryId: string };
