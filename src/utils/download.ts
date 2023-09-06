const useDownLoad = () => {
  return (name: string, url: string) => {
    const aElement = document.createElement('a');
    aElement.href = url;
    aElement.download = name;

    aElement.click();
  };
};

export { useDownLoad };
