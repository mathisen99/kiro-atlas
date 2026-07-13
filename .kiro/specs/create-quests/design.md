# Create Quests Design

## Quest model

`demo/quests.ts` exports the `Quest` type and a small factory for normalized quest values.

## In-memory store

`demo/quest-store.ts` keeps quests in an array and exposes focused create, complete, and list operations.

## Error handling

Blank titles are rejected at the model boundary so the store stays simple.
