import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { generateCard } from '../utils/generateCard';

export const useCardGenerator = () => {
  const [cardDataUrl, setCardDataUrl] = useState(null);
  const [cardGenerated, setCardGenerated] = useState(false);
  const [generatingCard, setGeneratingCard] = useState(false);

  const generate = useCallback(async ({
    memberData,
    memberDbId,
    photoPreviewUrl,
    logoSrc,
  }) => {
    if (!memberData) return;

    setGeneratingCard(true);

    try {
      const dataUrl = await generateCard({
        memberData,
        memberDbId,
        photoPreviewUrl,
        logoSrc,
      });

      setCardDataUrl(dataUrl);
      setCardGenerated(true);
    } catch (err) {
      console.error(err);
      toast.error('Could not generate membership card.');
    } finally {
      setGeneratingCard(false);
    }
  }, []);

  return {
    cardDataUrl,
    cardGenerated,
    generatingCard,
    generateCard: generate,
  };
};