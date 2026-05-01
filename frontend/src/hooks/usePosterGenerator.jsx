import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { generatePoster } from '../utils/generatePoster';

export const usePosterGenerator = () => {
  const [posterDataUrl, setPosterDataUrl] = useState(null);
  const [posterGenerated, setPosterGenerated] = useState(false);
  const [generatingPoster, setGeneratingPoster] = useState(false);

  const generate = useCallback(async ({
    memberData,
    photoPreviewUrl,
    templateSrc,
    canvas,
  }) => {
    if (!memberData || !canvas) return;

    setGeneratingPoster(true);

    try {
      const dataUrl = await generatePoster({
        memberData,
        photoPreviewUrl,
        templateSrc,
        canvas,
      });

      setPosterDataUrl(dataUrl);
      setPosterGenerated(true);
    } catch (err) {
      console.error(err);
      toast.error('Could not generate poster.');
    } finally {
      setGeneratingPoster(false);
    }
  }, []);

  return {
    posterDataUrl,
    posterGenerated,
    generatingPoster,
    generatePoster: generate,
  };
};