import { NDEFReader } from '../types';

declare global {
  interface Window {
    NDEFReader: {
      new (): NDEFReader;
    };
  }
}

export const checkNfcSupport = (): boolean => {
  return 'NDEFReader' in window;
};

const handleNfcError = (error: unknown): Error => {
  // Extract message reliably from Error or DOMException
  let message = "";
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'object' && error !== null && 'message' in error) {
    message = String((error as any).message);
  } else {
    message = String(error);
  }
  
  console.error("NFC Operation Error:", message);

  if (message.includes("top-level browsing context")) {
    return new Error("CONTEXT_ERROR");
  }
  
  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError') return new Error("Permiso NFC denegado. Asegúrate de desbloquear tu móvil y permitir el acceso.");
    if (error.name === 'NotSupportedError') return new Error("Web NFC no soportado en este dispositivo o conexión.");
  }
  
  return new Error(message || "Error desconocido de NFC");
};

export const writeNfcTag = async (
  message: string | Record<string, unknown> | ArrayBuffer
): Promise<void> => {
  if (!checkNfcSupport()) {
    throw new Error("Tu navegador no soporta Web NFC. Usa Chrome en Android.");
  }

  try {
    const ndef = new window.NDEFReader();
    
    if (typeof message === 'object' && !(message instanceof ArrayBuffer)) {
      // JSON Record
      const jsonString = JSON.stringify(message);
      const encoder = new TextEncoder();
      const records = [
        {
          recordType: "mime",
          mediaType: "application/json",
          data: encoder.encode(jsonString)
        }
      ];
      // The API accepts record array structure in implementation
      await ndef.write({ records });
    } else if (typeof message === 'string') {
        // String handling: Detect if it's a deep link or URL to ensure correct record type
        // This helps with custom schemes like instagram://
        const isUrl = /^[a-z0-9+.-]+:\/\/.+/i.test(message);
        
        if (isUrl) {
            await ndef.write({
                records: [{ recordType: "url", data: message }]
            });
        } else {
            await ndef.write(message);
        }
    } else {
      // ArrayBuffer or other
      await ndef.write(message);
    }
  } catch (error) {
    throw handleNfcError(error);
  }
};

export const scanNfcTag = async (
  onReading: (message: string, serialNumber: string) => void,
  onError: (error: string) => void,
  signal: AbortSignal
): Promise<void> => {
  if (!checkNfcSupport()) {
    onError("Web NFC no soportado.");
    return;
  }

  try {
    const ndef = new window.NDEFReader();
    await ndef.scan({ signal });

    ndef.onreading = (event) => {
      const decoder = new TextDecoder();
      let content = "";
      
      for (const record of event.message.records) {
        if (record.recordType === "text") {
            content += `Text: ${decoder.decode(record.data)}\n`;
        } else if (record.recordType === "url") {
            content += `URL: ${decoder.decode(record.data)}\n`;
        } else if (record.recordType === "mime") {
            if (record.mediaType === "application/json") {
                content += `JSON: ${decoder.decode(record.data)}\n`;
            } else {
                content += `MIME (${record.mediaType}): ${decoder.decode(record.data)}\n`;
            }
        } else {
            content += `Unknown Record (${record.recordType})\n`;
        }
      }
      
      onReading(content, event.serialNumber);
    };

    ndef.onreadingerror = () => {
      onError("Error leyendo. Mantén la etiqueta cerca.");
    };

  } catch (error) {
    const err = handleNfcError(error);
    onError(err.message);
  }
};