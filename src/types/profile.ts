import type { CVDocument, TemplateId } from "./cv";
import type { CoverLetterDocument } from "./coverLetter";

export interface CVProfileMeta {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  template: TemplateId;
  targetRole?: string;
  atsScore?: number;
}

export interface StoredProfileData {
  meta: CVProfileMeta;
  cv: CVDocument;
  coverLetter?: CoverLetterDocument;
}

export interface MultiProfileBundle {
  version: "1.0.0";
  exportedAt: string;
  activeProfileId: string;
  profiles: StoredProfileData[];
}
