export function toBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onload = () => {
      // ensure we return a string (data URL)
      resolve(typeof reader.result === 'string' ? reader.result : '');
    };
    reader.onerror = (error) => reject(error);
    // set handlers before starting the read
    reader.readAsDataURL(file);
  });
};