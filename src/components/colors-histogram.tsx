import React from 'react';

import { RGBA } from '../lib/images/interfaces';
import { rgba2hex } from '../lib/images/color-utilities';

import './colors-histogram.scss';

type ColorBarProps = {
    color: RGBA,
    percentage: number,
};

function ColorBar({ color, percentage }: ColorBarProps) {
    return <div className='color-bar' style={{ backgroundColor: rgba2hex(color) }}>
        {rgba2hex(color)}
    </div>;
}

type ColorsHistogramProps = {
    palette: RGBA[],
    histogram: number[],
};

export function ColorsHistogram({ palette, histogram }: ColorsHistogramProps) {
    let maxCount = 1;
    histogram.forEach(count => maxCount = Math.max(maxCount, count));

    return <div className="colors-histogram">
        {palette.map((color, id) => {
            return <ColorBar key={id} color={color} percentage={histogram[id] / maxCount} />
        })}
        {/* <ColorBar color={[255, 0, 255, 255]} percentage={100} /> */}
    </div>;
}