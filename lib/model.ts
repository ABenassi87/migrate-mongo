import { Db, MongoClient, MongoClientOptions } from 'mongodb';

export interface MigrateMongoDBConfigOptions {
  url: string;
  databaseName?: string;
  options: MongoClientOptions;
}

export interface MigrateMongoStatus {
  filename: string;
  appliedAt: string;
}

export interface MigrateMongoConfig {
  mongodb: MigrateMongoDBConfigOptions;
  migrationsDir: string;
  changelogCollectionName: string;
  migrationFileExtension: string;
}

export interface MigrateMongoMigration {
  down: (...arguments: any[]) => unknown;
  up: (...arguments: any[]) => unknown;
}

export interface MigrateMongoConnection {
  client: MongoClient;
  db: Db;
}
