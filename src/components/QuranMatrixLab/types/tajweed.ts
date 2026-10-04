export type TajweedRuleType =
  | 'ihfa'                // İhfâ (Tenvin / Sâkin Nûn + 15 Harf)
  | 'izhar'               // İzhâr (Tenvin / Sâkin Nûn + 6 Boğaz Harfi)
  | 'iklab'               // İklâb (Tenvin / Sâkin Nûn + Bâ)
  | 'idgam_maal_gunne'    // İdgam-ı Maal-Gunne (Y-M-N-V)
  | 'idgam_bila_gunne'    // İdgam-ı Bilâ-Gunne (L-R)
  | 'kalkale'             // Kalkale (Kaf, Tı, Be, Cim, Dal cezimli)
  | 'idgam_semsiyye'      // İdgam-ı Şemsiyye (Lâm okunmaz, harf şeddelenir)
  | 'izhar_kameriyye'     // İzhâr-ı Kameriyye (Lâm cezimle açıkça okunur)
  | 'medd_i_tabii'        // Medd-i Tabiî (1 Elif miktarı uzatma)
  | 'medd_i_muttasil'     // Medd-i Muttasıl (4 Elif, aynı kelimede hemze)
  | 'medd_i_munfasil'     // Medd-i Munfasıl (4 Elif, ayrı kelimede hemze)
  | 'medd_i_lazim'        // Medd-i Lâzım (4 Elif, sükûn-ı lâzım)
  | 'ihfa_sefevi'         // İhfâ-i Şefevî (Dudak İhfâsı - Sakin Mîm + Bâ)
  | 'idgam_misleyn'       // İdgam-ı Misleyn Maal-Gunne (Sakin Mîm + Mîm)
  | 'izhar_sefevi'        // İzhâr-ı Şefevî (Sakin Mîm + Diğerleri)
  | 'hukmur_ra_kalin'     // Râ Harfinin Kalın Okunuşu
  | 'hukmur_ra_ince';     // Râ Harfinin İnce Okunuşu

export interface TajweedColorStyle {
  bgLight: string;
  bgDark: string;
  textLight: string;
  textDark: string;
  border: string;
  badgeBg: string;
  badgeText: string;
  hex: string;
}

export interface TajweedRuleInfo {
  type: TajweedRuleType;
  titleTr: string;
  category: 'tenvin_ve_sakin_nun' | 'kalkale' | 'semsi_kameri' | 'med_halleri' | 'sakin_mim' | 'hukmur_ra';
  categoryTitleTr: string;
  shortDesc: string;
  ruleExplanation: string;
  lettersInvolved: string[];
  durationElif?: string; // Örn: '1.5 Elif', '1 Elif', '4 Elif'
  exampleArabic: string;
  exampleTr: string;
  color: TajweedColorStyle;
}

export interface DetectedTajweedSegment {
  text: string;
  rule?: TajweedRuleInfo;
  isHighlighted: boolean;
}

export interface TajweedAnalysisResult {
  hasRules: boolean;
  rulesFound: TajweedRuleInfo[];
  segments: DetectedTajweedSegment[];
  summaryNote?: string;
}
