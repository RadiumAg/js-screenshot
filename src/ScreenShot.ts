import html2canvas from 'html2canvas';

class ScreenShot {
  shot() {
    html2canvas(document.body).then(canvas => {
      document.body.append(canvas);
    });
  }
}

export default ScreenShot;
