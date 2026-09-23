import React, { useEffect, useState, useRef } from 'react';

const PwaBanner = () => {
  const [show, setShow] = useState(false);
  const deferredPrompt = useRef(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      deferredPrompt.current = e;
      if (!sessionStorage.getItem('av_install_snoozed')) {
        const timer = setTimeout(() => setShow(true), 2000);
        return () => clearTimeout(timer);
      }
    };

    const handleAppInstalled = () => {
      deferredPrompt.current = null;
      setShow(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt.current) return;
    deferredPrompt.current.prompt();
    await deferredPrompt.current.userChoice;
    deferredPrompt.current = null;
    setShow(false);
  };

  const handleDismiss = () => {
    setShow(false);
    sessionStorage.setItem('av_install_snoozed', '1');
  };

  return (
    <div className={`pwa-banner ${show ? 'show' : ''}`}>
      <div className="pwa-text">
        <strong>Install Avexi Farm</strong>
        <span>Add to your home screen for quick access</span>
      </div>
      <div className="pwa-actions">
        <button className="btn-pwa-install" onClick={handleInstall}>Install</button>
        <button className="btn-pwa-dismiss" onClick={handleDismiss}>Not now</button>
      </div>
    </div>
  );
};

export default PwaBanner;
