export const defaultPdfFileName = 'ayi-hardiyanto-cv.pdf';

type DownloadBlobOptions = {
  fileName?: string;
};

export function downloadBlob(blob: Blob, options: DownloadBlobOptions = {}) {
  const fileName = options.fileName ?? defaultPdfFileName;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
}

export function printBlob(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const frame = document.createElement('iframe');

  frame.style.position = 'fixed';
  frame.style.right = '0';
  frame.style.bottom = '0';
  frame.style.width = '0';
  frame.style.height = '0';
  frame.style.border = '0';
  frame.src = url;

  frame.onload = () => {
    frame.contentWindow?.focus();
    frame.contentWindow?.print();
    setTimeout(() => {
      frame.remove();
      URL.revokeObjectURL(url);
    }, 1000);
  };

  document.body.appendChild(frame);
}
