/* eslint-disable no-useless-computed-key */
import React, { useCallback } from 'react';

import './color-multi-selector.scss';

export interface DetailedPaletteColor {
    r: number, g: number, b: number, a: number,
    count: number, index: number
}

type ColorMultiSelectorProps = {
    palette: DetailedPaletteColor[],
    selected: number[],
    setSelected: (colors: number[]) => void,
};

export function ColorMultiSelector({ palette, selected, setSelected }: ColorMultiSelectorProps) {
    const size = palette.length;

    const columns = Math.min(Math.max(size, 8), size > 32 ? 16 : 8);
    const rows = Math.max(Math.ceil(palette.length / columns), 1);

    const toggleSelection = useCallback<React.MouseEventHandler<HTMLSpanElement>>((ev) => {
        const wasSelected = ev.currentTarget.classList.contains('selected');
        const rawIndex = ev.currentTarget.getAttribute('data-color-index');
        if (!rawIndex) return;

        const index = Number.parseInt(rawIndex);
        if (isNaN(index)) return;

        if (wasSelected) setSelected(selected.filter(value => value !== index));
        else setSelected([...selected, index]);
    }, [selected, setSelected]);

    return <div className='color-selector' style={{
        '--row-width': columns
    } as React.CSSProperties}>
        {palette.map(({ r, g, b, index }, colorId) => {
            const column = colorId % columns;
            const row = Math.floor(colorId / columns);

            const isSelected = selected.includes(index) ? 'selected' : '';

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
                data-color-index={index}
                className={`color-element ${isSelected} ${corner}`}
                style={{
                    '--palette-color': `rgb(${r},${g},${b})`,
                } as React.CSSProperties}
                onClick={toggleSelection}
            >
            </span>;
        })}
    </div>;
}

