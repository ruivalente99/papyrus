import type { MultiLangString, SupportedLanguage } from "./cv";

export interface CoverLetterRecipient {
  companyName: string;
  hiringManagerName?: string;
  jobTitle?: MultiLangString;
  department?: string;
  companyAddress?: MultiLangString;
  cityStateZip?: string;
}

export interface CoverLetterContent {
  date?: string;
  salutation: MultiLangString;
  opening: MultiLangString;
  bodyParagraphs: MultiLangString[];
  closing: MultiLangString;
  signOff: MultiLangString;
  signatureName?: string;
}

export type CoverLetterLayout = "standard" | "modern-sidebar" | "executive-minimal";

export interface CoverLetterDocument {
  id: string;
  version: string;
  title: string;
  preset?: string;
  currentLanguage: SupportedLanguage;
  recipient: CoverLetterRecipient;
  content: CoverLetterContent;
  layout: CoverLetterLayout;
  showSenderHeader: boolean;
  createdAt: string;
  updatedAt: string;
}
