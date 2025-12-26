import React from 'react';
import { Svg, Path, Circle, Rect } from 'react-native-svg';

export const HeartIcon = ({ size = 20, filled = false }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "white" : "none"} stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </Svg>
);

export const MessageCircleIcon = ({ size = 20 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
    </Svg>
);

export const EditIcon = ({ size = 18 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </Svg>
);

export const TrashIcon = ({ size = 18 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
    </Svg>
);

export const SendIcon = ({ size = 20, color = "white" }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
    </Svg>
);

export const MessageIconEmptyState = ({ size = 40 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
    </Svg>
);



export const EyeIcon = ({ size = 24 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M12 5C7 5 2.73 8.11 1 12.5 2.73 16.89 7 20 12 20s9.27-3.11 11-7.5C21.27 8.11 17 5 12 5z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx="12" cy="12" r="3" stroke="white" strokeWidth="2" />
    </Svg>
);

export const EyeOffIcon = ({ size = 24 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M3 3l18 18M10.5 10.677a2 2 0 002.823 2.823M7.362 7.561C5.68 8.74 4.279 10.42 3 12.5c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84M17 17l.5-.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </Svg>
);

export const WalletIcon = ({ size = 80 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x="3" y="6" width="18" height="13" rx="2" stroke="white" strokeWidth="1.5" />
        <Path d="M3 10h18M7 6V4a1 1 0 011-1h8a1 1 0 011 1v2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <Circle cx="17" cy="13" r="1.5" fill="white" />
    </Svg>
);

export const GoogleIcon = ({ size = 20 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="white" />
        <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="white" />
        <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s .13-1 .35- .09V7 .H .C .4 . . . . . . " fill="white" />
        <Path d="M1 . c - - - - - - - - - - " fill="white" />
    </Svg>
);

export const AppleIcon = ({ size = 20 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98 .48 7 .57 .6 .6 .6 .6 .6 " fill="white" />
    </Svg>
);

export const FacebookIcon = ({ size = 20 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="white" />
    </Svg>
);



export const ArrowLeftIcon = ({ size = 24 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M19 12H5M12 19l-7-7 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const UserPlusIcon = ({ size = 80 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M8.5 11a4 4 0 100-8 4 4 0 000 8zM20 8v6M23 11h-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const CheckIcon = ({ size = 12 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M20 6L9 17l-5-5" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

// Icons
export const PaperclipIcon = ({ size = 18 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
    </Svg>
);


export const ArrowUpIcon = ({ size = 14 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M12 19V5M5 12l7-7 7 7" />
    </Svg>
);

export const ArrowDownIcon = ({ size = 14 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M12 5v14M19 12l-7 7-7-7" />
    </Svg>
);

export const SearchIcon = ({ size = 18 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Circle cx="11" cy="11" r="8" />
        <Path d="M21 21l-4.35-4.35" />
    </Svg>
);



export const BackIcon = ({ size = 24, color = "white" }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M19 12H5M12 19l-7-7 7-7" />
    </Svg>
);

export const PlusIcon = ({ size = 20, color = "white" }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M12 5v14M5 12h14" />
    </Svg>
);


export const TargetIcon = ({ size = 40, color = "white" }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
        <Path d="M12 6a6 6 0 100 12 6 6 0 000-12z" />
        <Path d="M12 10a2 2 0 100 4 2 2 0 000-4z" />
    </Svg>
);

export const ShareIcon = ({ size = 18, color = 'white' }: { size?: number, color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
    </Svg>
);

export const CogIcon = ({ size = 20, color = "white" }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M12 20V10M12 20a8 8 0 100-16 8 8 0 000 16zM12 9a1 1 0 100-2 1 1 0 000 2z" />
    </Svg>
);


export const FinanceLogoIcon = ({ size = 120 }: { size?: number }) => (
    <Svg
        width={size}
        height={size}
        viewBox="0 0 1000 1000"
        fill="none"
    >
        {/* Traço vertical central */}
        <Path
            d="
        M470 120
        C470 110, 530 110, 530 120
        V520
        C530 530, 470 530, 470 520
        Z
      "
            fill="#FFFFFF"
        />

        {/* Traço horizontal central */}
        <Path
            d="
        M180 400
        C180 380, 220 370, 250 370
        H750
        C780 370, 820 380, 820 400
        V440
        H180
        Z
      "
            fill="#FFFFFF"
        />

        {/* Curva inferior esquerda */}
        <Path
            d="
        M430 460
        C300 600, 260 720, 300 820
        C340 900, 460 880, 500 820
        L470 780
        C430 820, 350 800, 340 740
        C330 670, 380 580, 460 500
        Z
      "
            fill="#FFFFFF"
        />

        {/* Curva inferior direita (U) */}
        <Path
            d="
        M560 460
        V720
        C560 840, 700 860, 800 800
        C830 780, 820 750, 800 740
        C740 770, 640 760, 640 700
        V460
        Z
      "
            fill="#FFFFFF"
        />

        {/* Arco superior esquerdo */}
        <Path
            d="
        M360 220
        C300 260, 260 320, 250 370
        C250 390, 290 400, 300 380
        C330 330, 370 280, 420 250
        Z
      "
            fill="#FFFFFF"
        />

        {/* Arco superior direito */}
        <Path
            d="
        M640 220
        C700 260, 740 320, 750 370
        C750 390, 710 400, 700 380
        C670 330, 630 280, 580 250
        Z
      "
            fill="#FFFFFF"
        />
    </Svg>
);

// SVG Icons
export const CameraIcon = ({ size = 20 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx="12" cy="13" r="4" stroke="black" strokeWidth="2" />
    </Svg>
);

export const LogoutIcon = ({ size = 20 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const ChartIcon = ({ size = 20 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M3 3v18h18M7 16l4-4 4 4 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);


export const FinancialsIcon = ({ size = 16 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const CheckCircleIcon = ({ size = 20, color = "white" }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <Path d="M22 4L12 14.01l-3-3" />
    </Svg>
);

export const ErrorCircleIcon = ({ size = 20, color = "white" }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Circle cx="12" cy="12" r="10" />
        <Path d="M12 8v4" />
        <Path d="M12 16h.01" />
    </Svg>
);

export const InfoCircleIcon = ({ size = 20, color = "white" }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Circle cx="12" cy="12" r="10" />
        <Path d="M12 16v-4" />
        <Path d="M12 8h.01" />
    </Svg>
);


