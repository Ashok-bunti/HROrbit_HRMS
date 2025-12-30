import React, { useRef } from 'react';
import { Box, Typography, Paper, IconButton, Card, CardMedia } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import { FavoriteBorder, ChatBubbleOutline, Send, BookmarkBorder, ChangeHistory } from '@mui/icons-material';

const SocialCard = ({ title, subtitle, image, icon, color }) => (
    <Card sx={{
        minWidth: 280,
        maxWidth: 280,
        borderRadius: 2,
        boxShadow: 'none',
        border: '1px solid #f3f4f6',
        flexShrink: 0,
        bgcolor: '#f6f6f6'
    }}>
        {/* Header */}
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                    sx={{
                        width: 32,
                        height: 32,
                        bgcolor: 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <ChangeHistory sx={{ color: '#d8b4fe', fontSize: 32, transform: 'rotate(-90deg)' }} /> {/* Approximate Logo */}
                </Box>
                <Typography variant="subtitle2" fontWeight="800" sx={{ fontSize: '0.9rem' }}>
                    {title === "Apptware" ? "Apptware" : "Apptware"} {/* Keep consistent branding name */}
                </Typography>
            </Box>
            {icon}
        </Box>

        {/* Content */}
        <Box sx={{ px: 2, mb: 2 }}>
            <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                    mb: 2,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    fontSize: '0.85rem',
                    lineHeight: 1.5
                }}
            >
                {subtitle}
            </Typography>

            <CardMedia
                component="img"
                height="140"
                image={image}
                alt={title}
                sx={{
                    borderRadius: 3,
                    width: '100%',
                    objectFit: 'cover'
                }}
            />
        </Box>

        {/* Footer Actions */}
        <Box sx={{ px: 2, pb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <FavoriteBorder sx={{ fontSize: 20, color: 'text.secondary' }} />
            <ChatBubbleOutline sx={{ fontSize: 20, color: 'text.secondary', transform: 'scaleX(-1)' }} />
            <Send sx={{ fontSize: 20, color: 'text.secondary', transform: 'rotate(-45deg)', mb: 0.5 }} />
            <Box sx={{ flexGrow: 1 }} />
            <BookmarkBorder sx={{ fontSize: 20, color: 'text.secondary' }} />
        </Box>
    </Card>
);

const SocialsWidget = () => {
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = 300;
            if (direction === 'left') {
                current.scrollLeft -= scrollAmount;
            } else {
                current.scrollLeft += scrollAmount;
            }
        }
    };

    return (
        <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">Socials</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                        onClick={() => scroll('left')}
                        size="small"
                        sx={{
                            border: '1px solid #e5e7eb',
                            '&:hover': { bgcolor: '#f6f6f6', borderColor: '#d8b4fe' }
                        }}
                    >
                        <ArrowBackIosIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                    </IconButton>
                    <IconButton
                        onClick={() => scroll('right')}
                        size="small"
                        sx={{
                            border: '1px solid #e5e7eb',
                            '&:hover': { bgcolor: '#f6f6f6', borderColor: '#d8b4fe' }
                        }}
                    >
                        <ArrowForwardIosIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                    </IconButton>
                </Box>
            </Box>

            <Box
                ref={scrollRef}
                sx={{
                    display: 'flex',
                    gap: 2,
                    overflowX: 'auto',
                    pb: 1,
                    scrollBehavior: 'smooth',
                    '::-webkit-scrollbar': { display: 'none' }, // Hide scrollbar
                    scrollbarWidth: 'none'
                }}
            >
                <SocialCard
                    title="apptwareindia"
                    subtitle="Eid Mubarak! May your day be filled with joy and blessings."
                    image="https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                    icon={<InstagramIcon sx={{ color: '#E1306C', fontSize: 22 }} />}
                    color="#E1306C"
                />
                <SocialCard
                    title="Apptware"
                    subtitle="Why should modern-day businesses invest in UX design?"
                    image="https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                    icon={<LinkedInIcon sx={{ color: '#0077b5', fontSize: 22 }} />}
                    color="#0077b5"
                />
                <SocialCard
                    title="apptwareindia"
                    subtitle="See you all at Game Night tournament! Ready to play?"
                    image="https://images.unsplash.com/photo-1551103782-8ab07afd45c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                    icon={<InstagramIcon sx={{ color: '#E1306C', fontSize: 22 }} />}
                    color="#E1306C"
                />
            </Box>
        </Paper>
    );
};

export default SocialsWidget;
