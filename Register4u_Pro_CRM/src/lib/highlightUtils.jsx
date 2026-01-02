import React from 'react';

/**
 * Highlights matching text in a string with a yellow background
 * @param {string} text - The text to search and highlight in
 * @param {string} searchTerm - The search term to highlight
 * @param {string} className - Optional custom CSS class for highlighting
 * @returns {React.ReactElement} - JSX with highlighted text
 */
export const highlightText = (text, searchTerm, className = 'bg-yellow-200 px-1 rounded') => {
  // Return original text if no search term or text
  if (!searchTerm || !text || typeof text !== 'string') {
    return <span>{text}</span>;
  }

  // Escape special regex characters in search term
  const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Create case-insensitive regex with global flag
  const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
  
  // Split text by matches, keeping the delimiters
  const parts = text.split(regex);
  
  return (
    <span>
      {parts.map((part, index) => {
        // Check if this part matches the search term (case-insensitive)
        const isMatch = new RegExp(`^${escapedSearchTerm}$`, 'i').test(part);
        
        return isMatch ? (
          <span key={index} className={className}>
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        );
      })}
    </span>
  );
};

/**
 * Utility to check if text contains search term (case-insensitive)
 * Useful for conditional rendering or additional logic
 */
export const containsSearchTerm = (text, searchTerm) => {
  if (!searchTerm || !text || typeof text !== 'string') {
    return false;
  }
  
  return text.toLowerCase().includes(searchTerm.toLowerCase());
};

/**
 * Highlight component for easier usage in JSX
 */
export const HighlightText = ({ 
  text, 
  searchTerm, 
  className = 'bg-yellow-200 px-1 rounded',
  fallback = 'N/A' 
}) => {
  const displayText = text || fallback;
  return highlightText(displayText, searchTerm, className);
};

export default highlightText;