import fs from 'fs-extra';
import path from 'path';
import { get } from 'lodash';
import { MigrateMongoConfig } from '../model';
import { program } from 'commander';

export const DEFAULT_CONFIG_FILE_NAME = 'migrate-mongo-config.js';

program.option('-f, --file', 'file config path');

function getConfigPath(): string {
  program.parse(process.argv);
  const fileOptionValue = get(program, 'file');
  if (!fileOptionValue) {
    return path.join(process.cwd(), DEFAULT_CONFIG_FILE_NAME);
  }

  if (path.isAbsolute(fileOptionValue)) {
    return fileOptionValue;
  }
  return path.join(process.cwd(), fileOptionValue);
}

export async function shouldExist(): Promise<void> {
  const configPath = getConfigPath();
  try {
    await fs.stat(configPath);
  } catch (err) {
    throw new Error(`config file does not exist: ${configPath}`);
  }
}

export async function shouldNotExist(): Promise<void> {
  const configPath = getConfigPath();
  const error = new Error(`config file already exists: ${configPath}`);
  try {
    await fs.stat(configPath);
    throw error;
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw error;
    }
  }
}

export async function read(): Promise<MigrateMongoConfig> {
  const configPath = getConfigPath();
  return Promise.resolve(require(configPath)); // eslint-disable-line
}
