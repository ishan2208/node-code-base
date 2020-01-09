import * as childProcess from 'child-process-promise';
import * as logger from 'winston';

export default class FileUtil {
  public static cleanseFilename(filename: string): string {
    return filename.replace(/[^\w.]/gi, '_');
  }

  public static escapeSpacesFilename(filename: string): string {
    return filename.replace(' ', '\\ ');
  }

  public static async cleanZip(filePath: string): Promise<any> {
    const tempFiles = ['__MACOSX/*'];

    const promises = [];
    for (const tempFile of tempFiles) {
      const exec = childProcess.exec;
      promises.push(exec(`zip -d ${filePath} ${tempFile}`));
    }

    try {
      await Promise.all(promises);
    } catch (error) {
      logger.debug('Nothing to clean in the zip file');
    }
  }
}
