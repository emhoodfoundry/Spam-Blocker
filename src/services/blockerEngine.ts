import { BlockedItem, KeywordRule, BlockerSettings, SpamCategory, ThreatLevel, BlockAction } from '../types';

export interface EvaluationResult {
  shouldBlock: boolean;
  reason: string;
  matchedKeywords: string[];
  category: SpamCategory;
  threatLevel: ThreatLevel;
  action: BlockAction;
  highlightIndices?: { start: number; end: number }[];
}

export function evaluateIncomingCommunication(
  type: 'call' | 'sms',
  senderNumber: string,
  senderName: string,
  content: string, // SMS text or Call voicemail/transcript
  keywords: KeywordRule[],
  settings: BlockerSettings,
  whitelist: string[]
): EvaluationResult {
  // 1. Check Whitelist
  const normalizedSender = senderNumber.replace(/\D/g, '');
  const isWhitelisted = whitelist.some(w => w.replace(/\D/g, '') === normalizedSender);
  if (isWhitelisted) {
    return {
      shouldBlock: false,
      reason: 'Sender is in safe contacts / whitelist',
      matchedKeywords: [],
      category: 'other',
      threatLevel: 'low',
      action: 'screen_alert',
    };
  }

  const matchedKeywords: string[] = [];
  const textToScan = `${senderName} ${content}`.toLowerCase();

  // 2. Scan Keyword Rules (User's custom & loan approval rules)
  if (settings.autoBlockKeywords) {
    const applicableRules = keywords.filter(r => {
      if (!r.enabled) return false;
      if (type === 'call' && r.target === 'sms_only') return false;
      if (type === 'sms' && r.target === 'calls_only') return false;
      return true;
    });

    for (const rule of applicableRules) {
      const kw = rule.keyword.trim().toLowerCase();
      if (!kw) continue;

      let matched = false;
      if (rule.matchType === 'exact') {
        const regex = new RegExp(`\\b${escapeRegExp(kw)}\\b`, 'i');
        matched = regex.test(textToScan);
      } else if (rule.matchType === 'regex') {
        try {
          const customRegex = new RegExp(rule.keyword, 'i');
          matched = customRegex.test(textToScan);
        } catch {
          matched = textToScan.includes(kw);
        }
      } else {
        // 'contains'
        matched = textToScan.includes(kw);
      }

      if (matched) {
        matchedKeywords.push(rule.keyword);
      }
    }
  }

  // 3. Neighbor Spoofing Check (e.g. area code 512 + prefix 849)
  const isNeighborSpoof = 
    settings.blockNeighborSpoofing &&
    settings.userAreaCode &&
    settings.userPrefix &&
    normalizedSender.length >= 10 &&
    normalizedSender.includes(`${settings.userAreaCode}${settings.userPrefix}`);

  // 4. Suspicious URL Quarantine for SMS
  const hasSuspiciousLink =
    type === 'sms' &&
    settings.quarantineSuspiciousLinks &&
    /(https?:\/\/[^\s]+|bit\.ly\/|tinyurl\.com\/|t\.co\/|\.info\/|\.top\/|\.xyz\/|cash-|claim|login|verify)/i.test(content);

  // 5. Determine category & threat level
  let category: SpamCategory = 'other';
  let threatLevel: ThreatLevel = 'low';
  let shouldBlock = false;
  let reason = '';

  if (matchedKeywords.length > 0) {
    shouldBlock = true;
    threatLevel = 'high';
    
    // Check if loan scam is prevalent
    const hasLoanKw = matchedKeywords.some(k => 
      /loan|pre-approved|funding|unsecured|financing|payout|credit line|debt/i.test(k)
    );
    if (hasLoanKw) {
      category = 'loan_scam';
      reason = `Blocked by keyword match: "${matchedKeywords[0]}"`;
    } else if (matchedKeywords.some(k => /irs|revenue|warrant|legal action|social security/i.test(k))) {
      category = 'impersonation';
      reason = `Blocked by impersonation rule: "${matchedKeywords[0]}"`;
    } else if (matchedKeywords.some(k => /warranty/i.test(k))) {
      category = 'warranty_scam';
      reason = `Blocked by warranty rule: "${matchedKeywords[0]}"`;
    } else {
      category = 'telemarketing';
      reason = `Blocked by keyword: "${matchedKeywords[0]}"`;
    }
  } else if (isNeighborSpoof) {
    shouldBlock = true;
    threatLevel = 'high';
    category = 'spoofed_number';
    reason = `Neighbor Spoofing: Matches your Area Code (${settings.userAreaCode}) and Prefix (${settings.userPrefix})`;
  } else if (hasSuspiciousLink) {
    shouldBlock = true;
    threatLevel = 'medium';
    category = 'phishing';
    reason = 'Quarantined: Suspicious unverified URL detected in message body';
  } else if (settings.silenceUnknownCallers && type === 'call') {
    shouldBlock = true;
    threatLevel = 'low';
    category = 'telemarketing';
    reason = 'Unknown caller silenced by Samsung Smart Call setting';
  }

  return {
    shouldBlock,
    reason,
    matchedKeywords,
    category,
    threatLevel,
    action: settings.defaultAction,
  };
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Highlights keywords inside text content safely
 */
export function getHighlightedSegments(text: string, keywords: string[]): { text: string; isMatch: boolean }[] {
  if (!text || keywords.length === 0) {
    return [{ text, isMatch: false }];
  }

  const validKeywords = keywords
    .map(k => k.trim())
    .filter(k => k.length > 0)
    .sort((a, b) => b.length - a.length);

  if (validKeywords.length === 0) {
    return [{ text, isMatch: false }];
  }

  const pattern = new RegExp(`(${validKeywords.map(escapeRegExp).join('|')})`, 'gi');
  const parts = text.split(pattern);

  return parts.map(part => {
    const isMatch = validKeywords.some(k => k.toLowerCase() === part.toLowerCase());
    return { text: part, isMatch };
  });
}
