import type { Difficulty } from "./difficulty";
import { createQuest, type Quest } from "./quests";

export class QuestStore {
  private quests: Quest[] = [];
  private nextId = 1;

  add(title: string, difficulty: Difficulty): Quest {
    const quest = createQuest(String(this.nextId++), title, difficulty);
    this.quests.push(quest);
    return quest;
  }

  complete(id: string): Quest | undefined {
    const quest = this.quests.find((candidate) => candidate.id === id);
    if (quest) {
      quest.completed = true;
    }
    return quest;
  }

  all(): Quest[] {
    return this.quests.map((quest) => ({ ...quest }));
  }
}
