import React, { useState } from 'react';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import './App.scss';

import { AppMode } from 'components/app-mode-switch';

import { SingleQuantization } from 'routes/single-quantization';
import { BatchQuantization } from 'routes/batch-quantization';
import { SimilarSearch } from 'routes/similar-search';

export default function App() {
    const [activeMode, setMode] = useState<AppMode>('single-quantization');

    if (activeMode === 'single-quantization') return <SingleQuantization setMode={setMode} />;
    else if (activeMode === 'batch-quantization') return <BatchQuantization setMode={setMode} />;
    else if (activeMode === 'similar-search') return <SimilarSearch setMode={setMode} />;
    else throw new Error(`Invalid application mode: ${activeMode}`);
}
