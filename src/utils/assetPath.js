// Utility function to resolve asset paths with PUBLIC_URL prefix
export const getAssetPath = (filename) => {
  return `${process.env.PUBLIC_URL}/${filename}`;
};
