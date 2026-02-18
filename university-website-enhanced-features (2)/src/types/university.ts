export type AdmissionChannel = '繁星推薦' | '個人申請';

export interface ExamRequirement {
  subject: string;
  standard: string;
  level: number;
}

export interface ThresholdValue {
  item: string;
  value: string;
}

export interface RoundResult {
  count: number;
  thresholds: ThresholdValue[];
}

export interface StarAdmission {
  channel: '繁星推薦';
  year: number;
  deptCode: string;
  quota: number;
  requirements: ExamRequirement[];
  comparisonOrder: string[];
  result: string;
  round1: RoundResult | null;
  round2: RoundResult | null;
}

export interface PersonalAdmission {
  channel: '個人申請';
  year: number;
  deptCode: string;
  quota: number;
  requirements: ExamRequirement[];
  screeningMultiplier?: number;
  secondStageItems?: string[];
  result?: string;
}

export type AdmissionInfo = StarAdmission | PersonalAdmission;

export type DeptGroup = '一' | '二' | '三';

export interface Department {
  id: string;
  name: string;
  groupName: string;
  group: DeptGroup;
  admissions: AdmissionInfo[];
}

export interface University {
  id: string;
  name: string;
  shortName: string;
  code: string;
  type: '國立' | '私立';
  category: '一般大學' | '科技大學' | '師範大學' | '醫學大學';
  location: {
    city: string;
    district: string;
  };
  departments: Department[];
}

export interface FlattenedProgram {
  university: University;
  department: Department;
}

export type AdmissionTab = '繁星推薦' | '個人申請';
export type BrowseMode = 'bySchool' | 'byDepartment';
export type PageView = 'home' | 'admission';
