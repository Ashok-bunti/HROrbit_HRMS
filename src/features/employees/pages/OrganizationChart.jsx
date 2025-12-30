import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    CircularProgress,
    Alert,
    Stack,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Autocomplete
} from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import {
    AccountTree as OrgChartIcon,
    ZoomIn as ZoomInIcon,
    ZoomOut as ZoomOutIcon,
    CenterFocusStrong as CenterIcon
} from '@mui/icons-material';
import { getOrganizationChart, updateReportingManager } from '../services/organizationService';
import OrgChartNode from '../components/OrgChartNode';

const OrganizationChart = () => {
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [newManager, setNewManager] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [collapsedNodes, setCollapsedNodes] = useState(new Set());

    const handleToggleNode = (id) => {
        setCollapsedNodes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const chartResponse = await getOrganizationChart();
            setChartData(chartResponse.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching organization data:', err);
            setError('Failed to load organization chart. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleEditManager = (employee) => {
        setSelectedEmployee(employee);
        setNewManager(employee.reporting_manager);
        setEditDialogOpen(true);
    };

    const handleSaveManager = async () => {
        try {
            await updateReportingManager(
                selectedEmployee.id,
                newManager?.id || null
            );
            setEditDialogOpen(false);
            fetchData();
        } catch (err) {
            console.error('Error updating manager:', err);
            alert('Failed to update reporting manager');
        }
    };

    const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.1, 2));
    const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
    const handleResetZoom = () => setZoomLevel(1);

    // CSS Tree Styles
    const treeStyles = `
        .org-tree ul {
            padding-top: 20px; 
            position: relative;
            transition: all 0.5s;
            display: flex;
            justify-content: center;
            margin: 0;
            padding-left: 0;
        }

        .org-tree li {
            float: left; 
            text-align: center;
            list-style-type: none;
            position: relative;
            padding: 20px 10px 0 10px;
            transition: all 0.5s;
        }

        /* We will use ::before and ::after to draw the connectors */

        .org-tree li::before, .org-tree li::after {
            content: '';
            position: absolute; 
            top: 0; 
            right: 50%;
            border-top: 2px solid #ccc;
            width: 50%; 
            height: 20px;
        }

        .org-tree li::after {
            right: auto; 
            left: 50%;
            border-left: 2px solid #ccc;
        }

        /* Only one child: remove left/right connectors, just keep vertical down */
        .org-tree li:only-child::after, .org-tree li:only-child::before {
            display: none;
        }

        /* Only one child: we still need a vertical line up to the parent */
        .org-tree li:only-child { 
            padding-top: 0;
        }

        /* Remove space from the top of the tree */
        .org-tree > ul > li {
            padding-top: 0;
        }
        
        /* Remove left connector from first child */
        .org-tree li:first-of-type::before {
            border: 0 none;
        }

        /* Remove right connector from last child */
        .org-tree li:last-of-type::after {
            border: 0 none;
        }

        /* Add vertical line back for first and last nodes that have siblings */
        .org-tree li:last-of-type::before {
            border-right: 2px solid #ccc;
            border-radius: 0 5px 0 0;
            -webkit-border-radius: 0 5px 0 0;
            -moz-border-radius: 0 5px 0 0;
        }

        .org-tree li:first-of-type::after {
            border-radius: 5px 0 0 0;
            -webkit-border-radius: 5px 0 0 0;
            -moz-border-radius: 5px 0 0 0;
        }

        /* Vertical line down from parent */
        .org-tree ul ul::before {
            content: '';
            position: absolute; 
            top: 0; 
            left: 50%;
            border-left: 2px solid #ccc;
            width: 0; 
            height: 20px;
        }

        /* Connector styles on hover */
        .org-tree li a:hover+ul li::after, 
        .org-tree li a:hover+ul li::before, 
        .org-tree li a:hover+ul::before, 
        .org-tree li a:hover+ul ul::before {
            border-color:  #94a0b4;
        }
    `;



    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress size={60} />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ m: 3 }}>
                {error}
            </Alert>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            {/* Header */}
            <PageHeader
                title="Organization Chart"
                subtitle="Hierarchical view of your organization structure"
                action={
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                            Zoom:
                        </Typography>
                        <IconButton onClick={handleZoomOut} size="small">
                            <ZoomOutIcon />
                        </IconButton>
                        <Typography variant="body2" sx={{ minWidth: 45, textAlign: 'center' }}>
                            {Math.round(zoomLevel * 100)}%
                        </Typography>
                        <IconButton onClick={handleZoomIn} size="small">
                            <ZoomInIcon />
                        </IconButton>
                        <IconButton onClick={handleResetZoom} size="small">
                            <CenterIcon />
                        </IconButton>
                    </Stack>
                }
            />

            {/* Organization Tree */}
            <Paper
                elevation={0}
                sx={{
                    p: 6,
                    overflow: 'auto',
                    minHeight: 600,
                    bgcolor: 'transparent',
                    borderRadius: 2
                }}
            >
                <style>{treeStyles}</style>
                <Box
                    sx={{
                        transform: `scale(${zoomLevel})`,
                        transformOrigin: 'top center',
                        transition: 'transform 0.3s ease',
                        display: 'inline-block',
                        minWidth: '100%'
                    }}
                >
                    {chartData?.hierarchy?.length > 0 ? (
                        <Box className="org-tree">
                            <ul>
                                {chartData.hierarchy.map((employee) => (
                                    <OrgChartNode
                                        key={employee.id}
                                        employee={employee}
                                        level={0}
                                        collapsedNodes={collapsedNodes}
                                        onToggleNode={handleToggleNode}
                                    />
                                ))}
                            </ul>
                        </Box>
                    ) : (
                        <Alert severity="info" sx={{ maxWidth: 600, mx: 'auto' }}>
                            No organization hierarchy data available. Please add employees and
                            assign reporting managers.
                        </Alert>
                    )}
                </Box>
            </Paper>

            {/* Edit Manager Dialog */}
            <Dialog
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Edit Reporting Manager</DialogTitle>
                <DialogContent>
                    {selectedEmployee && (
                        <>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Employee: <strong>{selectedEmployee.name}</strong> (
                                {selectedEmployee.position})
                            </Typography>
                            <Autocomplete
                                options={
                                    chartData?.employees?.filter(
                                        (e) => e.id !== selectedEmployee.id
                                    ) || []
                                }
                                getOptionLabel={(option) =>
                                    `${option.name} - ${option.position} (${option.department})`
                                }
                                value={newManager}
                                onChange={(event, newValue) => setNewManager(newValue)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Reporting Manager"
                                        placeholder="Select a manager"
                                    />
                                )}
                            />
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveManager} variant="contained">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default OrganizationChart;
