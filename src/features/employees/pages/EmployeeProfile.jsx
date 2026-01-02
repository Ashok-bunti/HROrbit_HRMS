import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Avatar,
    Chip,
    Alert,
    CircularProgress,
    Divider,
    Tab,
    Tabs,
    IconButton,
    Tooltip,
    LinearProgress,
    Autocomplete,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    alpha,
    useTheme
} from '@mui/material';

import PersonIcon from '@mui/icons-material/Person';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import EmailIcon from '@mui/icons-material/Email';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BadgeIcon from '@mui/icons-material/Badge';
import WorkIcon from '@mui/icons-material/Work';
import HomeIcon from '@mui/icons-material/Home';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import { useAuth } from '../../../context/AuthContext';
import {
    useGetEmployeeByUserIdQuery,
    useUpdateOwnProfileMutation,
    useGetEmployeeDocumentsQuery,
    useUploadDocumentMutation,
    useDeleteDocumentMutation
} from '../store/employeeApi';
import MFASetup from '../../auth/pages/MFASetup';
import CustomSnackbar from '../../../components/common/CustomSnackbar';
import useSnackbar from '../../../hooks/useSnackbar';
import FileDropZone from '../../../components/common/FileDropZone';
import PageHeader from '../../../components/common/PageHeader';

const maskValue = (value, visibleLast = 4) => {
    if (!value) return '';
    const str = String(value);
    if (str.length <= visibleLast) return str;
    return '•'.repeat(str.length - visibleLast) + str.slice(-visibleLast);
};

const EmployeeProfile = () => {
    const theme = useTheme();
    const { user, token } = useAuth();
    const [searchParams] = useSearchParams();
    const targetUserId = searchParams.get('userId') || user?.id;
    const isOwnProfile = targetUserId == user?.id;

    // Calculate maximum allowed date of birth (18 years ago from today)
    const maxDOB = new Date();
    maxDOB.setFullYear(maxDOB.getFullYear() - 18);
    const maxDOBString = maxDOB.toISOString().split('T')[0];

    // HR/Admin can view any profile, Employees can only view their own
    const canView = user?.role === 'admin' || user?.role === 'hr' || isOwnProfile;

    const [tabValue, setTabValue] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        phone: '',
        emergency_contact: '',
        date_of_birth: '',
        gender: '',
        blood_group: '',
        marital_status: '',
        father_name: '',
        education_qualification: '',
        current_address: '',
        permanent_address: '',
        city: '',
        state: '',
        country: 'India',
        postal_code: '',
        aadhaar_number: '',
        pan_number: '',
        uan_number: '',
        esi_number: '',
        bank_name: '',
        bank_account_number: '',
        bank_ifsc_code: '',
        biometric_id: ''
    });
    const [imageTimestamp, setImageTimestamp] = useState(Date.now());
    const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

    const { data: employeeData, isLoading, refetch } = useGetEmployeeByUserIdQuery(targetUserId, {
        skip: !targetUserId || !canView
    });

    const { data: documentsData, refetch: refetchDocs } = useGetEmployeeDocumentsQuery(targetUserId, {
        skip: !targetUserId || !canView
    });

    const [updateProfile, { isLoading: isUpdating }] = useUpdateOwnProfileMutation();
    const [uploadDocument, { isLoading: isUploading }] = useUploadDocumentMutation();
    const [deleteDocument] = useDeleteDocumentMutation();

    // Delete Confirmation State
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, type: null, label: '' });

    useEffect(() => {
        if (employeeData?.employee) {
            const emp = employeeData.employee;
            setFormData({
                phone: emp.phone || '',
                emergency_contact: emp.emergency_contact || '',
                date_of_birth: emp.date_of_birth ? emp.date_of_birth.split('T')[0] : '',
                gender: emp.gender || '',
                blood_group: emp.blood_group || '',
                marital_status: emp.marital_status || '',
                father_name: emp.father_name || '',
                education_qualification: emp.education_qualification || '',
                current_address: emp.current_address || '',
                permanent_address: emp.permanent_address || '',
                city: emp.city || '',
                state: emp.state || '',
                country: emp.country || 'India',
                postal_code: emp.postal_code || '',
                aadhaar_number: emp.aadhaar_number || '',
                pan_number: emp.pan_number || '',
                uan_number: emp.uan_number || '',
                esi_number: emp.esi_number || '',
                bank_name: emp.bank_name || '',
                bank_account_number: emp.bank_account_number || '',
                bank_ifsc_code: emp.bank_ifsc_code || '',
                biometric_id: emp.biometric_id || ''
            });
        }
    }, [employeeData]);

    // Fetch Bank List
    const [bankList, setBankList] = useState([]);
    const [branchName, setBranchName] = useState('');
    const [isLoadingBanks, setIsLoadingBanks] = useState(false);

    useEffect(() => {
        const fetchBanks = async () => {
            setIsLoadingBanks(true);
            try {
                const response = await fetch('https://raw.githubusercontent.com/razorpay/ifsc/master/src/banknames.json');
                const data = await response.json();
                const banks = [...new Set(Object.values(data))].sort();
                setBankList(banks);
            } catch (error) {
                console.error('Failed to fetch bank list:', error);
            } finally {
                setIsLoadingBanks(false);
            }
        };
        fetchBanks();
    }, []);

    // Fetch Branch Details based on IFSC
    useEffect(() => {
        const fetchBranch = async () => {
            const ifsc = formData.bank_ifsc_code;
            if (ifsc && ifsc.length === 11) {
                try {
                    const response = await fetch(`https://ifsc.razorpay.com/${ifsc}`);
                    if (response.ok) {
                        const data = await response.json();
                        setBranchName(data.BRANCH || '');
                        // Optionally auto-select bank name if not set
                        if (!formData.bank_name && data.BANK) {
                            setFormData(prev => ({ ...prev, bank_name: data.BANK }));
                        }
                    } else {
                        setBranchName('');
                    }
                } catch (error) {
                    console.error('Failed to fetch branch details:', error);
                    setBranchName('');
                }
            } else {
                setBranchName('');
            }
        };

        const timeoutId = setTimeout(() => {
            fetchBranch();
        }, 500); // Debounce

        return () => clearTimeout(timeoutId);
    }, [formData.bank_ifsc_code]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await updateProfile({
                userId: targetUserId,
                ...formData
            }).unwrap();
            showSnackbar('Profile updated successfully', 'success');
            setIsEditing(false);
            refetch();
        } catch (err) {
            showSnackbar(err.data?.error || 'Failed to update profile', 'error');
        }
    };

    const handleFileUpload = async (fileOrEvent, documentType) => {
        const file = fileOrEvent.target ? fileOrEvent.target.files[0] : fileOrEvent;
        if (!file) return;

        // File type validation
        const allowedTypes = {
            passport_photo: ['image/png', 'image/jpeg', 'image/jpg'],
            pan_document: ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'],
            aadhaar_document: ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'],
            education_certificates: ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'],
            relieving_letter: ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
        };

        const allowedExtensions = {
            passport_photo: ['.png', '.jpg', '.jpeg'],
            pan_document: ['.pdf', '.png', '.jpg', '.jpeg'],
            aadhaar_document: ['.pdf', '.png', '.jpg', '.jpeg'],
            education_certificates: ['.pdf', '.png', '.jpg', '.jpeg'],
            relieving_letter: ['.pdf', '.png', '.jpg', '.jpeg']
        };

        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        const isValidType = allowedTypes[documentType]?.includes(file.type);
        const isValidExtension = allowedExtensions[documentType]?.includes(fileExtension);

        if (!isValidType && !isValidExtension) {
            const typeLabel = documentType === 'passport_photo' ? 'Photo' : 'Document';
            const formats = documentType === 'passport_photo'
                ? 'PNG, JPG, or JPEG'
                : 'PDF, PNG, JPG, or JPEG';
            showSnackbar(`Invalid file type for ${typeLabel}. Please upload ${formats} format only.`, 'error');
            return;
        }

        // File size validation (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            showSnackbar('File size exceeds 5MB. Please upload a smaller file.', 'error');
            return;
        }

        const uploadFormData = new FormData();
        uploadFormData.append('document', file);

        try {
            await uploadDocument({
                userId: targetUserId,
                documentType,
                formData: uploadFormData
            }).unwrap();
            showSnackbar(`${documentType.replace(/_/g, ' ')} uploaded successfully`, 'success');

            if (documentType === 'passport_photo') {
                setImageTimestamp(Date.now());
            }

            refetch();
            refetchDocs();
        } catch (err) {
            showSnackbar(err.data?.error || `Failed to upload ${documentType}`, 'error');
        }
    };

    const handleDownload = async (documentType, fileName) => {
        try {
            const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/employees/${targetUserId}/documents/${documentType}/view?token=${token}`;

            // Fetch the file as blob
            const response = await fetch(url);
            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            // Create temporary link and trigger download
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = fileName || `${documentType}.pdf`;
            document.body.appendChild(link);
            link.click();

            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);

            showSnackbar('Document downloaded successfully', 'success');
        } catch (err) {
            showSnackbar('Failed to download document. Please try again.', 'error');
        }
    };

    const handleDeleteDoc = async () => {
        const { type, label } = deleteConfirm;
        try {
            await deleteDocument({
                userId: targetUserId,
                documentType: type
            }).unwrap();
            showSnackbar(`${label} deleted successfully`, 'success');
            setDeleteConfirm({ open: false, type: null, label: '' });
            refetchDocs();
        } catch (err) {
            showSnackbar(err.data?.error || `Failed to delete ${label}`, 'error');
        }
    };

    const openDeleteConfirm = (type, label) => {
        setDeleteConfirm({ open: true, type, label });
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    const employee = employeeData?.employee;

    if (!employee) {
        return (
            <Alert severity="error">Employee profile not found.</Alert>
        );
    }

    return (
        <Box sx={{ width: '100%', px: { xs: 0.5, sm: 1 }, pb: 4 }}>
            <PageHeader
                title="Profile Control Center"
                subtitle="Comprehensive view of your professional standing"
                action={
                    employee.profile_completed ? (
                        <Chip
                            icon={<CheckCircleIcon sx={{ fontSize: '1.2rem !important' }} />}
                            label="Profile Verified"
                            sx={{
                                height: 32,
                                fontWeight: 600,
                                bgcolor: 'success.lighter',
                                color: 'success.dark',
                                border: '1px solid',
                                borderColor: 'success.light'
                            }}
                        />
                    ) : (
                        <Tooltip title="Complete all required fields to verify profile">
                            <Chip
                                icon={<ErrorOutlineIcon sx={{ fontSize: '1.2rem !important' }} />}
                                label="Verification Pending"
                                sx={{
                                    height: 32,
                                    fontWeight: 600,
                                    bgcolor: 'warning.lighter',
                                    color: 'warning.dark',
                                    border: '1px solid',
                                    borderColor: 'warning.light'
                                }}
                            />
                        </Tooltip>
                    )
                }
            />


            <Box
                sx={{
                    display: 'flex',
                    gap: 2,
                    alignItems: 'stretch',
                }}
            >
                <Box sx={{ width: '20%' }}>
                    <Card
                        sx={{
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            boxShadow: 'none',
                            height: '100%',
                        }}
                    >
                        <CardContent sx={{ p: 0 }}>
                            <Box
                                sx={{
                                    height: 80,
                                    bgcolor: 'primary.main',
                                    borderTopLeftRadius: 12,
                                    borderTopRightRadius: 12,
                                    position: 'relative',
                                }}
                            />

                            <Box sx={{ textAlign: 'center', px: 2, pb: 3, mt: -5 }}>
                                <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                                    {/* The entire avatar area is now a drop zone */}
                                    <Box sx={{ position: 'relative', width: 110, height: 110 }}>
                                        <Avatar
                                            src={
                                                employee.documents?.passport_photo
                                                    ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/employees/${targetUserId}/documents/passport_photo/view?t=${imageTimestamp}&token=${token}`
                                                    : undefined
                                            }
                                            sx={{
                                                width: 110,
                                                height: 110,
                                                bgcolor: 'primary.main',
                                                fontSize: 44,
                                                border: '4px solid white',
                                                boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                                            }}
                                        >
                                            <PersonIcon sx={{ fontSize: 64 }} />
                                        </Avatar>

                                        {isOwnProfile && (
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: '100%',
                                                    borderRadius: '50%',
                                                    overflow: 'hidden',
                                                    zIndex: 1
                                                }}
                                            >
                                                <FileDropZone
                                                    variant="mini"
                                                    showIcon={false}
                                                    accept=".png,.jpg,.jpeg"
                                                    onFileSelect={(file) => handleFileUpload(file, 'passport_photo')}
                                                    isLoading={isUploading}
                                                />
                                            </Box>
                                        )}
                                    </Box>

                                    {/* Overlay Cloud Upload Icon when not dragging - visual hint */}
                                    {isOwnProfile && !isUploading && (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                bottom: 6,
                                                right: 6,
                                                bgcolor: 'white',
                                                color: 'primary.main',
                                                boxShadow: 3,
                                                width: 32,
                                                height: 32,
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                pointerEvents: 'none', // Allow clicks/drags to pass to FileDropZone below
                                                zIndex: 2
                                            }}
                                        >
                                            <CloudUploadIcon fontSize="small" />
                                        </Box>
                                    )}
                                </Box>

                                {/* EMPLOYEE NAME */}
                                <Typography
                                    sx={{
                                        fontSize: '1.25rem',   // ⬆ increased
                                        fontWeight: 800,
                                        lineHeight: 1.25,
                                        mb: 0.4,
                                    }}
                                >
                                    {employee.full_name}
                                </Typography>

                                {/* EMPLOYEE CODE */}
                                <Typography
                                    sx={{
                                        fontSize: '0.85rem',
                                        fontWeight: 700,
                                        color: 'primary.main',
                                        letterSpacing: '0.6px',
                                        textTransform: 'uppercase',
                                        mb: 2.5,
                                        display: 'block',
                                    }}
                                >
                                    {employee.employee_code}
                                </Typography>

                                {/* INFO SECTION */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 1.8,
                                        textAlign: 'left',
                                        p: 2.2,
                                        borderRadius: 2,
                                    }}
                                >
                                    {/* POSITION */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.4 }}>
                                        <WorkIcon sx={{ color: 'text.secondary', fontSize: 19 }} />
                                        <Box>
                                            <Typography
                                                sx={{
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    color: 'text.secondary',
                                                    lineHeight: 1.1,
                                                }}
                                            >
                                                Position
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    fontSize: '0.95rem',
                                                    fontWeight: 600,
                                                    color: 'text.primary',

                                                }}
                                            >
                                                {employee.position || 'N/A'}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* DEPARTMENT */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.4 }}>
                                        <BadgeIcon sx={{ color: 'text.secondary', fontSize: 19 }} />
                                        <Box>
                                            <Typography
                                                sx={{
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    color: 'text.secondary',
                                                    lineHeight: 1.1,
                                                }}
                                            >
                                                Department
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    fontSize: '0.95rem',
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {employee.department_name || 'N/A'}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* EMAIL */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.4 }}>
                                        <EmailIcon sx={{ color: 'text.secondary', fontSize: 19 }} />
                                        <Box>
                                            <Typography
                                                sx={{
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    color: 'text.secondary',
                                                    lineHeight: 1.1,
                                                }}
                                            >
                                                Email
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    fontSize: '0.95rem',
                                                    fontWeight: 600,
                                                    wordBreak: 'break-all',
                                                }}
                                            >
                                                {employee.email}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* JOINED DATE */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.4 }}>
                                        <CalendarMonthIcon
                                            sx={{ color: 'text.secondary', fontSize: 19 }}
                                        />
                                        <Box>
                                            <Typography
                                                sx={{
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    color: 'text.secondary',
                                                    lineHeight: 1.1,
                                                }}
                                            >
                                                Joined
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    fontSize: '0.95rem',
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {employee.date_of_joining
                                                    ? new Date(employee.date_of_joining).toLocaleDateString(
                                                        'en-US',
                                                        {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        }
                                                    )
                                                    : 'N/A'}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* BIOMETRIC ID */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.4 }}>
                                        <FingerprintIcon
                                            sx={{ color: 'text.secondary', fontSize: 19 }}
                                        />
                                        <Box>
                                            <Typography
                                                sx={{
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    color: 'text.secondary',
                                                    lineHeight: 1.1,
                                                }}
                                            >
                                                Biometric ID
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    fontSize: '0.95rem',
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {employee.biometric_id || 'Not Assigned'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>

                <Box sx={{ width: '80%' }}>

                    <Card sx={{
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        boxShadow: 'none',
                        minHeight: '100%'
                    }}>
                        <Tabs
                            value={tabValue}
                            onChange={handleTabChange}
                            sx={{
                                px: 3,
                                pt: 2,
                                borderBottom: 1,
                                borderColor: 'divider',
                                '& .MuiTab-root': {
                                    fontWeight: 700,
                                    fontSize: '0.9rem',
                                    textTransform: 'none',
                                    minHeight: 48,
                                    borderRadius: '8px 8px 0 0',
                                    '&.Mui-selected': { color: 'primary.main' }
                                }
                            }}
                        >
                            <Tab label="Personal Details" />
                            <Tab label="Identity & Bank" />
                            <Tab label="My Documents" />
                            {isOwnProfile && <Tab label="Security" />}
                        </Tabs>

                        <CardContent sx={{ p: 4 }}>
                            {tabValue === 0 && (
                                <Box component="form" onSubmit={handleSubmit}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <PersonIcon color="primary" />
                                            <Typography variant="h6" fontWeight={700}>Basic Information</Typography>
                                        </Box>
                                        {isOwnProfile && (
                                            !isEditing ? (
                                                <Button
                                                    startIcon={<EditIcon />}
                                                    onClick={() => setIsEditing(true)}
                                                    variant="contained"
                                                    sx={{ borderRadius: 2 }}
                                                >
                                                    Edit Profile
                                                </Button>
                                            ) : (
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Button variant="outlined" startIcon={<CancelIcon />} onClick={() => setIsEditing(false)} color="inherit" sx={{ borderRadius: 2 }}>Cancel</Button>
                                                    <Button variant="contained" startIcon={<SaveIcon />} type="submit" disabled={isUpdating} sx={{ borderRadius: 2 }}>Save Updates</Button>
                                                </Box>
                                            )
                                        )}
                                    </Box>

                                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2, mb: 2 }}>
                                        <TextField fullWidth label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} disabled={!isEditing} size="small" InputProps={{ startAdornment: <LocalPhoneIcon sx={{ mr: 1, color: 'text.disabled', fontSize: 18 }} /> }} />
                                        <TextField fullWidth label="Emergency Contact" name="emergency_contact" value={formData.emergency_contact} onChange={handleChange} disabled={!isEditing} size="small" />
                                        <TextField
                                            fullWidth
                                            label="Date of Birth"
                                            name="date_of_birth"
                                            type="date"
                                            value={formData.date_of_birth}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            size="small"
                                            InputLabelProps={{ shrink: true }}
                                            inputProps={{ max: maxDOBString }}
                                        />
                                    </Box>

                                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2, mb: 2 }}>
                                        <TextField fullWidth select label="Gender" name="gender" value={formData.gender} onChange={handleChange} disabled={!isEditing} size="small" SelectProps={{ native: true }}>
                                            <option value=""></option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </TextField>
                                        <TextField fullWidth select label="Blood Group" name="blood_group" value={formData.blood_group} onChange={handleChange} disabled={!isEditing} size="small" SelectProps={{ native: true }}>
                                            <option value=""></option>
                                            {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                        </TextField>
                                        <TextField fullWidth select label="Marital Status" name="marital_status" value={formData.marital_status} onChange={handleChange} disabled={!isEditing} size="small" SelectProps={{ native: true }}>
                                            <option value=""></option>
                                            {['Single', 'Married', 'Divorced', 'Widowed'].map(s => <option key={s} value={s}>{s}</option>)}
                                        </TextField>
                                    </Box>

                                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2, mb: 2 }}>
                                        <TextField fullWidth label="Father's Name" name="father_name" value={formData.father_name} onChange={handleChange} disabled={!isEditing} size="small" />
                                        <TextField fullWidth label="Highest Qualification" name="education_qualification" value={formData.education_qualification} onChange={handleChange} disabled={!isEditing} size="small" />
                                        <TextField fullWidth label="Country" name="country" value={formData.country} onChange={handleChange} disabled={!isEditing} size="small" />
                                    </Box>

                                    {/* Address Section */}

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <HomeIcon color="primary" fontSize="small" />
                                        <Typography variant="subtitle2" fontWeight={700}>Residential Information</Typography>
                                    </Box>

                                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2, mb: 2 }}>
                                        <TextField fullWidth label="Current Address" name="current_address" value={formData.current_address} onChange={handleChange} disabled={!isEditing} size="small" multiline rows={2} />
                                        <TextField fullWidth label="Permanent Address" name="permanent_address" value={formData.permanent_address} onChange={handleChange} disabled={!isEditing} size="small" multiline rows={2} />
                                        <Box />
                                    </Box>

                                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
                                        <TextField fullWidth label="City" name="city" value={formData.city} onChange={handleChange} disabled={!isEditing} size="small" />
                                        <TextField fullWidth label="State" name="state" value={formData.state} onChange={handleChange} disabled={!isEditing} size="small" />
                                        <TextField fullWidth label="Postal Code" name="postal_code" value={formData.postal_code} onChange={handleChange} disabled={!isEditing} size="small" />
                                    </Box>
                                </Box>
                            )}

                            {tabValue === 1 && (
                                <Box component="form" onSubmit={handleSubmit}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <AccountBalanceIcon color="primary" />
                                            <Typography variant="h6" fontWeight={700}>Financial Identification</Typography>
                                        </Box>
                                        {isOwnProfile && (
                                            !isEditing ? (
                                                <Button startIcon={<EditIcon />} onClick={() => setIsEditing(true)} variant="contained" sx={{ borderRadius: 2 }}>Edit Info</Button>
                                            ) : (
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Button variant="outlined" startIcon={<CancelIcon />} onClick={() => setIsEditing(false)} color="inherit" sx={{ borderRadius: 2 }}>Cancel</Button>
                                                    <Button variant="contained" startIcon={<SaveIcon />} type="submit" disabled={isUpdating} sx={{ borderRadius: 2 }}>Save</Button>
                                                </Box>
                                            )
                                        )}
                                    </Box>

                                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
                                        <TextField fullWidth label="Aadhaar Number" name="aadhaar_number" value={!isEditing ? maskValue(formData.aadhaar_number) : formData.aadhaar_number} onChange={handleChange} disabled={!isEditing} size="small" placeholder="XXXX-XXXX-XXXX" />
                                        <TextField fullWidth label="PAN Card Number" name="pan_number" value={!isEditing ? maskValue(formData.pan_number) : formData.pan_number} onChange={handleChange} disabled={!isEditing} size="small" placeholder="ABCDE1234F" />
                                        <TextField fullWidth label="UAN Number" name="uan_number" value={!isEditing ? maskValue(formData.uan_number) : formData.uan_number} onChange={handleChange} disabled={!isEditing} size="small" />
                                        <TextField fullWidth label="ESI Number" name="esi_number" value={!isEditing ? maskValue(formData.esi_number) : formData.esi_number} onChange={handleChange} disabled={!isEditing} size="small" />
                                        <TextField fullWidth label="Biometric ID" name="biometric_id" value={formData.biometric_id} disabled size="small" helperText="Assigned by system" />
                                        <Box />
                                    </Box>

                                    {/* Bank Details Section */}
                                    <Box sx={{ mt: 1.5, p: 2, border: '1px dashed', borderColor: 'primary.light', borderRadius: 2, bgcolor: 'primary.lighter' }}>
                                        <Typography variant="subtitle2" fontWeight={800} color="primary.dark" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                            <AccountBalanceIcon fontSize="small" />
                                            Settlement Bank Account
                                        </Typography>
                                        <Typography variant="caption" color="primary.dark" display="block" sx={{ mb: 1.5, opacity: 0.8 }}>
                                            Primary account for salary disbursements and reimbursements.
                                        </Typography>

                                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2, mb: 2 }}>
                                            <Autocomplete
                                                fullWidth
                                                options={bankList}
                                                value={formData.bank_name || ''}
                                                onChange={(e, newValue) => {
                                                    setFormData({
                                                        ...formData,
                                                        bank_name: newValue || ''
                                                    });
                                                }}
                                                disabled={!isEditing}
                                                loading={isLoadingBanks}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Full Bank Name"
                                                        size="small"
                                                        name="bank_name"
                                                    />
                                                )}
                                            />
                                            <TextField fullWidth label="Bank Account Number" name="bank_account_number" value={!isEditing ? maskValue(formData.bank_account_number) : formData.bank_account_number} onChange={handleChange} disabled={!isEditing} size="small" />
                                            <TextField
                                                fullWidth
                                                label="IFSC Code"
                                                name="bank_ifsc_code"
                                                value={!isEditing ? maskValue(formData.bank_ifsc_code) : formData.bank_ifsc_code}
                                                onChange={(e) => {
                                                    const val = e.target.value.toUpperCase();
                                                    handleChange({ target: { name: 'bank_ifsc_code', value: val } });
                                                }}
                                                disabled={!isEditing}
                                                size="small"
                                                inputProps={{ maxLength: 11 }}
                                                helperText={branchName ? `Branch: ${branchName}` : ""}
                                                FormHelperTextProps={{ sx: { color: 'success.main', fontWeight: 600 } }}
                                            />
                                        </Box>
                                    </Box>
                                </Box>
                            )}

                            {tabValue === 2 && (
                                <Box>
                                    <Typography variant="h6" fontWeight={700} gutterBottom>Compliance Documents</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                                        Please provide clear scans of the following documents to complete your verification process.
                                    </Typography>

                                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                                        {[
                                            { type: 'pan_document', label: 'PAN Card Copy' },
                                            { type: 'aadhaar_document', label: 'Aadhaar Card Copy' },
                                            { type: 'education_certificates', label: 'Degree / Certificates' },
                                            { type: 'relieving_letter', label: 'Relieving / Experience' }
                                        ].map((doc) => {
                                            const docInfo = documentsData?.documents?.find(d => d.type === doc.type);
                                            return (
                                                <Box
                                                    key={doc.type}
                                                    sx={{
                                                        p: 3,
                                                        height: '100%',
                                                        bgcolor: 'background.paper',
                                                        border: '1px solid',
                                                        borderColor: docInfo?.exists ? alpha(theme.palette.success.main, 0.2) : 'divider',
                                                        borderRadius: 2,
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'space-between',

                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                            <Box sx={{
                                                                width: 40,
                                                                height: 40,
                                                                borderRadius: 2,
                                                                bgcolor: docInfo?.exists ? 'success.main' : 'grey.200',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                color: 'white'
                                                            }}>
                                                                {docInfo?.exists ? <CheckCircleIcon fontSize="small" /> : <PersonIcon sx={{ color: 'text.disabled' }} fontSize="small" />}
                                                            </Box>
                                                            <Box>
                                                                <Typography variant="subtitle2" fontWeight={700}>{doc.label}</Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {docInfo?.exists ? 'Signed Copy Verified' : 'Action Required'}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                        {docInfo?.exists && (
                                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                                <Tooltip title="View Document">
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/employees/${targetUserId}/documents/${doc.type}/view?token=${token}`, '_blank')}
                                                                        sx={{
                                                                            color: '#2196f3',
                                                                            border: '1px solid',
                                                                            borderColor: '#2196f3',
                                                                            borderRadius: 1,
                                                                            '&:hover': { backgroundColor: '#2196f3', color: 'white' }
                                                                        }}
                                                                    >
                                                                        <VisibilityIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Download Document">
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => handleDownload(doc.type, doc.label)}
                                                                        sx={{
                                                                            color: '#4caf50',
                                                                            border: '1px solid',
                                                                            borderColor: '#4caf50',
                                                                            borderRadius: 1,
                                                                            '&:hover': { backgroundColor: '#4caf50', color: 'white' }
                                                                        }}
                                                                    >
                                                                        <DownloadIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </Box>
                                                        )}
                                                    </Box>

                                                    <Box sx={{ mt: 'auto', pt: 2 }}>
                                                        {isOwnProfile && (
                                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                                {!docInfo?.exists ? (
                                                                    <FileDropZone
                                                                        height={80}
                                                                        label="Drop File Here"
                                                                        subLabel="Click to Browse"
                                                                        onFileSelect={(file) => handleFileUpload(file, doc.type)}
                                                                        isLoading={isUploading}
                                                                    />
                                                                ) : (
                                                                    <Button
                                                                        component="label"
                                                                        fullWidth
                                                                        size="small"
                                                                        startIcon={<CloudUploadIcon />}
                                                                        variant="text"
                                                                        sx={{ borderRadius: 2, fontWeight: 700 }}
                                                                    >
                                                                        Re-upload
                                                                        <input
                                                                            hidden
                                                                            type="file"
                                                                            accept=".pdf,.png,.jpg,.jpeg"
                                                                            onChange={(e) => handleFileUpload(e, doc.type)}
                                                                        />
                                                                    </Button>
                                                                )}

                                                                {docInfo?.exists && (
                                                                    <IconButton
                                                                        size="small"
                                                                        color="error"
                                                                        onClick={() => openDeleteConfirm(doc.type, doc.label)}
                                                                        sx={{
                                                                            border: '1px solid',
                                                                            borderColor: 'error.light',
                                                                            borderRadius: 2,
                                                                            transition: 'all 0.2s',
                                                                            '&:hover': {
                                                                                bgcolor: 'error.main',
                                                                                color: 'white',
                                                                                borderColor: 'error.main'
                                                                            }
                                                                        }}
                                                                    >
                                                                        <DeleteIcon fontSize="small" />
                                                                    </IconButton>
                                                                )}
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                </Box>
                            )}

                            {isOwnProfile && tabValue === 3 && (
                                <MFASetup embedded={true} />
                            )}
                        </CardContent>
                    </Card>
                </Box>
            </Box>

            <CustomSnackbar
                open={snackbar.open}
                onClose={hideSnackbar}
                message={snackbar.message}
                severity={snackbar.severity}
            />

            {/* Custom Delete Confirmation Dialog */}
            <Dialog
                open={deleteConfirm.open}
                onClose={() => setDeleteConfirm({ ...deleteConfirm, open: false })}
                PaperProps={{
                    sx: { borderRadius: 3, p: 1, width: '100%', maxWidth: 400 }
                }}
            >
                <DialogTitle sx={{ fontWeight: 800, fontSize: '1.25rem', pb: 1 }}>
                    Confirm Deletion
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ fontWeight: 500, color: 'text.secondary' }}>
                        Are you sure you want to delete <strong>{deleteConfirm.label}</strong>? This action cannot be undone and you may need to re-upload it for verification.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => setDeleteConfirm({ ...deleteConfirm, open: false })}
                        color="inherit"
                        sx={{ borderRadius: 2, fontWeight: 700 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteDoc}
                        variant="contained"
                        color="error"
                        sx={{
                            borderRadius: 2,
                            fontWeight: 700,
                            boxShadow: '0 4px 12px rgba(211, 47, 47, 0.2)'
                        }}
                    >
                        Delete Permanently
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default EmployeeProfile;