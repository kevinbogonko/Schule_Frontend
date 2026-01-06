// fakeApiService.js
class FakeApiService {
  constructor() {
    this.db = this.loadDB();
    this.uploadProgressCallbacks = new Map();
    this.ingestionProgressCallbacks = new Map();
  }

  loadDB() {
    // Try to load from localStorage, fallback to initial data
    const saved = localStorage.getItem("document_ingestion_db");
    if (saved) {
      return JSON.parse(saved);
    }

    return {
      documents: [],
      settings: {
        supportedFormats: [".pdf", ".doc", ".docx", ".txt", ".md"],
        maxFileSize: 10485760, // 10MB
      },
    };
  }

  saveDB() {
    localStorage.setItem("document_ingestion_db", JSON.stringify(this.db));
  }

  // Simulate API delay
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Upload endpoint
  async uploadFiles(formData) {
    await this.delay(1000); // Simulate network delay

    const files = formData.getAll("files");
    const metadata = JSON.parse(formData.get("metadata") || "{}");

    const results = [];

    for (const file of files) {
      const documentId = `doc_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      const newDocument = {
        id: documentId,
        filename: file.name,
        size: file.size,
        status: "uploaded",
        chunks: 0,
        toc_entries: 0,
        uploadedAt: new Date().toISOString(),
        metadata: metadata,
        processingLogs: [
          {
            step: "uploading",
            timestamp: new Date().toISOString(),
            status: "completed",
          },
        ],
      };

      this.db.documents.unshift(newDocument);
      results.push(newDocument);

      // Start ingestion process simulation
      this.simulateIngestion(documentId);
    }

    this.saveDB();
    return { files: results };
  }

  // Simulate the ingestion process
  async simulateIngestion(documentId) {
    const steps = [
      { name: "extracting", label: "Extracting text...", duration: 2000 },
      { name: "chunking", label: "Creating chunks...", duration: 1500 },
      { name: "embedding", label: "Embedding to Qdrant...", duration: 3000 },
      { name: "indexing", label: "Creating TOC entries...", duration: 1000 },
    ];

    let document = this.db.documents.find((doc) => doc.id === documentId);
    if (!document) return;

    for (const [index, step] of steps.entries()) {
      // Update progress
      const progress = Math.round(((index + 1) / (steps.length + 1)) * 100);
      this.notifyIngestionProgress(documentId, step.name, progress);

      // Update document status
      document.status = "processing";
      document.processingLogs.push({
        step: step.name,
        timestamp: new Date().toISOString(),
        status: "in-progress",
      });
      this.saveDB();

      // Simulate processing time
      await this.delay(step.duration);

      // Mark step as completed
      const logIndex = document.processingLogs.findIndex(
        (log) => log.step === step.name && log.status === "in-progress"
      );
      if (logIndex !== -1) {
        document.processingLogs[logIndex].status = "completed";
      }

      // Add some random results
      if (step.name === "chunking") {
        document.chunks = Math.floor(Math.random() * 50) + 10;
      } else if (step.name === "indexing") {
        document.toc_entries = Math.floor(Math.random() * 20) + 5;
      }
    }

    // Final completion
    document.status = "processed";
    this.notifyIngestionProgress(documentId, "complete", 100);
    this.saveDB();
  }

  // Get all documents
  async getDocuments() {
    await this.delay(500);
    return { documents: this.db.documents };
  }

  // Get single document
  async getDocument(id) {
    await this.delay(300);
    const document = this.db.documents.find((doc) => doc.id === id);
    if (!document) {
      throw new Error("Document not found");
    }
    return { document };
  }

  // Delete document
  async deleteDocument(id) {
    await this.delay(500);
    this.db.documents = this.db.documents.filter((doc) => doc.id !== id);
    this.saveDB();
    return { success: true };
  }

  // Progress notification methods
  onUploadProgress(callback) {
    this.uploadProgressCallback = callback;
  }

  onIngestionProgress(documentId, callback) {
    this.ingestionProgressCallbacks.set(documentId, callback);
  }

  notifyIngestionProgress(documentId, step, progress) {
    const callback = this.ingestionProgressCallbacks.get(documentId);
    if (callback) {
      callback({ step, progress });
    }
  }
}

// Singleton instance
export const fakeApi = new FakeApiService();
