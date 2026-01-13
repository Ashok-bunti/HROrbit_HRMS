import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    Paper,
    Alert,
    Chip,
    TextField,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    CircularProgress,
    Tooltip,
    FormControlLabel,
    Switch,
    Stack,
    InputAdornment,
    useMediaQuery,
    alpha
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    MyLocation as MyLocationIcon,
    LocationOn as LocationOnIcon,
    CheckCircle as CheckCircleIcon,
    RadioButtonUnchecked as UncheckedIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import PageHeader from '../../../components/common/PageHeader';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import CustomSnackbar from '../../../components/common/CustomSnackbar';
import useSnackbar from '../../../hooks/useSnackbar';
import {
    useGetOfficeLocationsQuery,
    useCreateOfficeLocationMutation,
    useUpdateOfficeLocationMutation,
    useDeleteOfficeLocationMutation
} from '../store/attendanceApi';

const OfficeLocations = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

    const [searchTerm, setSearchTerm] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [isGettingLocation, setIsGettingLocation] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        latitude: '',
        longitude: '',
        radius_meters: 50,
        is_active: true
    });

    const { data, isLoading, error } = useGetOfficeLocationsQuery();
    const [createLocation, { isLoading: isCreating }] = useCreateOfficeLocationMutation();
    const [updateLocation, { isLoading: isUpdating }] = useUpdateOfficeLocationMutation();
    const [deleteLocation, { isLoading: isDeleting }] = useDeleteOfficeLocationMutation();

    const filteredLocations = (data?.locations || []).filter(loc =>
        loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenDialog = (location = null) => {
        if (location) {
            setSelectedLocation(location);
            setFormData({
                name: location.name,
                address: location.address || '',
                latitude: location.latitude,
                longitude: location.longitude,
                radius_meters: location.radius_meters || 50,
                is_active: location.is_active
            });
        } else {
            setSelectedLocation(null);
            setFormData({
                name: '',
                address: '',
                latitude: '',
                longitude: '',
                radius_meters: 50,
                is_active: true
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedLocation(null);
    };

    const getCurrentLocation = () => {
        setIsGettingLocation(true);
        if (!navigator.geolocation) {
            showSnackbar('Geolocation is not supported by your browser', 'error');
            setIsGettingLocation(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData({
                    ...formData,
                    latitude: position.coords.latitude.toFixed(8),
                    longitude: position.coords.longitude.toFixed(8)
                });
                showSnackbar('Captured current location!', 'success');
                setIsGettingLocation(false);
            },
            (err) => {
                showSnackbar(`Error: ${err.message}`, 'error');
                setIsGettingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                latitude: parseFloat(formData.latitude),
                longitude: parseFloat(formData.longitude),
                radius_meters: parseFloat(formData.radius_meters)
            };

            if (selectedLocation) {
                await updateLocation({ id: selectedLocation.id, ...payload }).unwrap();
                showSnackbar('Location updated successfully', 'success');
            } else {
                await createLocation(payload).unwrap();
                showSnackbar('Location created successfully', 'success');
            }
            handleCloseDialog();
        } catch (err) {
            showSnackbar(err.data?.error || 'Failed to save location', 'error');
        }
    };

    const handleDeleteClick = (location) => {
        setSelectedLocation(location);
        setConfirmDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (selectedLocation) {
            try {
                await deleteLocation(selectedLocation.id).unwrap();
                showSnackbar('Location deleted successfully', 'success');
                setConfirmDeleteOpen(false);
                setSelectedLocation(null);
            } catch (err) {
                showSnackbar(err.data?.error || 'Failed to delete location', 'error');
            }
        }
    };

    const columns = [
        {
            field: 'name',
            headerName: 'OFFICE NAME',
            flex: 1,
            minWidth: 150,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    <Typography variant="body2" fontWeight={600} color="primary.main">
                        {params.value}
                    </Typography>
                </Box>
            )
        },
        {
            field: 'address',
            headerName: 'ADDRESS',
            flex: 1.5,
            minWidth: 200,
            renderCell: (params) => (
                <Typography variant="body2" noWrap>
                    {params.value || '- -'}
                </Typography>
            )
        },
        {
            field: 'coords',
            headerName: 'COORDINATES',
            width: 200,
            valueGetter: (value, row) => `${row.latitude}, ${row.longitude}`,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationOnIcon fontSize="small" color="action" />
                    <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                        {params.value}
                    </Typography>
                </Box>
            )
        },
        {
            field: 'radius_meters',
            headerName: 'RADIUS',
            width: 100,
            renderCell: (params) => `${params.value}m`
        },
        {
            field: 'is_active',
            headerName: 'STATUS',
            width: 120,
            renderCell: (params) => (
                <Chip
                    label={params.value ? 'Active' : 'Inactive'}
                    color={params.value ? 'success' : 'default'}
                    size="small"
                    variant={params.value ? 'filled' : 'outlined'}
                    sx={{ fontWeight: 600 }}
                />
            )
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'ACTIONS',
            width: 100,
            getActions: (params) => [
                <GridActionsCellItem
                    key={`edit-${params.id}`}
                    icon={<Tooltip title="Edit"><EditIcon /></Tooltip>}
                    label="Edit"
                    onClick={() => handleOpenDialog(params.row)}
                    color="primary"
                />,
                <GridActionsCellItem
                    key={`delete-${params.id}`}
                    icon={<Tooltip title="Delete"><DeleteIcon /></Tooltip>}
                    label="Delete"
                    onClick={() => handleDeleteClick(params.row)}
                    color="error"
                />,
            ],
        },
    ];

    if (error) return <Alert severity="error">Error loading locations: {error.data?.error || 'Unknown error'}</Alert>;

    return (
        <Box sx={{ pb: 4 }}>
            <PageHeader
                title="Office Locations"
                subtitle="Configure geofencing locations for attendance clock-in."
                action={
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            placeholder="Search locations..."
                            size="small"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                                sx: { bgcolor: 'background.paper', borderRadius: 2 }
                            }}
                        />
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenDialog()}
                            sx={{ borderRadius: 2, px: 3 }}
                        >
                            Add Location
                        </Button>
                    </Box>
                }
            />

            {isMobile ? (
                <Stack spacing={2}>
                    {filteredLocations.map((loc) => (
                        <Card key={loc.id} sx={{ p: 2, borderRadius: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                                    {loc.name}
                                </Typography>
                                <Chip
                                    label={loc.is_active ? 'Active' : 'Inactive'}
                                    color={loc.is_active ? 'success' : 'default'}
                                    size="small"
                                />
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                                {loc.address}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                                    {loc.latitude}, {loc.longitude} ({loc.radius_meters}m)
                                </Typography>
                                <Box>
                                    <IconButton size="small" onClick={() => handleOpenDialog(loc)} color="primary">
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => handleDeleteClick(loc)} color="error">
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Box>
                        </Card>
                    ))}
                </Stack>
            ) : (
                <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
                    <Box sx={{ height: 600, width: '100%' }}>
                        <DataGrid
                            rows={filteredLocations}
                            columns={columns}
                            loading={isLoading}
                            pageSizeOptions={[10, 25, 50]}
                            disableRowSelectionOnClick
                            density="comfortable"
                        />
                    </Box>
                </Card>
            )}

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{selectedLocation ? 'Edit Office Location' : 'Add Office Location'}</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent dividers>
                        <Stack spacing={3} sx={{ pt: 1 }}>
                            <TextField
                                fullWidth
                                label="Location Name"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Head Office, Branch Office"
                            />
                            <TextField
                                fullWidth
                                label="Address"
                                multiline
                                rows={2}
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />

                            <Box>
                                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    Coordinates
                                    <Button
                                        size="small"
                                        startIcon={isGettingLocation ? <CircularProgress size={16} /> : <MyLocationIcon />}
                                        onClick={getCurrentLocation}
                                        disabled={isGettingLocation}
                                        sx={{ ml: 'auto', textTransform: 'none' }}
                                    >
                                        Get Current Location
                                    </Button>
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            label="Latitude"
                                            required
                                            type="number"
                                            inputProps={{ step: "any" }}
                                            value={formData.latitude}
                                            onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            label="Longitude"
                                            required
                                            type="number"
                                            inputProps={{ step: "any" }}
                                            value={formData.longitude}
                                            onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>

                            <TextField
                                fullWidth
                                label="Allowed Radius (meters)"
                                required
                                type="number"
                                value={formData.radius_meters}
                                onChange={(e) => setFormData({ ...formData, radius_meters: e.target.value })}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">m</InputAdornment>,
                                }}
                            />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography variant="subtitle2">Set as Active Location</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Only one location can be active for attendance tracking at a time.
                                        </Typography>
                                    </Box>
                                }
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isCreating || isUpdating}
                        >
                            {isCreating || isUpdating ? <CircularProgress size={24} /> : 'Save Location'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            <ConfirmDialog
                open={confirmDeleteOpen}
                onClose={() => setConfirmDeleteOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Location"
                message={`Are you sure you want to delete ${selectedLocation?.name}? This will affect attendance tracking if this was the active location.`}
                loading={isDeleting}
            />

            <CustomSnackbar
                open={snackbar.open}
                onClose={hideSnackbar}
                message={snackbar.message}
                severity={snackbar.severity}
            />
        </Box>
    );
};

export default OfficeLocations;
