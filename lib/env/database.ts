import { Db, MongoClient, MongoClientOptions } from 'mongodb';
import * as _ from 'lodash';
import * as configFile from './configFile';
import { MigrateMongoConnection } from '../model';

export async function connect(): Promise<MigrateMongoConnection> {
  const config = await configFile.read();
  const url: string = _.get(config, 'mongodb.url');
  const databaseName: string = _.get(config, 'mongodb.databaseName', undefined);
  const options: MongoClientOptions = _.get(config, 'mongodb.options');

  if (!url) {
    throw new Error('No `url` defined in config file!');
  }

  const client: MongoClient = await MongoClient.connect(url, options);

  const db: Db = client.db(databaseName);
  return {
    client,
    db
  };
}
