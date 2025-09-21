src/
├── components/
│   ├── common/
│   │   ├── Layout/
│   │   │   ├── AppLayout.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Header.jsx
│   │   ├── MatrixInput/
│   │   │   ├── MatrixInput.jsx
│   │   │   ├── MatrixDisplay.jsx
│   │   │   └── MatrixControls.jsx
│   │   ├── Canvas/
│   │   │   ├── GraphCanvas.jsx
│   │   │   └── HistogramCanvas.jsx
│   │   └── Navigation/
│   │       ├── NavigationMenu.jsx
│   │       └── NavigationItem.jsx
│   │
│   ├── modules/
│   │   ├── ImageProcessing/
│   │   │   ├── LaplacianFilter.jsx
│   │   │   ├── MedianFilter.jsx
│   │   │   ├── MeanFilter.jsx
│   │   │   └── FilterBase.jsx
│   │   │
│   │   ├── Histograms/
│   │   │   ├── HistogramExpansion.jsx
│   │   │   ├── HistogramEqualization.jsx
│   │   │   └── HistogramBase.jsx
│   │   │
│   │   ├── GraphTheory/
│   │   │   ├── PathMatrix.jsx
│   │   │   ├── ConnectedComponents.jsx
│   │   │   ├── HamiltonianCycle.jsx
│   │   │   └── GraphBase.jsx
│   │   │
│   │   ├── Cryptography/
│   │   │   ├── LinearCongruences.jsx
│   │   │   ├── RSAEncryption.jsx
│   │   │   └── CryptoBase.jsx
│   │   │
│   │   ├── GameTheory/
│   │   │   ├── NashEquilibrium.jsx
│   │   │   ├── GameMatrix.jsx
│   │   │   └── GameBase.jsx
│   │   │
│   │   └── ExternalLinks/
│   │       ├── HuffmanLink.jsx
│   │       ├── HasseDiagramLink.jsx
│   │       └── TruthTablesLink.jsx
│   │
│   └── ui/
│       ├── buttons/
│       │   ├── PrimaryButton.jsx
│       │   ├── SecondaryButton.jsx
│       │   └── ActionButton.jsx
│       ├── inputs/
│       │   ├── NumberInput.jsx
│       │   └── TextInput.jsx
│       └── containers/
│           ├── ModuleContainer.jsx
│           └── ResultContainer.jsx
│
├── hooks/
│   ├── useMatrix.js
│   ├── useCanvas.js
│   ├── useLocalStorage.js
│   ├── useAlgorithms.js
│   └── useNavigation.js
│
├── utils/
│   ├── algorithms/
│   │   ├── imageProcessing.js
│   │   ├── graphTheory.js
│   │   ├── cryptography.js
│   │   ├── gameTheory.js
│   │   └── histograms.js
│   ├── helpers/
│   │   ├── matrixHelpers.js
│   │   ├── canvasHelpers.js
│   │   └── mathHelpers.js
│   └── constants/
│       ├── filterMasks.js
│       ├── menuItems.js
│       └── colors.js
│
├── context/
│   ├── AppContext.js
│   └── ThemeContext.js
│
├── theme/
│   ├── theme.js
│   └── customComponents.js
│
├── pages/
│   └── Calculator.jsx
│
├── App.jsx
├── index.js
└── index.css