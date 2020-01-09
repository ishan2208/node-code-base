import { Parser } from 'json2csv';
import { Readable } from 'stream';
export default class CsvUtil {
  public static getCsvFromJson(csvHeaders: object, jsonData: object): string {
    const parser = new Parser(csvHeaders);
    const csvData = parser.parse(jsonData);

    return csvData;
  }

  public static getStreamFromString(stringData: string): Readable {
    const readStream = new Readable();
    readStream.push(stringData);
    readStream.push(null);

    return readStream;
  }

  public static getCSVResponse(csvName: string, csvData: string) {
    return `${csvName}\n${csvData}`;
  }
}
