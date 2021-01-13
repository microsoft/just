import { mergePackageJson, _shouldUpdateDep } from '../mergePackageJson';
import { PackageJson } from '../interfaces/PackageJson';

describe('_shouldUpdateDep', () => {
  it('returns true if old version is undefined', () => {
    expect(_shouldUpdateDep(undefined, '0.0.1')).toBe(true);
  });

  it('returns false if either version is invalid', () => {
    expect(_shouldUpdateDep(undefined, 'hi')).toBe(false);
    expect(_shouldUpdateDep('hi', '0.0.1')).toBe(false);
    expect(_shouldUpdateDep('0.0.1', 'hi')).toBe(false);
  });

  it('returns false if either version is an unsupported range type', () => {
    // Ideally we should add handling for these later...
    expect(_shouldUpdateDep(undefined, '1.x.x')).toBe(false);
    expect(_shouldUpdateDep('0.0.1', '1.x.x')).toBe(false);
    expect(_shouldUpdateDep('1.0.0', '2.x.x')).toBe(false);
    expect(_shouldUpdateDep('1.0.0 || 2.0.0', '3.0.0')).toBe(false);
    expect(_shouldUpdateDep('1.0.0 - 2.0.0', '3.0.0')).toBe(false);
    expect(_shouldUpdateDep('=1.0.0', '2.0.0')).toBe(false);
    expect(_shouldUpdateDep('<1.0.0', '2.0.0')).toBe(false);
    expect(_shouldUpdateDep('>=1.0.0 <2.0.0', '3.0.0')).toBe(false);
  });

  it('returns true for deps needing update', () => {
    expect(_shouldUpdateDep('1.0.0', '2.0.0')).toBe(true);
    expect(_shouldUpdateDep('1.0.0', '1.0.1')).toBe(true);
    expect(_shouldUpdateDep('1.0.0', '~1.0.1')).toBe(true);
    expect(_shouldUpdateDep('1.0.0', '~2.0.0')).toBe(true);
    expect(_shouldUpdateDep('1.0.0', '^2.0.0')).toBe(true);
    expect(_shouldUpdateDep('~1.0.0', '2.0.0')).toBe(true);
    expect(_shouldUpdateDep('^1.0.0', '2.0.0')).toBe(true);
  });

  it('returns false for deps not needing update', () => {
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
    // undefined to 0.0.0 is kind of an upgrade
    expect(_shouldUpdateDep(undefined, '0.0.0')).toBe(false);

    // original version is smaller or identical by pure numerical comparison, but ~ or ^
    // in incoming version potentially allows a newer version to be picked up
    expect(_shouldUpdateDep('~1.0.0', '^1.0.0')).toBe(false);
    expect(_shouldUpdateDep('~1.1.0', '^1.0.0')).toBe(false);
    expect(_shouldUpdateDep('1.0.1', '~1.0.0')).toBe(false);
    expect(_shouldUpdateDep('1.0.1', '^1.0.0')).toBe(false);

    // original version is smaller by numerical comparison, but ~ or ^ in incoming version
    // would allow a newer version to be picked up
    expect(_shouldUpdateDep('~1.0.0', '1.0.1')).toBe(true);
    expect(_shouldUpdateDep('^1.0.0', '1.0.1')).toBe(true);
  });

  it('does nothing if original.just is undefined', () => {
    const original: PackageJson = { name: 'a' };
    const incoming: PackageJson = { name: 'a', dependencies: { b: '1.0.0' } };
    const result = mergePackageJson(original, incoming);
    expect(result).toBe(original);
    expect(result.dependencies).toBeUndefined();
  });
});

describe('mergePackageJson', () => {
  /** Generates a package.json with required `name` and `just` properties. */
  function genPackageJson(extraProps: Partial<PackageJson> = {}): PackageJson {
    return { name: 'a', just: {}, ...extraProps };
  }

  it('handles undefined deps and devDeps', () => {
    const original = genPackageJson();
    const incoming = genPackageJson();
    const result = mergePackageJson(original, incoming);
    expect(result).toBe(original);
  });

  it('handles if deps are only defined in original', () => {
    const original = genPackageJson({ dependencies: { b: '1.0.0' } });
    const incoming = genPackageJson();
    const result = mergePackageJson(original, incoming);
    expect(result).toBe(original);
    expect(result.dependencies).toBeDefined();
    expect(result.devDependencies).toBeUndefined();
  });

  it('handles if deps are only defined in incoming', () => {
    const original = genPackageJson();
    const incoming = genPackageJson({ dependencies: { b: '1.0.0' } });
    const result = mergePackageJson(original, incoming);
    expect(result === original).toBe(false); // new object returned
    // in this case it should deep equal incoming, with empty devDependencies added
    expect(result).toEqual({ ...incoming, devDependencies: {} });
  });

  it('preserves extra properties of original', () => {
    const original = genPackageJson({ b: 'c' });
    const incoming = genPackageJson({
      dependencies: { d: '1.0.0' },
      devDependencies: { e: '1.0.0' },
    });
    const result = mergePackageJson(original, incoming);
    expect(result === original).toBe(false); // new object returned
    expect(result).toEqual({ ...original, ...incoming });
  });

  it('merges in new deps and devDeps without overlap', () => {
    const original = genPackageJson({
      dependencies: { b: '1.0.0' },
      devDependencies: { c: '1.0.0' },
    });
    const incoming = genPackageJson({
      dependencies: { d: '1.0.0' },
      devDependencies: { e: '1.0.0' },
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
      ...incoming.devDependencies,
    });
  });

  it('does not change older incoming dep (with only one dep total)', () => {
    // one dep and incoming version is older => return original
    const original = genPackageJson({ dependencies: { b: '1.0.0' } });
    const incoming = genPackageJson({ dependencies: { b: '0.1.1' } });
    const result = mergePackageJson(original, incoming);
    expect(result).toBe(original);
  });

  it('does not change older incoming dep, merges new deps', () => {
    // incoming introduces a new dep but has old version of existing dep
    // => merge in added dep but keep newer version of existing dep
    const original = genPackageJson({ dependencies: { b: '1.0.0' } });
    const incoming = genPackageJson({ dependencies: { b: '0.1.1', c: '1.0.0' } });
    const result = mergePackageJson(original, incoming);
    expect(result === original).toBe(false);
    expect(result.dependencies).toEqual({ b: '1.0.0', c: '1.0.0' });
    expect(original.dependencies).toEqual({ b: '1.0.0' });
  });

  it('updates to new dep version (with only one dep total)', () => {
    // one dep and incoming version is newer => upgrade
    const original = genPackageJson({ dependencies: { b: '1.0.0' } });
    const incoming = genPackageJson({ dependencies: { b: '2.0.0' } });
    const result = mergePackageJson(original, incoming);
    expect(result.dependencies).toEqual(incoming.dependencies);
  });

  it('updates to new dep version, merges deps', () => {
    const original = genPackageJson({ dependencies: { b: '1.0.0', c: '1.0.0' } });
    const incoming = genPackageJson({ dependencies: { b: '2.0.0', d: '1.0.0' } });
    const result = mergePackageJson(original, incoming);
    expect(result.dependencies).toEqual({ b: '2.0.0', c: '1.0.0', d: '1.0.0' });
  });
});
