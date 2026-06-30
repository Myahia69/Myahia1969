/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Explanation {
  rationale: string; // The core scientific justification for the correct answer
  alternatives: {
    A: string; // Why option A is correct/incorrect
    B: string; // Why option B is correct/incorrect
    C: string; // Why option C is correct/incorrect
    D: string; // Why option D is correct/incorrect
  };
  learningOutcome: string; // The target learning outcome (ناتج التعلم المستهدف)
}

export type QuestionLevel = 'past_exam' | 'medium' | 'advanced';
export type QuestionType = 'mcq' | 'essay';

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctOption?: 'A' | 'B' | 'C' | 'D'; // For MCQs
  sampleAnswer?: string; // For essay questions
  explanation: Explanation;
  level: QuestionLevel;
  yearAndSession?: string; // e.g., "دور أول 2024", "تجريبي 2023"
  section: string; // e.g., "الأهمية الاقتصادية", "الخواص العامة", "تفاعلات الحديد وأكاسيده"
}

export interface ConceptNode {
  id: string;
  title: string;
  summary: string;
  details: string[];
  equations?: {
    reactants: string;
    products: string;
    conditions?: string;
    balancedEq: string;
    importance: string;
  }[];
}

export interface CrossLink {
  id: string;
  title: string;
  sourceChapter: string; // "الباب الأول: العناصر الانتقالية"
  targetChapter: string; // "الباب الثاني: التحليل الكيميائي", etc.
  conceptConnection: string; // The linking narrative
  scientificExplanation: string; // In-depth chemistry analysis
  practicalExample: string; // High-yield question scenario or visual equation link
}

export interface IronReaction {
  id: string;
  reactant: string; // Starting substance, e.g. "Fe", "FeO", "Fe2O3", "Fe3O4", "Fe(OH)3", "FeC2O4"
  reagent: string; // Reactant or condition, e.g. "H2SO4 مخفف", "تسخين شديد بمعزل عن الهواء"
  temperature?: string; // e.g., "أعلى من 700°م", "230 - 300°م"
  products: string; // Balanced products
  balancedEquation: string;
  observations: string; // Visual change, colors, gas evolved
  examTrick: string; // The common exam trap associated with this reaction
}

export interface UserNote {
  id: string;
  content: string;
  timestamp: string;
}
