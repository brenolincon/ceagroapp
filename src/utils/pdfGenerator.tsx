// src/utils/pdfGenerator.ts
import { Image as NativeImage } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";

function validateImageUri(uri: string): Promise<void> {
  return new Promise((resolve, reject) => {
    NativeImage.getSize(
      uri,
      (width, height) => {
        if (width > 0 && height > 0) {
          resolve();
        } else {
          reject(new Error("A imagem não possui dimensões válidas."));
        }
      },
      reject,
    );
  });
}

function getSavedDocumentsRoot(): string {
  const documentDirectory = FileSystem.cacheDirectory;
  if (!documentDirectory) {
    throw new Error("Diretório de documentos indisponível.");
  }
  return `${documentDirectory}CeagroDocumentos/`;
}

function sanitizePathPart(value: string, fallback: string): string {
  const sanitized = value
    .trim()
    .replace(/[<>:"|?*\\]/g, "_")
    .replace(/\//g, "_")
    .replace(/[\u0000-\u001F]/g, "_")
    .replace(/\s+/g, "_")
    .replace(/^\.+|\.+$/g, "");

  return sanitized || fallback;
}

export type AttachmentImage = {
  uri: string;
  base64?: string;
};

export type PdfGenerationResult =
  | { status: "saved"; uri: string }
  | { status: "invalid-pages"; failedPageIndexes: number[] }
  | null;

export async function generatePdf(
  images: AttachmentImage[],
  nomeArquivo: string,
  folderName: string,
): Promise<PdfGenerationResult> {
  if (images.length === 0) {
    alert("Nenhuma imagem para gerar o PDF.");
    return null;
  }

  // Converte cada URI para base64 e registra falhas por número de página
  const htmlPages: { html: string; failedPage?: number }[] = await Promise.all(
    images.map(async (img, index) => {
      try {
        await validateImageUri(img.uri);

        const base64 =
          img.base64 ||
          (await FileSystem.readAsStringAsync(img.uri, {
            encoding: FileSystem.EncodingType.Base64,
          }));

        if (!base64.trim()) {
          throw new Error("A imagem não contém dados.");
        }

        return {
          html: `
            <div style="page-break-after: always; text-align: center; margin: 0; padding: 0;">
              <img
                src="data:image/jpeg;base64,${base64}"
                style="width: 100%; height: auto; display: block; margin: 0; padding: 0;"
              />
            </div>
          `,
        };
      } catch (error) {
        const pageNumber = index + 1;
        console.error(`Não foi possível ler a página ${pageNumber}:`, error);

        return {
          html: "",
          failedPage: pageNumber,
        };
      }
    }),
  );

  const failedPages = htmlPages
    .filter((page) => page.failedPage !== undefined)
    .map((page) => page.failedPage!);

  if (failedPages.length > 0) {
    return {
      status: "invalid-pages",
      failedPageIndexes: failedPages,
    };
  }

  // HTML mínimo, sem textos, apenas as imagens
  const fullHtml = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
        <style>
          @page {
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
          }
        </style>
      </head>
      <body>
        ${htmlPages.map((page) => page.html).join("")}
      </body>
    </html>
  `;

  try {
    const { uri: tempUri } = await Print.printToFileAsync({
      html: fullHtml,
    });
    const safeFolder = sanitizePathPart(folderName, "Documentos");
    const dirUri = `${getSavedDocumentsRoot()}${safeFolder}/`;

    const dirInfo = await FileSystem.getInfoAsync(dirUri);

    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(dirUri, { intermediates: true });
    }

    const safeName = sanitizePathPart(nomeArquivo, "Documento_scanner");
    const targetUri = `${dirUri}${safeName}_${Date.now()}.pdf`;

    await FileSystem.moveAsync({
      from: tempUri,
      to: targetUri,
    });

    return { status: "saved", uri: targetUri };
  } catch (error) {
    console.error("Erro ao gerar/compartilhar PDF:", error);
    alert("Houve um erro ao tentar gerar o PDF.");
    return null;
  }
}

export async function sharePdf(uri: string) {
  try {
    if (!uri) {
      alert("Nenhum PDF salvo para compartilhar.");
      return;
    }

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        UTI: "com.adobe.pdf",
      });
    } else {
      alert("Compartilhamento não disponível no seu dispositivo.");
    }
  } catch (error) {
    console.error("Erro ao compartilhar PDF:", error);
    alert("Houve um erro ao tentar compartilhar o PDF.");
  }
}

export type SavedPdf = {
  uri: string;
  name: string;
  folder: string;
  size: number;
  modifiedAt: number;
};

export async function listSavedPdfs(): Promise<SavedPdf[]> {
  try {
    const root = getSavedDocumentsRoot();
    const rootInfo = await FileSystem.getInfoAsync(root);

    if (!rootInfo.exists) {
      return [];
    }

    const folders = await FileSystem.readDirectoryAsync(root);

    const all: SavedPdf[] = [];

    for (const folder of folders) {
      const folderUri = `${root}${folder}/`;
      let files: string[] = [];
      try {
        files = await FileSystem.readDirectoryAsync(folderUri);
      } catch {
        continue;
      }

      for (const file of files) {
        if (!file.toLowerCase().endsWith(".pdf")) continue;

        const fileUri = `${folderUri}${file}`;
        const info = await FileSystem.getInfoAsync(fileUri);
        if (!info.exists) continue;

        all.push({
          uri: fileUri,
          name: file,
          folder,
          size: info.size ?? 0,
          modifiedAt: info.modificationTime ?? 0,
        });
      }
    }

    // ordem: mais recentes primeiro
    return all.sort((a, b) => b.modifiedAt - a.modifiedAt);
  } catch (error) {
    console.error("Erro ao listar PDFs salvos:", error);
    return [];
  }
}
