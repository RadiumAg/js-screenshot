function getArgs() {
  const args = process.argv.slice(2);
  const parsedArgs: Record<string, any> = {};

  // 遍历参数数组，解析键值对
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    const value = args[i + 1];
    parsedArgs[key] = value;
  }

  return parsedArgs;
}

export { getArgs };
