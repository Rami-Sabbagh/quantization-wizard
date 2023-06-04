import React from 'react';

import { RGBA } from '../lib/images/interfaces';
import { rgba2hex } from '../lib/images/color-utilities';

import './colors-histogram.scss';

type ColorBarProps = {
    color: RGBA,
    percentage: number,
};

function ColorBar({ color, percentage }: ColorBarProps) {
    return <div className='color-bar' style={{
        backgroundColor: rgba2hex(color),
        ['--percentage']: percentage,
    } as React.CSSProperties} />
}

type ColorsHistogramProps = {
    palette: RGBA[],
    histogram: number[],
};

export function ColorsHistogram({ palette, histogram }: ColorsHistogramProps) {
    let maxCount = 1;
    histogram.forEach(count => maxCount = Math.max(maxCount, count));

    const data: [color: RGBA, count: number, id: number][] = [];
    palette.forEach((color, id) => data[id] = [color, histogram[id], id]);
    data.sort((a, b) => b[1] - a[1]);

    return <div className="colors-histogram" style={{
        ['--columns']: palette.length,
    } as React.CSSProperties}>
        {data.map(([color, count, id]) =>
            <ColorBar key={id} color={color} percentage={count / maxCount} />
        )}
    </div>;
}