import { IconButton, Tooltip } from '@mui/material';

interface IconButtonWithTooltipProp {
    title: string;
    icon: JSX.Element;

    onClick?: () => void;
}

export function IconButtonWithTooltip({ title, icon, onClick }: IconButtonWithTooltipProp) {
    return <Tooltip title={title}>
        <span>
            <IconButton disabled={!onClick} onClick={onClick}>
                {icon}
            </IconButton>
        </span>
    </Tooltip>;
}