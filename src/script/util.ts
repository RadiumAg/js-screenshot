function parseArgs() {
  const args = process.argv.slice(2);
  const result: Record<string, string> = {};
  // Iterate through the args array to parse key-value pairs
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const value = args[i + 1];
      if (value && !value.startsWith('--')) {
        result[key] = value;
        i++;
      }
      else {
        result[key] = '';
      }
    }
  }
  return result;
}
