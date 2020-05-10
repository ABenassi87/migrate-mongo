import { find } from 'lodash';
import * as migrationsDir from '../env/migrationsDir';
import * as configFile from '../env/configFile';
import { Db } from 'mongodb';
import { MigrateMongoStatus } from '../model';

export async function status(db: Db): Promise<MigrateMongoStatus[]> {
  try {
    await migrationsDir.shouldExist();
    await configFile.shouldExist();
    const fileNames = await migrationsDir.getFileNames();

    const config = await configFile.read();
    const collectionName = config.changelogCollectionName;
    const collection = db.collection(collectionName);
    const changelog = await collection.find({}).toArray();

    const statusTable: MigrateMongoStatus[] = fileNames.map((filename) => {
      const itemInLog = find(changelog, { filename });
      const appliedAt: string = itemInLog ? itemInLog.appliedAt.toJSON() : 'PENDING';
      return { filename, appliedAt };
    });

    return statusTable;
  } catch (err) {
    throw err;
  }
}
