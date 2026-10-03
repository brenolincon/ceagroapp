// src/components/DocumentAttachment.tsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "expo-camera";
import { AttachmentImage, generatePdf, sharePdf } from "../utils/pdfGenerator";

interface Props {
  onFinish?: () => void;
  initialFolderName?: string;
  initialFileName?: string;
  autoStartSource?: "camera" | "gallery" | null;
  onUnsavedImagesChange?: (hasUnsavedImages: boolean) => void;
}

export function DocumentAttachment({
  onFinish,
  initialFolderName,
  initialFileName,
  autoStartSource = null,
  onUnsavedImagesChange,
}: Props) {
  const [images, setImages] = useState<AttachmentImage[]>([]);
  const [folderName, setFolderName] = useState(initialFolderName ?? "");
  const [fileName, setFileName] = useState(initialFileName ?? "");
  const [lastSavedUri, setLastSavedUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [failedImageUris, setFailedImageUris] = useState<string[]>([]);

  // --- Funções de Seleção/Captura ---
  const pickImage = async (source: "camera" | "gallery") => {
    let result: ImagePicker.ImagePickerResult | undefined;

    try {
      if (source === "camera") {
        console.log("Tentando solicitar permissão da câmera...");
        const { status } = await Camera.requestCameraPermissionsAsync();

        if (status !== "granted") {
          alert(
            "Permissão de Câmera negada. Verifique as configurações do app.",
          );
          console.error("Permissão de câmera negada. Status:", status);
          return;
        }

        console.log("Iniciando câmera...");
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 0.8,
          base64: true,
        });
      } else {
        // galeria
        console.log("Tentando solicitar permissão da galeria...");
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== "granted") {
          alert(
            "Permissão de Galeria negada. Verifique as configurações do app.",
          );
          console.error("Permissão de galeria negada. Status:", status);
          return;
        }

        console.log("Iniciando seleção da galeria...");
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 0.8,
          base64: true,
          allowsMultipleSelection: true,
        });
      }

      if (result && !result.canceled) {
        const newImages: AttachmentImage[] = result.assets.map((asset) => ({
          uri: asset.uri,
          base64: asset.base64 ?? undefined,
        }));
        console.log(`Imagens selecionadas: ${newImages.length}`);
        setImages((prev) => [...prev, ...newImages]);
      } else {
        console.log("Seleção cancelada pelo usuário ou resultado vazio.");
      }
    } catch (error) {
      // Captura qualquer erro inesperado durante o processo de seleção/câmera
      console.error(`Erro fatal ao tentar acessar ${source}:`, error);
      alert(
        `Erro inesperado ao abrir ${source}. Verifique o terminal para detalhes.`,
      );
    }
  };

  // --- Função de Remoção ---
  const removeImage = (uriToRemove: string) => {
    Alert.alert(
      "Remover Imagem",
      "Tem certeza que deseja remover este documento?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          onPress: () => {
            setImages((prev) => prev.filter((img) => img.uri !== uriToRemove));
            setFailedImageUris((prev) =>
              prev.filter((uri) => uri !== uriToRemove),
            );
          },
        },
      ],
    );
  };

  // --- Funções de Ação ---
  const handleSavePdf = async () => {
    if (saving) return;

    try {
      setSaving(true);
      const finalFileName =
        fileName.trim() || `Documento_${new Date().toISOString().slice(0, 10)}`;
      const finalFolderName = folderName.trim() || "Documentos";

      const result = await generatePdf(images, finalFileName, finalFolderName);

      if (!result) {
        return;
      }

      if (result.status === "invalid-pages") {
        const failedUris = result.failedPageIndexes
          .map((index) => images[index]?.uri)
          .filter((uri): uri is string => uri !== undefined);

        const failedPageNumbers = result.failedPageIndexes.map(
          (index) => index + 1,
        );

        setFailedImageUris(failedUris);

        Alert.alert(
          "Não foi possível validar todas as páginas",
          `Falha ao ler a(s) página(s) ${failedPageNumbers.join(", ")}. ` +
            "Nenhum PDF foi salvo. Tente novamente ou remova as páginas com falha.",
        );

        return;
      }

      setFailedImageUris([]);
      setLastSavedUri(result.uri);
      alert("PDF salvo com sucesso.");
      onFinish?.();
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Falha ao gerar o PDF. Verifique o terminal.");
    } finally {
      setSaving(false);
    }
  };

  const handleSharePdf = async () => {
    if (sharing) return;

    if (!lastSavedUri) {
      alert("Salve o PDF antes de compartilhar.");
      return;
    }

    try {
      setSharing(true);
      await sharePdf(lastSavedUri);
    } finally {
      setSharing(false);
    }
  };

  const hasPages = images.length > 0;

  useEffect(() => {
    onUnsavedImagesChange?.(images.length > 0);
  }, [images.length, onUnsavedImagesChange]);

  // Abrir automaticamente a câmera ao iniciar (para novo scanner)
  useEffect(() => {
    if (autoStartSource && !hasPages) {
      pickImage(autoStartSource);
    }
    // queremos chamar só uma vez ao montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Scanner de documentos</Text>

      {!hasPages && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Nenhuma página ainda</Text>
          <Text style={styles.emptySubtitle}>
            Toque em "Tirar foto" ou "Selecionar da galeria" para começar um
            novo scanner.
          </Text>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.primaryButton, styles.button]}
              onPress={() => pickImage("camera")}
            >
              <Text style={styles.primaryButtonText}>📸 Tirar foto</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryButton, styles.button]}
              onPress={() => pickImage("gallery")}
            >
              <Text style={styles.secondaryButtonText}>
                🖼️ Selecionar da galeria
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {hasPages && (
        <>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.primaryButton, styles.button]}
              onPress={() => pickImage("camera")}
            >
              <Text style={styles.primaryButtonText}>+ Página (câmera)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryButton, styles.button]}
              onPress={() => pickImage("gallery")}
            >
              <Text style={styles.secondaryButtonText}>+ Página (galeria)</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subHeader}>Páginas ({images.length})</Text>

          <ScrollView style={styles.imageScroll}>
            {images.map((img, index) => (
              <View key={img.uri} style={styles.imageContainer}>
                <Text style={styles.imageLabel}>Página {index + 1}</Text>
                <Image source={{ uri: img.uri }} style={styles.image} />
                {failedImageUris.includes(img.uri) && (
                  <View>
                    <Text style={styles.imageError}>
                      Não foi possível validar esta imagem. Tente novamente ou
                      remova a página.
                    </Text>

                    <TouchableOpacity
                      style={styles.retryButton}
                      onPress={handleSavePdf}
                      disabled={saving}
                    >
                      <Text style={styles.retryButtonText}>
                        {saving ? "Verificando..." : "Tentar novamente"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
                <TouchableOpacity
                  onPress={() => removeImage(img.uri)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeButtonText}>Remover</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <View style={styles.inputsRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Pasta</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Clientes_2026"
                value={folderName}
                onChangeText={setFolderName}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nome do PDF</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Contrato_Joao"
                value={fileName}
                onChangeText={setFileName}
              />
            </View>
          </View>

          <View style={styles.footerButtons}>
            <TouchableOpacity
              style={[styles.pdfButton, saving && styles.pdfButtonDisabled]}
              onPress={handleSavePdf}
              disabled={saving}
            >
              <Text style={styles.pdfButtonText}>
                {saving ? "Salvando..." : "Salvar PDF"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.shareButton,
                (!lastSavedUri || sharing) && styles.shareButtonDisabled,
              ]}
              onPress={handleSharePdf}
              disabled={!lastSavedUri || sharing}
            >
              <Text style={styles.shareButtonText}>
                {sharing ? "Compartilhando..." : "Compartilhar"}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f7f8fa",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 1,
  },
  header: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
    color: "#1f2933",
  },
  clientName: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 16,
  },
  subHeader: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 5,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  imageScroll: {
    flex: 1,
  },
  imageContainer: {
    marginBottom: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    backgroundColor: "#ffffff",
  },
  imageLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    color: "#4b5563",
  },
  image: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
    borderRadius: 6,
  },
  removeButton: {
    marginTop: 10,
    paddingVertical: 6,
    borderRadius: 999,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fef2f2",
  },
  removeButtonText: {
    color: "#b91c1c",
    fontWeight: "600",
  },
  placeholder: {
    textAlign: "center",
    color: "#9ca3af",
    marginTop: 16,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: "#2563eb",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#e5e7eb",
  },
  secondaryButtonText: {
    color: "#111827",
    fontWeight: "600",
  },
  pdfButton: {
    marginTop: 20,
    borderRadius: 999,
    backgroundColor: "#16a34a",
    paddingVertical: 12,
    alignItems: "center",
  },
  pdfButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  pdfButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
  },
  inputsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#ffffff",
    fontSize: 14,
    color: "#111827",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
  },
  footerButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  shareButton: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: "#e5e7eb",
    paddingVertical: 12,
    alignItems: "center",
  },
  shareButtonDisabled: {
    backgroundColor: "#d1d5db",
  },
  shareButtonText: {
    color: "#111827",
    fontWeight: "600",
    fontSize: 15,
  },
  imageError: {
    marginTop: 8,
    color: "#b91c1c",
    fontSize: 13,
  },
  retryButton: {
    marginTop: 8,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#fef2f2",
  },
  retryButtonText: {
    color: "#b91c1c",
    fontWeight: "600",
  },
});
