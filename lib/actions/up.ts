import * as _ from 'lodash';
import { promisify } from 'util';
import fnArgs from 'fn-args';
import pEachSeries from 'p-each-series';

import { status } from './status';
import * as migrationsDir from '../env/migrationsDir';
import * as configFile from '../env/configFile';
import hasCallback from '../utils/has-callback';
import { Db, MongoClient } from 'mongodb';
import { MigrateMongoStatus } from '../model';

export async function up(db: Db, client: MongoClient) {
  const statusItems = await status(db);
  const pendingItems = _.filter(statusItems, { appliedAt: 'PENDING' });
  const migrated: string[] = [];

  const migrateItem = async (item: MigrateMongoStatus) => {
    try {
      const migration = await migrationsDir.loadMigration(item.filename);
      const up = hasCallback(migration.up) ? promisify(migration.up) : migration.up;

      if (hasCallback(migration.up) && fnArgs(migration.up).length < 3) {
        // support old callback-based migrations prior to migrate-mongo 7.x.x
        await up(db);
      } else {
        await up(db, client);
      }
    } catch (err) {
      throw {
        message: `Could not migrate up ${item.filename}: ${err.message}`,
        migrated
      };
    }

    const config = await configFile.read();
    const collectionName = config.changelogCollectionName;
    const collection = db.collection(collectionName);

    const { filename } = item;
    const appliedAt = new Date();

    try {
      await collection.insertOne({ fileName: filename, appliedAt });
    } catch (err) {
      throw new Error(`Could not update changelog: ${err.message}`);
    }
    migrated.push(item.filename);
  };

  await pEachSeries(pendingItems, migrateItem);
  return migrated;
}
