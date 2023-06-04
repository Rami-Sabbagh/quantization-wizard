/* eslint-disable no-useless-computed-key */
import React from 'react';

import { RGBA } from '../lib/images/interfaces';

import './color-selector.scss';

type ColorSelectorProps = {
    palette: RGBA[];
    /**
     * The currently selected color.
     */
    selected: number;
    /**
     * Triggered when a color is selected from the palette.
     */
    onSelect?: (id: number) => void;
};

export function ColorSelector({ palette, selected, onSelect }: ColorSelectorProps) {
    const size = palette.length;

    const columns = Math.min(size, size > 32 ? 16 : 8);
    const rows = Math.ceil(palette.length / columns);

    return <div className='color-selector' style={{
        ['--row-width']: columns
    } as React.CSSProperties}>
        {palette.map(([r, g, b, _a], colorId) => {
            const column = colorId % columns;
            const row = Math.floor(colorId / columns);

            let corner = '';

            const firstColumn = column === 0;
            const firstRow = row === 0;
            const lastColumn = column + 1 === columns;
            const lastRow = row + 1 === rows;

            if (firstColumn && firstRow) corner += ' tl';
            if (lastColumn && firstRow) corner += ' tr';
            if (firstColumn && lastRow) corner += ' bl';
            if (lastColumn && lastRow) corner += ' br';

            return <span
                key={colorId}
                className={`color-element ${corner}`}
                style={{ backgroundColor: `rgb(${r},${g},${b})` }}
                onClick={onSelect && (() => onSelect(colorId))}
            >
            </span>;
        })}
        <div className='selection-indicator' style={{
            ['--color-x']: selected % columns,
            ['--color-y']: Math.floor(selected / columns),
        } as React.CSSProperties} />
    </div>;
}

