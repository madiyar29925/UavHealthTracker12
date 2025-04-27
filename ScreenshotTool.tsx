import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { Button } from '@/components/ui/button';

export default function ScreenshotTool() {
  const [loading, setLoading] = useState(false);
  
  const takeScreenshot = async () => {
    try {
      setLoading(true);
      
      // Capture the main content area
      const mainElement = document.querySelector('main');
      if (!mainElement) {
        console.error('Main element not found');
        return;
      }
      
      // Create canvas from the element
      const canvas = await html2canvas(mainElement, {
        scale: 2, // Higher scale for better quality
        logging: false,
        useCORS: true,
        allowTaint: true,
      });
      
      // Convert to blob
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Failed to create blob');
          return;
        }
        
        // Save using FileSaver
        const timestamp = new Date().toISOString().replace(/:/g, '-').substring(0, 19);
        saveAs(blob, `uav-dashboard-${timestamp}.png`);
        setLoading(false);
      });
    } catch (error) {
      console.error('Error taking screenshot:', error);
      setLoading(false);
    }
  };
  
  const takeMobileScreenshot = async () => {
    try {
      setLoading(true);
      
      // Create a mobile viewport simulation
      const virtualMobile = document.createElement('div');
      virtualMobile.style.position = 'fixed';
      virtualMobile.style.width = '375px'; // iPhone size
      virtualMobile.style.height = '667px';
      virtualMobile.style.overflow = 'hidden';
      virtualMobile.style.zIndex = '-1000';
      virtualMobile.style.opacity = '0';
      virtualMobile.style.left = '-1000px';
      virtualMobile.style.top = '0';
      
      // Clone the main element into our virtual mobile view
      const mainElement = document.querySelector('main');
      if (!mainElement) {
        console.error('Main element not found');
        return;
      }
      
      const clone = mainElement.cloneNode(true) as HTMLElement;
      clone.style.width = '375px';
      clone.style.transformOrigin = 'top left';
      clone.style.transform = 'scale(1)';
      
      virtualMobile.appendChild(clone);
      document.body.appendChild(virtualMobile);
      
      // Take screenshot of the virtual mobile element
      const canvas = await html2canvas(virtualMobile, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        width: 375,
        height: 667
      });
      
      // Clean up
      document.body.removeChild(virtualMobile);
      
      // Convert to blob and save
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Failed to create blob');
          return;
        }
        
        const timestamp = new Date().toISOString().replace(/:/g, '-').substring(0, 19);
        saveAs(blob, `uav-mobile-view-${timestamp}.png`);
        setLoading(false);
      });
    } catch (error) {
      console.error('Error taking mobile screenshot:', error);
      setLoading(false);
    }
  };
  
  return (
    <div className="mt-4 flex space-x-4">
      <Button 
        onClick={takeScreenshot} 
        disabled={loading}
        variant="outline"
      >
        {loading ? 'Создание...' : 'Сделать скриншот'}
      </Button>
      
      <Button 
        onClick={takeMobileScreenshot} 
        disabled={loading}
        variant="outline"
        className="bg-blue-50"
      >
        {loading ? 'Создание...' : 'Сделать мобильный скриншот'}
      </Button>
    </div>
  );
}