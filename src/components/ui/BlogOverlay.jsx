import React, { useState, useEffect } from 'react';

const BlogOverlay = ({ isOpen, onClose, initialProject }) => {
    const [view, setView] = useState('about'); // 'about', 'posts', 'project'
    const [activeProject, setActiveProject] = useState(null);

    // Reset view when opened
    useEffect(() => {
        if (isOpen) {
            if (initialProject) {
                setActiveProject(initialProject);
                setView('project');
            } else {
                setView('about');
            }
        }
    }, [isOpen, initialProject]);

    // Mock Data
    const posts = [
        { id: 1, title: "Building a 3D Portfolio with React Three Fiber", date: "Nov 20, 2023", url: "https://example.com/post1" },
        { id: 2, title: "The Math Behind Inverse Kinematics", date: "Oct 15, 2023", url: "https://example.com/post2" },
        { id: 3, title: "Why I Love WebGL", date: "Sep 01, 2023", url: "https://example.com/post3" },
    ];

    const handlePostClick = (post) => {
        window.open(post.url, '_blank');
    };

    const renderContent = () => {
        if (view === 'project') {
            if (activeProject === 'roboarm') {
                return (
                    <div style={{ padding: '40px', color: 'white' }}>
                        <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>RoboArm Project</h1>
                        <p style={{ fontSize: '18px', lineHeight: '1.6', color: 'rgba(255, 255, 255, 0.8)' }}>
                            This project demonstrates inverse kinematics and 3D interaction in the web browser.
                            (Placeholder content for RoboArm thesis/details).
                        </p>
                    </div>
                );
            }
            return <div style={{ padding: '40px', color: 'white' }}>Project Not Found</div>;
        }

        if (view === 'posts') {
            return (
                <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '28px', marginBottom: '30px', color: 'white' }}>Latest Thoughts</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {posts.map(post => (
                            <div
                                key={post.id}
                                onClick={() => handlePostClick(post)}
                                style={{
                                    padding: '24px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', color: 'white' }}>{post.title}</h3>
                                <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255, 255, 255, 0.5)' }}>{post.date}</p>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        // Default: About View
        return (
            <div style={{ padding: '60px 40px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    margin: '0 auto 30px auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '40px',
                    fontWeight: 'bold',
                    color: 'rgba(0,0,0,0.5)'
                }}>
                    AK
                </div>
                <h1 style={{ fontSize: '36px', marginBottom: '16px', color: 'white' }}>Arttu Kiviranta</h1>
                <p style={{ fontSize: '20px', lineHeight: '1.6', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '40px' }}>
                    Creative Developer & 3D Enthusiast. I build immersive web experiences that blend art and technology.
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                    <a href="#" style={{ color: '#4facfe', textDecoration: 'none', fontSize: '16px' }}>LinkedIn</a>
                    <a href="#" style={{ color: '#4facfe', textDecoration: 'none', fontSize: '16px' }}>GitHub</a>
                    <a href="#" style={{ color: '#4facfe', textDecoration: 'none', fontSize: '16px' }}>Twitter</a>
                </div>
            </div>
        );
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                right: 0,
                width: '85%',
                maxWidth: '1200px',
                height: '100vh',
                backgroundColor: 'rgba(10, 10, 12, 0.98)',
                transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                zIndex: 1000,
                boxShadow: '-20px 0 50px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                fontFamily: "'Inter', sans-serif",
            }}
        >
            {/* Top Navigation Bar */}
            <div style={{
                height: '80px',
                padding: '0 40px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(255, 255, 255, 0.02)',
            }}>
                {/* Left: Brand/Home */}
                <div
                    onClick={() => setView('about')}
                    style={{
                        fontSize: '20px',
                        fontWeight: 600,
                        color: 'white',
                        cursor: 'pointer',
                        letterSpacing: '-0.5px'
                    }}
                >
                    Arttu Kiviranta
                </div>

                {/* Center: Navigation */}
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={() => setView('about')}
                        style={{
                            background: view === 'about' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                            border: 'none',
                            color: view === 'about' ? 'white' : 'rgba(255, 255, 255, 0.6)',
                            padding: '8px 20px',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontSize: '15px',
                            fontWeight: 500,
                            transition: 'all 0.2s',
                        }}
                    >
                        About Me
                    </button>
                    <button
                        onClick={() => setView('posts')}
                        style={{
                            background: view === 'posts' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                            border: 'none',
                            color: view === 'posts' ? 'white' : 'rgba(255, 255, 255, 0.6)',
                            padding: '8px 20px',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontSize: '15px',
                            fontWeight: 500,
                            transition: 'all 0.2s',
                        }}
                    >
                        Posts
                    </button>
                </div>

                {/* Right: Close */}
                <button
                    onClick={onClose}
                    style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: 'none',
                        color: 'white',
                        padding: '8px 20px',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        transition: 'background 0.2s',
                    }}
                    onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
                    onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
                >
                    Close
                </button>
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {renderContent()}
            </div>
        </div>
    );
};

export default BlogOverlay;
