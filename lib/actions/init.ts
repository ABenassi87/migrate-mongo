import fs from 'fs-extra';
import path from 'path';

import * as migrationsDir from '../env/migrationsDir';
import * as configFile from '../env/configFile';

function copySampleConfigFile(): Promise<void> {
  const source = path.join(__dirname, '../../samples/migrate-mongo-config.js');
  const destination = path.join(process.cwd(), configFile.DEFAULT_CONFIG_FILE_NAME);
  return fs.copy(source, destination);
}

function createMigrationsDirectory(): Promise<void> {
  return fs.mkdirs(path.join(process.cwd(), 'migrations'));
}

export async function init(): Promise<void> {
  try {
    await migrationsDir.shouldNotExist();
    await configFile.shouldNotExist();
    await copySampleConfigFile();
    return createMigrationsDirectory();
  } catch (err) {
    throw err;
  }
}
