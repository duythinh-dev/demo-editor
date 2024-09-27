export async function imageUploadHandler(image) {
  // TODO: create link to image in local
  const file = image; // Lấy file từ input
  if (file) {
    const blobURL = URL.createObjectURL(file); // Tạo link blob từ file
    console.log("Blob URL:", blobURL); // In ra link blob
    return blobURL;
  }
  return null;
}
