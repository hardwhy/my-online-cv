import { getCvDownloadUrl } from '../lib/storage';

type DownloadCvButtonProps = {
  className?: string;
};

export function DownloadCvButton({ className = 'btn-primary' }: DownloadCvButtonProps) {
  const downloadUrl = getCvDownloadUrl();

  const handleDownload = () => {
    if (!downloadUrl) return;
    
    // Track the download event
    window.dispatchEvent(new CustomEvent('portfolio:cv-download'));
    
    // Open in new tab which usually triggers download or browser PDF viewer
    window.open(downloadUrl, '_blank');
  };

  return (
    <button className={className} type="button" onClick={handleDownload}>
      Download CV
    </button>
  );
}
