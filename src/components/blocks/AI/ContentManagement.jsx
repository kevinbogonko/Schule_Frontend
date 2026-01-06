// import React, { useEffect, useState } from "react";
// import { fakeApi } from './fakeApiService';

// const DocumentExplorer = () => {
//   const [files, setFiles] = useState([]);
//   const [tocEntries, setTocEntries] = useState([]);
//   const [chunks, setChunks] = useState([]);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [selectedTocNode, setSelectedTocNode] = useState(null);
//   const [selectedChunk, setSelectedChunk] = useState(null);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [regenerating, setRegenerating] = useState(false);

//   useEffect(() => {
//     loadData();
//   }, []);

//   // Load data from our fake backend
//   const loadData = async () => {
//     try {
//       setLoading(true);
      
//       // Load documents and generate TOC entries and chunks from them
//       const documentsResponse = await fakeApi.getDocuments();
//       const documents = documentsResponse.documents || [];
      
//       setFiles(documents);
      
//       // Auto-select first file if available
//       if (documents.length > 0) {
//         handleFileSelect(documents[0]);
//       }
      
//       // Generate TOC entries and chunks from the documents
//       const { tocEntries: generatedTocEntries, chunks: generatedChunks } = generateTocAndChunks(documents);
//       setTocEntries(generatedTocEntries);
//       setChunks(generatedChunks);
      
//     } catch (err) {
//       console.error("Error loading data:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Generate mock TOC entries and chunks based on documents
//   const generateTocAndChunks = (documents) => {
//     const tocEntries = [];
//     const chunks = [];
//     let tocId = 1;
//     let chunkId = 1;

//     documents.forEach(document => {
//       if (!document.id) return;

//       // Generate TOC entries for this document
//       const documentTocEntries = generateDocumentToc(document, tocId);
//       tocEntries.push(...documentTocEntries);
      
//       // Generate chunks for this document
//       const documentChunks = generateDocumentChunks(document, chunkId, documentTocEntries);
//       chunks.push(...documentChunks);
      
//       tocId += documentTocEntries.length;
//       chunkId += documentChunks.length;
//     });

//     return { tocEntries, chunks };
//   };

//   // Generate TOC structure for a document
//   const generateDocumentToc = (document, startId) => {
//     const tocEntries = [];
//     const docId = document.id;
    
//     // Main sections based on document type
//     const sections = [
//       { title: "Introduction", level: 1 },
//       { title: "Methodology", level: 1 },
//       { title: "Research Design", level: 2 },
//       { title: "Data Collection", level: 2 },
//       { title: "Analysis Methods", level: 2 },
//       { title: "Results", level: 1 },
//       { title: "Key Findings", level: 2 },
//       { title: "Statistical Analysis", level: 2 },
//       { title: "Discussion", level: 1 },
//       { title: "Conclusion", level: 1 },
//       { title: "References", level: 1 }
//     ];

//     let currentId = startId;
//     let parentStack = [];

//     sections.forEach((section, index) => {
//       const tocEntry = {
//         id: `toc_${currentId}`,
//         document_id: docId,
//         title: section.title,
//         level: section.level,
//         page_number: Math.floor(index / 2) + 1,
//         children: []
//       };

//       // Handle hierarchy
//       if (section.level === 1) {
//         tocEntries.push(tocEntry);
//         parentStack = [tocEntry];
//       } else {
//         let parent = parentStack[section.level - 2];
//         if (parent) {
//           parent.children.push(tocEntry);
//           parentStack[section.level - 1] = tocEntry;
//         }
//       }

//       currentId++;
//     });

//     return tocEntries;
//   };

//   // Generate chunks for a document
//   const generateDocumentChunks = (document, startId, documentTocEntries) => {
//     const chunks = [];
//     const flatTocEntries = flattenTocEntries(documentTocEntries);
    
//     flatTocEntries.forEach((tocEntry, index) => {
//       const chunkCount = Math.floor(Math.random() * 3) + 2; // 2-4 chunks per TOC entry
      
//       for (let i = 0; i < chunkCount; i++) {
//         const chunkId = `chunk_${startId}`;
        
//         chunks.push({
//           id: chunkId,
//           document_id: document.id,
//           toc_node_id: tocEntry.id,
//           chunk_number: i + 1,
//           page_number: tocEntry.page_number,
//           token_count: Math.floor(Math.random() * 100) + 50,
//           content: generateChunkContent(tocEntry.title, document.metadata?.subject, i, chunkCount),
//           embedding: Array(384).fill(0).map(() => (Math.random() * 2 - 1).toFixed(6)), // Mock embedding
//           created_at: document.uploadedAt
//         });
        
//         startId++;
//       }
//     });

//     return chunks;
//   };

//   // Flatten TOC entries for easier processing
//   const flattenTocEntries = (entries, result = []) => {
//     entries.forEach(entry => {
//       result.push(entry);
//       if (entry.children && entry.children.length > 0) {
//         flattenTocEntries(entry.children, result);
//       }
//     });
//     return result;
//   };

//   // Generate realistic chunk content
//   const generateChunkContent = (sectionTitle, subject, chunkIndex, totalChunks) => {
//     const subjects = {
//       'Artificial Intelligence': 'machine learning models neural networks deep learning algorithms',
//       'Research': 'study findings analysis results methodology data collection',
//       'Technology': 'software development systems architecture implementation deployment',
//       'Business': 'strategy management operations growth market analysis',
//       'Science': 'experimental results hypothesis testing scientific method research'
//     };
    
//     const baseText = subjects[subject] || 'content document information data analysis';
    
//     const templates = [
//       `This section ${sectionTitle.toLowerCase()} discusses important aspects of ${baseText}. The findings indicate significant progress in this field.`,
//       `In ${sectionTitle.toLowerCase()}, we examine the key components that contribute to successful outcomes. ${baseText.split(' ').slice(0, 3).join(' ')} plays a crucial role.`,
//       `The ${sectionTitle.toLowerCase()} presents detailed analysis of collected data. Multiple approaches were considered including various methods of ${baseText}.`,
//       `Throughout ${sectionTitle.toLowerCase()}, consistent patterns emerged that support our initial hypothesis. The ${baseText.split(' ')[0]} framework proved particularly effective.`,
//       `This part of ${sectionTitle.toLowerCase()} focuses on practical applications. Implementation strategies for ${baseText} are discussed in detail.`
//     ];
    
//     const template = templates[chunkIndex % templates.length];
//     return `${template} [Chunk ${chunkIndex + 1} of ${totalChunks} for ${sectionTitle}]`;
//   };

//   const handleFileSelect = async (file) => {
//     setSelectedFile(file);
//     setSelectedTocNode(null);
//     setSelectedChunk(null);
//     setSearchQuery("");
    
//     if (file) {
//       // Filter TOC entries and chunks for selected file
//       const documentTocEntries = tocEntries.filter(entry => 
//         entry.document_id === file.id
//       );
//       const documentChunks = chunks.filter(chunk => 
//         chunk.document_id === file.id
//       );
      
//       // Update state with filtered data
//       setTocEntries(prev => {
//         const otherEntries = prev.filter(entry => entry.document_id !== file.id);
//         return [...otherEntries, ...documentTocEntries];
//       });
      
//       setChunks(prev => {
//         const otherChunks = prev.filter(chunk => chunk.document_id !== file.id);
//         return [...otherChunks, ...documentChunks];
//       });
//     }
//   };

//   const handleTocNodeSelect = (node) => {
//     setSelectedTocNode(node);
//     setSelectedChunk(null);
    
//     // Find and select the first chunk for this TOC node
//     const firstChunk = chunks.find(chunk => chunk.toc_node_id === node.id);
//     if (firstChunk) {
//       setSelectedChunk(firstChunk);
//     }
//   };

//   const handleRegenerate = async () => {
//     if (!selectedFile) return;
    
//     try {
//       setRegenerating(true);
      
//       // Simulate regeneration process
//       await new Promise(resolve => setTimeout(resolve, 2000));
      
//       // Update document status
//       const updatedDocuments = files.map(doc => 
//         doc.id === selectedFile.id 
//           ? { ...doc, status: 'processing', chunks: 0, toc_entries: 0 }
//           : doc
//       );
      
//       setFiles(updatedDocuments);
//       setSelectedFile(updatedDocuments.find(doc => doc.id === selectedFile.id));
      
//       // Simulate processing completion
//       setTimeout(async () => {
//         const finalDocuments = updatedDocuments.map(doc => 
//           doc.id === selectedFile.id 
//             ? { 
//                 ...doc, 
//                 status: 'processed', 
//                 chunks: Math.floor(Math.random() * 50) + 10,
//                 toc_entries: Math.floor(Math.random() * 20) + 5
//               }
//             : doc
//         );
        
//         setFiles(finalDocuments);
//         setSelectedFile(finalDocuments.find(doc => doc.id === selectedFile.id));
        
//         // Reload data to get new TOC and chunks
//         await loadData();
//         setRegenerating(false);
        
//         alert("Document chunks and embeddings regenerated successfully!");
//       }, 3000);
      
//     } catch (err) {
//       console.error("Error regenerating chunks:", err);
//       alert("Error regenerating document chunks");
//       setRegenerating(false);
//     }
//   };

//   // FileInfoCard Component
//   const FileInfoCard = ({ file }) => {
//     if (!file) {
//       return (
//         <div className="bg-white p-4 rounded-lg shadow mb-4">
//           <h2 className="text-xl font-bold mb-2 text-gray-500">No file selected</h2>
//           <p className="text-sm text-gray-600">Please select a document to view details</p>
//         </div>
//       );
//     }

//     const formatFileSize = (bytes) => {
//       if (!bytes) return '-';
//       if (bytes < 1024) return bytes + ' Bytes';
//       if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
//       return (bytes / 1048576).toFixed(1) + ' MB';
//     };

//     return (
//       <div className="bg-white p-4 rounded-lg shadow mb-4">
//         <h2 className="text-xl font-bold mb-2">{file.metadata?.title || file.filename}</h2>
//         <div className="grid grid-cols-2 gap-2 text-sm">
//           <div>
//             <span className="font-medium">Filename:</span> {file.filename}
//           </div>
//           <div>
//             <span className="font-medium">Upload Date:</span> {new Date(file.uploadedAt).toLocaleDateString()}
//           </div>
//           <div>
//             <span className="font-medium">Status:</span> 
//             <span className={`ml-2 px-2 py-1 rounded text-xs ${
//               file.status === "processed" 
//                 ? "bg-green-100 text-green-800"
//                 : file.status === "processing"
//                 ? "bg-yellow-100 text-yellow-800"
//                 : "bg-gray-100 text-gray-800"
//             }`}>
//               {file.status || "unknown"}
//             </span>
//           </div>
//           <div>
//             <span className="font-medium">Size:</span> {formatFileSize(file.size)}
//           </div>
//           <div>
//             <span className="font-medium">Chunks:</span> {file.chunks || 0}
//           </div>
//           <div>
//             <span className="font-medium">TOC Entries:</span> {file.toc_entries || 0}
//           </div>
//           {file.metadata?.subject && (
//             <div className="col-span-2">
//               <span className="font-medium">Subject:</span> {file.metadata.subject}
//             </div>
//           )}
//           {file.metadata?.tags && (
//             <div className="col-span-2">
//               <span className="font-medium">Tags:</span> {file.metadata.tags}
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   // TOCTree Component
//   const TOCTree = ({ entries, selectedNode, onSelectNode }) => {
//     const [expandedNodes, setExpandedNodes] = useState(new Set());

//     const toggleNode = (nodeId) => {
//       const newExpanded = new Set(expandedNodes);
//       if (newExpanded.has(nodeId)) {
//         newExpanded.delete(nodeId);
//       } else {
//         newExpanded.add(nodeId);
//       }
//       setExpandedNodes(newExpanded);
//     };

//     const renderTree = (nodes, level = 0) => {
//       return nodes.map((node) => (
//         <div key={node.id} className="ml-4">
//           <div 
//             className={`flex items-center py-1 px-2 rounded cursor-pointer hover:bg-gray-100 ${
//               selectedNode?.id === node.id ? "bg-blue-50 border border-blue-200" : ""
//             }`}
//             style={{ marginLeft: `${level * 12}px` }}
//           >
//             {node.children && node.children.length > 0 ? (
//               <button 
//                 onClick={() => toggleNode(node.id)}
//                 className="w-4 h-4 mr-1 flex items-center justify-center border border-gray-300 rounded text-xs"
//               >
//                 {expandedNodes.has(node.id) ? "−" : "+"}
//               </button>
//             ) : (
//               <span className="w-4 h-4 mr-1"></span>
//             )}
//             <span 
//               onClick={() => onSelectNode(node)}
//               className="flex-1 text-sm"
//             >
//               {node.title}
//               <span className="text-xs text-gray-500 ml-2">(p{node.page_number})</span>
//             </span>
//           </div>
//           {node.children && node.children.length > 0 && expandedNodes.has(node.id) && (
//             renderTree(node.children, level + 1)
//           )}
//         </div>
//       ));
//     };

//     const documentTocEntries = entries.filter(entry => 
//       selectedFile && entry.document_id === selectedFile.id
//     );

//     return (
//       <div className="bg-white p-4 rounded-lg shadow h-64 overflow-y-auto">
//         <h3 className="font-bold mb-2">Table of Contents</h3>
//         {documentTocEntries.length === 0 ? (
//           <p className="text-gray-500 text-sm">
//             {selectedFile ? "No TOC entries available" : "Select a document to view TOC"}
//           </p>
//         ) : (
//           renderTree(documentTocEntries)
//         )}
//       </div>
//     );
//   };

//   // ChunkList Component
//   const ChunkList = ({ chunks, selectedTocNode, searchQuery, onSelectChunk, selectedFile }) => {
//     const filteredChunks = chunks.filter(chunk => {
//       if (!selectedFile) return false;
//       const matchesFile = chunk.document_id === selectedFile.id;
//       const matchesToc = !selectedTocNode || chunk.toc_node_id === selectedTocNode.id;
//       const matchesSearch = !searchQuery || 
//         chunk.content.toLowerCase().includes(searchQuery.toLowerCase());
//       return matchesFile && matchesToc && matchesSearch;
//     });

//     return (
//       <div className="bg-white p-4 rounded-lg shadow">
//         <div className="flex justify-between items-center mb-2">
//           <h3 className="font-bold">
//             Content Chunks {selectedTocNode && `- ${selectedTocNode.title}`}
//           </h3>
//           <span className="text-sm text-gray-500">
//             {filteredChunks.length} chunks
//           </span>
//         </div>
//         <div className="h-48 overflow-y-auto">
//           {!selectedFile ? (
//             <p className="text-gray-500 text-sm">Select a document to view chunks</p>
//           ) : filteredChunks.length === 0 ? (
//             <p className="text-gray-500 text-sm">
//               {searchQuery ? "No chunks match your search" : "No chunks available"}
//             </p>
//           ) : (
//             filteredChunks.map((chunk) => (
//               <div
//                 key={chunk.id}
//                 className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
//                   selectedChunk?.id === chunk.id ? "bg-blue-50 border-blue-200" : ""
//                 }`}
//                 onClick={() => onSelectChunk(chunk)}
//               >
//                 <div className="flex justify-between text-xs text-gray-500 mb-1">
//                   <span>Chunk #{chunk.chunk_number}</span>
//                   <span>Page {chunk.page_number} • {chunk.token_count} tokens</span>
//                 </div>
//                 <p className="text-sm line-clamp-2">
//                   {chunk.content}
//                 </p>
//               </div>
//             ))
//           )}
//         </div>
//       </div>
//     );
//   };

//   // SearchInFile Component
//   const SearchInFile = ({ searchQuery, onSearchChange, selectedFile }) => (
//     <div className="bg-white p-4 rounded-lg shadow mb-4">
//       <h3 className="font-bold mb-2">Search in Document</h3>
//       <input
//         type="text"
//         placeholder={selectedFile ? "Search through document chunks..." : "Select a document to search..."}
//         value={searchQuery}
//         onChange={(e) => onSearchChange(e.target.value)}
//         disabled={!selectedFile}
//         className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
//       />
//     </div>
//   );

//   // PreviewPane Component
//   const PreviewPane = ({ selectedChunk, selectedFile }) => (
//     <div className="bg-white p-4 rounded-lg shadow h-64">
//       <h3 className="font-bold mb-2">
//         {selectedChunk ? `Preview - Chunk #${selectedChunk.chunk_number}` : "Preview"}
//       </h3>
//       <div className="h-48 overflow-y-auto text-sm bg-gray-50 p-3 rounded">
//         {selectedChunk ? (
//           <div>
//             <div className="flex justify-between text-xs text-gray-500 mb-2">
//               <span>Page {selectedChunk.page_number}</span>
//               <span>Tokens: {selectedChunk.token_count}</span>
//             </div>
//             <p className="whitespace-pre-wrap">{selectedChunk.content}</p>
//             <div className="mt-3 pt-2 border-t border-gray-200 text-xs text-gray-500">
//               <div>Chunk ID: {selectedChunk.id}</div>
//               <div>TOC Node: {selectedChunk.toc_node_id}</div>
//               <div>Document: {selectedFile?.filename}</div>
//             </div>
//           </div>
//         ) : (
//           <p className="text-gray-500">
//             {selectedFile ? "Select a chunk to preview" : "Select a document to view preview"}
//           </p>
//         )}
//       </div>
//     </div>
//   );

//   // RegenerateButton Component
//   const RegenerateButton = ({ file, onRegenerate, regenerating }) => (
//     <div className="bg-white p-4 rounded-lg shadow">
//       <div className="flex justify-between items-center">
//         <div>
//           <h3 className="font-bold">Processing Actions</h3>
//           <p className="text-sm text-gray-600">Re-process document chunks and embeddings</p>
//         </div>
//         <button
//           onClick={onRegenerate}
//           disabled={!file || regenerating}
//           className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded transition-colors flex items-center"
//         >
//           {regenerating ? (
//             <>
//               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//               Processing...
//             </>
//           ) : (
//             'Regenerate Chunks'
//           )}
//         </button>
//       </div>
//     </div>
//   );

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading document explorer...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold">📚 Document Explorer</h1>
//         <button
//           onClick={loadData}
//           className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded transition-colors"
//         >
//           Refresh Data
//         </button>
//       </div>

//       {/* File Selection */}
//       <div className="mb-6">
//         <label className="block text-sm font-medium mb-2">Select Document:</label>
//         <select
//           value={selectedFile?.id || ""}
//           onChange={(e) => handleFileSelect(files.find(f => f.id === e.target.value))}
//           className="w-full md:w-64 p-2 border border-gray-300 rounded"
//         >
//           <option value="">Choose a file...</option>
//           {files.map(file => (
//             <option key={file.id} value={file.id}>
//               {file.metadata?.title || file.filename} ({file.status})
//             </option>
//           ))}
//         </select>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Left Column */}
//         <div className="lg:col-span-1 space-y-4">
//           <FileInfoCard file={selectedFile} />
//           <TOCTree 
//             entries={tocEntries} 
//             selectedNode={selectedTocNode}
//             onSelectNode={handleTocNodeSelect}
//           />
//           <RegenerateButton 
//             file={selectedFile} 
//             onRegenerate={handleRegenerate}
//             regenerating={regenerating}
//           />
//         </div>

//         {/* Middle Column */}
//         <div className="lg:col-span-1 space-y-4">
//           <SearchInFile 
//             searchQuery={searchQuery}
//             onSearchChange={setSearchQuery}
//             selectedFile={selectedFile}
//           />
//           <ChunkList 
//             chunks={chunks}
//             selectedTocNode={selectedTocNode}
//             searchQuery={searchQuery}
//             onSelectChunk={setSelectedChunk}
//             selectedFile={selectedFile}
//           />
//         </div>

//         {/* Right Column */}
//         <div className="lg:col-span-1">
//           <PreviewPane selectedChunk={selectedChunk} selectedFile={selectedFile} />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DocumentExplorer;


import React, { useEffect, useState } from "react";
import { fakeApi } from "./fakeApiService";

const ContentManagement = () => {
  const [files, setFiles] = useState([]);
  const [tocEntries, setTocEntries] = useState([]);
  const [chunks, setChunks] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedTocNode, setSelectedTocNode] = useState(null);
  const [selectedChunk, setSelectedChunk] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Load data from our fake backend
  const loadData = async () => {
    try {
      setLoading(true);

      // Load documents and generate TOC entries and chunks from them
      const documentsResponse = await fakeApi.getDocuments();
      const documents = documentsResponse.documents || [];

      setFiles(documents);

      // Auto-select first file if available
      if (documents.length > 0) {
        handleFileSelect(documents[0]);
      }

      // Generate TOC entries and chunks from the documents
      const { tocEntries: generatedTocEntries, chunks: generatedChunks } =
        generateTocAndChunks(documents);
      setTocEntries(generatedTocEntries);
      setChunks(generatedChunks);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Generate mock TOC entries and chunks based on documents
  const generateTocAndChunks = (documents) => {
    const tocEntries = [];
    const chunks = [];
    let tocId = 1;
    let chunkId = 1;

    documents.forEach((document) => {
      if (!document.id) return;

      // Generate TOC entries for this document
      const documentTocEntries = generateDocumentToc(document, tocId);
      tocEntries.push(...documentTocEntries);

      // Generate chunks for this document
      const documentChunks = generateDocumentChunks(
        document,
        chunkId,
        documentTocEntries
      );
      chunks.push(...documentChunks);

      tocId += documentTocEntries.length;
      chunkId += documentChunks.length;
    });

    return { tocEntries, chunks };
  };

  // Generate TOC structure for a document
  const generateDocumentToc = (document, startId) => {
    const tocEntries = [];
    const docId = document.id;

    // Main sections based on document type
    const sections = [
      { title: "Introduction", level: 1 },
      { title: "Methodology", level: 1 },
      { title: "Research Design", level: 2 },
      { title: "Data Collection", level: 2 },
      { title: "Analysis Methods", level: 2 },
      { title: "Results", level: 1 },
      { title: "Key Findings", level: 2 },
      { title: "Statistical Analysis", level: 2 },
      { title: "Discussion", level: 1 },
      { title: "Conclusion", level: 1 },
      { title: "References", level: 1 },
    ];

    let currentId = startId;
    let parentStack = [];

    sections.forEach((section, index) => {
      const tocEntry = {
        id: `toc_${currentId}`,
        document_id: docId,
        title: section.title,
        level: section.level,
        page_number: Math.floor(index / 2) + 1,
        children: [],
      };

      // Handle hierarchy
      if (section.level === 1) {
        tocEntries.push(tocEntry);
        parentStack = [tocEntry];
      } else {
        let parent = parentStack[section.level - 2];
        if (parent) {
          parent.children.push(tocEntry);
          parentStack[section.level - 1] = tocEntry;
        }
      }

      currentId++;
    });

    return tocEntries;
  };

  // Generate chunks for a document
  const generateDocumentChunks = (document, startId, documentTocEntries) => {
    const chunks = [];
    const flatTocEntries = flattenTocEntries(documentTocEntries);

    flatTocEntries.forEach((tocEntry, index) => {
      const chunkCount = Math.floor(Math.random() * 3) + 2; // 2-4 chunks per TOC entry

      for (let i = 0; i < chunkCount; i++) {
        const chunkId = `chunk_${startId}`;

        chunks.push({
          id: chunkId,
          document_id: document.id,
          toc_node_id: tocEntry.id,
          chunk_number: i + 1,
          page_number: tocEntry.page_number,
          token_count: Math.floor(Math.random() * 100) + 50,
          content: generateChunkContent(
            tocEntry.title,
            document.metadata?.subject,
            i,
            chunkCount
          ),
          embedding: Array(384)
            .fill(0)
            .map(() => (Math.random() * 2 - 1).toFixed(6)), // Mock embedding
          created_at: document.uploadedAt,
        });

        startId++;
      }
    });

    return chunks;
  };

  // Flatten TOC entries for easier processing
  const flattenTocEntries = (entries, result = []) => {
    entries.forEach((entry) => {
      result.push(entry);
      if (entry.children && entry.children.length > 0) {
        flattenTocEntries(entry.children, result);
      }
    });
    return result;
  };

  // Generate realistic chunk content
  const generateChunkContent = (
    sectionTitle,
    subject,
    chunkIndex,
    totalChunks
  ) => {
    const subjects = {
      "Artificial Intelligence":
        "machine learning models neural networks deep learning algorithms",
      Research: "study findings analysis results methodology data collection",
      Technology:
        "software development systems architecture implementation deployment",
      Business: "strategy management operations growth market analysis",
      Science:
        "experimental results hypothesis testing scientific method research",
    };

    const baseText =
      subjects[subject] || "content document information data analysis";

    const templates = [
      `This section ${sectionTitle.toLowerCase()} discusses important aspects of ${baseText}. The findings indicate significant progress in this field.`,
      `In ${sectionTitle.toLowerCase()}, we examine the key components that contribute to successful outcomes. ${baseText
        .split(" ")
        .slice(0, 3)
        .join(" ")} plays a crucial role.`,
      `The ${sectionTitle.toLowerCase()} presents detailed analysis of collected data. Multiple approaches were considered including various methods of ${baseText}.`,
      `Throughout ${sectionTitle.toLowerCase()}, consistent patterns emerged that support our initial hypothesis. The ${
        baseText.split(" ")[0]
      } framework proved particularly effective.`,
      `This part of ${sectionTitle.toLowerCase()} focuses on practical applications. Implementation strategies for ${baseText} are discussed in detail.`,
    ];

    const template = templates[chunkIndex % templates.length];
    return `${template} [Chunk ${
      chunkIndex + 1
    } of ${totalChunks} for ${sectionTitle}]`;
  };

  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    setSelectedTocNode(null);
    setSelectedChunk(null);
    setSearchQuery("");

    if (file) {
      // Filter TOC entries and chunks for selected file
      const documentTocEntries = tocEntries.filter(
        (entry) => entry.document_id === file.id
      );
      const documentChunks = chunks.filter(
        (chunk) => chunk.document_id === file.id
      );

      // Update state with filtered data
      setTocEntries((prev) => {
        const otherEntries = prev.filter(
          (entry) => entry.document_id !== file.id
        );
        return [...otherEntries, ...documentTocEntries];
      });

      setChunks((prev) => {
        const otherChunks = prev.filter(
          (chunk) => chunk.document_id !== file.id
        );
        return [...otherChunks, ...documentChunks];
      });
    }
  };

  const handleTocNodeSelect = (node) => {
    setSelectedTocNode(node);
    setSelectedChunk(null);

    // Find and select the first chunk for this TOC node
    const firstChunk = chunks.find((chunk) => chunk.toc_node_id === node.id);
    if (firstChunk) {
      setSelectedChunk(firstChunk);
    }
  };

  const handleRegenerate = async () => {
    if (!selectedFile) return;

    try {
      setRegenerating(true);

      // Simulate regeneration process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update document status
      const updatedDocuments = files.map((doc) =>
        doc.id === selectedFile.id
          ? { ...doc, status: "processing", chunks: 0, toc_entries: 0 }
          : doc
      );

      setFiles(updatedDocuments);
      setSelectedFile(
        updatedDocuments.find((doc) => doc.id === selectedFile.id)
      );

      // Simulate processing completion
      setTimeout(async () => {
        const finalDocuments = updatedDocuments.map((doc) =>
          doc.id === selectedFile.id
            ? {
                ...doc,
                status: "processed",
                chunks: Math.floor(Math.random() * 50) + 10,
                toc_entries: Math.floor(Math.random() * 20) + 5,
              }
            : doc
        );

        setFiles(finalDocuments);
        setSelectedFile(
          finalDocuments.find((doc) => doc.id === selectedFile.id)
        );

        // Reload data to get new TOC and chunks
        await loadData();
        setRegenerating(false);

        alert("Document chunks and embeddings regenerated successfully!");
      }, 3000);
    } catch (err) {
      console.error("Error regenerating chunks:", err);
      alert("Error regenerating document chunks");
      setRegenerating(false);
    }
  };

  // FileInfoCard Component
  const FileInfoCard = ({ file }) => {
    if (!file) {
      return (
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <h2 className="text-xl font-bold mb-2 text-gray-500">
            No file selected
          </h2>
          <p className="text-sm text-gray-600">
            Please select a document to view details
          </p>
        </div>
      );
    }

    const formatFileSize = (bytes) => {
      if (!bytes) return "-";
      if (bytes < 1024) return bytes + " Bytes";
      if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
      return (bytes / 1048576).toFixed(1) + " MB";
    };

    return (
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <h2 className="text-xl font-bold mb-2">
          {file.metadata?.title || file.filename}
        </h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-medium">Filename:</span> {file.filename}
          </div>
          <div>
            <span className="font-medium">Upload Date:</span>{" "}
            {new Date(file.uploadedAt).toLocaleDateString()}
          </div>
          <div>
            <span className="font-medium">Status:</span>
            <span
              className={`ml-2 px-2 py-1 rounded text-xs ${
                file.status === "processed"
                  ? "bg-green-100 text-green-800"
                  : file.status === "processing"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {file.status || "unknown"}
            </span>
          </div>
          <div>
            <span className="font-medium">Size:</span>{" "}
            {formatFileSize(file.size)}
          </div>
          <div>
            <span className="font-medium">Chunks:</span> {file.chunks || 0}
          </div>
          <div>
            <span className="font-medium">TOC Entries:</span>{" "}
            {file.toc_entries || 0}
          </div>
          {file.metadata?.subject && (
            <div className="col-span-2">
              <span className="font-medium">Subject:</span>{" "}
              {file.metadata.subject}
            </div>
          )}
          {file.metadata?.tags && (
            <div className="col-span-2">
              <span className="font-medium">Tags:</span> {file.metadata.tags}
            </div>
          )}
        </div>
      </div>
    );
  };

  // TOCTree Component
  const TOCTree = ({ entries, selectedNode, onSelectNode }) => {
    const [expandedNodes, setExpandedNodes] = useState(new Set());

    const toggleNode = (nodeId) => {
      const newExpanded = new Set(expandedNodes);
      if (newExpanded.has(nodeId)) {
        newExpanded.delete(nodeId);
      } else {
        newExpanded.add(nodeId);
      }
      setExpandedNodes(newExpanded);
    };

    const renderTree = (nodes, level = 0) => {
      return nodes.map((node) => (
        <div key={node.id} className="ml-4">
          <div
            className={`flex items-center py-1 px-2 rounded cursor-pointer hover:bg-gray-100 ${
              selectedNode?.id === node.id
                ? "bg-blue-50 border border-blue-200"
                : ""
            }`}
            style={{ marginLeft: `${level * 12}px` }}
          >
            {node.children && node.children.length > 0 ? (
              <button
                onClick={() => toggleNode(node.id)}
                className="w-4 h-4 mr-1 flex items-center justify-center border border-gray-300 rounded text-xs"
              >
                {expandedNodes.has(node.id) ? "−" : "+"}
              </button>
            ) : (
              <span className="w-4 h-4 mr-1"></span>
            )}
            <span onClick={() => onSelectNode(node)} className="flex-1 text-sm">
              {node.title}
              <span className="text-xs text-gray-500 ml-2">
                (p{node.page_number})
              </span>
            </span>
          </div>
          {node.children &&
            node.children.length > 0 &&
            expandedNodes.has(node.id) &&
            renderTree(node.children, level + 1)}
        </div>
      ));
    };

    const documentTocEntries = entries.filter(
      (entry) => selectedFile && entry.document_id === selectedFile.id
    );

    return (
      <div className="bg-white p-4 rounded-lg shadow h-64 overflow-y-auto">
        <h3 className="font-bold mb-2">Table of Contents</h3>
        {documentTocEntries.length === 0 ? (
          <p className="text-gray-500 text-sm">
            {selectedFile
              ? "No TOC entries available"
              : "Select a document to view TOC"}
          </p>
        ) : (
          renderTree(documentTocEntries)
        )}
      </div>
    );
  };

  // ChunkList Component
  const ChunkList = ({
    chunks,
    selectedTocNode,
    searchQuery,
    onSelectChunk,
    selectedFile,
  }) => {
    const filteredChunks = chunks.filter((chunk) => {
      if (!selectedFile) return false;
      const matchesFile = chunk.document_id === selectedFile.id;
      const matchesToc =
        !selectedTocNode || chunk.toc_node_id === selectedTocNode.id;
      const matchesSearch =
        !searchQuery ||
        chunk.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFile && matchesToc && matchesSearch;
    });

    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold">
            Content Chunks {selectedTocNode && `- ${selectedTocNode.title}`}
          </h3>
          <span className="text-sm text-gray-500">
            {filteredChunks.length} chunks
          </span>
        </div>
        <div className="h-48 overflow-y-auto">
          {!selectedFile ? (
            <p className="text-gray-500 text-sm">
              Select a document to view chunks
            </p>
          ) : filteredChunks.length === 0 ? (
            <p className="text-gray-500 text-sm">
              {searchQuery
                ? "No chunks match your search"
                : "No chunks available"}
            </p>
          ) : (
            filteredChunks.map((chunk) => (
              <div
                key={chunk.id}
                className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                  selectedChunk?.id === chunk.id
                    ? "bg-blue-50 border-blue-200"
                    : ""
                }`}
                onClick={() => onSelectChunk(chunk)}
              >
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Chunk #{chunk.chunk_number}</span>
                  <span>
                    Page {chunk.page_number} • {chunk.token_count} tokens
                  </span>
                </div>
                <p className="text-sm line-clamp-2">{chunk.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  // SearchInFile Component
  const SearchInFile = ({ searchQuery, onSearchChange, selectedFile }) => (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <h3 className="font-bold mb-2">Search in Document</h3>
      <input
        type="text"
        placeholder={
          selectedFile
            ? "Search through document chunks..."
            : "Select a document to search..."
        }
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        disabled={!selectedFile}
        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
    </div>
  );

  // PreviewPane Component
  const PreviewPane = ({ selectedChunk, selectedFile }) => (
    <div className="bg-white p-4 rounded-lg shadow h-64">
      <h3 className="font-bold mb-2">
        {selectedChunk
          ? `Preview - Chunk #${selectedChunk.chunk_number}`
          : "Preview"}
      </h3>
      <div className="h-48 overflow-y-auto text-sm bg-gray-50 p-3 rounded">
        {selectedChunk ? (
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Page {selectedChunk.page_number}</span>
              <span>Tokens: {selectedChunk.token_count}</span>
            </div>
            <p className="whitespace-pre-wrap">{selectedChunk.content}</p>
            <div className="mt-3 pt-2 border-t border-gray-200 text-xs text-gray-500">
              <div>Chunk ID: {selectedChunk.id}</div>
              <div>TOC Node: {selectedChunk.toc_node_id}</div>
              <div>Document: {selectedFile?.filename}</div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">
            {selectedFile
              ? "Select a chunk to preview"
              : "Select a document to view preview"}
          </p>
        )}
      </div>
    </div>
  );

  // RegenerateButton Component
  const RegenerateButton = ({ file, onRegenerate, regenerating }) => (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold">Processing Actions</h3>
          <p className="text-sm text-gray-600">
            Re-process document chunks and embeddings
          </p>
        </div>
        <button
          onClick={onRegenerate}
          disabled={!file || regenerating}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded transition-colors flex items-center"
        >
          {regenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            "Regenerate Chunks"
          )}
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading document explorer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📚 Document Explorer</h1>
        <button
          onClick={loadData}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded transition-colors"
        >
          Refresh Data
        </button>
      </div>

      {/* File Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Select Document:
        </label>
        <select
          value={selectedFile?.id || ""}
          onChange={(e) =>
            handleFileSelect(files.find((f) => f.id === e.target.value))
          }
          className="w-full md:w-64 p-2 border border-gray-300 rounded"
        >
          <option value="">Choose a file...</option>
          {files.map((file) => (
            <option key={file.id} value={file.id}>
              {file.metadata?.title || file.filename} ({file.status})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-4">
          <FileInfoCard file={selectedFile} />
          <TOCTree
            entries={tocEntries}
            selectedNode={selectedTocNode}
            onSelectNode={handleTocNodeSelect}
          />
          <RegenerateButton
            file={selectedFile}
            onRegenerate={handleRegenerate}
            regenerating={regenerating}
          />
        </div>

        {/* Middle Column */}
        <div className="lg:col-span-1 space-y-4">
          <SearchInFile
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedFile={selectedFile}
          />
          <ChunkList
            chunks={chunks}
            selectedTocNode={selectedTocNode}
            searchQuery={searchQuery}
            onSelectChunk={setSelectedChunk}
            selectedFile={selectedFile}
          />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1">
          <PreviewPane
            selectedChunk={selectedChunk}
            selectedFile={selectedFile}
          />
        </div>
      </div>
    </div>
  );
};

export default ContentManagement;