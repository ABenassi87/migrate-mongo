import * as _ from 'lodash';
import { promisify } from 'util';
import fnArgs from 'fn-args';

import { status } from './status';
import * as migrationsDir from '../env/migrationsDir';
import * as configFile from '../env/configFile';

import hasCallback from '../utils/has-callback';
import { Db, MongoClient } from 'mongodb';

export async function down(db: Db, client: MongoClient) {
  const downgraded = [];
  const statusItems = await status(db);
  const appliedItems = statusItems.filter((item) => item.appliedAt !== 'PENDING');
  const lastAppliedItem = _.last(appliedItems);

  if (lastAppliedItem) {
    try {
      const migration = await migrationsDir.loadMigration(lastAppliedItem.filename);
      const down = hasCallback(migration.down) ? promisify(migration.down) : migration.down;

      if (hasCallback(migration.down) && fnArgs(migration.down).length < 3) {
        // support old callback-based migrations prior to migrate-mongo 7.x.x
        await down(db);
      } else {
        await down(db, client);
      }
    } catch (err) {
      throw new Error(`Could not migrate down ${lastAppliedItem.filename}: ${err.message}`);
    }
    const config = await configFile.read();
    const collectionName = config.changelogCollectionName;
    const collection = db.collection(collectionName);
    try {
      await collection.deleteOne({ fileName: lastAppliedItem.filename });
      downgraded.push(lastAppliedItem.filename);
    } catch (err) {
      throw new Error(`Could not update changelog: ${err.message}`);
    }
  }

  return downgraded;
}
