const API_BASE_URL = import.meta.env.VITE_API_URL || "krishnasoftwarebackend.vercel.app/api";
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const getToken = () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Your session has expired. Please log in again.");
  return token;
};

const request = async (path, options = {}) => {
  const token = getToken();
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
  } catch {
    throw new Error("Unable to connect to the server. Check that the backend is running and try again.");
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("The server returned an invalid response.");
  }

  if (!response.ok) {
    throw new Error(data.message || "The request could not be completed.");
  }
  return data;
};

const encodeFile = async (file) => {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const chunkSize = 0x8000;
  let binary = "";

  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }

  return btoa(binary);
};

export const getDocuments = async () => {
  const data = await request("/documents");
  return data.documents;
};

export const saveDocument = async (document, file) => {
  if (!(file instanceof File)) throw new Error("Select a file before uploading.");
  if (!file.size || file.size > MAX_FILE_SIZE) {
    throw new Error("Choose a file that is no larger than 10 MB.");
  }

  const data = await request("/documents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...document,
      file: {
        name: file.name,
        contentType: file.type || "application/octet-stream",
        size: file.size,
        data: await encodeFile(file),
      },
    }),
  });

  window.dispatchEvent(new Event("kdms:documents-changed"));
  return data.document;
};

export const openDocumentFile = async (documentId) => {
  const newTab = window.open("about:blank", "_blank");
  if (!newTab) {
    throw new Error("Allow pop-ups for this site to open files in a new tab.");
  }

  newTab.opener = null;
  newTab.document.title = "Opening file...";
  newTab.document.body.textContent = "Loading file...";

  let objectUrl;
  try {
    const token = getToken();
    let response;
    try {
      response = await fetch(`${API_BASE_URL}/documents/${encodeURIComponent(documentId)}/file`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      throw new Error("Unable to connect to the server. Check that the backend is running and try again.");
    }

    if (!response.ok) {
      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error("The server returned an invalid response.");
      }
      throw new Error(data.message || "Could not open this file.");
    }

    const file = await response.blob();
    objectUrl = URL.createObjectURL(file);
    newTab.location.replace(objectUrl);
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 5 * 60 * 1000);
  } catch (error) {
    newTab.close();
    throw error;
  }
};
