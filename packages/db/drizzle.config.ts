import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

export default defineConfig({
    schema: './src/schema.ts',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url: 'postgresql://neondb_owner:npg_gus3koazJ8Zy@ep-odd-recipe-aifowe6z-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require',
    },
    verbose: true,
    strict: true,
});
