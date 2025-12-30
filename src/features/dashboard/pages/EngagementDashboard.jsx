import React, { useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    Chip,
    IconButton,
    Divider,
    Alert
} from '@mui/material';
import { Add, Poll, Feedback, Delete } from '@mui/icons-material';
import {
    useGetEngagementStatsQuery,
    useGetAllFeedbackQuery,
    useCreateSurveyMutation
} from '../../engagement/store/engagementApi';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

import { usePermissions } from '../../../hooks/usePermissions';
import CustomSnackbar from '../../../components/common/CustomSnackbar';
import useSnackbar from '../../../hooks/useSnackbar';

const EngagementDashboard = () => {
    const { can } = usePermissions();
    const { data: statsData, isLoading: statsLoading } = useGetEngagementStatsQuery();
    const { data: feedbackData, isLoading: feedbackLoading } = useGetAllFeedbackQuery();
    const [createSurvey, { isLoading: isCreating }] = useCreateSurveyMutation();

    const [openDialog, setOpenDialog] = useState(false);
    const [surveyTitle, setSurveyTitle] = useState('');
    const [surveyDesc, setSurveyDesc] = useState('');
    const [questions, setQuestions] = useState([{ question_text: '', type: 'rating' }]);
    const { showSnackbar, snackbar, hideSnackbar } = useSnackbar();

    const handleAddQuestion = () => {
        setQuestions([...questions, { question_text: '', type: 'rating' }]);
    };

    const handleQuestionChange = (index, value) => {
        const newQuestions = [...questions];
        newQuestions[index].question_text = value;
        setQuestions(newQuestions);
    };

    const handleCreateSurvey = async () => {
        try {
            await createSurvey({
                title: surveyTitle,
                description: surveyDesc,
                questions
            }).unwrap();
            setOpenDialog(false);
            showSnackbar('Survey created successfully!', 'success');
            setSurveyTitle('');
            setSurveyDesc('');
            setQuestions([{ question_text: '', type: 'rating' }]);
        } catch (err) {
            showSnackbar('Failed to create survey', 'error');
        }
    };

    const feedbackChartData = statsData?.stats?.feedback_distribution?.map(item => ({
        name: item.category,
        value: item._count.id
    })) || [];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                <Typography variant="h4" fontWeight="bold">Engagement Dashboard</Typography>
                {can('surveys', 'create') && (
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setOpenDialog(true)}
                    >
                        Create New Survey
                    </Button>
                )}
            </Box>



            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%', bgcolor: 'primary.main', color: 'white' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Poll sx={{ fontSize: 40, mr: 2, opacity: 0.8 }} />
                                <Box>
                                    <Typography variant="h3" fontWeight="bold">
                                        {statsData?.stats?.active_surveys || 0}
                                    </Typography>
                                    <Typography variant="subtitle1">Active Surveys</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%', bgcolor: 'success.main', color: 'white' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Feedback sx={{ fontSize: 40, mr: 2, opacity: 0.8 }} />
                                <Box>
                                    <Typography variant="h3" fontWeight="bold">
                                        {statsData?.stats?.total_responses || 0}
                                    </Typography>
                                    <Typography variant="subtitle1">Total Responses</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Feedback Categories</Typography>
                            <Box sx={{ height: 300, width: '100%' }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={feedbackChartData}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {feedbackChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                                {feedbackChartData.map((entry, index) => (
                                    <Box key={entry.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: COLORS[index % COLORS.length] }} />
                                        <Typography variant="caption">{entry.name}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Recent Feedback</Typography>
                            <List>
                                {feedbackData?.feedback?.slice(0, 5).map((item) => (
                                    <React.Fragment key={item.id}>
                                        <ListItem alignItems="flex-start">
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <Typography variant="subtitle2" fontWeight="bold">
                                                            {item.category}
                                                        </Typography>
                                                        {item.is_anonymous ? (
                                                            <Chip label="Anonymous" size="small" variant="outlined" />
                                                        ) : (
                                                            <Typography variant="caption" color="text.secondary">
                                                                {item.employees?.first_name} {item.employees?.last_name}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                }
                                                secondary={item.message}
                                            />
                                        </ListItem>
                                        <Divider component="li" />
                                    </React.Fragment>
                                ))}
                                {feedbackData?.feedback?.length === 0 && (
                                    <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                                        No feedback received yet.
                                    </Typography>
                                )}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Create Survey Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create New Pulse Survey</DialogTitle>
                <DialogContent dividers>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Survey Title"
                        fullWidth
                        value={surveyTitle}
                        onChange={(e) => setSurveyTitle(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Description"
                        fullWidth
                        multiline
                        rows={2}
                        value={surveyDesc}
                        onChange={(e) => setSurveyDesc(e.target.value)}
                        sx={{ mb: 3 }}
                    />

                    <Typography variant="subtitle2" gutterBottom>Questions</Typography>
                    {questions.map((q, index) => (
                        <Box key={index} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder={`Question ${index + 1}`}
                                value={q.question_text}
                                onChange={(e) => handleQuestionChange(index, e.target.value)}
                            />
                        </Box>
                    ))}
                    <Button startIcon={<Add />} onClick={handleAddQuestion} size="small">
                        Add Question
                    </Button>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleCreateSurvey}
                        variant="contained"
                        disabled={isCreating || !surveyTitle}
                    >
                        Create Survey
                    </Button>
                </DialogActions>
            </Dialog>

            <CustomSnackbar
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={hideSnackbar}
            />
        </Box>
    );
};

export default EngagementDashboard;
