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

export { downloadFile };
