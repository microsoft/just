export function wrapTask(fn: any) {
  return function(done: any) {
    let origFn = fn;
    if (fn.unwrap) {
      origFn = fn.unwrap();
    }

    if (origFn.length > 0) {
      (fn as any).call(null, done);
    } else {
      let results = (fn as any).call();
      if (results && results.then) {
        results
          .then(() => {
            done();
          })
          .catch((e: any) => {
            done(e);
          });
      } else {
        done();
      }
    }
  };
}
