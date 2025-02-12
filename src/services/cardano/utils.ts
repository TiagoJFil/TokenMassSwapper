


export class CardanoUtils {

  static harden(num: number): number {
    return 0x80000000 + num;
  }

  static toAda(amount: number | string): number {
    return Number(amount) / 1000000;
  }


}