import React from 'react';

import { Skeleton } from '@mui/material';

import './compare-frame.scss';

interface ImageProps {
    src?: string,
    width?: number,
    height?: number,
    alt?: string,
}

function Image({ src, width, height, alt }: ImageProps) {
    return (
        src ? <img src={src} width={width} height={height} alt={alt} />
            : <Skeleton variant='rectangular' width={width} height={height} />
    );
}

interface CompareFrameProps {
    source?: string;
    result?: string;

    width: number;
    height: number;
}

export function CompareFrame({ source, result, width, height }: CompareFrameProps) {
    return <div className="compare-frame" style={{
        writingMode: (width <= height) ? 'vertical-lr' : 'horizontal-tb'
    }}>
        <Image src={source} width={width} height={height} alt="Original" />
        <Image src={result} width={width} height={height} alt="Result" />
    </div>
}