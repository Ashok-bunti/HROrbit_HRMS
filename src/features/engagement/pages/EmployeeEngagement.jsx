import React, { useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    TextField,
    MenuItem,
    FormControlLabel,
    Switch,
    Alert,
    Rating,
    Divider,
    Chip
} from '@mui/material';
import { Send, Poll } from '@mui/icons-material';
import {
    useGetActiveSurveysQuery,
    useSubmitSurveyResponseMutation,
    useSubmitFeedbackMutation
} from '../../engagement/store/engagementApi';

import { usePermissions } from '../../../hooks/usePermissions';
import CustomSnackbar from '../../../components/common/CustomSnackbar';
import useSnackbar from '../../../hooks/useSnackbar';

const EmployeeEngagement = () => {
    const { can } = usePermissions();
    const { data: surveysData, isLoading: surveysLoading } = useGetActiveSurveysQuery();
    const [submitResponse] = useSubmitSurveyResponseMutation();
    const [submitFeedback] = useSubmitFeedbackMutation();

    if (!can('surveys', 'read') && !can('feedback', 'read')) {
        return <Alert severity="error">You do not have permission to access Engagement features.</Alert>;
    }

    // Feedback State
    const [category, setCategory] = useState('General');
    const [message, setMessage] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const { showSnackbar, snackbar, hideSnackbar } = useSnackbar();

    // Survey State
    const [answers, setAnswers] = useState({});

    const handleFeedbackSubmit = async () => {
        try {
            await submitFeedback({ category, message, is_anonymous: isAnonymous }).unwrap();
            showSnackbar('Feedback submitted successfully!', 'success');
            setMessage('');
            setCategory('General');
        } catch (err) {
            showSnackbar('Failed to submit feedback', 'error');
        }
    };

    const handleSurveySubmit = async (surveyId) => {
        try {
            // Collect answers for this survey
            const surveyAnswers = {};
            // Simplified: assuming answers state structure matches needed format
            // In reality, you'd filter answers by surveyId

            await submitResponse({
                survey_id: surveyId,
                answers: answers[surveyId] || {}
            }).unwrap();

            showSnackbar('Survey response submitted!', 'success');
        } catch (err) {
            showSnackbar(err.data?.error || 'Failed to submit response', 'error');
        }
    };

    const handleRatingChange = (surveyId, questionId, value) => {
        setAnswers(prev => ({
            ...prev,
            [surveyId]: {
                ...prev[surveyId],
                [questionId]: value
            }
        }));
    };

    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Employee Engagement
            </Typography>



            <Grid container spacing={4}>
                {/* Active Surveys Section */}
                {can('surveys', 'read') && (
                    <Grid item xs={12} md={7}>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                            <Poll sx={{ mr: 1 }} /> Active Pulse Surveys
                        </Typography>

                        {surveysData?.surveys?.length === 0 && (
                            <Alert severity="info">No active surveys at the moment.</Alert>
                        )}

                        {surveysData?.surveys?.map((survey) => (
                            <Card key={survey.id} sx={{ mb: 3, border: '1px solid #e0e0e0' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="h6">{survey.title}</Typography>
                                        {survey.has_responded && <Chip label="Completed" color="success" size="small" />}
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        {survey.description}
                                    </Typography>

                                    {!survey.has_responded ? (
                                        <Box>
                                            <Divider sx={{ my: 2 }} />
                                            {survey.questions.map((q) => (
                                                <Box key={q.id} sx={{ mb: 2 }}>
                                                    <Typography gutterBottom>{q.question_text}</Typography>
                                                    <Rating
                                                        value={answers[survey.id]?.[q.id] || 0}
                                                        onChange={(event, newValue) => {
                                                            handleRatingChange(survey.id, q.id, newValue);
                                                        }}
                                                    />
                                                </Box>
                                            ))}
                                            <Button
                                                variant="contained"
                                                onClick={() => handleSurveySubmit(survey.id)}
                                                disabled={!answers[survey.id]}
                                            >
                                                Submit Response
                                            </Button>
                                        </Box>
                                    ) : (
                                        <Typography variant="body2" color="success.main">
                                            Thank you for your participation!
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </Grid>
                )}

                {/* Feedback Section */}
                {can('feedback', 'create') && (
                    <Grid item xs={12} md={5}>
                        <Card sx={{ position: 'sticky', top: 20 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Share Your Feedback
                                </Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    Have a suggestion or concern? Let us know. You can choose to remain anonymous.
                                </Typography>

                                <TextField
                                    select
                                    label="Category"
                                    fullWidth
                                    margin="normal"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    <MenuItem value="General">General</MenuItem>
                                    <MenuItem value="Work Environment">Work Environment</MenuItem>
                                    <MenuItem value="Management">Management</MenuItem>
                                    <MenuItem value="Suggestion">Suggestion</MenuItem>
                                    <MenuItem value="Grievance">Grievance</MenuItem>
                                </TextField>

                                <TextField
                                    label="Your Message"
                                    fullWidth
                                    multiline
                                    rows={4}
                                    margin="normal"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={isAnonymous}
                                            onChange={(e) => setIsAnonymous(e.target.checked)}
                                        />
                                    }
                                    label="Submit Anonymously"
                                    sx={{ mt: 1, mb: 2 }}
                                />

                                <Button
                                    variant="contained"
                                    fullWidth
                                    startIcon={<Send />}
                                    onClick={handleFeedbackSubmit}
                                    disabled={!message}
                                >
                                    Submit Feedback
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                )}
            </Grid>

            <CustomSnackbar
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={hideSnackbar}
            />
        </Box>
    );
};

export default EmployeeEngagement;
