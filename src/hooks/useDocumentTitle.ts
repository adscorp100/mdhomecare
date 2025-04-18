import { useEffect } from 'react';

/**
 * A custom hook for setting the document title
 * @param title The title to set
 * @param suffix Optional suffix to append to the title (e.g. site name)
 */
const useDocumentTitle = (title: string, suffix: string = 'MD Homecare'): void => {
  useEffect(() => {
    // Set the document title with the suffix
    const formattedTitle = suffix ? `${title} | ${suffix}` : title;
    document.title = formattedTitle;
    
    // Reset the title when the component unmounts
    return () => {
      document.title = 'MD Homecare';
    };
  }, [title, suffix]);
};

export default useDocumentTitle; 