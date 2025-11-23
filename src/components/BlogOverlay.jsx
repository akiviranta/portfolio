import React from 'react';

const BlogOverlay = ({ isOpen, onClose, url }) => {
    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                right: 0,
                width: '80%', // or '600px'
                maxWidth: '800px',
                height: '100vh',
                backgroundColor: 'rgba(20, 20, 20, 0.95)', // Dark, slightly transparent
                backdropFilter: 'blur(10px)',
                transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)', // Smooth ease-out
                zIndex: 1000, // Above canvas
                boxShadow: '-5px 0 20px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
            }}
        >
            {/* Header */}
            <div style={{
                padding: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
                <h2 style={{ margin: 0, color: 'white', fontFamily: 'sans-serif' }}>Blog</h2>
                <button
                    onClick={onClose}
                    style={{
                        background: 'transparent',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        transition: 'background 0.2s',
                    }}
                    onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
                    onMouseOut={(e) => e.target.style.background = 'transparent'}
                >
                    Close
                </button>
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, position: 'relative' }}>
                {isOpen && url ? (
                    <iframe
                        src={url}
                        style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            background: 'white', // Fallback if iframe loads slowly
                        }}
                        title="Blog Post"
                    />
                ) : (
                    <div style={{
                        padding: '40px',
                        color: 'rgba(255, 255, 255, 0.5)',
                        textAlign: 'center',
                        fontFamily: 'sans-serif'
                    }}>
                        <p>Select a post to read.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogOverlay;
