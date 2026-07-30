export class PRDiffBuilder {
  /**
   * Generates a unified diff format string comparing two version payloads.
   */
  static generateDiff(v1Content: string, v2Content: string, v1Num: number, v2Num: number): string {
    if (v1Content === v2Content) {
      return `--- Version ${v1Num}\n+++ Version ${v2Num}\n@@ -1 +1 @@\n No changes detected between Version ${v1Num} and Version ${v2Num}`;
    }

    const lines1 = v1Content.split('\n');
    const lines2 = v2Content.split('\n');

    let diff = `--- Version ${v1Num}\n+++ Version ${v2Num}\n@@ -1,${lines1.length} +1,${lines2.length} @@\n`;

    const maxLines = Math.max(lines1.length, lines2.length);
    for (let i = 0; i < maxLines; i++) {
      const l1 = lines1[i];
      const l2 = lines2[i];

      if (l1 === l2) {
        if (l1 !== undefined) diff += ` ${l1}\n`;
      } else {
        if (l1 !== undefined) diff += `-${l1}\n`;
        if (l2 !== undefined) diff += `+${l2}\n`;
      }
    }

    return diff;
  }
}
