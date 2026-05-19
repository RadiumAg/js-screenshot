/**
 * 下载文件工具函数
 */
function downloadFile(name: string, url: string) {
  const aElement = document.createElement('a');
  aElement.href = url;
  aElement.download = name;
  aElement.click();

  // 延迟释放 ObjectURL 避免下载中断
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

/**
 * @deprecated 请使用 downloadFile 代替
 */
// eslint-disable-next-line react/no-unnecessary-use-prefix -- 保留向后兼容，新代码应使用 downloadFile
function useDownLoad() {
  return (name: string, url: string) => {
    downloadFile(name, url);
  };
}

export { downloadFile, useDownLoad };
