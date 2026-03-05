// src/utils/pdfGenerator.ts
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";

export type AttachmentImage = {
  uri: string;
  base64?: string;
};

export async function generatePdf(
  images: AttachmentImage[],
  nomeArquivo: string,
  folderName: string
) {
  if (images.length === 0) {
    alert("Nenhuma imagem para gerar o PDF.");
    return null;
  }

  // Converte cada URI para base64 e monta <img> em data URL
  const htmlContent = await Promise.all(
    images.map(async (img) => {
      try {
        const base64 =
          img.base64 ||
          (await FileSystem.readAsStringAsync(img.uri, {
            encoding: FileSystem.EncodingType.Base64,
          }));

        return `
          <div style="page-break-after: always; text-align: center; margin: 0; padding: 0;">
            <img 
              src="data:image/jpeg;base64,${base64}" 
              style="width: 100%; height: auto; display: block; margin: 0; padding: 0;"
            />
          </div>
        `;
      } catch {
        // Se alguma imagem falhar, apenas ignora essa página
        return "";
      }
    })
  );

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
        ${htmlContent.join("")}
      </body>
    </html>
  `;

  try {
    const { uri: tempUri } = await Print.printToFileAsync({
      html: fullHtml,
    });

    const safeFolder = folderName.replace(/\s/g, "_") || "Documentos";
    const dirUri = `${FileSystem.cacheDirectory}${safeFolder}/`;

    try {
      await FileSystem.makeDirectoryAsync(dirUri, { intermediates: true });
    } catch {
      // se já existir, ignorar erro
    }

    const safeName = nomeArquivo.replace(/\s/g, "_") || "Documento_scanner";
    const targetUri = `${dirUri}${safeName}_${Date.now()}.pdf`;

    await FileSystem.moveAsync({
      from: tempUri,
      to: targetUri,
    });

    return targetUri;
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
    const root = FileSystem.cacheDirectory ?? "";
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
