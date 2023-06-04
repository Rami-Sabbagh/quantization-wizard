import { RGBA } from './interfaces';

function toHex(byte: number): string {
    byte = Math.floor(byte);
    return (byte < 16) ? `0${byte.toString(16)}` : byte.toString(16);
}

export function rgba2hex(rgba: RGBA): string {
    const [r, g, b, a] = rgba;
    return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a)}`;
}