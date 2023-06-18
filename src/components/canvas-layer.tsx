import React, { useRef, useEffect, useState } from 'react';

type CanvasLayerProps = {
    resetToken?: number;
    children?: React.ReactNode;
};

export function CanvasLayer({ resetToken, children }: CanvasLayerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const paneRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!resetToken) setVisible(false);
        else {
            const container = containerRef.current, pane = paneRef.current;
            if (!container || !pane) return;

            container.scrollTo(
                (container.scrollWidth - container.clientWidth) * .5,
                (container.scrollHeight - container.clientHeight - 50) * .5,
            );

            pane.style.scale = '1';

            setVisible(true);
        }
    }, [resetToken]);

    useEffect(() => {
        const container = containerRef.current, pane = paneRef.current, overlay = overlayRef.current;
        if (!container || !pane || !overlay) return;

        let activePointer: number | null = null;

        const pointerListener = (ev: PointerEvent) => {
            const { type, pointerId, movementX, movementY } = ev;

            if (type === 'pointerdown' && activePointer === null) activePointer = pointerId;
            else if ((type === 'pointerup' || type === 'pointerout') && activePointer === pointerId) activePointer = null;

            overlay.style.cursor = activePointer === null ? 'grab' : 'grabbing';
            if (activePointer !== pointerId) return;

            // Un-focus any active element.
            const activeElement = document.activeElement;
            if (activeElement instanceof HTMLElement) activeElement.blur();

            container.scrollBy(-movementX, -movementY);
            ev.preventDefault();
        };

        const wheelListener = (ev: WheelEvent) => {
            const scaleRaw = pane.style.scale;
            const scale = Number.parseFloat(scaleRaw === '' ? '1' : scaleRaw);
            const delta = ev.deltaY * -1e-3 * Math.ceil(scale);

            if (scale + delta < 0.1) return;
            if (scale + delta > 20) return;

            pane.style.scale = (scale + delta).toString();
        };

        overlay.addEventListener('pointerdown', pointerListener);
        overlay.addEventListener('pointermove', pointerListener);
        overlay.addEventListener('pointerup', pointerListener);
        overlay.addEventListener('pointerout', pointerListener);
        overlay.addEventListener('wheel', wheelListener, { passive: true });

        return () => {
            overlay.removeEventListener('pointerdown', pointerListener);
            overlay.removeEventListener('pointermove', pointerListener);
            overlay.removeEventListener('pointerup', pointerListener);
            overlay.removeEventListener('pointerout', pointerListener);
            overlay.removeEventListener('wheel', wheelListener);
        };
    }, []);


    return <>
        <div ref={containerRef} className="canvas-layer" style={{ opacity: visible ? 1 : 0 }}>
            <div ref={paneRef} className="canvas-pane">
                {children}
            </div>
        </div>
        <div ref={overlayRef} className="canvas-input-overlay" />
    </>;
}
