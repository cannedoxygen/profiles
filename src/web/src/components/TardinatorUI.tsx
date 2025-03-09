import React from 'react';
import '../styles/TardinatorUI.less';

// Button Components
export const PrimaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ 
    children,
    className = '',
    ...props
}) => {
    return (
        <button 
            className={`tardi-btn tardi-btn-primary ${className}`} 
            {...props}
        >
            {children}
        </button>
    );
};

export const SecondaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ 
    children,
    className = '',
    ...props
}) => {
    return (
        <button 
            className={`tardi-btn tardi-btn-secondary ${className}`} 
            {...props}
        >
            {children}
        </button>
    );
};

// Card Component
interface CardProps {
    title?: string;
    children: React.ReactNode;
    className?: string;
}

export const Card: React.FC<CardProps> = ({
    title,
    children,
    className = ''
}) => {
    return (
        <div className={`tardi-card ${className}`}>
            {title && <h3 className="tardi-card-title">{title}</h3>}
            <div className="tardi-card-content">
                {children}
            </div>
        </div>
    );
};

// Badge Component
interface BadgeProps {
    text: string;
    type?: 'default' | 'success' | 'warning' | 'error';
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
    text,
    type = 'default',
    className = ''
}) => {
    return (
        <span className={`tardi-badge tardi-badge-${type} ${className}`}>
            {text}
        </span>
    );
};

// Loading Spinner Component
interface SpinnerProps {
    size?: 'small' | 'medium' | 'large';
    className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
    size = 'medium',
    className = ''
}) => {
    return (
        <div className={`tardi-spinner tardi-spinner-${size} ${className}`}></div>
    );
};

// Form Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    help?: string;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    help,
    className = '',
    ...props
}) => {
    return (
        <div className="tardi-form-field">
            {label && <label className="tardi-label">{label}</label>}
            <input 
                className={`tardi-input ${error ? 'tardi-input-error' : ''} ${className}`}
                {...props}
            />
            {error && <div className="tardi-error-text">{error}</div>}
            {help && <div className="tardi-help-text">{help}</div>}
        </div>
    );
};

// TextArea Component
interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    help?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({
    label,
    error,
    help,
    className = '',
    ...props
}) => {
    return (
        <div className="tardi-form-field">
            {label && <label className="tardi-label">{label}</label>}
            <textarea
                className={`tardi-textarea ${error ? 'tardi-textarea-error' : ''} ${className}`}
                {...props}
            />
            {error && <div className="tardi-error-text">{error}</div>}
            {help && <div className="tardi-help-text">{help}</div>}
        </div>
    );
};

// Empty State Component
interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
    className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    title,
    description,
    icon,
    action,
    className = ''
}) => {
    return (
        <div className={`tardi-empty-state ${className}`}>
            {icon && <div className="tardi-empty-state-icon">{icon}</div>}
            <h3 className="tardi-empty-state-title">{title}</h3>
            {description && <p className="tardi-empty-state-description">{description}</p>}
            {action && <div className="tardi-empty-state-action">{action}</div>}
        </div>
    );
};

// Avatar Component
interface AvatarProps {
    src?: string;
    alt?: string;
    size?: 'small' | 'medium' | 'large';
    className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
    src,
    alt = 'User avatar',
    size = 'medium',
    className = ''
}) => {
    return (
        <div className={`tardi-avatar tardi-avatar-${size} ${className}`}>
            <img 
                src={src || '/img/anon.webp'} 
                alt={alt}
                className="tardi-avatar-img"
            />
        </div>
    );
};

// Social Link Component
interface SocialLinkProps {
    platform: 'twitter' | 'telegram' | 'discord' | 'other';
    username: string;
    showIcon?: boolean;
    className?: string;
}

export const SocialLink: React.FC<SocialLinkProps> = ({
    platform,
    username,
    showIcon = true,
    className = ''
}) => {
    let href = '#';
    let icon = '';
    
    switch (platform) {
        case 'twitter':
            href = `https://x.com/${username}`;
            icon = '𝕏';
            break;
        case 'telegram':
            href = `https://t.me/${username}`;
            icon = '✈️';
            break;
        case 'discord':
            href = `https://discord.com/users/${username}`;
            icon = '🎮';
            break;
    }
    
    return (
        <a 
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`tardi-social-link tardi-social-${platform} ${className}`}
        >
            {showIcon && <span className="tardi-social-icon">{icon}</span>}
            <span className="tardi-social-username">@{username}</span>
        </a>
    );
};