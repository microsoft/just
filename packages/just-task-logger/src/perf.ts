const markers: { [marker: string]: [number, number] } = {};

export function mark(marker: string) {
  markers[marker] = process.hrtime();
}

export function getDeltaAndClearMark(marker: string) {
  if (markers[marker]) {
    const delta = process.hrtime(markers[marker]);
    delete markers[marker];
    return delta;
  }

  return null;
}
