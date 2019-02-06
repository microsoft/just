import { mergePackageJson, _shouldUpdateDep } from '../mergePackageJson';
import { IPackageJson } from '../IPackageJson';

describe('_shouldUpdateDep', () => {
  it('correctly detects deps needing update', () => {
    // okay if old version is undefined
    expect(_shouldUpdateDep(undefined, '0.0.1')).toBe(true);

    // do nothing if either version is totally invalid
    expect(_shouldUpdateDep(undefined, 'hi')).toBe(false);
    expect(_shouldUpdateDep('hi', '0.0.1')).toBe(false);
    expect(_shouldUpdateDep('0.0.1', 'hi')).toBe(false);

    // do nothing if either version is a type of range we don't understand
    // (ideally we should add handling for these later)
    expect(_shouldUpdateDep(undefined, '1.x.x')).toBe(false);
    expect(_shouldUpdateDep('0.0.1', '1.x.x')).toBe(false);
    expect(_shouldUpdateDep('1.0.0', '2.x.x')).toBe(false);
    expect(_shouldUpdateDep('1.0.0 || 2.0.0', '3.0.0')).toBe(false);
    expect(_shouldUpdateDep('1.0.0 - 2.0.0', '3.0.0')).toBe(false);
    expect(_shouldUpdateDep('=1.0.0', '2.0.0')).toBe(false);
    expect(_shouldUpdateDep('<1.0.0', '2.0.0')).toBe(false);
    expect(_shouldUpdateDep('>=1.0.0 <2.0.0', '3.0.0')).toBe(false);

    // normal cases!
    expect(_shouldUpdateDep('1.0.0', '2.0.0')).toBe(true);
    expect(_shouldUpdateDep('1.0.0', '1.0.1')).toBe(true);
    expect(_shouldUpdateDep('1.0.0', '~1.0.1')).toBe(true);
    expect(_shouldUpdateDep('1.0.0', '~2.0.0')).toBe(true);
    expect(_shouldUpdateDep('1.0.0', '^2.0.0')).toBe(true);
    expect(_shouldUpdateDep('~1.0.0', '2.0.0')).toBe(true);
    expect(_shouldUpdateDep('^1.0.0', '2.0.0')).toBe(true);
    expect(_shouldUpdateDep('2.0.0', '1.0.0')).toBe(false);
    expect(_shouldUpdateDep('1.0.1', '1.0.0')).toBe(false);
    expect(_shouldUpdateDep('~2.0.0', '1.0.0')).toBe(false);
    expect(_shouldUpdateDep('^2.0.0', '1.0.0')).toBe(false);
    expect(_shouldUpdateDep('2.0.0', '^1.0.0')).toBe(false);
    expect(_shouldUpdateDep('2.0.0', '~1.0.0')).toBe(false);
  });

  // This test case is solely meant to DOCUMENT current questionable behaviors that weren't
  // initially considered worth fixing. If one of these is fixed and it fails the test,
  // please remove the old test case and add one to the normal section.
  it('has questionable handling of some edge cases', () => {
    expect(_shouldUpdateDep(undefined, '0.0.0')).toBe(false);
    expect(_shouldUpdateDep('~1.0.0', '^1.0.0')).toBe(false);
    expect(_shouldUpdateDep('~1.1.0', '^1.0.0')).toBe(false);
    expect(_shouldUpdateDep('1.0.1', '~1.0.0')).toBe(false);
    expect(_shouldUpdateDep('1.0.1', '^1.0.0')).toBe(false);
    expect(_shouldUpdateDep('~1.0.0', '1.0.1')).toBe(true);
    expect(_shouldUpdateDep('^1.0.0', '1.0.1')).toBe(true);
  });

  it('does nothing if original.just is undefined', () => {
    const original: IPackageJson = { name: 'a' };
    const incoming: IPackageJson = { name: 'a', dependencies: { b: '1.0.0' } };
    const result = mergePackageJson(original, incoming);
    expect(result).toBe(original);
    expect(result.dependencies).toBeUndefined();
  });
});

describe('mergePackageJson', () => {
  /** Generates a package.json with required `name` and `just` properties. */
  function genPackageJson(extraProps: Partial<IPackageJson> = {}): IPackageJson {
    return { name: 'a', just: {}, ...extraProps };
  }

  it('handles undefined deps and devDeps', () => {
    // no deps or devDeps in either
    let original = genPackageJson();
    let incoming = genPackageJson();
    let result = mergePackageJson(original, incoming);
    expect(result).toBe(original);

    // deps only in original
    original = genPackageJson({ dependencies: { b: '1.0.0' } });
    incoming = genPackageJson();
    result = mergePackageJson(original, incoming);
    expect(result).toBe(original);
    expect(result.dependencies).toBeDefined();
    expect(result.devDependencies).toBeUndefined();

    // deps only in incoming
    original = genPackageJson();
    incoming = genPackageJson({ dependencies: { b: '1.0.0' } });
    result = mergePackageJson(original, incoming);
    expect(result === original).toBe(false); // new object returned
    // in this case it should deep equal incoming, with empty devDependencies added
    expect(result).toEqual({ ...incoming, devDependencies: {} });
  });

  it('preserves extra properties of original', () => {
    const original = genPackageJson({ b: 'c' });
    const incoming = genPackageJson({
      dependencies: { d: '1.0.0' },
      devDependencies: { e: '1.0.0' }
    });
    const result = mergePackageJson(original, incoming);
    expect(result === original).toBe(false); // new object returned
    expect(result).toEqual({ ...original, ...incoming });
  });

  it('merges in new deps and devDeps without overlap', () => {
    const original = genPackageJson({
      dependencies: { b: '1.0.0' },
      devDependencies: { c: '1.0.0' }
    });
    const incoming = genPackageJson({
      dependencies: { d: '1.0.0' },
      devDependencies: { e: '1.0.0' }
    });
    const result = mergePackageJson(original, incoming);
    // new object returned
    expect(result === original).toBe(false);
    // original object not modified
    expect(original.dependencies).toEqual({ b: '1.0.0' });
    // deps and devDeps merged
    expect(result.dependencies).toEqual({ ...original.dependencies, ...incoming.dependencies });
    expect(result.devDependencies).toEqual({
      ...original.devDependencies,
      ...incoming.devDependencies
    });
  });

  it('does not change older incoming dep', () => {
    // one dep and incoming version is older => return original
    const original = genPackageJson({ dependencies: { b: '1.0.0' } });
    const incoming = genPackageJson({ dependencies: { b: '0.1.1' } });
    let result = mergePackageJson(original, incoming);
    expect(result).toBe(original);

    // incoming introduces a new dep but has old version of existing dep
    // => merge in added dep but keep newer version of existing dep
    incoming.dependencies!.c = '1.0.0';
    result = mergePackageJson(original, incoming);
    expect(result === original).toBe(false);
    expect(result.dependencies).toEqual({ b: '1.0.0', c: '1.0.0' });
    expect(original.dependencies).toEqual({ b: '1.0.0' });
  });

  it('updates to new dep version', () => {
    // one dep and incoming version is newer => upgrade
    const original = genPackageJson({ dependencies: { b: '1.0.0' } });
    const incoming = genPackageJson({ dependencies: { b: '2.0.0' } });
    let result = mergePackageJson(original, incoming);
    expect(result.dependencies).toEqual(incoming.dependencies);

    original.dependencies!.c = '1.0.0';
    incoming.dependencies!.d = '1.0.0';
    result = mergePackageJson(original, incoming);
    expect(result.dependencies).toEqual({ b: '2.0.0', c: '1.0.0', d: '1.0.0' });
  });
});
