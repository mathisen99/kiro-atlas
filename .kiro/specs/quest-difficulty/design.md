# Quest Difficulty Design

## Difficulty type

`demo/difficulty.ts` owns the `Difficulty` string union so every consumer uses the same allowed values.

## Quest integration

The `Quest` model in `demo/quests.ts` stores difficulty directly and the quest factory requires it.

## Display helper

A focused helper in `demo/difficulty.ts` will convert stored values into Easy, Medium, and Hard labels.
