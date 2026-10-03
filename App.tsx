// App.tsx
import { useEffect, useState, useCallback } from "react";
import {
  Alert,
  BackHandler,
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"; // <-- NOVA IMPORTAÇÃO
import { DocumentAttachment } from "./src/components/DocumentAttachment";
import { listSavedPdfs, SavedPdf, sharePdf } from "./src/utils/pdfGenerator";

type Screen = "home" | "scanner" | "detail";

function HomeScreen({
  onNewScan,
  onOpenDetail,
}: {
  onNewScan: () => void;
  onOpenDetail: (doc: SavedPdf) => void;
}) {
  const [docs, setDocs] = useState<SavedPdf[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const items = await listSavedPdfs();
    setDocs(items);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Scanner de Documentos</Text>

        <TouchableOpacity style={styles.newScanButton} onPress={onNewScan}>
          <Text style={styles.newScanButtonText}>+ Novo scanner</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Histórico de documentos</Text>
            <TouchableOpacity onPress={load}>
              <Text style={styles.sectionAction}>
                {loading ? "Atualizando..." : "Atualizar"}
              </Text>
            </TouchableOpacity>
          </View>

          {docs.length === 0 && !loading && (
            <Text style={styles.emptyHistoryText}>
              Nenhum PDF salvo ainda. Crie um novo scanner para começar.
            </Text>
          )}

          {docs.map((doc) => (
            <TouchableOpacity
              key={doc.uri}
              style={styles.historyItem}
              onPress={() => onOpenDetail(doc)}
            >
              <Text style={styles.historyName}>{doc.name}</Text>
              <Text style={styles.historyMeta}>{doc.folder}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ScannerScreen({
  onFinish,
  onBack,
  initialFolderName,
  initialFileName,
  autoStartSource = "camera",
}: {
  onFinish: () => void;
  onBack: () => void;
  initialFolderName?: string;
  initialFileName?: string;
  autoStartSource?: "camera" | "gallery" | null;
}) {
  const [hasUnsavedImages, setHasUnsavedImages] = useState(false);
  const requestExit = useCallback(() => {
    if (!hasUnsavedImages) {
      onBack();
      return;
    }

    Alert.alert(
      "Descartar digitalização?",
      "As imagens capturadas ainda não foram salvas em PDF. Se sair agora, elas serão perdidas.",
      [
        {
          text: "Continuar editando",
          style: "cancel",
        },
        {
          text: "Descartar e sair",
          style: "destructive",
          onPress: onBack,
        },
      ],
    );
  }, [hasUnsavedImages, onBack]);
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        requestExit();
        return true;
      },
    );

    return () => subscription.remove();
  }, [requestExit]);
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={requestExit} style={styles.backButton}>
            <Text style={styles.backButtonText}>◀</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Novo scanner</Text>
          <View style={styles.backButtonPlaceholder} />
        </View>

        <View style={styles.section}>
          <DocumentAttachment
            onFinish={onFinish}
            initialFolderName={initialFolderName}
            initialFileName={initialFileName}
            autoStartSource={autoStartSource}
            onUnsavedImagesChange={setHasUnsavedImages}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailScreen({
  doc,
  onAddImages,
  onBack,
}: {
  doc: SavedPdf;
  onAddImages: () => void;
  onBack: () => void;
}) {
  const handleShare = async () => {
    await sharePdf(doc.uri);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>◀</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Detalhes do documento</Text>
          <View style={styles.backButtonPlaceholder} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{doc.name}</Text>
          <Text style={styles.detailMeta}>Pasta: {doc.folder}</Text>
          <Text style={styles.detailMeta}>
            Tamanho: {(doc.size / (1024 * 1024)).toFixed(2)} MB
          </Text>

          <View style={styles.detailButtons}>
            <TouchableOpacity
              style={styles.newScanButton}
              onPress={onAddImages}
            >
              <Text style={styles.newScanButtonText}>
                + Adicionar novas imagens
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shareExistingButton}
              onPress={handleShare}
            >
              <Text style={styles.shareExistingButtonText}>
                Compartilhar PDF
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ----------------------------------------------------
// 4. Componente Exportado (Wrapper)
// ----------------------------------------------------
export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedDoc, setSelectedDoc] = useState<SavedPdf | null>(null);

  return (
    <SafeAreaProvider>
      {screen === "home" ? (
        <HomeScreen
          onNewScan={() => {
            setSelectedDoc(null);
            setScreen("scanner");
          }}
          onOpenDetail={(doc) => {
            setSelectedDoc(doc);
            setScreen("detail");
          }}
        />
      ) : screen === "scanner" ? (
        <ScannerScreen
          onFinish={() => setScreen("home")}
          onBack={() => setScreen("home")}
          initialFolderName={selectedDoc?.folder}
          initialFileName={
            selectedDoc
              ? selectedDoc.name.replace(/\.pdf$/i, "") + "_novo"
              : undefined
          }
          autoStartSource="camera"
        />
      ) : selectedDoc ? (
        <DetailScreen
          doc={selectedDoc}
          onBack={() => setScreen("home")}
          onAddImages={() => setScreen("scanner")}
        />
      ) : null}
    </SafeAreaProvider>
  );
}

// ----------------------------------------------------
// 5. Estilos
// ----------------------------------------------------
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    // O SafeAreaView do Context lida com o padding superior automaticamente.
    // Removendo o paddingTop condicional do Platform.
  },
  container: {
    flexGrow: 1,
    padding: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  section: {
    marginVertical: 10,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#1a1a1a",
  },
  newScanButton: {
    marginVertical: 10,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: "#2563eb",
    alignItems: "center",
  },
  newScanButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionAction: {
    fontSize: 14,
    color: "#2563eb",
    fontWeight: "500",
  },
  emptyHistoryText: {
    fontSize: 14,
    color: "#6b7280",
  },
  historyItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  historyName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  historyMeta: {
    fontSize: 12,
    color: "#6b7280",
  },
  detailMeta: {
    fontSize: 14,
    color: "#4b5563",
    marginTop: 4,
  },
  detailButtons: {
    marginTop: 16,
    gap: 12,
  },
  shareExistingButton: {
    marginTop: 4,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
  },
  shareExistingButtonText: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "600",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    fontSize: 18,
    color: "#2563eb",
  },
  backButtonPlaceholder: {
    width: 40,
    height: 40,
  },
});
