function copyWithGettersAndSetters(source: any): any {
  const descriptors = Object.getOwnPropertyDescriptors(source);
  return Object.create(Object.getPrototypeOf(source), descriptors);
}

export { copyWithGettersAndSetters };
