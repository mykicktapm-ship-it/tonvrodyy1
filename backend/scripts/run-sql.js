#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function main() {
  // Parse --file=<name> or positional argument
  let argFile = null;
  for (const a of process.argv.slice(2)) {
    if (a.startsWith('--file=')) {
      argFile = a.split('=')[1];
    } else if (!a.startsWith('--')) {
      argFile = a;
    }
  }
  const defaultFile = path.join(__dirname, '..', 'sql', 'migrations', '001_invites.sql');
  const file = argFile ? (path.isAbsolute(argFile) ? argFile : path.join(__dirname, '..', 'sql', 'migrations', argFile)) : defaultFile;
  const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL (or SUPABASE_DB_URL) is not set. Please provide a Postgres connection string.');
    process.exit(2);
  }
  const sql = fs.readFileSync(file, 'utf8');
  const client = new Client({ connectionString: databaseUrl });
  try {
    await client.connect();
    await client.query(sql);
    console.log('Migration executed successfully:', file);
  } catch (e) {
    console.error('Migration failed:', e.message || e);
    process.exit(3);
  } finally {
    await client.end();
  }
}

main();
