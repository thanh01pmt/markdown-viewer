import fs from 'fs/promises';
import path from 'path';
import { zodToJsonSchema } from 'zod-to-json-schema';

const zodSchemasDir = path.resolve('./src/lib/interactive-quiz-kit/schemas/zod');
const jsonSchemasDir = path.resolve('./src/lib/interactive-quiz-kit/schemas/json');

async function generateSchemas() {
  try {
    await fs.mkdir(jsonSchemasDir, { recursive: true });
    const files = await fs.readdir(zodSchemasDir);

    for (const file of files) {
      if (file.endsWith('.ts')) {
        const zodSchemaPath = path.join(zodSchemasDir, file);
        const schemaModule = await import(zodSchemaPath);
        
        // Giả định schema được export với tên dạng "XXXSchema"
        const schemaKey = Object.keys(schemaModule).find(key => key.endsWith('Schema'));
        if (!schemaKey) {
          console.warn(`No schema export found in ${file}`);
          continue;
        }

        const zodSchema = schemaModule[schemaKey];
        const jsonSchema = zodToJsonSchema(zodSchema, schemaKey);

        const jsonFileName = file.replace('.ts', '.json');
        const jsonFilePath = path.join(jsonSchemasDir, jsonFileName);
        
        await fs.writeFile(jsonFilePath, JSON.stringify(jsonSchema, null, 2));
        console.log(`Generated: ${jsonFilePath}`);
      }
    }
    console.log('\nSchema generation complete!');
  } catch (error) {
    console.error('Error generating schemas:', error);
    process.exit(1);
  }
}

generateSchemas();