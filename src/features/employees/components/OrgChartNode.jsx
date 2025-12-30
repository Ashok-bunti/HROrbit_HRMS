import React from 'react';
import {
    Box,
    Typography,
    Avatar,
    IconButton,
    Divider,
    alpha
} from '@mui/material';
import {
    KeyboardArrowDown,
    KeyboardArrowUp
} from '@mui/icons-material';

const getInitials = (name) => {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

const getAvatarColor = (level) => {
    const colors = [
        '#00bcd4', // Cyan for top level
        '#f44336', // Red for level 1
        '#8bc34a', // Green for level 2
        '#ff9800', // Orange for level 3+
    ];
    return colors[Math.min(level, colors.length - 1)];
};

const OrgChartNode = ({ employee, level = 0, collapsedNodes, onToggleNode }) => {
    const hasChildren = employee.children && employee.children.length > 0;
    const avatarColor = getAvatarColor(level);
    const isCollapsed = collapsedNodes.has(employee.id);

    // Responsive sizes based on hierarchy
    const nodeWidth = 240;
    const avatarSize = level === 0 ? 44 : 36;
    const nameSize = level === 0 ? '0.95rem' : '0.85rem';
    const roleSize = level === 0 ? '0.8rem' : '0.75rem';
    const positionSize = level === 0 ? '0.75rem' : '0.7rem';

    return (
        <li key={employee.id}>
            <Box
                sx={{
                    display: 'inline-flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative',
                    zIndex: 2,
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        bgcolor: 'background.paper',
                        borderRadius: 50,
                        p: 0.5,
                        pl: 0.5,
                        pr: 1,
                        cursor: 'default',
                        border: '1px solid',
                        borderColor: 'divider',
                        width: nodeWidth,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
                            borderColor: avatarColor
                        }
                    }}
                >
                    <Avatar
                        sx={{
                            width: avatarSize,
                            height: avatarSize,
                            border: '2px solid',
                            borderColor: avatarColor,
                            bgcolor: 'white',
                            color: avatarColor,
                            fontWeight: 'bold',
                            fontSize: level === 0 ? '0.9rem' : '0.75rem'
                        }}
                    >
                        {getInitials(employee.name)}
                    </Avatar>

                    <Box sx={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
                        <Typography
                            variant="subtitle2"
                            fontWeight="bold"
                            lineHeight={1.2}
                            noWrap
                            sx={{ fontSize: nameSize }}
                        >
                            {employee.name}
                        </Typography>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            lineHeight={1}
                            sx={{ mt: 0.25, fontSize: roleSize }}
                            noWrap
                        >
                            {employee.role || 'No Role'}
                        </Typography>
                        {employee.position && (
                            <Typography
                                variant="caption"
                                color="text.disabled"
                                display="block"
                                lineHeight={1}
                                sx={{ fontSize: positionSize }}
                                noWrap
                            >
                                {employee.position}
                            </Typography>
                        )}
                    </Box>

                    {hasChildren && (
                        <>
                            <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 24, alignSelf: 'center' }} />
                            <Box sx={{ width: 20, display: 'flex', justifyContent: 'center' }}>
                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleNode(employee.id);
                                    }}
                                    sx={{
                                        width: 20,
                                        height: 20,
                                        p: 0,
                                        color: 'text.secondary',
                                        '&:hover': { color: 'primary.main', bgcolor: 'transparent' }
                                    }}
                                >
                                    {isCollapsed ? <KeyboardArrowDown sx={{ fontSize: 18 }} /> : <KeyboardArrowUp sx={{ fontSize: 18 }} />}
                                </IconButton>
                            </Box>
                        </>
                    )}
                </Box>
            </Box>

            {!isCollapsed && hasChildren && (
                <ul>
                    {employee.children.map((child) => (
                        <OrgChartNode
                            key={child.id}
                            employee={child}
                            level={level + 1}
                            collapsedNodes={collapsedNodes}
                            onToggleNode={onToggleNode}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
};

export default OrgChartNode;
