export default class Util {
  public static generateRandomToken(): string {
    const token =
      Math.random()
        .toString(36)
        .slice(2) +
      Math.random()
        .toString(36)
        .slice(2) +
      Math.random()
        .toString(36)
        .slice(2);

    return token;
  }

  public static getRandomInt(max: number) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  public static getPercentageChange(oldValue: number, newValue: number) {
    const diff = newValue - oldValue;
    const percentDiff = diff / oldValue * 100;

    return Math.round(percentDiff);
  }
}
