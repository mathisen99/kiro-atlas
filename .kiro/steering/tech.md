# Technical Direction

Quest Board uses simple TypeScript files, while Kiro Atlas uses Lakebed and Preact for its visual homepage. A small Python standard-library generator connects the committed workspace artifacts to the page.

## Technology choices

- TypeScript for the fictional Quest Board source files
- Lakebed and Preact for the Atlas homepage
- Tailwind utilities supplied by Lakebed for styling
- Python standard library only for data generation

## Constraints

- No database or application backend is needed
- No external APIs or frontend dependencies
- Keep code small, readable, and suitable for a one-day demo
- Deployment stays a deliberate manual command
