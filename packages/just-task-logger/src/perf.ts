const markers: { [marker: string]: [number, number] } = {};

export function mark(marker: string): void {
  markers[marker] = process.hrtime();
}

export function getDeltaAndClearMark(marker: string): [number, number] | null {
  if (markers[marker]) {
    const delta = process.hrtime(markers[marker]);
    delete markers[marker];
    return delta;
  }

  return null;
}
