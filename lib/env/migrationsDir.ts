import fs from 'fs-extra';
import path from 'path';
import * as configFile from './configFile';
import { MigrateMongoConfig, MigrateMongoMigration } from '../model';

const DEFAULT_MIGRATIONS_DIR_NAME = 'migrations';
const DEFAULT_MIGRATION_EXT = '.js';

async function resolveMigrationsDirPath(): Promise<string> {
  let migrationsDir: string | undefined;
  try {
    const config: MigrateMongoConfig = await configFile.read();
    migrationsDir = config.migrationsDir; // eslint-disable-line
    // if config file doesn't have migrationsDir key, assume default 'migrations' dir
    if (!migrationsDir) {
      migrationsDir = DEFAULT_MIGRATIONS_DIR_NAME;
    }
  } catch (err) {
    // config file could not be read, assume default 'migrations' dir
    migrationsDir = DEFAULT_MIGRATIONS_DIR_NAME;
  }

  if (path.isAbsolute(migrationsDir)) {
    return migrationsDir;
  }
  return path.join(process.cwd(), migrationsDir);
}

export async function resolveSampleMigrationPath(): Promise<string> {
  const migrationsDir = await resolveMigrationsDirPath();
  return path.join(migrationsDir, 'sample-migration.js');
}

export async function resolveMigrationFileExtension(): Promise<string> {
  let migrationFileExtension: string;
  try {
    const config = await configFile.read();
    migrationFileExtension = config.migrationFileExtension || DEFAULT_MIGRATION_EXT;
  } catch (err) {
    // config file could not be read, assume default extension
    migrationFileExtension = DEFAULT_MIGRATION_EXT;
  }

  if (migrationFileExtension && !migrationFileExtension.startsWith('.')) {
    throw new Error('migrationFileExtension must start with dot');
  }

  return migrationFileExtension;
}

export const resolve = resolveMigrationsDirPath;

export async function shouldExist(): Promise<void> {
  const migrationsDir: string = await resolveMigrationsDirPath();
  try {
    await fs.stat(migrationsDir);
  } catch (err) {
    throw new Error(`migrations directory does not exist: ${migrationsDir}`);
  }
}

export async function shouldNotExist(): Promise<void> {
  const migrationsDir = await resolveMigrationsDirPath();
  const error = new Error(`migrations directory already exists: ${migrationsDir}`);

  try {
    await fs.stat(migrationsDir);
    throw error;
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw error;
    }
  }
}

export async function getFileNames(): Promise<string[]> {
  const migrationsDir: string = await resolveMigrationsDirPath();
  const migrationExt: string = await resolveMigrationFileExtension();
  const files: string[] = await fs.readdir(migrationsDir);
  return files.filter((file) => path.extname(file) === migrationExt && path.basename(file) !== 'sample-migration.js');
}

export async function loadMigration(fileName: string): Promise<MigrateMongoMigration> {
  const migrationsDir = await resolveMigrationsDirPath();
  return require(path.join(migrationsDir, fileName)); // eslint-disable-line
}

export async function doesSampleMigrationExist(): Promise<boolean> {
  const samplePath = await resolveSampleMigrationPath();
  try {
    await fs.stat(samplePath);
    return true;
  } catch (err) {
    return false;
  }
}
