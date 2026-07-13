import type { Difficulty } from "./difficulty";

export type Quest = {
  id: string;
  title: string;
  difficulty: Difficulty;
  completed: boolean;
};

export function createQuest(id: string, title: string, difficulty: Difficulty): Quest {
  const cleanTitle = title.trim();
  if (!cleanTitle) {
    throw new Error("A quest title is required.");
  }

  return { id, title: cleanTitle, difficulty, completed: false };
}
