export type CommunicationType = 'call' | 'sms';

export type BlockAction = 'silent_drop' | 'voicemail_mute' | 'screen_alert';

export type ThreatLevel = 'high' | 'medium' | 'low';

export type SpamCategory = 
  | 'loan_scam' 
  | 'telemarketing' 
  | 'phishing' 
  | 'warranty_scam' 
  | 'impersonation' 
  | 'spoofed_number'
  | 'other';

export interface KeywordRule {
  id: string;
  keyword: string;
  category: SpamCategory;
  matchType: 'contains' | 'exact' | 'regex';
  target: 'all' | 'calls_only' | 'sms_only';
  action: BlockAction;
  enabled: boolean;
  matchCount: number;
  dateAdded: string;
  notes?: string;
}

export interface BlockedItem {
  id: string;
  type: CommunicationType;
  senderNumber: string;
  senderName?: string;
  location?: string;
  timestamp: string; // ISO string
  category: SpamCategory;
  threatLevel: ThreatLevel;
  triggerReason: string;
  matchedKeywords: string[];
  messageContent?: string; // For SMS
  voicemailTranscript?: string; // For Call
  audioSampleDuration?: number; // In seconds
  actionTaken: BlockAction;
  reportedToSamsung: boolean;
  whitelisted: boolean;
  notes?: string;
}

export interface BlockerSettings {
  autoBlockKnownSpam: boolean;
  autoBlockKeywords: boolean;
  blockNeighborSpoofing: boolean;
  userAreaCode: string;
  userPrefix: string;
  quarantineSuspiciousLinks: boolean;
  silenceUnknownCallers: boolean;
  blockPrivateNumbers: boolean;
  samsungSmartCallEnabled: boolean;
  samsungKnoxGuardLevel: 'high' | 'maximum' | 'standard';
  defaultAction: BlockAction;
  notifyOnBlock: boolean;
  autoReportToFTC: boolean;
}

export interface SpamStats {
  totalBlocked: number;
  callsBlocked: number;
  smsBlocked: number;
  loanSpamBlocked: number;
  timeSavedMinutes: number;
  topBlockedKeywords: { keyword: string; count: number }[];
  categoryBreakdown: Record<SpamCategory, number>;
  dailyTrend: { date: string; calls: number; sms: number }[];
  hourlyDistribution: { hour: number; count: number }[];
}
