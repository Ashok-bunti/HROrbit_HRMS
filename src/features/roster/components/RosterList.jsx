import React, { useState, useEffect } from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { Box, Chip, IconButton, Tooltip, Typography, Button, alpha } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import rosterService from '../store/Rosterapi';
import { useTheme } from '@mui/material/styles';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

const RosterList = ({ employee, canManage }) => {
    const theme = useTheme();
    const [rosters, setRosters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });
    const [rowCount, setRowCount] = useState(0);
    const [selectedIds, setSelectedIds] = useState([]);
    const [confirmState, setConfirmState] = useState({ open: false, type: null, id: null });

    const fetchRosters = async () => {
        setLoading(true);
        try {
            const params = {
                $skip: paginationModel.page * paginationModel.pageSize,
                $top: paginationModel.pageSize,
                $orderby: 'name asc'
            };

            if (employee && employee.id) {
                params.employee_id = employee.id;
            }

            const data = await rosterService.getAllRosters(params);

            if (data && data.data) {
                setRosters(data.data);
                setRowCount(data.count || data.total || data.data.length);
            } else if (Array.isArray(data)) {
                setRosters(data);
                setRowCount(data.length);
            }
        } catch (error) {
            console.error("Failed to fetch rosters", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setLoading(true);
        try {
            await rosterService.deleteRoster(id);
            fetchRosters();
            setConfirmState({ open: false, type: null, id: null });
        } catch (error) {
            console.error('Failed to delete roster', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBulkDelete = async () => {
        setLoading(true);
        try {
            await rosterService.bulkDelete(selectedIds);
            fetchRosters();
            setSelectedIds([]);
            setConfirmState({ open: false, type: null, id: null });
        } catch (error) {
            console.error('Bulk delete failed', error);
        } finally {
            setLoading(false);
        }
    };

    const confirmAction = () => {
        if (confirmState.type === 'single') {
            handleDelete(confirmState.id);
        } else if (confirmState.type === 'bulk') {
            handleBulkDelete();
        }
    };

    useEffect(() => {
        fetchRosters();
    }, [paginationModel, employee]);

    const columns = [
        {
            field: 'employee_id',
            headerName: 'EMP ID',
            width: 100,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
                    <Typography variant="body2" fontWeight={700} color="primary.main">
                        {params.value}
                    </Typography>
                </Box>
            )
        },
        {
            field: 'name',
            headerName: 'EMPLOYEE NAME',
            flex: 1,
            minWidth: 200,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
                    <Typography variant="body2" fontWeight={600}>
                        {params.value}
                    </Typography>
                </Box>
            )
        },
        {
            field: 'pseudo_name',
            headerName: 'PSEUDO NAME',
            flex: 1,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
                    <Typography variant="body2" color="text.secondary">
                        {params.value || '- -'}
                    </Typography>
                </Box>
            )
        },
        {
            field: 'department',
            headerName: 'DEPARTMENT',
            flex: 1,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
                    <Chip
                        label={params.value || 'General'}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 600, color: 'text.secondary', borderColor: alpha(theme.palette.text.secondary, 0.3) }}
                    />
                </Box>
            )
        },
        ...(canManage ? [{
            field: 'actions',
            type: 'actions',
            headerName: 'ACTIONS',
            width: 130,
            align: 'center',
            headerAlign: 'center',
            getActions: (params) => [
                <GridActionsCellItem
                    key={`edit-${params.id}`}
                    icon={<Tooltip title="Edit Roster"><EditIcon fontSize="small" /></Tooltip>}
                    label="Edit"
                    onClick={() => { }} // Handle Edit
                    sx={{
                        color: 'primary.main',
                        border: 1,
                        borderColor: 'primary.main',
                        borderRadius: '50%',
                        width: 32,
                        height: 32,
                        mr: 1,
                        '&:hover': { backgroundColor: 'primary.light', color: 'white' }
                    }}
                />,
                <GridActionsCellItem
                    key={`delete-${params.id}`}
                    icon={<Tooltip title="Delete Roster"><DeleteIcon fontSize="small" /></Tooltip>}
                    label="Delete"
                    onClick={() => setConfirmState({ open: true, type: 'single', id: params.row.id })}
                    sx={{
                        color: 'error.main',
                        border: 1,
                        borderColor: 'error.main',
                        borderRadius: '50%',
                        width: 32,
                        height: 32,
                        '&:hover': { backgroundColor: 'error.light', color: 'white' }
                    }}
                />,
            ]
        }] : [])
    ];

    return (
        <Box sx={{ width: '100%' }}>
            {canManage && selectedIds.length > 0 && (
                <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Typography>{selectedIds.length} items selected</Typography>
                    <Button variant="contained" color="error" size="small" onClick={() => setConfirmState({ open: true, type: 'bulk' })}>
                        Bulk Delete
                    </Button>
                </Box>
            )}
            <Box sx={{
                height: 565,
                width: '100%',
                '& .MuiDataGrid-root': {
                    border: 'none',
                    '& .MuiDataGrid-main': {
                        borderRadius: 0
                    },
                    '& .MuiDataGrid-cell': {
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        fontSize: '0.875rem',
                        '&:focus': { outline: 'none' },
                        '&:focus-within': { outline: 'none' }
                    },
                    '& .MuiDataGrid-columnHeader': {
                        backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#1e1e1e' : '#f8f9fa',
                        color: 'text.secondary',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        '&:focus': { outline: 'none' },
                        '&:focus-within': { outline: 'none' }
                    },
                    '& .MuiDataGrid-row:hover': {
                        backgroundColor: (theme) => theme.palette.action.hover,
                    },
                    '& .MuiDataGrid-columnSeparator': {
                        display: 'none'
                    },
                    '& ::-webkit-scrollbar': { width: 8, height: 8 },
                    '& ::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
                    '& ::-webkit-scrollbar-thumb': {
                        backgroundColor: (theme) => theme.palette.divider,
                        borderRadius: 4,
                        '&:hover': { backgroundColor: (theme) => theme.palette.text.disabled },
                    },
                }
            }}>
                <DataGrid
                    rows={rosters}
                    columns={columns}
                    loading={loading}
                    rowCount={rowCount}
                    pageSizeOptions={[10, 25, 50]}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    paginationMode="server"
                    checkboxSelection={canManage}
                    onRowSelectionModelChange={(newSelection) => setSelectedIds(newSelection)}
                    disableRowSelectionOnClick
                    density="compact"
                    rowHeight={52}
                    columnHeaderHeight={48}
                />
            </Box>
            <ConfirmDialog
                open={confirmState.open}
                onClose={() => setConfirmState({ open: false, type: null, id: null })}
                onConfirm={confirmAction}
                title={confirmState.type === 'bulk' ? "Bulk Delete" : "Delete Roster"}
                message={confirmState.type === 'bulk'
                    ? `Are you sure you want to delete ${selectedIds.length} rosters? This action cannot be undone.`
                    : "Are you sure you want to delete this roster? This action cannot be undone."}
                loading={loading}
            />
        </Box>
    );
};

export default RosterList;
